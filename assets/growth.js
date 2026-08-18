(function () {
  'use strict';

  var KEY = 'dooyoung-growth-quest-v10';
  var DEMO_VERSION = 6;
  var MAX_LEVEL = 50;
  var XP_PER_LEVEL = 170;
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth();
  var todayKey = toDateKey(today);
  var defaultAxes = ['Health', 'Intelligence', 'Capital'];
  var rankNames = [
    'Life Initiate',
    'Routine Builder',
    'Momentum Runner',
    'Growth Strategist',
    'Systems Master'
  ];
  var commonEvolution = [
    { name: 'Eucalyptus Dreamer', kind: 'outfit', unlock: 'Natural Koala', detail: 'A quiet beginning among eucalyptus leaves.' },
    { name: 'Leaf Forager', kind: 'effect', unlock: 'Leaf Trail', detail: 'Fresh leaves follow each happy movement.' },
    { name: 'Branch Listener', kind: 'motion', unlock: 'Ear Wiggle', detail: 'A curious idle motion joins the character loop.' },
    { name: 'Pocket Explorer', kind: 'outfit', unlock: 'Canvas Satchel', detail: 'A small satchel appears for the first collected plans.' },
    { name: 'Gumtree Scout', kind: 'skill', unlock: 'Leaf Toss', detail: 'The first playful skill can be cast.' },
    { name: 'Morning Climber', kind: 'motion', unlock: 'Branch Swing', detail: 'The koala swings with more confidence.' },
    { name: 'Trail Keeper', kind: 'outfit', unlock: 'Explorer Scarf', detail: 'A simple scarf marks a growing routine.' },
    { name: 'Canopy Seeker', kind: 'effect', unlock: 'Sun Motes', detail: 'Soft motes gather around the eucalyptus canopy.' },
    { name: 'Pathfinder', kind: 'skill', unlock: 'Eucalyptus Guard', detail: 'A protective ring of leaves becomes available.' },
    { name: 'Crossroads', kind: 'scene', unlock: 'Path Aurora', detail: 'The three career paths become visible.' }
  ];
  var evolutionPaths = {
    guardian: {
      label: 'Guardian',
      classLabel: 'Guardian Class',
      axis: 'Health',
      accent: '#ff5a5f',
      accents: ['#b9424b', '#d64d54', '#ff5a5f', '#ff6c63', '#e69a55', '#e0a85d', '#7bcf90', '#f1d06a'],
      chapters: [
        chapter('Trail Guardian', 'Bushland Trail', ['Training Vest', 'Guard Stance', 'Branch Strike', 'Ember Pulse', 'Trail Camp']),
        chapter('Ironbark Guard', 'Ironbark Grove', ['Ironbark Pauldrons', 'Shield Ready', 'Bark Barrier', 'Impact Sparks', 'Ironbark Gate']),
        chapter('Red Earth Knight', 'Red Earth Ridge', ['Crimson Mantle', 'Grounded Step', 'Red Earth Cleave', 'Dust Halo', 'Sunset Ridge']),
        chapter('Stormwall Warden', 'Coastal Storm', ['Stormplate Vest', 'Storm Brace', 'Thunder Guard', 'Rain Sparks', 'Stormwall Lookout']),
        chapter('Sunforged Champion', 'Sunlit Range', ['Sunforged Crown', 'Champion Salute', 'Solar Breaker', 'Gold Ember Ring', 'Sunforge Arena']),
        chapter('Southern Sentinel', 'Southern Night', ['Sentinel Cape', 'Starwatch Stance', 'Cross Guard', 'Starsteel Sparks', 'Southern Watch']),
        chapter('Canopy Protector', 'Ancient Canopy', ['Canopy Aegis', 'Guardian Roar', 'Worldroot Shield', 'Verdant Aura', 'Great Tree Sanctuary']),
        chapter('Worldtree Vanguard', 'Worldtree Dawn', ['Vanguard Regalia', 'Victory Rise', 'Worldtree Nova', 'Crown of Sparks', 'Worldtree Horizon'])
      ]
    },
    arcanist: {
      label: 'Arcanist',
      classLabel: 'Arcanist Class',
      axis: 'Intelligence',
      accent: '#4f8edc',
      accents: ['#416fae', '#4f8edc', '#6f7fe2', '#5aa8db', '#8d73df', '#63b7c8', '#8a79e6', '#73d0d1'],
      chapters: [
        chapter('Gumleaf Adept', 'Scholar Grove', ['Apprentice Robe', 'Page Turn', 'Leaf Spark', 'Ink Motes', 'Study Nook']),
        chapter('Ember Scholar', 'Ember Library', ['Ember Hood', 'Focused Cast', 'Cinder Bolt', 'Ember Glyphs', 'Firelit Archive']),
        chapter('Moonlit Arcanist', 'Moonlit Canopy', ['Moonweave Mantle', 'Moonstep', 'Lunar Orb', 'Silver Runes', 'Moon Observatory']),
        chapter('Stormcaller', 'Cloud Laboratory', ['Storm Collar', 'Staff Spin', 'Arc Lightning', 'Cloud Sparks', 'Storm Observatory']),
        chapter('Starbloom Magus', 'Starbloom Garden', ['Starbloom Crown', 'Hovering Read', 'Comet Bloom', 'Orbiting Stars', 'Celestial Garden']),
        chapter('Aurora Sage', 'Aurora Range', ['Aurora Robe', 'Sage Levitation', 'Spectrum Ray', 'Aurora Veil', 'Polar Observatory']),
        chapter('Cosmic Weaver', 'Deep Sky', ['Cosmic Mantle', 'Constellation Cast', 'Gravity Well', 'Nebula Orbit', 'Astral Library']),
        chapter('Eucalypt Archmage', 'Eternal Canopy', ['Archmage Regalia', 'Grand Invocation', 'Eucalypt Nova', 'Infinite Runes', 'Eternal Canopy'])
      ]
    },
    founder: {
      label: 'Founder',
      classLabel: 'Founder Class',
      axis: 'Capital',
      accent: '#d8b45a',
      accents: ['#a9853c', '#c39a44', '#d8b45a', '#d6a857', '#e1bd67', '#d7c06f', '#89c398', '#e3ca74'],
      chapters: [
        chapter('Market Scout', 'Weekend Market', ['Utility Jacket', 'Price Check', 'Coin Compass', 'Ledger Ticks', 'Market Stall']),
        chapter('Venture Builder', 'Workshop Floor', ['Builder Vest', 'Prototype Pose', 'Launch Spark', 'Blueprint Lines', 'Maker Workshop']),
        chapter('Goldleaf Broker', 'Goldleaf Arcade', ['Goldleaf Tie', 'Deal Gesture', 'Value Pulse', 'Coin Orbit', 'Goldleaf Arcade']),
        chapter('Harbour Founder', 'Harbour Studio', ['Founder Coat', 'Pitch Stance', 'Harbour Beacon', 'Signal Waves', 'Harbour Office']),
        chapter('Scale Architect', 'City Network', ['Architect Blazer', 'Systems Scan', 'Network Link', 'Data Nodes', 'City Grid']),
        chapter('Southern Magnate', 'Southern Exchange', ['Magnate Cape', 'Confident Step', 'Capital Surge', 'Golden Trails', 'Southern Exchange']),
        chapter('Ecosystem Shaper', 'Living Network', ['Ecosystem Mantle', 'Network Conduct', 'Alliance Field', 'Partner Nodes', 'Living Network']),
        chapter('Prosperity Pioneer', 'Future City', ['Pioneer Regalia', 'Horizon Point', 'Prosperity Wave', 'Crown of Coins', 'Future Horizon'])
      ]
    }
  };

  function chapter(name, scene, unlockNames) {
    var kinds = ['outfit', 'motion', 'skill', 'effect', 'scene'];
    return {
      name: name,
      scene: scene,
      unlocks: unlockNames.map(function (unlock, index) {
        return { kind: kinds[index], unlock: unlock };
      })
    };
  }

  var els = {
    levelValue: byId('levelValue'),
    playerName: byId('playerName'),
    playerNameButton: byId('playerNameButton'),
    playerNameForm: byId('playerNameForm'),
    playerNameInput: byId('playerNameInput'),
    playerNameCancel: byId('playerNameCancel'),
    rankName: byId('rankName'),
    className: byId('className'),
    growthAvatar: byId('growthAvatar'),
    evolutionScene: byId('evolutionScene'),
    evolutionOpen: byId('evolutionOpen'),
    evolutionDialog: byId('evolutionDialog'),
    evolutionClose: byId('evolutionClose'),
    evolutionPathTabs: byId('evolutionPathTabs'),
    evolutionGrid: byId('evolutionGrid'),
    evolutionDetail: byId('evolutionDetail'),
    growthRewardToast: byId('growthRewardToast'),
    rankState: byId('rankState'),
    xpFill: byId('xpFill'),
    xpLabel: byId('xpLabel'),
    monthlyCompletion: byId('monthlyCompletion'),
    streakLabel: byId('streakLabel'),
    statusCompletedToday: byId('statusCompletedToday'),
    statusActiveQuests: byId('statusActiveQuests'),
    boardCompletedHabits: byId('boardCompletedHabits'),
    boardActiveQuests: byId('boardActiveQuests'),
    seasonScore: byId('seasonScore'),
    boardProgressFill: byId('boardProgressFill'),
    progressGraph: byId('progressGraph'),
    achievementPanel: byId('achievementPanel'),
    staminaFill: byId('staminaFill'),
    staminaScore: byId('staminaScore'),
    intelligenceFill: byId('intelligenceFill'),
    intelligenceScore: byId('intelligenceScore'),
    capitalFill: byId('capitalFill'),
    capitalScore: byId('capitalScore'),
    currentMonthLabel: byId('currentMonthLabel'),
    boardTitle: byId('boardTitle'),
    todayLabel: byId('todayLabel'),
    monthGrid: byId('monthGrid'),
    calendarScrollbar: byId('calendarScrollbar'),
    calendarScrollbarTrack: byId('calendarScrollbarTrack'),
    trendPanel: byId('trendPanel'),
    questForm: byId('questForm'),
    boardTools: document.querySelector('.board-tools'),
    questTitle: byId('questTitle'),
    questCadence: byId('questCadence'),
    questCadenceButton: byId('questCadenceButton'),
    questCadenceLabel: byId('questCadenceLabel'),
    questCadenceMenu: byId('questCadenceMenu'),
    questAxis: byId('questAxis'),
    questAxisButton: byId('questAxisButton'),
    questAxisLabel: byId('questAxisLabel'),
    questAxisMenu: byId('questAxisMenu'),
    questAxisOptions: byId('questAxisOptions'),
    axisToggle: byId('axisToggle'),
    axisQuickAdd: byId('axisQuickAdd'),
    axisAddButton: byId('axisAddButton'),
    axisForm: byId('axisForm'),
    axisName: byId('axisName'),
    axisList: byId('axisList'),
    resetDemo: byId('resetDemo')
  };

  if (!els.monthGrid) return;

  var activeView = 'board';
  var statisticsRange = 'monthly';
  var selectedAchievementId = null;
  var draggedQuestId = null;
  var dragInsertPosition = 'before';
  var dragDropHandled = false;
  var syncingCalendarScroll = false;
  var remoteSaveReady = false;
  var authenticatedProfile = null;
  var selectedEvolutionPath = 'arcanist';
  var selectedEvolutionLevel = 1;
  var rewardToastTimer = null;
  var state = migrateState(loadState());
  saveState();
  exposeGrowthQuest();

  if (els.currentMonthLabel) els.currentMonthLabel.textContent = monthLabel();
  els.boardTitle.textContent = monthLabel();
  if (els.todayLabel) els.todayLabel.textContent = todayLabel();

  document.querySelectorAll('.board-tab').forEach(function (button) {
    button.addEventListener('click', function () {
      var nextView = button.getAttribute('data-view') || 'board';
      activeView = nextView;
      render();
    });
  });

  if (els.questAxisButton && els.questAxisMenu) {
    els.questAxisButton.addEventListener('click', function () {
      var willOpen = els.questAxisMenu.hidden;
      closeQuestMenus();
      setQuestMenuOpen(els.questAxisButton, els.questAxisMenu, willOpen);
    });
  }

  if (els.calendarScrollbar) {
    els.calendarScrollbar.addEventListener('scroll', function () {
      if (syncingCalendarScroll) return;
      syncingCalendarScroll = true;
      els.monthGrid.parentElement.scrollLeft = els.calendarScrollbar.scrollLeft;
      syncingCalendarScroll = false;
    });

    els.monthGrid.parentElement.addEventListener('scroll', function () {
      if (syncingCalendarScroll) return;
      syncingCalendarScroll = true;
      els.calendarScrollbar.scrollLeft = els.monthGrid.parentElement.scrollLeft;
      syncingCalendarScroll = false;
    });

    els.monthGrid.parentElement.addEventListener('wheel', function (event) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      els.calendarScrollbar.scrollLeft += event.deltaX;
    }, { passive: false });

    window.addEventListener('resize', updateCalendarScrollbar);
  }

  if (els.playerNameButton) {
    els.playerNameButton.addEventListener('click', openPlayerNameEditor);
  }

  if (els.evolutionOpen) {
    els.evolutionOpen.addEventListener('click', function () {
      openEvolutionDialog();
    });
  }

  if (els.evolutionClose) {
    els.evolutionClose.addEventListener('click', closeEvolutionDialog);
  }

  if (els.evolutionDialog) {
    els.evolutionDialog.addEventListener('click', function (event) {
      if (event.target === els.evolutionDialog) closeEvolutionDialog();
    });
  }

  if (els.playerNameForm) {
    els.playerNameForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!authenticatedProfile || !els.playerNameInput) return;
      var nextName = els.playerNameInput.value.trim();
      if (!nextName) return;
      state.playerName = nextName;
      closePlayerNameEditor();
      saveState();
      renderPlayerName();
    });
  }

  if (els.playerNameCancel) {
    els.playerNameCancel.addEventListener('click', closePlayerNameEditor);
  }

  if (els.playerNameInput) {
    els.playerNameInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePlayerNameEditor();
      }
    });
  }

  if (els.questCadenceButton && els.questCadenceMenu) {
    els.questCadenceButton.addEventListener('click', function () {
      var willOpen = els.questCadenceMenu.hidden;
      closeQuestMenus();
      setQuestMenuOpen(els.questCadenceButton, els.questCadenceMenu, willOpen);
    });
  }

  document.querySelectorAll('[data-cadence-option]').forEach(function (button) {
    button.addEventListener('click', function () {
      els.questCadence.value = button.getAttribute('data-cadence-option') || 'daily';
      renderCadenceControl();
      closeQuestMenus();
    });
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest('.quest-menu')) return;
    closeQuestMenus();
  });

  els.questForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addQuest();
  });

  if (els.axisForm) {
    els.axisForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addAxis();
    });
  }

  if (els.axisToggle && els.axisQuickAdd) {
    els.axisToggle.addEventListener('click', function () {
      var willOpen = els.axisQuickAdd.hidden;
      els.axisQuickAdd.hidden = !willOpen;
      els.axisToggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen && els.axisName) els.axisName.focus();
    });
  }

  if (els.axisAddButton) {
    els.axisAddButton.addEventListener('click', addAxis);
  }

  if (els.axisName) {
    els.axisName.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        addAxis();
      }
      if (event.key === 'Escape' && els.axisQuickAdd) {
        els.axisQuickAdd.hidden = true;
        if (els.axisToggle) els.axisToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  els.resetDemo.addEventListener('click', function () {
    var signedIn = els.resetDemo.getAttribute('data-signed-in') === 'true';
    var message = signedIn
      ? 'Reset all Growth Quest data for this signed-in account? This cannot be undone.'
      : 'Reset local Growth Quest data in this browser?';
    if (!window.confirm(message)) return;
    state = signedIn ? seedState() : demoState();
    saveState();
    activeView = 'board';
    statisticsRange = 'monthly';
    render();
  });

  render();

  function render() {
    renderAxisOptions();
    renderCadenceControl();
    renderAxisControls();
    renderPlayerName();
    renderOverview();
    renderTabs();

    var boardWrap = els.monthGrid.parentElement;
    var isBoard = activeView === 'board';
    boardWrap.hidden = !isBoard;
    if (els.calendarScrollbar) els.calendarScrollbar.hidden = !isBoard;
    els.questForm.hidden = !isBoard;
    if (els.boardTools) els.boardTools.hidden = !isBoard;
    if (els.progressGraph) els.progressGraph.hidden = true;
    if (els.achievementPanel) els.achievementPanel.hidden = isBoard;
    els.trendPanel.hidden = isBoard;

    if (isBoard) {
      renderMonthGrid();
      updateCalendarScrollbar();
      centerToday();
    } else {
      renderAchievements();
      renderTrend(statisticsRange);
    }
  }

  function renderTabs() {
    document.querySelectorAll('.board-tab').forEach(function (button) {
      var selected = button.getAttribute('data-view') === activeView;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function renderOverview() {
    var xp = totalXp();
    var level = levelFromXp(xp);
    var levelXp = level >= MAX_LEVEL ? XP_PER_LEVEL : xp % XP_PER_LEVEL;
    var completion = monthlyCompletion(state.quests);
    var streak = currentStreak();
    var dailyQuests = state.quests.filter(function (quest) { return quest.cadence === 'daily'; });
    var todayDone = dailyQuests.filter(function (quest) { return quest.checks[todayKey]; }).length;
    var monthDoneQuests = completedQuestCountInMonth();
    var rank = rankNames[Math.min(rankNames.length - 1, Math.floor((level - 1) / 10))];
    var stamina = scoreForAxes(['Health', 'Stamina']);
    var intelligence = scoreForAxes(['Intelligence', 'Work', 'Growth']);
    var capital = scoreForAxes(['Capital']);

    els.levelValue.textContent = level;
    els.rankName.textContent = rank;
    renderCharacterClass(level);
    if (els.rankState) {
      els.rankState.textContent = completion >= 100
        ? 'Perfect clear'
        : completion >= 90
          ? 'High clear'
          : completion >= 80
            ? 'Pass clear'
            : 'Quest line open';
    }
    els.xpFill.style.width = Math.min(100, Math.round((levelXp / XP_PER_LEVEL) * 100)) + '%';
    els.xpLabel.textContent = level >= MAX_LEVEL ? 'MAX' : levelXp + ' / ' + XP_PER_LEVEL;
    if (els.monthlyCompletion) els.monthlyCompletion.textContent = completion + '%';
    if (els.streakLabel) els.streakLabel.textContent = streak + ' day streak';
    if (els.statusCompletedToday) els.statusCompletedToday.textContent = todayDone;
    if (els.statusActiveQuests) els.statusActiveQuests.textContent = state.quests.length;
    els.boardCompletedHabits.textContent = todayDone;
    els.boardActiveQuests.textContent = dailyQuests.length;
    els.seasonScore.textContent = completion + '%';
    els.boardProgressFill.style.width = completion + '%';
    updateStat('stamina', stamina);
    updateStat('intelligence', intelligence);
    updateStat('capital', capital);
  }

  function visiblePlayerName() {
    if (!authenticatedProfile) return 'Koala';
    return state.playerName || authenticatedProfile.displayName || 'Koala';
  }

  function renderCharacterClass(level) {
    if (!els.growthAvatar) return;
    var path = level >= 11 ? dominantEvolutionPath() : 'novice';
    var profile = evolutionProfile(level, path);
    var avatarClass = path === 'guardian'
      ? 'avatar-warrior'
      : path === 'arcanist'
        ? 'avatar-mage'
        : path === 'founder'
          ? 'avatar-entrepreneur'
          : 'avatar-novice';

    els.growthAvatar.classList.remove(
      'avatar-novice',
      'avatar-warrior',
      'avatar-mage',
      'avatar-entrepreneur',
      'avatar-tier-1',
      'avatar-tier-2',
      'avatar-tier-3',
      'avatar-tier-4',
      'avatar-tier-5',
      'motion-calm',
      'motion-sway',
      'motion-hop',
      'motion-guard',
      'motion-cast',
      'motion-plan'
    );
    els.growthAvatar.classList.add(avatarClass, 'avatar-tier-' + Math.min(5, Math.max(1, Math.ceil(level / 10))), 'motion-' + profile.motionCode);
    els.growthAvatar.setAttribute('data-path', path);
    els.growthAvatar.setAttribute('data-level', String(level));
    els.growthAvatar.setAttribute('data-tier', String(profile.tier));
    els.growthAvatar.setAttribute('data-step', String(profile.step));
    els.growthAvatar.setAttribute('data-unlock-kind', profile.unlock.kind);
    els.growthAvatar.style.setProperty('--evolution-accent', profile.accent);
    els.growthAvatar.style.setProperty('--evolution-intensity', String(profile.intensity));
    els.growthAvatar.style.setProperty('--evolution-scale', String((1 + (profile.tier * 0.012) + (profile.step * 0.003)).toFixed(3)));
    els.growthAvatar.style.setProperty('--cape-visible', level >= 7 ? '1' : '0');
    els.growthAvatar.style.setProperty('--emblem-visible', level >= 4 ? '1' : '0');
    els.growthAvatar.style.setProperty('--skill-visible', level >= 5 ? '1' : '0');
    els.growthAvatar.style.setProperty('--particle-two-visible', level >= 8 ? '1' : '0');
    els.growthAvatar.style.setProperty('--particle-three-visible', level >= 14 ? '1' : '0');
    els.growthAvatar.setAttribute('aria-label', profile.classLabel.replace(' Class', '') + ' koala, level ' + level);
    if (els.evolutionScene) {
      els.evolutionScene.setAttribute('data-path', path);
      els.evolutionScene.setAttribute('data-tier', String(profile.tier));
      els.evolutionScene.setAttribute('data-step', String(profile.step));
      els.evolutionScene.style.setProperty('--evolution-accent', profile.accent);
      els.evolutionScene.style.setProperty('--evolution-intensity', String(profile.intensity));
    }
    if (els.className) els.className.textContent = profile.classLabel;
    if (els.rankName) els.rankName.textContent = profile.title;
    return profile;
  }

  function levelFromXp(xp) {
    return Math.min(MAX_LEVEL, Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1);
  }

  function dominantEvolutionPath() {
    var paths = [
      { key: 'guardian', xp: lifetimeXpForAxes(['Health', 'Stamina']) },
      { key: 'arcanist', xp: lifetimeXpForAxes(['Intelligence', 'Work', 'Growth']) },
      { key: 'founder', xp: lifetimeXpForAxes(['Capital']) }
    ];
    paths.sort(function (a, b) { return b.xp - a.xp; });
    return paths[0].key;
  }

  function evolutionProfile(level, requestedPath) {
    var safeLevel = Math.max(1, Math.min(MAX_LEVEL, Number(level) || 1));
    var path = safeLevel <= 10 ? 'novice' : (evolutionPaths[requestedPath] ? requestedPath : 'arcanist');
    var base = {
      level: safeLevel,
      path: path,
      classLabel: 'Unassigned Class',
      title: commonEvolution[Math.min(9, safeLevel - 1)].name,
      chapter: 'The Eucalyptus Beginning',
      unlock: commonEvolution[Math.min(9, safeLevel - 1)],
      outfit: 'Natural Koala',
      motion: 'Leaf Nibble',
      motionCode: 'sway',
      skill: 'Quiet Rest',
      effect: 'Soft Leaf Drift',
      scene: 'Eucalyptus Dawn',
      accent: '#72c69a',
      tier: Math.max(1, Math.ceil(safeLevel / 5)),
      step: ((safeLevel - 1) % 5) + 1,
      intensity: Number((safeLevel / MAX_LEVEL).toFixed(2))
    };

    commonEvolution.slice(0, Math.min(10, safeLevel)).forEach(function (item) {
      applyEvolutionUnlock(base, item);
    });
    if (safeLevel <= 10) return base;

    var pathData = evolutionPaths[path];
    base.classLabel = pathData.classLabel;
    base.tier = Math.floor((safeLevel - 11) / 5) + 1;
    base.step = ((safeLevel - 11) % 5) + 1;
    base.accent = pathData.accents[Math.min(pathData.accents.length - 1, base.tier - 1)] || pathData.accent;
    base.motionCode = path === 'guardian' ? 'guard' : path === 'arcanist' ? 'cast' : 'plan';
    pathData.chapters.forEach(function (chapterData, chapterIndex) {
      var firstLevel = 11 + (chapterIndex * 5);
      if (firstLevel > safeLevel) return;
      base.chapter = chapterData.name;
      chapterData.unlocks.forEach(function (item, unlockIndex) {
        if (firstLevel + unlockIndex <= safeLevel) applyEvolutionUnlock(base, item);
      });
    });
    var activeChapter = pathData.chapters[Math.min(pathData.chapters.length - 1, base.tier - 1)];
    base.title = activeChapter.name;
    var activeUnlock = activeChapter.unlocks[base.step - 1];
    base.unlock = {
      kind: activeUnlock.kind,
      unlock: activeUnlock.unlock,
      detail: evolutionUnlockDetail(activeUnlock, activeChapter.name)
    };
    return base;
  }

  function applyEvolutionUnlock(profile, item) {
    if (!item) return;
    if (item.kind === 'outfit') profile.outfit = item.unlock;
    if (item.kind === 'motion') profile.motion = item.unlock;
    if (item.kind === 'skill') profile.skill = item.unlock;
    if (item.kind === 'effect') profile.effect = item.unlock;
    if (item.kind === 'scene') profile.scene = item.unlock;
  }

  function evolutionUnlockDetail(item, chapterName) {
    if (item.detail) return item.detail;
    var labels = {
      outfit: 'A new outfit piece changes the character silhouette.',
      motion: 'A new idle motion joins the character loop.',
      skill: 'A new active skill effect becomes visible.',
      effect: 'Particles and aura gain a new layer.',
      scene: 'The character background advances to a new chapter.'
    };
    return chapterName + ': ' + (labels[item.kind] || 'A new evolution detail is unlocked.');
  }

  function lifetimeXpForAxes(axisNames) {
    return state.quests.reduce(function (sum, quest) {
      if (axisNames.indexOf(quest.axis) === -1) return sum;
      return sum + Object.keys(quest.checks || {}).length * xpForCadence(quest.cadence);
    }, 0);
  }

  function dailyCompletionForDate(date) {
    var dailyQuests = state.quests.filter(function (quest) { return quest.cadence === 'daily'; });
    if (!dailyQuests.length) return 0;
    var key = toDateKey(date);
    var done = dailyQuests.filter(function (quest) { return !!quest.checks[key]; }).length;
    return Math.round((done / dailyQuests.length) * 100);
  }

  function openEvolutionDialog(level) {
    if (!els.evolutionDialog) return;
    var currentLevel = levelFromXp(totalXp());
    selectedEvolutionPath = currentLevel >= 11 ? dominantEvolutionPath() : selectedEvolutionPath;
    selectedEvolutionLevel = Math.max(1, Math.min(MAX_LEVEL, Number(level) || currentLevel));
    renderEvolutionDialog();
    if (typeof els.evolutionDialog.showModal === 'function') els.evolutionDialog.showModal();
    else els.evolutionDialog.setAttribute('open', '');
  }

  function closeEvolutionDialog() {
    if (!els.evolutionDialog) return;
    if (typeof els.evolutionDialog.close === 'function' && els.evolutionDialog.open) els.evolutionDialog.close();
    else els.evolutionDialog.removeAttribute('open');
  }

  function renderEvolutionDialog() {
    if (!els.evolutionPathTabs || !els.evolutionGrid || !els.evolutionDetail) return;
    var currentLevel = levelFromXp(totalXp());
    els.evolutionPathTabs.innerHTML = Object.keys(evolutionPaths).map(function (path) {
      var selected = path === selectedEvolutionPath;
      return '<button type="button" role="tab" aria-selected="' + (selected ? 'true' : 'false') + '" class="' + (selected ? 'active' : '') + '" data-evolution-path="' + path + '">' + escapeHtml(evolutionPaths[path].label) + '</button>';
    }).join('');

    els.evolutionGrid.innerHTML = Array.from({ length: MAX_LEVEL }, function (_, index) {
      var level = index + 1;
      var profile = evolutionProfile(level, selectedEvolutionPath);
      var classes = ['evolution-level'];
      if (level <= currentLevel) classes.push('unlocked');
      if (level === currentLevel) classes.push('current');
      if (level === selectedEvolutionLevel) classes.push('selected');
      if (level % 10 === 0) classes.push('milestone');
      return '<button class="' + classes.join(' ') + '" type="button" data-evolution-level="' + level + '" title="Lv. ' + level + ' / ' + escapeAttr(profile.unlock.unlock) + '"><span>' + level + '</span><i data-kind="' + escapeAttr(profile.unlock.kind) + '"></i></button>';
    }).join('');

    var detail = evolutionProfile(selectedEvolutionLevel, selectedEvolutionPath);
    var stateLabel = selectedEvolutionLevel <= currentLevel ? 'Unlocked' : 'Locked';
    els.evolutionDetail.innerHTML =
      '<div class="evolution-detail-visual" data-path="' + escapeAttr(detail.path) + '" data-tier="' + detail.tier + '" style="--evolution-accent:' + escapeAttr(detail.accent) + '">' +
        '<span class="detail-aura"></span><span class="detail-koala"></span><span class="detail-gear"></span><span class="detail-skill"></span>' +
      '</div>' +
      '<div class="evolution-detail-copy"><span>Lv. ' + detail.level + ' / ' + escapeHtml(stateLabel) + '</span><h3>' + escapeHtml(detail.title) + '</h3><strong>' + escapeHtml(detail.unlock.unlock) + '</strong><p>' + escapeHtml(detail.unlock.detail || evolutionUnlockDetail(detail.unlock, detail.title)) + '</p>' +
      '<dl><div><dt>Outfit</dt><dd>' + escapeHtml(detail.outfit) + '</dd></div><div><dt>Motion</dt><dd>' + escapeHtml(detail.motion) + '</dd></div><div><dt>Skill</dt><dd>' + escapeHtml(detail.skill) + '</dd></div><div><dt>Effect</dt><dd>' + escapeHtml(detail.effect) + '</dd></div><div><dt>Scene</dt><dd>' + escapeHtml(detail.scene) + '</dd></div></dl></div>';

    els.evolutionPathTabs.querySelectorAll('[data-evolution-path]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectedEvolutionPath = button.getAttribute('data-evolution-path') || 'arcanist';
        renderEvolutionDialog();
      });
    });
    els.evolutionGrid.querySelectorAll('[data-evolution-level]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectedEvolutionLevel = Number(button.getAttribute('data-evolution-level')) || 1;
        renderEvolutionDialog();
      });
    });
  }

  function playQuestReward(quest, cadence, previousLevel) {
    if (!quest || !els.growthRewardToast) return;
    var nextLevel = levelFromXp(totalXp());
    var axis = canonicalAxis(quest.axis);
    var bonus = xpForCadence(cadence);
    var leveledUp = nextLevel > previousLevel;
    els.growthRewardToast.innerHTML = '<strong>' + (leveledUp ? 'Level Up! Lv. ' + nextLevel : '+' + bonus + ' EXP') + '</strong><span>' + escapeHtml(cleanQuestTitle(quest.title, cadence)) + ' / ' + escapeHtml(axis) + '</span>';
    els.growthRewardToast.hidden = false;
    els.growthRewardToast.classList.remove('show');
    void els.growthRewardToast.offsetWidth;
    els.growthRewardToast.classList.add('show');
    if (els.growthAvatar) {
      els.growthAvatar.classList.remove('quest-cleared', 'level-up');
      void els.growthAvatar.offsetWidth;
      els.growthAvatar.classList.add(leveledUp ? 'level-up' : 'quest-cleared');
    }
    if (rewardToastTimer) window.clearTimeout(rewardToastTimer);
    rewardToastTimer = window.setTimeout(function () {
      els.growthRewardToast.classList.remove('show');
      els.growthRewardToast.hidden = true;
      if (els.growthAvatar) els.growthAvatar.classList.remove('quest-cleared', 'level-up');
    }, leveledUp ? 3200 : 2200);
  }

  function renderPlayerName() {
    if (!els.playerName || !els.playerNameButton) return;
    els.playerName.textContent = visiblePlayerName();
    els.playerNameButton.disabled = !authenticatedProfile;
    els.playerNameButton.classList.toggle('editable', Boolean(authenticatedProfile));
    els.playerNameButton.title = authenticatedProfile ? 'Edit character name' : 'Sign in to set your name';
    if (!authenticatedProfile) closePlayerNameEditor();
  }

  function openPlayerNameEditor() {
    if (!authenticatedProfile || !els.playerNameForm || !els.playerNameInput) return;
    els.playerNameInput.value = visiblePlayerName();
    els.playerNameButton.hidden = true;
    els.playerNameForm.hidden = false;
    els.playerNameInput.focus();
    els.playerNameInput.select();
  }

  function closePlayerNameEditor() {
    if (els.playerNameForm) els.playerNameForm.hidden = true;
    if (els.playerNameButton) els.playerNameButton.hidden = false;
  }

  function updateStat(name, value) {
    var fill = els[name + 'Fill'];
    var score = els[name + 'Score'];
    if (fill) fill.style.width = Math.max(0, Math.min(100, value)) + '%';
    if (score) score.textContent = value + '%';
  }

  function scoreForAxes(axisNames) {
    var quests = state.quests.filter(function (quest) {
      return axisNames.indexOf(quest.axis) !== -1;
    });
    return monthlyCompletion(quests);
  }

  function totalCompletedChecks() {
    return state.quests.reduce(function (sum, quest) {
      return sum + Object.keys(quest.checks || {}).length;
    }, 0);
  }

  function completedQuestCountInMonth() {
    var start = startOfMonth(today);
    var end = endOfMonth(today);
    return state.quests.filter(function (quest) {
      return Object.keys(quest.checks || {}).some(function (key) {
        if (!quest.checks[key]) return false;
        var date = parseDateKey(key);
        return date >= start && date <= end;
      });
    }).length;
  }

  function renderMonthGrid() {
    var days = daysInMonth(year, month);
    var weeks = buildWeeks(days);
    var html = '';

    html += '<div class="board-head axis-head">Axis</div>';
    html += '<div class="board-head cadence-head">Type</div>';
    html += '<div class="board-head board-quest-head">Items</div>';
    weeks.forEach(function (week, index) {
      html += '<div class="board-head week-head" style="grid-column: span ' + week.length + '">' + (week.length < 3 ? 'W' : 'Week ') + (index + 1) + '</div>';
    });

    for (var d = 1; d <= days; d += 1) {
      html += '<div class="board-subhead day-head' + (dateKey(year, month, d) === todayKey ? ' today' : '') + '" data-day="' + d + '"' + (dateKey(year, month, d) === todayKey ? ' aria-current="date"' : '') + '><span>' + weekdayShort(year, month, d) + '</span><strong>' + d + '</strong></div>';
    }

    var hasRows = false;
    state.axes.forEach(function (axis, axisIndex) {
      var quests = state.quests.filter(function (quest) { return quest.axis === axis; });
      if (!quests.length) return;
      hasRows = true;
      quests.forEach(function (quest, rowIndex) {
        if (rowIndex === 0) {
          html += '<div class="axis-band axis-' + (axisIndex % 4) + '" style="grid-row: span ' + quests.length + '" aria-label="' + escapeAttr(axis) + '" title="' + escapeAttr(axis) + '"><span class="axis-label">' + escapeHtml(axisCode(axis)) + '</span></div>';
        }
        html += renderQuestRow(quest, days, weeks, axisIndex);
      });
    });

    if (hasRows) {
      html += renderSummaryRows(days);
    }

    if (!hasRows) {
      html += '<div class="empty-board">Add your first quest below.</div>';
    }

    els.monthGrid.style.setProperty('--days', String(days));
    els.monthGrid.innerHTML = html;
    renderProgressGraph(days);
    attachBoardEvents();
  }

  function renderSummaryRows(days) {
    var stats = dailyStats(days);
    var html = '';
    html += '<div class="summary-label" style="grid-column: span 3">Progress</div>';
    stats.forEach(function (day) {
      html += '<div class="summary-cell">' + day.percent + '%</div>';
    });
    html += '<div class="summary-label" style="grid-column: span 3">Net Done</div>';
    stats.forEach(function (day) {
      html += '<div class="summary-cell">' + day.done + '</div>';
    });
    html += '<div class="summary-label" style="grid-column: span 3">Total Done</div>';
    stats.forEach(function (day) {
      html += '<div class="summary-cell">' + day.total + '</div>';
    });
    return html;
  }

  function dailyStats(days) {
    var dailyQuests = state.quests.filter(function (quest) { return quest.cadence === 'daily'; });
    var denom = Math.max(1, dailyQuests.length);
    var total = 0;
    var stats = [];
    for (var d = 1; d <= days; d += 1) {
      var key = dateKey(year, month, d);
      var done = state.quests.filter(function (quest) { return !!quest.checks[key]; }).length;
      var dailyDone = dailyQuests.filter(function (quest) { return !!quest.checks[key]; }).length;
      total += done;
      stats.push({
        done: done,
        total: total,
        percent: Math.round((dailyDone / denom) * 100)
      });
    }
    return stats;
  }

  function renderProgressGraph(days) {
    if (!els.progressGraph) return;
    var stats = dailyStats(days);
    var width = 960;
    var height = 148;
    var padX = 28;
    var padY = 18;
    var usableW = width - padX * 2;
    var usableH = height - padY * 2;
    var points = stats.map(function (day, index) {
      var x = padX + (stats.length <= 1 ? 0 : (usableW * index / (stats.length - 1)));
      var y = padY + usableH - (usableH * day.percent / 100);
      return [Math.round(x), Math.round(y)];
    });
    var pointString = points.map(function (point) { return point.join(','); }).join(' ');
    var areaString = points.length ? padX + ',' + (height - padY) + ' ' + pointString + ' ' + (width - padX) + ',' + (height - padY) : '';
    els.progressGraph.innerHTML =
      '<div class="graph-title"><span>Progress</span><strong>Daily completion</strong></div>' +
      '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Daily completion trend">' +
      '<line x1="' + padX + '" y1="' + (height - padY) + '" x2="' + (width - padX) + '" y2="' + (height - padY) + '" />' +
      '<line x1="' + padX + '" y1="' + (padY + usableH / 2) + '" x2="' + (width - padX) + '" y2="' + (padY + usableH / 2) + '" class="midline" />' +
      '<polygon points="' + areaString + '" />' +
      '<polyline points="' + pointString + '" />' +
      '</svg>';
  }

  function renderAchievements() {
    if (!els.achievementPanel) return;
    var achievements = Array.isArray(state.achievements) ? state.achievements : [];
    var axes = ['Health', 'Intelligence', 'Capital'];
    var html = '<div class="achievement-head"><div><span>Achievements</span><strong>Axis Badges</strong></div><p>Weekly / Monthly Clears</p></div>';
    html += '<div class="badge-row">';

    axes.forEach(function (axis) {
      var count = achievements.filter(function (item) { return item.axis === axis; }).length;
      var tier = badgeTier(count);
      var next = nextBadgeTarget(count);
      var percent = next ? Math.round((count / next) * 100) : 100;
      html += '<article class="axis-badge badge-' + axis.toLowerCase() + (count ? '' : ' locked') + '">';
      html += '<div class="badge-mark">' + escapeHtml(axisCode(axis)) + '</div>';
      html += '<div class="badge-copy"><span>' + escapeHtml(axis) + '</span><strong>' + escapeHtml(tier) + '</strong><em>' + count + ' clears</em></div>';
      html += '<div class="badge-progress" aria-label="' + escapeAttr(axis) + ' badge progress"><span style="width:' + Math.min(100, percent) + '%"></span></div>';
      html += '</article>';
    });

    html += '</div>';
    var selected = selectedAchievementId
      ? achievements.find(function (item) { return item.id === selectedAchievementId; })
      : null;
    if (!selected && achievements.length) selected = achievements[0];
    if (selected) selectedAchievementId = selected.id;

    html += '<div class="achievement-log earned-badges"><span>Earned Badges</span>';

    if (!achievements.length) {
      html += '<p>No clears yet.</p>';
    } else {
      html += '<div class="earned-badge-grid" role="list">';
      achievements.slice(0, 18).forEach(function (item, index) {
        var active = selected && selected.id === item.id;
        var visual = achievementVisual(item, index);
        html += '<button class="earned-badge-button token-' + escapeAttr(item.axis.toLowerCase()) + ' rarity-' + escapeAttr(item.cadence) + ' badge-variant-' + visual.variant + (active ? ' active' : '') + '" style="' + escapeAttr(visual.style) + '" data-achievement-id="' + escapeAttr(item.id) + '" type="button" role="listitem" aria-pressed="' + (active ? 'true' : 'false') + '" aria-label="' + escapeAttr(item.title) + ' badge">';
        html += '<span class="earned-medal">' + escapeHtml(axisCode(item.axis)) + '</span>';
        html += '<small>' + escapeHtml(item.cadence === 'monthly' ? 'M' : 'W') + '</small>';
        html += '</button>';
      });
      html += '</div>';
    }

    if (selected) {
      var selectedVisual = achievementVisual(selected, 0);
      html += '<div class="achievement-detail">';
      html += '<i class="earned-medal large token-' + escapeAttr(selected.axis.toLowerCase()) + ' badge-variant-' + selectedVisual.variant + '">' + escapeHtml(axisCode(selected.axis)) + '</i>';
      html += '<div><strong>' + escapeHtml(selected.title) + '</strong><span>' + escapeHtml(selected.period) + ' / ' + escapeHtml(selected.axis) + '</span><em>+' + achievementXp(selected) + ' XP</em></div>';
      html += '</div>';
    }

    html += '</div>';
    els.achievementPanel.innerHTML = html;
    attachAchievementEvents();
  }

  function attachAchievementEvents() {
    if (!els.achievementPanel) return;
    els.achievementPanel.querySelectorAll('[data-achievement-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        selectedAchievementId = button.getAttribute('data-achievement-id');
        renderAchievements();
      });
    });
  }

  function renderQuestRow(quest, days, weeks, axisIndex) {
    var groupClass = ' axis-group-' + (axisIndex % 4);
    var html = '';
    var cleanTitle = cleanQuestTitle(quest.title, quest.cadence);
    html += '<select class="board-input cadence-select' + groupClass + '" data-cadence="' + quest.id + '" data-row-quest="' + quest.id + '" aria-label="Quest cadence">' + cadenceOptions(quest.cadence) + '</select>';
    html += '<input class="board-input quest-title-input' + groupClass + '" data-title="' + quest.id + '" data-row-quest="' + quest.id + '" value="' + escapeAttr(cleanTitle) + '" draggable="true" aria-label="Quest title" title="Drag to reorder. Drop outside the board to remove.">';

    if (quest.cadence === 'weekly') {
      var startDay = 1;
      weeks.forEach(function (week, index) {
        var endDay = startDay + week.length - 1;
        var key = dateKey(year, month, endDay);
        var checked = !!quest.checks[key];
        var weekStartKey = dateKey(year, month, startDay);
        var ready = startOfDay(today) >= parseDateKey(weekStartKey);
        html += '<button class="check-cell check-bar weekly-bar' + groupClass + (checked ? ' checked' : '') + (ready ? ' ready' : '') + '" style="grid-column: span ' + week.length + '" data-quest="' + quest.id + '" data-row-quest="' + quest.id + '" data-date="' + key + '" type="button" aria-pressed="' + (checked ? 'true' : 'false') + '"' + (ready ? '' : ' disabled') + ' aria-label="' + escapeAttr(quest.title) + ' week ' + (index + 1) + ' clear"><span>' + (week.length < 3 ? 'W' : 'Week ') + (index + 1) + '</span></button>';
        startDay = endDay + 1;
      });
      return html;
    }

    if (quest.cadence === 'monthly') {
      var monthEndKey = dateKey(year, month, days);
      var monthChecked = !!quest.checks[monthEndKey];
      var monthReady = startOfDay(today) >= new Date(year, month, 1);
      html += '<button class="check-cell check-bar monthly-bar' + groupClass + (monthChecked ? ' checked' : '') + (monthReady ? ' ready' : '') + '" style="grid-column: span ' + days + '" data-quest="' + quest.id + '" data-row-quest="' + quest.id + '" data-date="' + monthEndKey + '" type="button" aria-pressed="' + (monthChecked ? 'true' : 'false') + '"' + (monthReady ? '' : ' disabled') + ' aria-label="' + escapeAttr(quest.title) + ' month clear"><span>Month Clear</span></button>';
      return html;
    }

    for (var d = 1; d <= days; d += 1) {
      var key = dateKey(year, month, d);
      var checked = !!quest.checks[key];
      var isToday = key === todayKey;
      html += '<button class="check-cell' + groupClass + (checked ? ' checked' : '') + (isToday ? ' today' : '') + '" data-quest="' + quest.id + '" data-row-quest="' + quest.id + '" data-date="' + key + '" type="button" aria-pressed="' + (checked ? 'true' : 'false') + '"' + (isToday ? '' : ' disabled') + ' aria-label="' + escapeAttr(quest.title) + ' on day ' + d + '"></button>';
    }
    return html;
  }

  function attachBoardEvents() {
    els.monthGrid.querySelectorAll('[data-title]').forEach(function (input) {
      input.addEventListener('change', function () {
        var quest = findQuest(input.getAttribute('data-title'));
        if (!quest) return;
        if (!input.value.trim()) {
          if (window.confirm('Delete this quest?')) {
            state.quests = state.quests.filter(function (item) { return item.id !== quest.id; });
          } else {
            input.value = cleanQuestTitle(quest.title, quest.cadence);
          }
          saveState();
          render();
          return;
        }
        quest.title = cleanQuestTitle(stripCadencePrefix(input.value), quest.cadence);
        saveState();
        render();
      });
    });

    els.monthGrid.querySelectorAll('[data-cadence]').forEach(function (select) {
      select.addEventListener('change', function () {
        var quest = findQuest(select.getAttribute('data-cadence'));
        if (!quest) return;
        quest.cadence = select.value || 'daily';
        quest.title = cleanQuestTitle(quest.title, quest.cadence);
        quest.checks = {};
        saveState();
        render();
      });
    });

    els.monthGrid.querySelectorAll('.check-cell:not(:disabled)').forEach(function (button) {
      button.addEventListener('click', function () {
        var quest = findQuest(button.getAttribute('data-quest'));
        var key = button.getAttribute('data-date');
        if (!quest) return;
        var previousLevel = levelFromXp(totalXp());
        var wasChecked = !!quest.checks[key];
        quest.checks[key] = !quest.checks[key];
        if (!quest.checks[key]) delete quest.checks[key];
        if (!wasChecked && quest.checks[key] && quest.cadence !== 'daily') {
          recordAchievement(quest, key);
        }
        saveState();
        render();
        if (!wasChecked && quest.checks[key]) playQuestReward(quest, quest.cadence, previousLevel);
      });
    });

    attachDragEvents();
  }

  function attachDragEvents() {
    els.monthGrid.querySelectorAll('.quest-title-input[data-row-quest]').forEach(function (input) {
      input.addEventListener('dragstart', function (event) {
        draggedQuestId = input.getAttribute('data-row-quest');
        dragDropHandled = false;
        input.classList.add('dragging');
        els.monthGrid.classList.add('is-dragging-row');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', draggedQuestId);
        }
      });

      input.addEventListener('dragend', function (event) {
        var shouldDelete = draggedQuestId && !dragDropHandled && !pointInsideElement(event.clientX, event.clientY, els.monthGrid.parentElement);
        var questId = draggedQuestId;
        clearDragState();
        if (shouldDelete) {
          removeQuest(questId);
        }
      });
    });

    els.monthGrid.querySelectorAll('[data-row-quest]').forEach(function (cell) {
      cell.addEventListener('dragover', function (event) {
        var targetId = cell.getAttribute('data-row-quest');
        if (!draggedQuestId || !targetId || targetId === draggedQuestId) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        var rect = cell.getBoundingClientRect();
        var position = event.clientY >= rect.top + (rect.height / 2) ? 'after' : 'before';
        highlightDropTarget(targetId, position);
      });

      cell.addEventListener('drop', function (event) {
        var targetId = cell.getAttribute('data-row-quest');
        if (!draggedQuestId || !targetId || targetId === draggedQuestId) return;
        event.preventDefault();
        dragDropHandled = true;
        moveQuest(draggedQuestId, targetId, dragInsertPosition);
        clearDragState();
        saveState();
        render();
      });
    });

    els.monthGrid.addEventListener('dragleave', function (event) {
      if (event.relatedTarget && els.monthGrid.contains(event.relatedTarget)) return;
      highlightDropTarget('');
    });
  }

  function moveQuest(sourceId, targetId, position) {
    var sourceIndex = state.quests.findIndex(function (quest) { return quest.id === sourceId; });
    var targetIndex = state.quests.findIndex(function (quest) { return quest.id === targetId; });
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    var source = state.quests[sourceIndex];
    var target = state.quests[targetIndex];
    source.axis = target.axis;
    state.quests.splice(sourceIndex, 1);
    var nextTargetIndex = state.quests.findIndex(function (quest) { return quest.id === targetId; });
    var insertIndex = nextTargetIndex + (position === 'after' ? 1 : 0);
    state.quests.splice(insertIndex, 0, source);
  }

  function removeQuest(questId) {
    var index = state.quests.findIndex(function (quest) { return quest.id === questId; });
    if (index < 0) return;
    state.quests.splice(index, 1);
    saveState();
    render();
  }

  function highlightDropTarget(questId, position) {
    els.monthGrid.querySelectorAll('.drop-target, .drop-before, .drop-after').forEach(function (cell) {
      cell.classList.remove('drop-target', 'drop-before', 'drop-after');
    });
    if (!questId) return;
    dragInsertPosition = position === 'after' ? 'after' : 'before';
    els.monthGrid.querySelectorAll('[data-row-quest="' + cssEscape(questId) + '"]').forEach(function (cell) {
      cell.classList.add('drop-target', dragInsertPosition === 'after' ? 'drop-after' : 'drop-before');
    });
  }

  function clearDragState() {
    draggedQuestId = null;
    dragInsertPosition = 'before';
    dragDropHandled = false;
    els.monthGrid.classList.remove('is-dragging-row');
    els.monthGrid.querySelectorAll('.dragging, .drop-target, .drop-before, .drop-after').forEach(function (cell) {
      cell.classList.remove('dragging', 'drop-target', 'drop-before', 'drop-after');
    });
  }

  function pointInsideElement(x, y, element) {
    if (!element || (!x && !y)) return false;
    var rect = element.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function cssEscape(value) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function recordAchievement(quest, key) {
    state.achievements = Array.isArray(state.achievements) ? state.achievements : [];
    var exists = state.achievements.some(function (item) {
      return item.questId === quest.id && item.key === key;
    });
    if (exists) return;
    state.achievements.unshift({
      id: quest.id + '-' + key + '-' + Date.now().toString(36),
      questId: quest.id,
      title: cleanQuestTitle(quest.title, quest.cadence),
      axis: canonicalAxis(quest.axis),
      cadence: quest.cadence,
      xp: xpForCadence(quest.cadence),
      key: key,
      period: achievementPeriodLabel(quest, key),
      completedAt: new Date().toISOString()
    });
    state.achievements = state.achievements.slice(0, 80);
  }

  function achievementPeriodLabel(quest, key) {
    var date = parseDateKey(key);
    if (quest.cadence === 'weekly') {
      var weeks = buildWeeks(daysInMonth(date.getFullYear(), date.getMonth()), date.getFullYear(), date.getMonth());
      var day = date.getDate();
      var weekIndex = weeks.findIndex(function (week) {
        return day >= week[0] && day <= week[week.length - 1];
      });
      return date.toLocaleString('en-US', { month: 'short' }) + ' Week ' + (weekIndex + 1);
    }
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }

  function badgeTier(count) {
    if (count >= 8) return 'Mastery';
    if (count >= 3) return 'Momentum';
    if (count >= 1) return 'First Clear';
    return 'Locked';
  }

  function nextBadgeTarget(count) {
    if (count < 1) return 1;
    if (count < 3) return 3;
    if (count < 8) return 8;
    return 0;
  }

  function centerToday() {
    window.requestAnimationFrame(function () {
      var wrap = els.monthGrid.parentElement;
      var todayCell = els.monthGrid.querySelector('.day-head.today');
      if (!wrap || !todayCell) return;
      var stickyWidth = fixedBoardWidth();
      var dateViewport = Math.max(1, wrap.clientWidth - stickyWidth);
      wrap.scrollLeft = Math.max(0, todayCell.offsetLeft - stickyWidth - (dateViewport / 2) + (todayCell.clientWidth / 2));
    });
  }

  function fixedBoardWidth() {
    var axisHead = els.monthGrid.querySelector('.axis-head');
    var typeHead = els.monthGrid.querySelector('.cadence-head');
    var itemsHead = els.monthGrid.querySelector('.board-quest-head');
    var styles = window.getComputedStyle(els.monthGrid);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;

    if (axisHead && typeHead && itemsHead) {
      return axisHead.offsetWidth + typeHead.offsetWidth + itemsHead.offsetWidth + (gap * 2);
    }

    var resolvedColumns = styles.gridTemplateColumns.split(/\s+/).slice(0, 3);
    var resolvedWidth = resolvedColumns.reduce(function (sum, value) {
      return sum + (parseFloat(value) || 0);
    }, 0);
    return resolvedWidth + (gap * 2);
  }

  function updateCalendarScrollbar() {
    if (!els.calendarScrollbar || !els.calendarScrollbarTrack || activeView !== 'board') return;
    window.requestAnimationFrame(function () {
      var wrap = els.monthGrid.parentElement;
      var fixedWidth = fixedBoardWidth();
      var calendarViewport = Math.max(1, wrap.clientWidth - fixedWidth);
      var calendarContent = Math.max(calendarViewport, els.monthGrid.scrollWidth - fixedWidth);

      els.calendarScrollbar.style.marginLeft = fixedWidth + 'px';
      els.calendarScrollbar.style.width = 'calc(100% - ' + fixedWidth + 'px)';
      els.calendarScrollbarTrack.style.width = calendarContent + 'px';
      els.calendarScrollbar.hidden = calendarContent <= calendarViewport + 1;
      els.calendarScrollbar.scrollLeft = wrap.scrollLeft;
    });
  }

  function renderTrend(view) {
    var range = trendRange(view);
    var quests = state.quests;
    var previous = previousComparableRange(view, range);
    var periodLabels = { weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
    var html = '<div class="statistics-toolbar">';
    html += '<div class="trend-heading"><p class="growth-kicker">Statistics</p><h3>' + escapeHtml(range.label) + '</h3></div>';
    html += '<div class="quest-menu statistics-period-menu">';
    html += '<button id="statisticsPeriodButton" class="quest-menu-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span>' + escapeHtml(periodLabels[view]) + '</span></button>';
    html += '<div id="statisticsPeriodMenu" class="quest-menu-list" role="listbox" aria-label="Statistics period" hidden>';
    ['weekly', 'monthly', 'yearly'].forEach(function (period) {
      html += '<button class="quest-menu-option' + (period === view ? ' selected' : '') + '" type="button" data-statistics-period="' + period + '" role="option" aria-selected="' + (period === view ? 'true' : 'false') + '">' + periodLabels[period] + '</button>';
    });
    html += '</div></div></div>';
    html += renderCompletionChart(view, range);
    html += '<div class="trend-grid">';

    state.axes.forEach(function (axis, index) {
      var axisQuests = quests.filter(function (quest) { return quest.axis === axis; });
      var currentData = rangeCompletionData(axisQuests, range.start, range.end);
      var previousData = rangeCompletionData(axisQuests, previous.start, previous.end);
      var delta = currentData.percent - previousData.percent;
      html += '<article class="trend-card axis-' + (index % 4) + '">';
      html += '<div><span>' + escapeHtml(axis) + '</span><strong>' + currentData.percent + '%</strong></div>';
      html += '<div class="trend-bar"><span style="width:' + currentData.percent + '%"></span></div>';
      html += '<p class="' + (delta >= 0 ? 'positive' : 'negative') + '">' + currentData.done + ' / ' + currentData.possible + ' clears &middot; ' + (delta >= 0 ? '+' : '') + delta + '% vs previous period</p>';
      html += '</article>';
    });

    html += '</div>';
    html += renderRecentClears(range);
    html += '<div class="trend-note">The chart and cards are calculated directly from the checks saved on your quest board.</div>';
    els.trendPanel.innerHTML = html;

    var periodButton = byId('statisticsPeriodButton');
    var periodMenu = byId('statisticsPeriodMenu');
    if (periodButton && periodMenu) {
      periodButton.addEventListener('click', function () {
        var willOpen = periodMenu.hidden;
        closeQuestMenus();
        setQuestMenuOpen(periodButton, periodMenu, willOpen);
      });
      periodMenu.querySelectorAll('[data-statistics-period]').forEach(function (button) {
        button.addEventListener('click', function () {
          statisticsRange = button.getAttribute('data-statistics-period') || 'monthly';
          closeQuestMenus();
          render();
        });
      });
    }
  }

  function renderCompletionChart(view, range) {
    var points = trendPoints(view, range);
    var width = 720;
    var height = 230;
    var left = 46;
    var right = 18;
    var top = 18;
    var bottom = 38;
    var plotWidth = width - left - right;
    var plotHeight = height - top - bottom;
    var axisColors = ['#ff5a5f', '#4f8edc', '#d8b45a', '#72c69a'];
    var html = '<section class="trend-chart-panel" aria-label="Actual quest completion trend">';
    html += '<div class="trend-chart-header"><div><strong>Actual completion trend</strong><span>' + escapeHtml(view === 'yearly' ? 'Monthly completion' : 'Daily completion') + '</span></div>';
    html += '<div class="trend-legend">';
    state.axes.forEach(function (axis, index) {
      html += '<span><i style="background:' + axisColors[index % axisColors.length] + '"></i>' + escapeHtml(axis) + '</span>';
    });
    html += '</div></div>';
    html += '<div class="trend-chart-scroll"><svg class="trend-chart" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Completion percentage over ' + escapeAttr(range.label) + '">';

    [100, 50, 0].forEach(function (guide) {
      var y = top + ((100 - guide) / 100) * plotHeight;
      html += '<line class="trend-guide" x1="' + left + '" y1="' + y + '" x2="' + (width - right) + '" y2="' + y + '"></line>';
      html += '<text class="trend-y-label" x="' + (left - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + guide + '%</text>';
    });

    state.axes.forEach(function (axis, axisIndex) {
      var axisQuests = state.quests.filter(function (quest) { return quest.axis === axis; });
      var path = points.map(function (point, pointIndex) {
        var x = points.length === 1 ? left + (plotWidth / 2) : left + (pointIndex / (points.length - 1)) * plotWidth;
        var score = trendPointCompletion(axisQuests, point, view);
        var y = top + ((100 - score) / 100) * plotHeight;
        return (pointIndex === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
      html += '<path class="trend-series axis-' + (axisIndex % 4) + '" d="' + path + '"></path>';
    });

    points.forEach(function (point, pointIndex) {
      if (!shouldLabelTrendPoint(view, point, pointIndex, points.length)) return;
      var x = points.length === 1 ? left + (plotWidth / 2) : left + (pointIndex / (points.length - 1)) * plotWidth;
      html += '<text class="trend-x-label" x="' + x.toFixed(1) + '" y="' + (height - 12) + '" text-anchor="middle">' + escapeHtml(point.label) + '</text>';
    });

    html += '</svg></div></section>';
    return html;
  }

  function trendPoints(view, range) {
    var points = [];
    if (view === 'yearly') {
      for (var monthIndex = 0; monthIndex <= range.end.getMonth(); monthIndex += 1) {
        var monthStart = new Date(range.end.getFullYear(), monthIndex, 1);
        var monthEnd = monthIndex === range.end.getMonth() ? range.end : endOfMonth(monthStart);
        points.push({
          start: startOfDay(monthStart),
          end: endOfDay(monthEnd),
          date: monthEnd,
          label: monthStart.toLocaleDateString('en-US', { month: 'short' })
        });
      }
      return points;
    }

    var cursor = startOfDay(range.start);
    var limit = startOfDay(range.end);
    while (cursor <= limit) {
      points.push({
        start: startOfDay(cursor),
        end: endOfDay(cursor),
        date: new Date(cursor),
        label: view === 'weekly' ? weekdayShort(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()) : String(cursor.getDate())
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return points;
  }

  function trendPointCompletion(quests, point, view) {
    if (view === 'yearly') return rangeCompletion(quests, point.start, point.end);
    var key = toDateKey(point.date);
    var possible = 0;
    var done = 0;

    quests.forEach(function (quest) {
      if (quest.cadence === 'daily') {
        possible += 1;
        if (quest.checks[key]) done += 1;
        return;
      }
      if (quest.cadence === 'weekly' && isWeeklyPeriodEnd(point.date)) {
        possible += 1;
        if (quest.checks[key]) done += 1;
        return;
      }
      if (quest.cadence === 'monthly' && point.date.getDate() === daysInMonth(point.date.getFullYear(), point.date.getMonth())) {
        possible += 1;
        if (quest.checks[key]) done += 1;
      }
    });

    return possible ? Math.round((done / possible) * 100) : 0;
  }

  function isWeeklyPeriodEnd(date) {
    return date.getDay() === 0 || date.getDate() === daysInMonth(date.getFullYear(), date.getMonth());
  }

  function shouldLabelTrendPoint(view, point, index, total) {
    if (view === 'weekly' || view === 'yearly') return true;
    return index === 0 || index === total - 1 || point.date.getDate() % 5 === 0;
  }

  function renderRecentClears(range) {
    var entries = recentClears(range);
    var html = '<section class="trend-activity"><div class="trend-activity-heading"><div><strong>Recent clears</strong><span>Completed during this period</span></div><em>' + entries.length + '</em></div>';
    if (!entries.length) {
      return html + '<p class="trend-empty">No quest clears recorded in this period yet.</p></section>';
    }

    html += '<div class="trend-clear-list">';
    entries.slice(0, 6).forEach(function (entry) {
      html += '<div class="trend-clear-item"><i class="axis-' + (entry.axisIndex % 4) + '">' + escapeHtml(axisCode(entry.axis)) + '</i>';
      html += '<div><strong>' + escapeHtml(entry.title) + '</strong><span>' + escapeHtml(entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) + ' &middot; ' + escapeHtml(entry.axis) + '</span></div>';
      html += '<em>+' + entry.xp + ' XP</em></div>';
    });
    html += '</div></section>';
    return html;
  }

  function recentClears(range) {
    var achievements = {};
    state.achievements.forEach(function (item) {
      achievements[item.questId + '::' + item.key] = item;
    });
    var entries = [];

    state.quests.forEach(function (quest) {
      Object.keys(quest.checks || {}).forEach(function (key) {
        if (!quest.checks[key]) return;
        var achievement = achievements[quest.id + '::' + key];
        var date = achievement && achievement.completedAt ? new Date(achievement.completedAt) : parseDateKey(key);
        if (Number.isNaN(date.getTime()) || date < range.start || date > range.end) return;
        entries.push({
          title: cleanQuestTitle(quest.title, quest.cadence),
          axis: quest.axis,
          axisIndex: Math.max(0, state.axes.indexOf(quest.axis)),
          date: date,
          xp: xpForCadence(quest.cadence)
        });
      });
    });

    return entries.sort(function (a, b) { return b.date - a.date; });
  }

  function addQuest() {
    var title = els.questTitle.value.trim();
    if (!title) return;
    state.quests.push(makeQuest(title, els.questAxis.value || state.axes[0], els.questCadence.value || 'daily'));
    els.questForm.reset();
    saveState();
    render();
  }

  function addAxis() {
    if (!els.axisName) return;
    var name = els.axisName.value.trim();
    if (!name) return;
    if (state.axes.indexOf(name) === -1) {
      state.axes.push(name);
    }
    els.axisName.value = '';
    if (els.questAxis) els.questAxis.value = name;
    if (els.axisQuickAdd) els.axisQuickAdd.hidden = true;
    if (els.axisToggle) els.axisToggle.setAttribute('aria-expanded', 'false');
    closeQuestMenus();
    saveState();
    render();
  }

  function renderAxisOptions() {
    var current = state.axes.indexOf(els.questAxis.value) !== -1 ? els.questAxis.value : state.axes[0];
    els.questAxis.innerHTML = state.axes.map(function (axis) {
      return '<option' + (axis === current ? ' selected' : '') + '>' + escapeHtml(axis) + '</option>';
    }).join('');
    els.questAxis.value = current;
    if (els.questAxisLabel) els.questAxisLabel.textContent = current;
    if (!els.questAxisOptions) return;
    els.questAxisOptions.innerHTML = state.axes.map(function (axis) {
      return '<button class="quest-menu-option' + (axis === current ? ' selected' : '') + '" type="button" data-axis-option="' + escapeAttr(axis) + '" role="option" aria-selected="' + (axis === current ? 'true' : 'false') + '">' + escapeHtml(axis) + '</button>';
    }).join('');
    els.questAxisOptions.querySelectorAll('[data-axis-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        els.questAxis.value = button.getAttribute('data-axis-option') || state.axes[0];
        if (els.questAxisLabel) els.questAxisLabel.textContent = els.questAxis.value;
        closeQuestMenus();
      });
    });
  }

  function renderCadenceControl() {
    if (!els.questCadence) return;
    var labels = { daily: '[d] Daily', weekly: '[w] Weekly', monthly: '[m] Monthly' };
    var current = labels[els.questCadence.value] ? els.questCadence.value : 'daily';
    els.questCadence.value = current;
    if (els.questCadenceLabel) els.questCadenceLabel.textContent = labels[current];
    document.querySelectorAll('[data-cadence-option]').forEach(function (button) {
      var selected = button.getAttribute('data-cadence-option') === current;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function setQuestMenuOpen(button, menu, open) {
    if (!button || !menu) return;
    menu.hidden = !open;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeQuestMenus() {
    setQuestMenuOpen(els.questAxisButton, els.questAxisMenu, false);
    setQuestMenuOpen(els.questCadenceButton, els.questCadenceMenu, false);
    setQuestMenuOpen(byId('statisticsPeriodButton'), byId('statisticsPeriodMenu'), false);
    if (els.axisQuickAdd) els.axisQuickAdd.hidden = true;
    if (els.axisToggle) els.axisToggle.setAttribute('aria-expanded', 'false');
  }

  function renderAxisControls() {
    if (!els.axisList) return;
    els.axisList.innerHTML = state.axes.map(function (axis, index) {
      return '<label class="axis-chip axis-chip-' + (index % 4) + '"><input data-axis-rename="' + escapeAttr(axis) + '" value="' + escapeAttr(axis) + '" aria-label="Axis name"></label>';
    }).join('');

    els.axisList.querySelectorAll('[data-axis-rename]').forEach(function (input) {
      input.addEventListener('change', function () {
        var oldAxis = input.getAttribute('data-axis-rename');
        var nextAxis = input.value.trim();
        if (!nextAxis) {
          if (state.axes.length > 1 && window.confirm('Delete this axis and its quests?')) {
            state.axes = state.axes.filter(function (axis) { return axis !== oldAxis; });
            state.quests = state.quests.filter(function (quest) { return quest.axis !== oldAxis; });
          } else {
            input.value = oldAxis;
          }
          saveState();
          render();
          return;
        }
        if (nextAxis !== oldAxis && state.axes.indexOf(nextAxis) === -1) {
          state.axes = state.axes.map(function (axis) { return axis === oldAxis ? nextAxis : axis; });
          state.quests.forEach(function (quest) {
            if (quest.axis === oldAxis) quest.axis = nextAxis;
          });
        }
        saveState();
        render();
      });
    });
  }

  function totalXp() {
    return (Number(state.baseXp) || 0) + questXpTotal(state.quests) + attendanceBonusXp(state.quests) + completionBonus();
  }

  function questXpTotal(quests) {
    return quests.reduce(function (sum, quest) {
      return sum + Object.keys(quest.checks || {}).length * xpForCadence(quest.cadence);
    }, 0);
  }

  function xpForCadence(cadence) {
    if (cadence === 'monthly') return 300;
    if (cadence === 'weekly') return 70;
    return 10;
  }

  function attendanceBonusXp(quests) {
    var dailyQuests = quests.filter(function (quest) { return quest.cadence === 'daily'; });
    if (!dailyQuests.length) return 0;
    var keys = {};
    dailyQuests.forEach(function (quest) {
      Object.keys(quest.checks || {}).forEach(function (key) {
        if (quest.checks[key] && parseDateKey(key) <= today) keys[key] = true;
      });
    });
    var qualified = Object.keys(keys).filter(function (key) {
      var done = dailyQuests.filter(function (quest) { return !!quest.checks[key]; }).length;
      return (done / dailyQuests.length) >= 0.8;
    }).sort();
    var total = 0;
    var run = 0;
    var previous = null;
    qualified.forEach(function (key) {
      var date = parseDateKey(key);
      run = previous && daysBetween(previous, date) === 1 ? run + 1 : 1;
      total += 10 + Math.min(60, run * 2);
      previous = date;
    });
    return total;
  }

  function achievementXp(item) {
    return item.xp || xpForCadence(item.cadence);
  }

  function achievementVisual(item, index) {
    var seed = hashString([item.id, item.title, item.key, item.axis, index].join('|'));
    var variant = seed % 8;
    var tilt = ((seed >> 3) % 9) - 4;
    var corner = [12, 999, 7, 16, 10, 4, 14, 9][variant];
    var notch = 12 + (seed % 18);
    var shine = 18 + ((seed >> 5) % 48);
    var depth = item.cadence === 'monthly' ? 0.72 : 0.42;
    return {
      variant: variant,
      style: [
        '--badge-tilt:' + tilt + 'deg',
        '--badge-radius:' + corner + 'px',
        '--badge-notch:' + notch + '%',
        '--badge-shine:' + shine + '%',
        '--badge-depth:' + depth
      ].join(';')
    };
  }

  function hashString(value) {
    var hash = 0;
    for (var i = 0; i < value.length; i += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function completionBonus() {
    return completionBonusForScore(monthlyCompletion(state.quests));
  }

  function completionBonusForScore(score) {
    if (score >= 100) return 500;
    if (score >= 90) return 250;
    if (score >= 80) return 100;
    return 0;
  }

  function monthlyCompletion(quests) {
    return rangeCompletion(quests, startOfMonth(today), endOfDay(today));
  }

  function rangeCompletion(quests, start, end) {
    return rangeCompletionData(quests, start, end).percent;
  }

  function rangeCompletionData(quests, start, end) {
    if (!quests.length) return { done: 0, possible: 0, percent: 0 };
    var possible = 0;
    var done = quests.reduce(function (sum, quest) {
      var expected = expectedKeys(quest, start, end);
      possible += expected.length;
      return sum + expected.filter(function (key) { return !!quest.checks[key]; }).length;
    }, 0);
    if (!possible) return { done: done, possible: 0, percent: 0 };
    var percent = Math.round((done / possible) * 100);
    return {
      done: done,
      possible: possible,
      percent: done > 0 && percent === 0 ? 1 : percent
    };
  }

  function expectedKeys(quest, start, end) {
    var cursor = startOfDay(start);
    var limit = startOfDay(end);
    var keys = [];
    if (quest.cadence === 'monthly') {
      var monthCursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      while (monthCursor <= limit) {
        var monthEnd = startOfDay(endOfMonth(monthCursor));
        if (monthEnd >= cursor && monthCursor <= limit) {
          keys.push(toDateKey(monthEnd));
        }
        monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
      }
      return keys.length ? keys : [toDateKey(limit)];
    }
    if (quest.cadence === 'weekly') {
      var weekMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      while (weekMonth <= limit) {
        var weekYear = weekMonth.getFullYear();
        var weekMonthIndex = weekMonth.getMonth();
        var monthWeeks = buildWeeks(daysInMonth(weekYear, weekMonthIndex), weekYear, weekMonthIndex);
        monthWeeks.forEach(function (week) {
          var weekStart = new Date(weekYear, weekMonthIndex, week[0]);
          var weekEnd = new Date(weekYear, weekMonthIndex, week[week.length - 1]);
          if (weekEnd >= cursor && weekStart <= limit) keys.push(toDateKey(weekEnd));
        });
        weekMonth = new Date(weekYear, weekMonthIndex + 1, 1);
      }
      return keys.length ? keys : [toDateKey(limit)];
    }
    while (cursor <= limit) {
      keys.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return keys;
  }

  function currentStreak() {
    if (!state.quests.length) return 0;
    var cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var streak = 0;
    while (streak < 365) {
      if (dailyCompletionForDate(cursor) < 80) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function trendRange(view) {
    if (view === 'weekly') {
      var weekStart = new Date(year, month, today.getDate());
      weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      return { start: startOfDay(weekStart), end: endOfDay(today), unit: 'week', label: 'This Week' };
    }
    if (view === 'yearly') {
      return { start: new Date(year, 0, 1), end: endOfDay(today), unit: 'year', label: String(year) };
    }
    return { start: startOfMonth(today), end: endOfDay(today), unit: 'month', label: monthLabel() };
  }

  function previousComparableRange(view, range) {
    if (view === 'monthly') {
      var previousMonthStart = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
      var previousMonthDay = Math.min(range.end.getDate(), daysInMonth(previousMonthStart.getFullYear(), previousMonthStart.getMonth()));
      return {
        start: startOfDay(previousMonthStart),
        end: endOfDay(new Date(previousMonthStart.getFullYear(), previousMonthStart.getMonth(), previousMonthDay))
      };
    }
    if (view === 'yearly') {
      return {
        start: new Date(range.start.getFullYear() - 1, 0, 1),
        end: endOfDay(new Date(range.end.getFullYear() - 1, range.end.getMonth(), range.end.getDate()))
      };
    }
    var span = daysBetween(range.start, range.end);
    var previousEnd = new Date(range.start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    var previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - span + 1);
    return { start: startOfDay(previousStart), end: endOfDay(previousEnd) };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.mode === 'demo' && parsed.demoVersion !== DEMO_VERSION) return demoState();
        return shouldUpgradeToDemo(parsed) ? demoState() : parsed;
      }
    } catch (e) {}
    return demoState();
  }

  function migrateState(nextState) {
    nextState.mode = nextState.mode === 'demo' ? 'demo' : 'user';
    nextState.demoVersion = nextState.mode === 'demo' ? Number(nextState.demoVersion) || 0 : 0;
    nextState.baseXp = Math.max(0, Number(nextState.baseXp) || 0);
    nextState.playerName = typeof nextState.playerName === 'string'
      ? nextState.playerName.trim().slice(0, 28)
      : '';
    nextState.axes = Array.isArray(nextState.axes) && nextState.axes.length ? nextState.axes : defaultAxes.slice();
    nextState.quests = Array.isArray(nextState.quests) ? nextState.quests : [];
    nextState.quests.forEach(function (quest) {
      quest.axis = canonicalAxis(quest.axis || defaultAxes[0]);
      quest.cadence = quest.cadence || 'daily';
      quest.title = cleanQuestTitle(stripCadencePrefix(quest.title || ''), quest.cadence);
      quest.checks = quest.checks || {};
      if (nextState.axes.indexOf(quest.axis) === -1) nextState.axes.push(quest.axis);
    });
    nextState.axes = defaultAxes.concat(nextState.axes.filter(function (axis) {
      return defaultAxes.indexOf(axis) === -1 && ['Stamina', 'Work', 'Growth'].indexOf(axis) === -1;
    }));
    nextState.achievements = Array.isArray(nextState.achievements)
      ? nextState.achievements.map(function (item) {
          return {
            id: item.id || (item.questId || 'achievement') + '-' + (item.key || Date.now()),
            questId: item.questId || '',
            title: cleanQuestTitle(item.title || 'Completed quest', item.cadence || 'weekly'),
            axis: canonicalAxis(item.axis || defaultAxes[0]),
            cadence: item.cadence === 'monthly' ? 'monthly' : 'weekly',
            xp: Number(item.xp) || xpForCadence(item.cadence === 'monthly' ? 'monthly' : 'weekly'),
            key: item.key || '',
            period: item.key ? achievementPeriodLabel({ cadence: item.cadence === 'monthly' ? 'monthly' : 'weekly' }, item.key) : (item.period || 'Clear'),
            completedAt: item.completedAt || new Date().toISOString()
          };
        }).filter(function (item) {
          return item.title && item.key;
        }).slice(0, 80)
      : [];
    return nextState;
  }

  function seedState() {
    return {
      mode: 'user',
      baseXp: 0,
      playerName: '',
      axes: defaultAxes.slice(),
      achievements: [],
      quests: [
        makeQuest('30 min exercise', 'Health', 'daily'),
        makeQuest('2 vegetable servings', 'Health', 'daily'),
        makeQuest('Alcohol-free day', 'Health', 'daily'),
        makeQuest('30 min focused learning', 'Intelligence', 'daily'),
        makeQuest('Set 3 priorities for next week', 'Intelligence', 'weekly'),
        makeQuest('Finish 2 books', 'Intelligence', 'monthly'),
        makeQuest('Lunch at or under $15', 'Capital', 'daily'),
        makeQuest('Log every expense', 'Capital', 'daily'),
        makeQuest('Save 10% of income', 'Capital', 'monthly')
      ]
    };
  }

  function shouldUpgradeToDemo(nextState) {
    if (!nextState || nextState.playerName) return false;
    if (nextState.mode && nextState.mode !== 'user') return false;
    if (Number(nextState.baseXp) > 0) return false;
    if (Array.isArray(nextState.achievements) && nextState.achievements.length) return false;
    if (!Array.isArray(nextState.quests)) return true;
    if (nextState.quests.some(function (quest) {
      return quest && quest.checks && Object.keys(quest.checks).length;
    })) return false;

    var defaultState = seedState();
    var nextAxes = Array.isArray(nextState.axes) ? nextState.axes.join('|') : '';
    var defaultQuestSignature = defaultState.quests.map(questSignature).sort().join('|');
    var nextQuestSignature = nextState.quests.map(questSignature).sort().join('|');
    var legacyQuestSignature = [
      'Workout 1hr::Health::daily',
      'Eat healthy::Health::daily',
      'Not drinking::Health::daily',
      'Write paper::Intelligence::daily',
      'Mentor students::Intelligence::weekly',
      'Read 1 book::Intelligence::monthly',
      '> $15 per meal::Capital::daily',
      'Study stock 30min::Capital::daily',
      'Save $1500::Capital::monthly'
    ].sort().join('|');
    return nextAxes === defaultState.axes.join('|') &&
      (nextQuestSignature === defaultQuestSignature || nextQuestSignature === legacyQuestSignature);
  }

  function questSignature(quest) {
    if (!quest) return '';
    return [quest.title || '', quest.axis || '', quest.cadence || ''].join('::');
  }

  function demoState() {
    var nextState = seedState();
    nextState.mode = 'demo';
    nextState.demoVersion = DEMO_VERSION;
    var dailyQuests = nextState.quests.filter(function (quest) { return quest.cadence === 'daily'; });
    var currentDay = today.getDate();

    dailyQuests.forEach(function (quest, questIndex) {
      for (var day = 1; day <= currentDay; day += 1) {
        if ((day + (questIndex * 2)) % 7 !== 0) {
          quest.checks[dateKey(year, month, day)] = true;
        }
      }
    });

    var availableWeeks = buildWeeks(daysInMonth(year, month)).filter(function (week) {
      return week[0] <= currentDay;
    });
    nextState.quests.filter(function (quest) { return quest.cadence === 'weekly'; }).forEach(function (quest) {
      availableWeeks.slice(0, Math.max(1, availableWeeks.length - 1)).forEach(function (week) {
        quest.checks[dateKey(year, month, week[week.length - 1])] = true;
      });
    });

    var monthlyQuests = nextState.quests.filter(function (quest) { return quest.cadence === 'monthly'; });
    if (monthlyQuests[0]) {
      monthlyQuests[0].checks[dateKey(year, month, daysInMonth(year, month))] = true;
    }

    nextState.achievements = [];
    nextState.quests.filter(function (quest) { return quest.cadence !== 'daily'; }).forEach(function (quest) {
      Object.keys(quest.checks).forEach(function (key) {
        var achievementDate = parseDateKey(key);
        if (achievementDate > today) achievementDate = today;
        nextState.achievements.unshift({
          id: 'demo-' + quest.id + '-' + key,
          questId: quest.id,
          title: cleanQuestTitle(quest.title, quest.cadence),
          axis: canonicalAxis(quest.axis),
          cadence: quest.cadence,
          xp: xpForCadence(quest.cadence),
          key: key,
          period: achievementPeriodLabel(quest, key),
          completedAt: achievementDate.toISOString()
        });
      });
    });

    var demoScore = rangeCompletion(nextState.quests, startOfMonth(today), endOfDay(today));
    var demoTargetXp = (16 * XP_PER_LEVEL) + 80;
    nextState.baseXp = Math.max(0, demoTargetXp - questXpTotal(nextState.quests) - attendanceBonusXp(nextState.quests) - completionBonusForScore(demoScore));
    return nextState;
  }

  function makeQuest(title, axis, cadence) {
    return {
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 7),
      title: title,
      axis: axis,
      cadence: cadence || 'daily',
      checks: {},
      createdAt: new Date().toISOString()
    };
  }

  function axisCode(axis) {
    if (axis === 'Health' || axis === 'Stamina') return 'H';
    if (axis === 'Intelligence' || axis === 'Work' || axis === 'Growth') return 'I';
    if (axis === 'Capital') return 'C';
    return String(axis || '?').trim().slice(0, 1).toUpperCase() || '?';
  }

  function canonicalAxis(axis) {
    if (axis === 'Stamina') return 'Health';
    if (axis === 'Work' || axis === 'Growth') return 'Intelligence';
    return axis;
  }

  function cadencePrefix(cadence) {
    if (cadence === 'weekly') return '[w]';
    if (cadence === 'monthly') return '[m]';
    return '[d]';
  }

  function cadenceOptions(cadence) {
    var options = [
      ['daily', '[d]'],
      ['weekly', '[w]'],
      ['monthly', '[m]']
    ];
    return options.map(function (option) {
      return '<option value="' + option[0] + '"' + (cadence === option[0] ? ' selected' : '') + '>' + option[1] + '</option>';
    }).join('');
  }

  function stripCadencePrefix(title) {
    return String(title || '').replace(/^\s*\[(d|w|m)\]\s*/i, '').trim();
  }

  function cleanQuestTitle(title, cadence) {
    var cleaned = stripCadencePrefix(title)
      .replace(/\s+this\s+month\b/ig, '')
      .replace(/\s+per\s+month\b/ig, '')
      .replace(/\s*\/\s*month\b/ig, '')
      .replace(/\s+monthly\b/ig, '')
      .replace(/\s+weekly\b/ig, '')
      .replace(/\s+daily\b/ig, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!cleaned) {
      return cadence === 'weekly' ? 'Weekly quest' : cadence === 'monthly' ? 'Monthly quest' : 'Daily quest';
    }
    return cleaned;
  }

  function buildWeeks(days, targetYear, targetMonth) {
    var baseYear = typeof targetYear === 'number' ? targetYear : year;
    var baseMonth = typeof targetMonth === 'number' ? targetMonth : month;
    var weeks = [];
    var current = [];
    for (var day = 1; day <= days; day += 1) {
      current.push(day);
      var isSunday = new Date(baseYear, baseMonth, day).getDay() === 0;
      if (isSunday || day === days) {
        weeks.push(current);
        current = [];
      }
    }
    return weeks;
  }

  function weekdayShort(y, m, d) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(y, m, d).getDay()];
  }

  function todayLabel() {
    return 'Today / ' + today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function saveState() {
    localStorage.setItem(KEY, JSON.stringify(state));
    if (remoteSaveReady) {
      window.dispatchEvent(new CustomEvent('growth-state-saved', {
        detail: { state: cloneState(state) }
      }));
    }
  }

  function exposeGrowthQuest() {
    window.GrowthQuest = {
      getState: function () {
        return cloneState(state);
      },
      replaceState: function (nextState) {
        state = migrateState(nextState || seedState());
        localStorage.setItem(KEY, JSON.stringify(state));
        render();
      },
      startFresh: function () {
        state = migrateState(seedState());
        localStorage.setItem(KEY, JSON.stringify(state));
        activeView = 'board';
        statisticsRange = 'monthly';
        render();
        return cloneState(state);
      },
      enableRemoteSave: function () {
        remoteSaveReady = true;
        saveState();
      },
      disableRemoteSave: function () {
        remoteSaveReady = false;
      },
      setAuthenticatedUser: function (profile) {
        authenticatedProfile = profile && typeof profile === 'object' ? profile : null;
        renderPlayerName();
      }
    };
    window.dispatchEvent(new CustomEvent('growth-quest-ready', {
      detail: { state: cloneState(state) }
    }));
  }

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function findQuest(id) {
    return state.quests.find(function (quest) { return quest.id === id; });
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function monthLabel() {
    return today.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  }

  function daysInMonth(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }

  function daysBetween(start, end) {
    var startDate = startOfDay(start);
    var endDate = startOfDay(end);
    return Math.max(1, Math.round((endDate - startDate) / 86400000) + 1);
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function endOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  function dateKey(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function parseDateKey(key) {
    var parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function toDateKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }
})();
