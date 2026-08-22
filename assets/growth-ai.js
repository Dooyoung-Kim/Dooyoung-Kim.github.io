import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-ai.js';

const config = window.GROWTH_FIREBASE_CONFIG || null;
const aiConfig = window.GROWTH_AI_LOGIC || {};
let modelPromise = null;

window.GrowthQuestAI = {
  compose: composePlan,
  suggestReview,
  isEnabled: () => Boolean(aiConfig.enabled && config)
};
window.dispatchEvent(new CustomEvent('growth-ai-ready'));

async function composePlan(input, adjustment) {
  const normalized = normalizeInput(input);
  if (!aiConfig.enabled || !config) {
    return localPlan(normalized, adjustment);
  }

  try {
    const model = await getPlanningModel();
    const prompt = buildPlanningPrompt(normalized, adjustment);
    const result = await withTimeout(model.generateContent(prompt), 16000);
    const text = result.response.text();
    const draft = validatePlan(JSON.parse(stripCodeFence(text)), normalized);
    if (!draft.milestones.length || !draft.quests.length) {
      throw new Error('The planning response was incomplete.');
    }
    draft.source = 'ai';
    draft.notice = 'AI draft. Review every milestone before adding it to the board.';
    return draft;
  } catch (error) {
    const fallback = localPlan(normalized, adjustment);
    fallback.notice = 'The planning service was unavailable, so a private on-device draft was created instead.';
    return fallback;
  }
}

async function suggestReview(context, responses) {
  const snapshot = context && context.snapshot ? context.snapshot : { percent: 0 };
  const blocker = responses && responses.blocker ? responses.blocker : 'none';
  const goal = context && context.goal ? context.goal : {};
  if (!aiConfig.enabled || !config) {
    return localReviewSuggestion(goal, snapshot, blocker);
  }

  try {
    const model = await getPlanningModel();
    const prompt = [
      'Return JSON only with keys adaptation and nextFocus.',
      'Adaptation must be keep, reduce, or replace.',
      'NextFocus must be one measurable weekly outcome under 160 characters.',
      `Goal: ${clean(goal.title, 120)}`,
      `Current weekly focus: ${clean(goal.weeklyFocus, 160)}`,
      `Completion: ${Number(snapshot.percent) || 0}%`,
      `Blocker: ${clean(blocker, 80)}`
    ].join('\n');
    const result = await withTimeout(model.generateContent(prompt), 12000);
    const parsed = JSON.parse(stripCodeFence(result.response.text()));
    return {
      adaptation: ['keep', 'reduce', 'replace'].includes(parsed.adaptation) ? parsed.adaptation : 'keep',
      nextFocus: clean(parsed.nextFocus || goal.weeklyFocus || goal.title, 160)
    };
  } catch (error) {
    return localReviewSuggestion(goal, snapshot, blocker);
  }
}

async function getPlanningModel() {
  if (modelPromise) return modelPromise;
  modelPromise = Promise.resolve().then(() => {
    const app = getApps().length ? getApp() : initializeApp(config);
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    return getGenerativeModel(ai, {
      model: aiConfig.model || 'gemini-3.6-flash',
      systemInstruction: [
        'You are the planning engine for Growth Quest.',
        'Turn one 30-90 day goal into an achievable plan.',
        'Use binary completion evidence, realistic buffers, and no more than 80% of available time.',
        'Daily quests must take 15-60 minutes. Weekly quests must produce a visible result.',
        'Do not provide medical, investment, legal, or diagnostic advice.',
        'Return valid JSON only.'
      ].join(' '),
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25,
        maxOutputTokens: 1800
      }
    });
  });
  return modelPromise;
}

function buildPlanningPrompt(input, adjustment) {
  return [
    'Create a goal plan using this exact JSON shape:',
    '{"title":"","outcome":"","targetDate":"YYYY-MM-DD","axis":"Health|Intelligence|Capital","weeklyFocus":"","milestones":[{"title":"","targetDate":"YYYY-MM-DD"}],"quests":[{"title":"","cadence":"daily|weekly|monthly","axis":"Health|Intelligence|Capital"}],"assumptions":[""]}',
    'Requirements: 3-5 milestones, 3-6 quests, at most 3 daily quests, concise titles, measurable completion.',
    `Goal: ${input.title}`,
    `Deadline: ${input.targetDate}`,
    `Current state: ${input.currentState}`,
    `Hours per week: ${input.availableHours}`,
    `Constraints: ${input.constraints || 'None stated'}`,
    `Adjustment request: ${adjustment || 'None'}`
  ].join('\n');
}

function localPlan(input, adjustment) {
  const lower = input.title.toLowerCase();
  const axis = inferAxis(lower);
  const target = parseDate(input.targetDate);
  const start = new Date();
  const span = Math.max(21, dayDiff(start, target));
  const milestoneDates = [0.25, 0.55, 0.8, 1].map(ratio => addDays(start, Math.max(7, Math.round(span * ratio))));
  const topic = conciseTopic(input.title);
  const minutes = adjustment === 'easier' ? 25 : adjustment === 'faster' ? 60 : Math.min(60, Math.max(30, Math.round((input.availableHours * 60 * 0.65) / 5)));
  const outcome = measurableOutcome(lower, topic, input.targetDate);
  const milestones = milestoneTitles(lower, topic).map((title, index) => ({
    title,
    targetDate: toDateKey(milestoneDates[Math.min(index, milestoneDates.length - 1)])
  }));
  const quests = questTemplates(lower, topic, axis, minutes);

  return validatePlan({
    planId: uniqueId('local-plan'),
    title: input.title,
    outcome,
    targetDate: input.targetDate,
    axis,
    weeklyFocus: milestones[0].title,
    milestones,
    quests,
    assumptions: [
      `${input.availableHours} focused hours are available each week.`,
      input.constraints ? `The plan accounts for: ${input.constraints}` : 'One buffer session remains open each week.'
    ],
    currentState: input.currentState,
    constraints: input.constraints,
    availableHours: input.availableHours,
    source: 'local',
    notice: 'Private on-device draft. Firebase AI Logic can replace this engine after App Check setup.'
  }, input);
}

function milestoneTitles(lower, topic) {
  if (/paper|manuscript|proposal|thesis|article/.test(lower)) {
    return [
      'Lock the outline and evidence map',
      'Complete the full working draft',
      'Finish internal review and revisions',
      'Submit the final manuscript'
    ];
  }
  if (/app|product|website|portfolio|launch|deploy|prototype/.test(lower)) {
    return [
      'Define the smallest testable scope',
      'Complete the working core experience',
      'Test and resolve launch blockers',
      `Publish ${topic}`
    ];
  }
  if (/exam|certif|course|learn|study|language/.test(lower)) {
    return [
      'Map the syllabus and baseline score',
      'Complete the core learning blocks',
      'Pass two timed practice runs',
      `Complete ${topic}`
    ];
  }
  if (/run|fitness|workout|weight|health/.test(lower)) {
    return [
      'Record the baseline and weekly schedule',
      'Complete four consistent weeks',
      'Reach the target performance range',
      `Verify the result for ${topic}`
    ];
  }
  return [
    'Define the finish line and first evidence',
    'Complete the first working version',
    'Test the result and close the largest gap',
    `Finish ${topic}`
  ];
}

function questTemplates(lower, topic, axis, minutes) {
  const dailyVerb = /paper|manuscript|proposal|thesis|article/.test(lower)
    ? 'Write or revise'
    : /exam|certif|course|learn|study|language/.test(lower)
      ? 'Complete focused study'
      : /run|fitness|workout|weight|health/.test(lower)
        ? 'Complete the planned training'
        : 'Complete focused work';
  const resultVerb = /paper|manuscript|proposal|thesis|article/.test(lower)
    ? 'Finish one reviewable section'
    : /app|product|website|portfolio|launch|deploy|prototype/.test(lower)
      ? 'Ship one testable increment'
      : 'Finish one measurable weekly result';
  return [
    { title: `${dailyVerb} for ${minutes} min`, cadence: 'daily', axis },
    { title: resultVerb, cadence: 'weekly', axis },
    { title: 'Review evidence and set the next finish line', cadence: 'weekly', axis }
  ];
}

function measurableOutcome(lower, topic, date) {
  if (/paper|manuscript|proposal|thesis|article/.test(lower)) return `Submit a complete, reviewed ${topic} by ${date}.`;
  if (/app|product|website|portfolio|launch|deploy|prototype/.test(lower)) return `Publish a working ${topic} and record one external test by ${date}.`;
  if (/exam|certif/.test(lower)) return `Complete the exam or certification with a recorded result by ${date}.`;
  if (/run|fitness|workout|weight|health/.test(lower)) return `Complete the defined health target and record the final measure by ${date}.`;
  return `Complete ${topic} and record clear evidence of completion by ${date}.`;
}

function localReviewSuggestion(goal, snapshot, blocker) {
  const score = Number(snapshot.percent) || 0;
  if (score < 50 || blocker === 'time' || blocker === 'scope') {
    return {
      adaptation: 'reduce',
      nextFocus: `Finish the smallest reviewable part of ${clean(goal.title, 90)}.`
    };
  }
  if (score >= 85) {
    return {
      adaptation: 'keep',
      nextFocus: goal.weeklyFocus || `Close the next measurable milestone for ${clean(goal.title, 90)}.`
    };
  }
  return {
    adaptation: blocker === 'priority' ? 'replace' : 'keep',
    nextFocus: goal.weeklyFocus || `Complete one visible result for ${clean(goal.title, 90)}.`
  };
}

function validatePlan(plan, input) {
  const axes = ['Health', 'Intelligence', 'Capital'];
  const axis = axes.includes(plan.axis) ? plan.axis : inferAxis(String(plan.title || '').toLowerCase());
  const milestones = Array.isArray(plan.milestones) ? plan.milestones : [];
  const quests = Array.isArray(plan.quests) ? plan.quests : [];
  return {
    planId: clean(plan.planId || uniqueId('plan'), 80),
    title: clean(plan.title || input.title, 120),
    outcome: clean(plan.outcome || input.title, 220),
    targetDate: /^\d{4}-\d{2}-\d{2}$/.test(plan.targetDate || '') ? plan.targetDate : input.targetDate,
    axis,
    weeklyFocus: clean(plan.weeklyFocus || (milestones[0] && milestones[0].title) || input.title, 160),
    milestones: milestones.map(item => ({
      title: clean(item && item.title, 120),
      targetDate: /^\d{4}-\d{2}-\d{2}$/.test(item && item.targetDate || '') ? item.targetDate : input.targetDate
    })).filter(item => item.title).slice(0, 6),
    quests: quests.map(item => ({
      title: clean(item && item.title, 80),
      cadence: ['daily', 'weekly', 'monthly'].includes(item && item.cadence) ? item.cadence : 'weekly',
      axis: axes.includes(item && item.axis) ? item.axis : axis
    })).filter(item => item.title).slice(0, 8),
    assumptions: (Array.isArray(plan.assumptions) ? plan.assumptions : []).map(item => clean(item, 120)).filter(Boolean).slice(0, 5),
    currentState: clean(input.currentState, 240),
    constraints: clean(input.constraints, 240),
    availableHours: input.availableHours,
    source: plan.source || 'ai',
    notice: plan.notice || ''
  };
}

function normalizeInput(input) {
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(input && input.targetDate || '') ? input.targetDate : toDateKey(addDays(new Date(), 60));
  return {
    title: clean(input && input.title, 120),
    targetDate: deadline,
    currentState: clean(input && input.currentState, 240),
    constraints: clean(input && input.constraints, 240),
    availableHours: Math.min(80, Math.max(1, Number(input && input.availableHours) || 5))
  };
}

function inferAxis(text) {
  if (/run|fitness|workout|weight|health|sleep|meal|alcohol/.test(text)) return 'Health';
  if (/save|income|money|finance|invest|business|revenue|capital/.test(text)) return 'Capital';
  return 'Intelligence';
}

function conciseTopic(value) {
  return clean(value, 70).replace(/^(finish|complete|build|create|submit|launch|learn|study)\s+/i, '').replace(/[.!?]+$/, '') || 'goal';
}

function stripCodeFence(value) {
  return String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

function clean(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max || 200);
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseDate(value) {
  const parts = String(value || '').split('-').map(Number);
  const parsed = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  return Number.isNaN(parsed.getTime()) ? addDays(new Date(), 60) : parsed;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dayDiff(start, end) {
  return Math.max(1, Math.round((new Date(end.getFullYear(), end.getMonth(), end.getDate()) - new Date(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000));
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function withTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error('Planning request timed out.')), timeout))
  ]);
}
