var authTitle = document.getElementById('growthAuthTitle');
var authMessage = document.getElementById('growthAuthMessage');
var signInButton = document.getElementById('googleSignIn');
var signOutButton = document.getElementById('googleSignOut');
var resetButton = document.getElementById('resetDemo');
var statusAuthActions = document.getElementById('statusAuthActions');
var accountDataActions = document.getElementById('accountDataActions');
var firebaseConfig = window.GROWTH_FIREBASE_CONFIG || {};
var sdkVersion = window.GROWTH_FIREBASE_SDK_VERSION || '10.12.5';
var remoteReady = false;
var remoteUser = null;
var saveTimer = null;
var firestoreTools = null;

function configured(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function setAuthUi(mode, message) {
  if (authTitle) authTitle.textContent = mode;
  if (authMessage) authMessage.textContent = message;
}

function placeResetControl(signedIn) {
  if (!resetButton || !statusAuthActions || !accountDataActions) return;
  resetButton.setAttribute('data-signed-in', signedIn ? 'true' : 'false');
  resetButton.textContent = signedIn ? 'Reset Account Data' : 'Reset Local';
  if (signedIn) {
    accountDataActions.appendChild(resetButton);
    accountDataActions.hidden = false;
  } else {
    statusAuthActions.appendChild(resetButton);
    accountDataActions.hidden = true;
  }
}

function waitForBoard() {
  if (window.GrowthQuest) return Promise.resolve(window.GrowthQuest);
  return new Promise(function (resolve) {
    window.addEventListener('growth-quest-ready', function () {
      resolve(window.GrowthQuest);
    }, { once: true });
  });
}

async function initFirebaseAuth() {
  placeResetControl(false);
  if (!configured(firebaseConfig)) {
    setAuthUi('Local mode', 'Firebase config needed for sync.');
    if (signInButton) {
      signInButton.disabled = true;
      signInButton.title = 'Google sync not configured';
    }
    return;
  }

  try {
    var appModule = await import('https://www.gstatic.com/firebasejs/' + sdkVersion + '/firebase-app.js');
    var authModule = await import('https://www.gstatic.com/firebasejs/' + sdkVersion + '/firebase-auth.js');
    var firestoreModule = await import('https://www.gstatic.com/firebasejs/' + sdkVersion + '/firebase-firestore.js');

    var app = appModule.initializeApp(firebaseConfig);
    var auth = authModule.getAuth(app);
    var db = firestoreModule.getFirestore(app);
    var provider = new authModule.GoogleAuthProvider();

    firestoreTools = {
      db: db,
      doc: firestoreModule.doc,
      getDoc: firestoreModule.getDoc,
      setDoc: firestoreModule.setDoc,
      serverTimestamp: firestoreModule.serverTimestamp
    };

    if (signInButton) {
      signInButton.disabled = false;
      signInButton.addEventListener('click', function () {
        authModule.signInWithPopup(auth, provider).catch(function (error) {
          var message = error && error.code === 'auth/operation-not-allowed'
            ? 'Enable Google provider in Firebase Auth.'
            : (error.message || 'Google sign-in could not start.');
          setAuthUi('Sign-in failed', message);
        });
      });
    }

    if (signOutButton) {
      signOutButton.addEventListener('click', function () {
        authModule.signOut(auth);
      });
    }

    authModule.onAuthStateChanged(auth, function (user) {
      remoteUser = user || null;
      if (remoteUser) {
        placeResetControl(true);
        handleSignedIn(remoteUser);
      } else {
        placeResetControl(false);
        remoteReady = false;
        waitForBoard().then(function (board) {
          board.disableRemoteSave();
          board.setAuthenticatedUser(null);
        });
        if (signInButton) {
          signInButton.hidden = false;
          signInButton.title = 'Sign in with Google';
        }
        if (signOutButton) signOutButton.hidden = true;
        setAuthUi('Local mode', 'Sign in to sync across devices.');
      }
    });

    window.addEventListener('growth-state-saved', function (event) {
      if (!remoteReady || !remoteUser) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(function () {
        saveRemoteState(remoteUser.uid, event.detail.state);
      }, 650);
    });
  } catch (error) {
    setAuthUi('Local mode', 'Sync unavailable. Local board works.');
    if (signInButton) signInButton.disabled = true;
  }
}

async function handleSignedIn(user) {
  if (signInButton) signInButton.hidden = true;
  if (signOutButton) signOutButton.hidden = false;
  setAuthUi('Cloud sync', 'Loading ' + (user.email || 'Google user') + '...');

  var board = await waitForBoard();
  var remoteState = await loadRemoteState(user.uid);
  if (remoteState) {
    board.replaceState(remoteState);
  } else {
    await saveRemoteState(user.uid, board.getState());
  }

  remoteReady = true;
  board.enableRemoteSave();
  board.setAuthenticatedUser({
    displayName: user.displayName || '',
    email: user.email || ''
  });
  setAuthUi('Cloud sync', 'Syncing as ' + (user.email || 'Google user') + '.');
}

async function loadRemoteState(uid) {
  if (!firestoreTools) return null;
  var ref = firestoreTools.doc(firestoreTools.db, 'growthQuest', uid);
  var snapshot = await firestoreTools.getDoc(ref);
  if (!snapshot.exists()) return null;
  var data = snapshot.data();
  return data && data.state ? data.state : null;
}

async function saveRemoteState(uid, state) {
  if (!firestoreTools || !uid || !state) return;
  var ref = firestoreTools.doc(firestoreTools.db, 'growthQuest', uid);
  await firestoreTools.setDoc(ref, {
    state: state,
    updatedAt: firestoreTools.serverTimestamp()
  }, { merge: true });
}

initFirebaseAuth();
