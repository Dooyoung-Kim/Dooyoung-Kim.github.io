(function () {
  'use strict';

  var els = {};
  var step = 1;
  var draft = null;
  var composing = false;
  var reviewContext = null;
  var reviewSuggestionRun = 0;
  var syncReady = Boolean(window.GROWTH_SYNC_STATUS && window.GROWTH_SYNC_STATUS.ready);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    els.rail = byId('primaryGoalRail');
    els.planner = byId('goalPlannerDialog');
    els.plannerForm = byId('goalPlannerForm');
    els.plannerClose = byId('goalPlannerClose');
    els.stepLabel = byId('goalPlannerStepLabel');
    els.statement = byId('goalStatement');
    els.deadline = byId('goalDeadline');
    els.hours = byId('goalHours');
    els.currentState = byId('goalCurrentState');
    els.constraints = byId('goalConstraints');
    els.loading = byId('goalPlanLoading');
    els.preview = byId('goalPlanPreview');
    els.adjustments = byId('goalPlanAdjustments');
    els.message = byId('goalPlannerMessage');
    els.back = byId('goalPlannerBack');
    els.next = byId('goalPlannerNext');
    els.apply = byId('goalPlannerApply');
    els.review = byId('weeklyReviewDialog');
    els.reviewForm = byId('weeklyReviewForm');
    els.reviewClose = byId('weeklyReviewClose');
    els.reviewSnapshot = byId('weeklyReviewSnapshot');
    els.reviewWin = byId('weeklyReviewWin');
    els.reviewBlocker = byId('weeklyReviewBlocker');
    els.reviewFocus = byId('weeklyReviewFocus');
    els.reviewAdaptation = byId('weeklyReviewAdaptation');
    els.reviewMessage = byId('weeklyReviewMessage');
    if (!els.rail || !els.planner || !els.plannerForm) return;

    els.plannerClose.addEventListener('click', closePlanner);
    els.back.addEventListener('click', function () { setStep(Math.max(1, step - 1)); });
    els.next.addEventListener('click', handleNext);
    els.plannerForm.addEventListener('submit', applyDraft);
    els.planner.addEventListener('click', function (event) {
      if (event.target === els.planner) closePlanner();
    });
    els.planner.addEventListener('cancel', function (event) {
      event.preventDefault();
      closePlanner();
    });
    document.querySelectorAll('[data-plan-adjust]').forEach(function (button) {
      button.addEventListener('click', function () {
        composeDraft(button.getAttribute('data-plan-adjust') || '');
      });
    });

    if (els.reviewClose) els.reviewClose.addEventListener('click', closeReview);
    if (els.review) {
      els.review.addEventListener('click', function (event) {
        if (event.target === els.review) closeReview();
      });
      els.review.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeReview();
      });
    }
    if (els.reviewForm) els.reviewForm.addEventListener('submit', saveReview);
    if (els.reviewBlocker) els.reviewBlocker.addEventListener('change', refreshReviewSuggestion);

    var defaultDeadline = addDays(new Date(), 60);
    els.deadline.min = toDateKey(addDays(new Date(), 30));
    els.deadline.max = toDateKey(addDays(new Date(), 90));
    els.deadline.value = toDateKey(defaultDeadline);

    window.addEventListener('growth-state-changed', renderRail);
    window.addEventListener('growth-quest-ready', renderRail);
    window.addEventListener('growth-sync-ready', function () {
      syncReady = true;
      renderRail();
      if (step === 3) els.apply.disabled = !draft || composing;
    });
    renderRail();
  }

  function renderRail() {
    if (!window.GrowthQuest || !els.rail) return;
    var state = window.GrowthQuest.getState();
    var planning = state.planning || { goals: [], weeklyReviews: [] };
    var goal = planning.goals.find(function (item) { return item.status === 'active'; });
    if (!goal) {
      els.rail.innerHTML = '<div class="growth-planning-empty"><div><span>Primary quest</span><strong>Turn one meaningful goal into a plan you can finish.</strong><p>Set the deadline and available time. Growth Quest will draft the milestones and measurable quests.</p></div><button class="growth-planning-primary" type="button" data-goal-plan-open' + (syncReady ? '' : ' disabled') + '>Plan a goal</button></div>';
      bindRailEvents();
      return;
    }

    var context = window.GrowthQuest.getWeeklyReviewContext();
    var timeline = timelineProgress(goal);
    var nextMilestone = (goal.milestones || []).find(function (item) { return !item.done; });
    var review = context && context.existingReview;
    var snapshot = context && context.snapshot ? context.snapshot : { percent: 0 };
    var reviewMeta = review ? 'Reviewed · ' + review.snapshot.percent + '%' : 'This week · ' + snapshot.percent + '%';
    var dayLabel = timeline.total > 0 ? 'Day ' + timeline.elapsed + ' / ' + timeline.total : formatDate(goal.targetDate);
    els.rail.innerHTML = [
      '<div class="growth-planning-active">',
        '<button class="growth-planning-goal growth-planning-link" type="button" data-goal-plan-open aria-label="Open primary goal plan">',
          '<span class="growth-planning-label">Primary quest · ' + escapeHtml(goal.axis) + '</span>',
          '<strong>' + escapeHtml(goal.title) + '</strong>',
          '<span class="growth-planning-goal-meta"><i>' + escapeHtml(dayLabel) + '</i><i>' + escapeHtml(formatDate(goal.targetDate)) + '</i></span>',
          '<span class="growth-planning-progress" aria-label="Time elapsed ' + timeline.percent + ' percent"><i style="width:' + timeline.percent + '%"></i></span>',
        '</button>',
        '<div class="growth-planning-focus">',
          '<span class="growth-planning-label">Current finish line</span>',
          '<strong>' + escapeHtml(goal.weeklyFocus || (nextMilestone && nextMilestone.title) || goal.outcome) + '</strong>',
          '<span class="growth-planning-focus-meta"><i>' + (nextMilestone ? 'Next milestone · ' + escapeHtml(formatDate(nextMilestone.targetDate)) : 'Final outcome') + '</i></span>',
        '</div>',
        '<div class="growth-planning-review">',
          '<button class="growth-planning-secondary" type="button" data-weekly-review-open' + (syncReady ? '' : ' disabled') + '>' + (review ? 'Edit review' : 'Review week') + '</button>',
          '<small>' + escapeHtml(reviewMeta) + '</small>',
        '</div>',
      '</div>'
    ].join('');
    bindRailEvents();
  }

  function bindRailEvents() {
    els.rail.querySelectorAll('[data-goal-plan-open]').forEach(function (button) {
      button.addEventListener('click', openPlanner);
    });
    els.rail.querySelectorAll('[data-weekly-review-open]').forEach(function (button) {
      button.addEventListener('click', openReview);
    });
  }

  function openPlanner() {
    var state = window.GrowthQuest && window.GrowthQuest.getState();
    var active = state && state.planning && state.planning.goals
      ? state.planning.goals.find(function (item) { return item.status === 'active'; })
      : null;
    draft = null;
    composing = false;
    els.plannerForm.reset();
    els.hours.value = active ? active.availableHours : 5;
    els.deadline.value = active && active.targetDate ? active.targetDate : toDateKey(addDays(new Date(), 60));
    els.statement.value = active ? active.title : '';
    els.currentState.value = active ? active.currentState : '';
    els.constraints.value = active ? active.constraints : '';
    els.preview.innerHTML = '';
    setMessage('');
    setStep(1);
    showDialog(els.planner);
    window.setTimeout(function () { els.statement.focus(); }, 60);
    track('goal_composer_opened');
  }

  function closePlanner() {
    if (composing) return;
    closeDialog(els.planner);
  }

  function setStep(next) {
    step = Math.max(1, Math.min(3, next));
    document.querySelectorAll('[data-planning-step]').forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-planning-step')) !== step;
    });
    els.stepLabel.textContent = 'Step ' + step + ' of 3';
    els.back.hidden = step === 1;
    els.next.hidden = step === 3;
    els.apply.hidden = step !== 3;
    els.apply.disabled = step === 3 && (!draft || composing || !syncReady);
    if (step === 1) els.statement.focus();
    if (step === 2) els.deadline.focus();
  }

  function handleNext() {
    setMessage('');
    if (step === 1) {
      if (!els.statement.value.trim()) return setMessage('Write the goal you want to finish.', true);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!els.deadline.value) return setMessage('Choose a realistic deadline.', true);
      var deadlineDays = dayDiff(new Date(), parseDateKey(els.deadline.value));
      if (deadlineDays < 30 || deadlineDays > 90) return setMessage('Choose a deadline between 30 and 90 days from today.', true);
      var weeklyHours = Number(els.hours.value);
      if (!Number.isFinite(weeklyHours) || weeklyHours < 1 || weeklyHours > 40) return setMessage('Choose between 1 and 40 hours per week.', true);
      if (!els.currentState.value.trim()) return setMessage('Describe the current starting point.', true);
      setStep(3);
      composeDraft('');
    }
  }

  async function composeDraft(adjustment) {
    if (composing) return;
    composing = true;
    draft = null;
    els.loading.hidden = false;
    els.preview.hidden = true;
    els.adjustments.hidden = true;
    els.apply.disabled = true;
    setMessage('');
    var input = plannerInput();
    try {
      var engine = window.GrowthQuestAI;
      if (!engine || typeof engine.compose !== 'function') throw new Error('The planning engine is still loading. Try again.');
      draft = await engine.compose(input, adjustment);
      renderPreview(draft);
      els.preview.hidden = false;
      els.adjustments.hidden = false;
      els.apply.disabled = !syncReady;
      setMessage(draft.notice || 'Review the draft before adding it to your board.');
      track('goal_plan_generated', { source: draft.source || 'unknown', adjustment: adjustment || 'none' });
    } catch (error) {
      setMessage(error && error.message ? error.message : 'The plan could not be created.', true);
    } finally {
      composing = false;
      els.loading.hidden = true;
    }
  }

  function renderPreview(plan) {
    var milestoneHtml = (plan.milestones || []).map(function (item) {
      return '<li><span>' + escapeHtml(formatDate(item.targetDate)) + '</span><strong>' + escapeHtml(item.title) + '</strong></li>';
    }).join('');
    var questHtml = (plan.quests || []).map(function (item) {
      return '<li><span>' + cadenceLabel(item.cadence) + '</span><strong>' + escapeHtml(item.title) + '</strong></li>';
    }).join('');
    els.preview.innerHTML = [
      '<div class="growth-planning-preview-title">',
        '<span class="growth-planning-preview-label">' + (plan.source === 'ai' ? 'AI plan draft' : 'Private plan draft') + ' · ' + escapeHtml(plan.axis) + '</span>',
        '<h3>' + escapeHtml(plan.title) + '</h3>',
        '<p>' + escapeHtml(plan.outcome) + '</p>',
      '</div>',
      '<div class="growth-planning-preview-grid">',
        '<div class="growth-planning-preview-block"><span class="growth-planning-preview-label">Milestones</span><ul class="growth-planning-preview-list">' + milestoneHtml + '</ul></div>',
        '<div class="growth-planning-preview-block"><span class="growth-planning-preview-label">Board quests</span><ul class="growth-planning-preview-list">' + questHtml + '</ul></div>',
      '</div>',
      '<div class="growth-planning-preview-block"><span class="growth-planning-preview-label">This week</span><p>' + escapeHtml(plan.weeklyFocus) + '</p></div>'
    ].join('');
  }

  function applyDraft(event) {
    event.preventDefault();
    if (!draft || composing) return;
    if (!syncReady) return setMessage('Wait for account sync to finish before adding this plan.', true);
    setMessage('');
    try {
      var result = window.GrowthQuest.applyGoalPlan(draft);
      closeDialog(els.planner);
      renderRail();
      track('goal_plan_applied', { quest_count: result.quests.length, source: draft.source || 'unknown' });
    } catch (error) {
      setMessage(error && error.message ? error.message : 'The plan could not be added.', true);
    }
  }

  function openReview() {
    if (!syncReady) return;
    reviewContext = window.GrowthQuest && window.GrowthQuest.getWeeklyReviewContext();
    if (!reviewContext) return;
    var existing = reviewContext.existingReview;
    els.reviewWin.value = existing ? existing.win : '';
    els.reviewBlocker.value = existing ? existing.blocker : 'none';
    els.reviewFocus.value = existing ? existing.nextFocus : reviewContext.goal.weeklyFocus;
    els.reviewAdaptation.value = existing ? existing.adaptation : 'keep';
    els.reviewMessage.textContent = '';
    els.reviewMessage.classList.remove('is-error');
    els.reviewSnapshot.innerHTML = [
      '<div><span>Primary quest</span><strong>' + escapeHtml(reviewContext.goal.title) + '</strong></div>',
      '<div><span>Completed</span><strong>' + reviewContext.snapshot.done + ' / ' + reviewContext.snapshot.possible + '</strong></div>',
      '<div><span>This week</span><strong>' + reviewContext.snapshot.percent + '%</strong></div>'
    ].join('');
    showDialog(els.review);
    window.setTimeout(function () { els.reviewWin.focus(); }, 60);
    if (!existing) refreshReviewSuggestion();
    track('weekly_review_opened', { completion: reviewContext.snapshot.percent });
  }

  async function refreshReviewSuggestion() {
    if (!reviewContext || !window.GrowthQuestAI || typeof window.GrowthQuestAI.suggestReview !== 'function') return;
    var initialFocus = els.reviewFocus.value.trim();
    var run = ++reviewSuggestionRun;
    try {
      var suggestion = await window.GrowthQuestAI.suggestReview(reviewContext, { blocker: els.reviewBlocker.value });
      if (run !== reviewSuggestionRun) return;
      var latestFocus = els.reviewFocus.value.trim();
      if (latestFocus === initialFocus && (!initialFocus || initialFocus === reviewContext.goal.weeklyFocus)) {
        els.reviewFocus.value = suggestion.nextFocus;
      }
      els.reviewAdaptation.value = suggestion.adaptation;
    } catch (error) {}
  }

  function saveReview(event) {
    event.preventDefault();
    if (!syncReady) {
      els.reviewMessage.textContent = 'Wait for account sync to finish before saving this review.';
      els.reviewMessage.classList.add('is-error');
      return;
    }
    if (!els.reviewFocus.value.trim()) {
      els.reviewMessage.textContent = 'Set one clear finish line for next week.';
      els.reviewMessage.classList.add('is-error');
      return;
    }
    try {
      var saved = window.GrowthQuest.saveWeeklyReview({
        id: reviewContext.existingReview && reviewContext.existingReview.id,
        createdAt: reviewContext.existingReview && reviewContext.existingReview.createdAt,
        rating: ratingFromPercent(reviewContext.snapshot.percent),
        win: els.reviewWin.value,
        blocker: els.reviewBlocker.value,
        nextFocus: els.reviewFocus.value,
        adaptation: els.reviewAdaptation.value
      });
      closeDialog(els.review);
      renderRail();
      track('weekly_review_saved', { completion: saved.snapshot.percent, adaptation: saved.adaptation });
    } catch (error) {
      els.reviewMessage.textContent = error && error.message ? error.message : 'The review could not be saved.';
      els.reviewMessage.classList.add('is-error');
    }
  }

  function closeReview() {
    closeDialog(els.review);
  }

  function plannerInput() {
    return {
      title: els.statement.value.trim(),
      targetDate: els.deadline.value,
      availableHours: Number(els.hours.value) || 5,
      currentState: els.currentState.value.trim(),
      constraints: els.constraints.value.trim()
    };
  }

  function setMessage(message, isError) {
    els.message.textContent = message || '';
    els.message.classList.toggle('is-error', Boolean(isError));
  }

  function timelineProgress(goal) {
    var start = new Date(goal.createdAt || Date.now());
    var end = parseDateKey(goal.targetDate);
    var total = Math.max(1, dayDiff(start, end));
    var elapsed = Math.min(total, Math.max(1, dayDiff(start, new Date())));
    return { total: total, elapsed: elapsed, percent: Math.min(100, Math.round((elapsed / total) * 100)) };
  }

  function ratingFromPercent(percent) {
    if (percent >= 90) return 5;
    if (percent >= 75) return 4;
    if (percent >= 50) return 3;
    if (percent >= 25) return 2;
    return 1;
  }

  function showDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  function formatDate(value) {
    var date = parseDateKey(value);
    if (Number.isNaN(date.getTime())) return 'No date';
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  }

  function parseDateKey(value) {
    var parts = String(value || '').split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  }

  function dayDiff(start, end) {
    var a = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var b = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.max(1, Math.round((b - a) / 86400000));
  }

  function addDays(date, amount) {
    var next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function toDateKey(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function cadenceLabel(cadence) {
    return cadence === 'daily' ? 'Daily' : cadence === 'monthly' ? 'Monthly' : 'Weekly';
  }

  function track(name, properties) {
    window.dispatchEvent(new CustomEvent('growth-product-event', {
      detail: { name: name, properties: properties || {}, at: new Date().toISOString() }
    }));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function byId(id) {
    return document.getElementById(id);
  }
})();
