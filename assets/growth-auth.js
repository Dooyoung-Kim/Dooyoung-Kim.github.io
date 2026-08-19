var authTitle = document.getElementById('growthAuthTitle');
var authMessage = document.getElementById('growthAuthMessage');
var signInButton = document.getElementById('googleSignIn');
var signOutButton = document.getElementById('googleSignOut');
var resetButton = document.getElementById('resetDemo');
var statusAuthActions = document.getElementById('statusAuthActions');
var accountDataActions = document.getElementById('accountDataActions');
var firebaseConfig = window.GROWTH_FIREBASE_CONFIG || {};
var sdkVersion = window.GROWTH_FIREBASE_SDK_VERSION || '10.12.5';
var LAST_CLOUD_UID_KEY = 'growth-quest-last-cloud-uid';
var remoteReady = false;
var remoteUser = null;
var saveTimer = null;
var authGeneration = 0;
var remoteRevision = 0;
var saveChain = Promise.resolve();
var firestoreTools = null;

function configured(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

function setAuthUi(mode, message) {
  if (authTitle) authTitle.textContent = mode;
  if (authMessage) authMessage.textContent = message;
}

function readLastCloudUid() {
  try {
    return localStorage.getItem(LAST_CLOUD_UID_KEY) || '';
  } catch (error) {
    return '';
  }
}

function rememberCloudUid(uid) {
  try {
    localStorage.setItem(LAST_CLOUD_UID_KEY, uid);
  } catch (error) {
    setAuthUi('Cloud sync', 'Signed in, but this browser cannot remember the account locally.');
  }
}

function forgetCloudUid() {
  try {
    localStorage.removeItem(LAST_CLOUD_UID_KEY);
  } catch (error) {}
}

function stopRemoteSave() {
  remoteReady = false;
  window.clearTimeout(saveTimer);
  saveTimer = null;
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
      runTransaction: firestoreModule.runTransaction,
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
      var previousUid = remoteUser && remoteUser.uid ? remoteUser.uid : '';
      var generation = ++authGeneration;
      stopRemoteSave();
      remoteRevision = 0;
      remoteUser = user || null;

      waitForBoard().then(function (board) {
        board.disableRemoteSave();
      });

      if (remoteUser) {
        placeResetControl(true);
        handleSignedIn(remoteUser, generation).catch(function (error) {
          if (generation !== authGeneration) return;
          stopRemoteSave();
          waitForBoard().then(function (board) {
            board.disableRemoteSave();
          });
          var message = error && error.code === 'growth/conflict'
            ? 'Newer cloud data exists. Reload before making more changes.'
            : 'Cloud sync failed. Changes will remain on this device.';
          setAuthUi('Sync unavailable', message);
        });
      } else {
        placeResetControl(false);
        if (previousUid) forgetCloudUid();
        waitForBoard().then(function (board) {
          board.disableRemoteSave();
          board.setAuthenticatedUser(null);
          if (previousUid && board.showDemo) board.showDemo();
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
      var uid = remoteUser.uid;
      var generation = authGeneration;
      var nextState = event && event.detail ? event.detail.state : null;
      if (!nextState) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(function () {
        if (!remoteReady || !remoteUser || remoteUser.uid !== uid || generation !== authGeneration) return;
        saveChain = saveChain
          .then(function () {
            return saveRemoteState(uid, nextState, generation);
          })
          .then(function () {
            if (remoteReady && remoteUser && remoteUser.uid === uid && generation === authGeneration) {
              setAuthUi('Cloud sync', 'Saved to your Google account.');
            }
          })
          .catch(function (error) {
            if (generation !== authGeneration) return;
            stopRemoteSave();
            waitForBoard().then(function (board) {
              board.disableRemoteSave();
            });
            var message = error && error.code === 'growth/conflict'
              ? 'A newer cloud version exists. Reload to keep both devices safe.'
              : 'Save failed. Your latest changes remain on this device.';
            setAuthUi('Sync paused', message);
          });
      }, 650);
    });

    window.addEventListener('growth-storage-error', function () {
      setAuthUi('Local save failed', 'Browser storage is unavailable. Keep this tab open.');
    });
  } catch (error) {
    setAuthUi('Local mode', 'Sync unavailable. Local board works.');
    if (signInButton) signInButton.disabled = true;
  }
}

async function handleSignedIn(user, generation) {
  if (signInButton) signInButton.hidden = true;
  if (signOutButton) signOutButton.hidden = false;
  setAuthUi('Cloud sync', 'Loading ' + (user.email || 'Google user') + '...');

  var board = await waitForBoard();
  if (generation !== authGeneration || !remoteUser || remoteUser.uid !== user.uid) return;
  var remoteDocument = await loadRemoteState(user.uid);
  if (generation !== authGeneration || !remoteUser || remoteUser.uid !== user.uid) return;
  if (remoteDocument) {
    remoteRevision = remoteDocument.revision;
    board.replaceState(remoteDocument.state);
  } else {
    var localState = board.getState();
    var previousCloudUid = readLastCloudUid();
    if ((localState.mode === 'demo' || (previousCloudUid && previousCloudUid !== user.uid)) && board.startFresh) {
      localState = board.startFresh();
    }
    await saveRemoteState(user.uid, localState, generation);
  }

  if (generation !== authGeneration || !remoteUser || remoteUser.uid !== user.uid) return;
  rememberCloudUid(user.uid);
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
  return data && data.state ? {
    state: data.state,
    revision: Math.max(0, Number(data.revision) || 0)
  } : null;
}

async function saveRemoteState(uid, state, generation) {
  if (!firestoreTools || !uid || !state) return;
  var ref = firestoreTools.doc(firestoreTools.db, 'growthQuest', uid);
  var expectedRevision = remoteRevision;
  var nextRevision = await firestoreTools.runTransaction(firestoreTools.db, async function (transaction) {
    var snapshot = await transaction.get(ref);
    var data = snapshot.exists() ? snapshot.data() : {};
    var cloudRevision = Math.max(0, Number(data && data.revision) || 0);
    if (cloudRevision !== expectedRevision) {
      var conflict = new Error('Cloud state changed on another device.');
      conflict.code = 'growth/conflict';
      throw conflict;
    }
    transaction.set(ref, {
      state: state,
      revision: cloudRevision + 1,
      updatedAt: firestoreTools.serverTimestamp()
    }, { merge: true });
    return cloudRevision + 1;
  });
  if (generation === authGeneration && remoteUser && remoteUser.uid === uid) {
    remoteRevision = nextRevision;
  }
}

initFirebaseAuth().catch(function () {
  setAuthUi('Local mode', 'Sync unavailable. Local board works.');
  if (signInButton) signInButton.disabled = true;
});
