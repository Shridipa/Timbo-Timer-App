import { GoogleGenAI } from '@google/genai';

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const SYSTEM_PROMPTS = {
  strategist: `You are an elite AI Strategic Goal Planner and Productivity Architect. You help users break down major life goals into tactical, realistic, and highly structured execution roadmaps. You always respond with clean, valid JSON matching the exact schema requested.`,
  psychologist: `You are a world-class Psychological Accountability Coach, combining elements of Cognitive Behavioral Therapy (CBT), performance psychology, and empathetic accountability. You help users confront excuses, overcome procrastination (classifying it as fear, avoidance, perfectionism, confusion, laziness, or genuine burnout), and gently but firmly guide them back to execution.`,
  briefing: `You are a high-performance Morning Briefing Assistant. Your job is to motivate, inspire, and strategically brief the user on their daily execution missions. Your tone is energetic, crisp, and empowering—like a world-class athletic trainer preparing an elite performer.`
};

// Helper for calling Gemini
const callGemini = async (prompt, persona, jsonMode = false) => {
  try {
    if (!ai) {
      throw new Error('Optional AI key not configured');
    }

    const config = {
      systemInstruction: SYSTEM_PROMPTS[persona] || SYSTEM_PROMPTS.strategist,
      temperature: 0.7,
    };

    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: config
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to communicate with AI Engine');
  }
};

const inferBurnoutRisk = (goalData) => {
  const hours = Number(goalData.targetHours || 1);
  if (goalData.stressLevel === 'High' || hours > 5) return 'High';
  if (goalData.stressLevel === 'Medium' || hours < 2) return 'Medium';
  return 'Low';
};

const ruleBasedGoalAnalysis = (goalData) => {
  const isCareer = /faang|job|interview|coding|career/i.test(goalData.title || '');
  const isStudy = /exam|study|learn|course|crack/i.test(goalData.title || '');
  const burnoutRisk = inferBurnoutRisk(goalData);
  const hours = Number(goalData.targetHours || 1);

  return {
    skillGaps: isCareer
      ? ['Problem pattern fluency', 'Timed execution', 'Interview confidence']
      : isStudy
        ? ['Concept retention', 'Practice consistency', 'Revision rhythm']
        : ['Clear next actions', 'Consistent execution', 'Feedback loops'],
    effortEstimate: 'Step 1: Build the foundation\nStep 2: Practice in focused blocks\nStep 3: Simulate real conditions\nStep 4: Review weak spots weekly',
    dependencies: ['Stable weekly availability', 'One protected focus window', 'A simple review ritual'],
    risks: burnoutRisk === 'High'
      ? ['Overloaded calendar', 'Skipped recovery', 'Too many heavy sessions']
      : ['Evening avoidance', 'Underestimated task size', 'Loss of momentum after missed days'],
    executionProbability: Math.max(58, Math.min(92, 62 + hours * 7 - (burnoutRisk === 'High' ? 12 : 0))),
    focusAllocation: burnoutRisk === 'High' ? '60% practice, 25% review, 15% recovery' : '70% practice, 20% review, 10% reflection',
    burnoutRisk
  };
};

const ruleBasedRoadmap = (goalData) => ({
  phases: [
    {
      title: 'Phase 1: Foundation reset',
      objective: `Make ${goalData.title} feel startable and concrete.`,
      duration: '3 weeks',
      practiceGoals: ['Complete 5 focused sessions per week', 'Log one tiny review after each session'],
      expectedOutcomes: ['Clear baseline', 'Reduced starting friction'],
      order: 1,
      tasks: [
        { title: 'Map the core skills', description: 'List the highest-leverage subskills and pick the first one.', duration: 35, priority: 'high', resources: 'Existing notes or syllabus', whyItMatters: 'Clarity reduces avoidance.' },
        { title: 'Daily focus block', description: 'Complete one protected session on the main skill.', duration: 50, priority: 'high', resources: 'Timer and practice set', whyItMatters: 'Consistency compounds faster than intensity.' },
        { title: 'Light review loop', description: 'Review mistakes and update the next mission.', duration: 20, priority: 'medium', resources: 'Journal or review sheet', whyItMatters: 'Review turns effort into learning.' }
      ]
    },
    {
      title: 'Phase 2: Pattern and speed',
      objective: 'Increase difficulty while keeping recovery protected.',
      duration: '6 weeks',
      practiceGoals: ['Alternate deep work and review sessions', 'Complete one simulation weekly'],
      expectedOutcomes: ['Better speed', 'More reliable confidence'],
      order: 2,
      tasks: [
        { title: 'Timed practice sprint', description: 'Practice under a visible time box.', duration: 45, priority: 'high', resources: 'Timed task set', whyItMatters: 'Pressure becomes familiar.' },
        { title: 'Weakness repair', description: 'Pick one repeated mistake and repair it deliberately.', duration: 35, priority: 'medium', resources: 'Mistake log', whyItMatters: 'Small repairs prevent repeated stalls.' },
        { title: 'Recovery checkpoint', description: 'Run a lighter session after two heavy days.', duration: 25, priority: 'low', resources: 'Review notes', whyItMatters: 'Recovery preserves momentum.' }
      ]
    },
    {
      title: 'Phase 3: Simulation and polish',
      objective: 'Practice the real performance environment and refine final gaps.',
      duration: 'Final stretch',
      practiceGoals: ['Run realistic simulations', 'Protect sleep and recovery'],
      expectedOutcomes: ['Readiness', 'Stable execution under pressure'],
      order: 3,
      tasks: [
        { title: 'Full simulation', description: 'Perform a realistic mock session.', duration: 90, priority: 'high', resources: 'Mock test or interview prompt', whyItMatters: 'Real conditions reveal the last blockers.' },
        { title: 'Final gap review', description: 'Review the most expensive errors first.', duration: 40, priority: 'high', resources: 'Error log', whyItMatters: 'Priority repair beats broad panic.' },
        { title: 'Confidence closeout', description: 'End with a short win log and next action.', duration: 15, priority: 'medium', resources: 'Journal', whyItMatters: 'The brain returns to what feels finishable.' }
      ]
    }
  ]
});

/**
 * Step 2: Goal Analysis Engine
 */
export const analyzeGoal = async (goalData) => {
  if (!ai) return ruleBasedGoalAnalysis(goalData);

  const prompt = `
    Analyze the following user-defined goal and return a comprehensive analysis in JSON format.
    
    Goal Title: "${goalData.title}"
    Timeline/Deadline: "${goalData.deadline}"
    Current Experience Level: "${goalData.currentLevel}"
    Daily Hours Committed: ${goalData.targetHours} hours/day
    Current commitments/bottlenecks: "${goalData.commitments}"
    Stress Level: "${goalData.stressLevel}"
    Primary Distractions: "${goalData.distractions}"
    
    Provide a realistic, scientific estimation of this goal.
    Return JSON format matching this EXACT structure:
    {
      "skillGaps": ["gap 1", "gap 2", ...],
      "effortEstimate": "Step 1: Foundational Skill Setup\nStep 2: Core Project Implementation\nStep 3: Deep Focus Mastery\nStep 4: Real-world Simulation. (Ensure each pointwise execution step is on a new line separated by \\n, structured sequentially)",
      "dependencies": ["pre-requisite 1", "pre-requisite 2", ...],
      "risks": ["risk factor 1", "risk factor 2", ...],
      "executionProbability": 85, // percentage (integer between 0 and 100) based on hours and commitments
      "focusAllocation": "Where the user should focus their attention (e.g. 70% learning, 30% project building)",
      "burnoutRisk": "Low" | "Medium" | "High"
    }
  `;

  try {
    const responseText = await callGemini(prompt, 'strategist', true);
    return JSON.parse(responseText);
  } catch {
    return ruleBasedGoalAnalysis(goalData);
  }
};

/**
 * Step 3: Roadmap Generator
 */
export const generateRoadmap = async (goalData, analysis) => {
  if (!ai) return ruleBasedRoadmap(goalData, analysis);

  const prompt = `
    Generate a complete, sequential strategic execution roadmap for the following goal:
    
    Goal: "${goalData.title}"
    Timeline: "${goalData.deadline}"
    Current Level: "${goalData.currentLevel}"
    Daily Investable Hours: ${goalData.targetHours}
    Burnout Risk: "${analysis.burnoutRisk}"
    Skill Gaps: ${JSON.stringify(analysis.skillGaps)}
    
    Create exactly 3 execution phases. Each phase should be progressively harder and build on the last.
    Each phase MUST contain a set of 3-4 tactical, actionable tasks.
    Return JSON format matching this EXACT structure:
    {
      "phases": [
        {
          "title": "Phase Title (e.g. Phase 1: Core Foundation)",
          "objective": "Clear, specific objective of this phase",
          "duration": "Duration (e.g. 6 weeks)",
          "practiceGoals": ["Measurable practice goal 1", "Measurable practice goal 2"],
          "expectedOutcomes": ["Expected output 1", "Expected output 2"],
          "order": 1,
          "tasks": [
            {
              "title": "Actionable task title (e.g. Complete Python basics)",
              "description": "Short specific instruction on how to execute",
              "duration": 90, // target minutes per session (integer)
              "priority": "high" | "medium" | "low",
              "resources": "Specific resources (e.g. FreeCodeCamp Python Course)",
              "whyItMatters": "Why this specific task matters emotionally or tactically"
            }
          ]
        }
      ]
    }
  `;

  try {
    const responseText = await callGemini(prompt, 'strategist', true);
    return JSON.parse(responseText);
  } catch {
    return ruleBasedRoadmap(goalData, analysis);
  }
};

/**
 * Step 2.5: Conversational AI Task Scheduling Analysis
 */
export const analyzeTaskScheduling = async (taskData, userContext, existingEvents, skippedMissions) => {
  try {
    const prompt = `
      You are an elite AI Cognitive Scheduler and Executive Productivity Strategist.
      A user wants to schedule a new task/mission but we need to behave like a cognitive coach and determine the absolute best placement and strategy.
      
      Task Details:
      - Title: "${taskData.title}"
      - Mentally Heavy or Light: "${taskData.mentalWeight}"
      - Execution Mode: "${taskData.executionMode}" (Deep Work vs Relaxed)
      - Preferred Time of Day: "${taskData.preferredTime}" (Morning, Afternoon, Evening)
      - Preferred Duration: ${taskData.duration} minutes
      - User Stress/Fatigue Level: "${taskData.stressLevel}"
      - Optimize For: "${taskData.optimizationGoal}" (Max Productivity vs Low Stress)
      - Breaks Desired: ${taskData.wantsBreaks ? 'Yes' : 'No'}
      
      User & Calendar Context:
      - User Peak Focus Hours: "${userContext?.peakHour || '10:00'}"
      - Sleep Schedule: "${userContext?.sleepStart || '23:00'} to ${userContext?.sleepEnd || '07:00'}"
      - Existing Events Today/Tomorrow: ${JSON.stringify((existingEvents || []).map(e => ({ title: e.title, start: e.start, end: e.end, type: e.type })))}
      - Previously Skipped Tasks: ${JSON.stringify((skippedMissions || []).map(m => ({ title: m.title, skipReason: m.skipReason })))}
      
      Analyze the cognitive load, existing calendar clutter, burnout indicators, deep work limits, context switching, and focus history.
      Generate 3-4 highly intelligent, conversational AI suggestions/insights (like a human cognitive coach) before confirming placement.
      Examples of what you should say:
      - "You usually focus best between 9–11 AM. I recommend placing this there."
      - "This task appears cognitively demanding. Splitting it into 2 sessions may improve retention."
      - "You've skipped similar evening sessions before. Morning placement may work better."
      - "You already have 3 heavy sessions tomorrow. Shall I move this to Thursday?"
      
      Also recommend the best exact start time (ISO string or relative description like "Tomorrow at 09:00 AM"), suggested label (e.g., "Deep Work", "Revision", "Recovery", "Cognitive Sprint", "Focus Session"), color hex (#8b5cf6 for Deep Work, #3b82f6 for Revision/Learning, #10b981 for Recovery/Relaxed, #f59e0b for Cognitive Sprint), and whether to split into 2 sessions.
      
      Return JSON format matching this EXACT structure:
      {
        "aiSuggestions": [
          "Suggestion 1",
          "Suggestion 2",
          "Suggestion 3"
        ],
        "recommendedStartTime": "2026-05-20T09:00:00.000Z",
        "recommendedEndTime": "2026-05-20T10:00:00.000Z",
        "recommendedLabel": "Deep Work",
        "recommendedColor": "#8b5cf6",
        "splitRecommended": false,
        "splitExplanation": "Explanation if split is recommended",
        "cognitiveLoadAssessment": "High Cognitive Demand - Best paired with a 15m recovery buffer."
      }
    `;

    const responseText = await callGemini(prompt, 'strategist', true);
    return JSON.parse(responseText);
  } catch (error) {
    console.warn('Gemini API fallback for analyzeTaskScheduling:', error.message);
    // Intelligent algorithmic fallback matching the exact persona and requirements
    const isHeavy = taskData.mentalWeight === 'heavy' || taskData.executionMode === 'deep_work';
    const isFatigued = taskData.stressLevel === 'High';
    const peak = userContext?.peakHour || '10:00';
    
    let suggestions = [];
    if (isHeavy) {
      suggestions.push(`This task appears cognitively demanding. Splitting it into 2 sessions may improve retention.`);
      suggestions.push(`You usually focus best around ${peak} AM. I recommend placing this there.`);
    } else {
      suggestions.push(`This is a lightweight session. Placing it during your afternoon/evening recovery window will maintain momentum without causing burnout.`);
    }
    if (isFatigued) {
      suggestions.push(`I detect high fatigue indicators. I'm adding a mandatory 15-minute cognitive buffer after this session.`);
    }
    if (skippedMissions && skippedMissions.length > 0) {
      suggestions.push(`You've skipped similar evening sessions before. Morning placement will ensure higher execution consistency.`);
    }
    if (suggestions.length === 0) {
      suggestions.push(`You have a clear focus window available. Scheduling this for optimal cognitive flow.`);
    }

    // Calculate a smart start time: tomorrow at peak hour
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [peakH, peakM] = peak.split(':').map(Number);
    tomorrow.setHours(peakH || 10, peakM || 0, 0, 0);
    const end = new Date(tomorrow.getTime() + (taskData.duration || 50) * 60000);

    const label = isHeavy ? (taskData.executionMode === 'deep_work' ? 'Deep Work' : 'Cognitive Sprint') : 'Focus Session';
    const color = isHeavy ? '#8b5cf6' : '#3b82f6';

    return {
      aiSuggestions: suggestions,
      recommendedStartTime: tomorrow.toISOString(),
      recommendedEndTime: end.toISOString(),
      recommendedLabel: label,
      recommendedColor: color,
      splitRecommended: isHeavy && (taskData.duration > 60),
      splitExplanation: isHeavy ? 'Splitting heavy tasks prevents neural fatigue and leverages the spacing effect.' : '',
      cognitiveLoadAssessment: isHeavy ? 'High Cognitive Demand - Best paired with a 15m recovery buffer.' : 'Balanced Cognitive Load - Smooth execution expected.'
    };
  }
};

/**
 * Step 10: Excuse Validation Engine
 */
export const validateExcuse = async (taskTitle, excuse, motivations) => {
  if (!ai) {
    const lower = (excuse || '').toLowerCase();
    const burnout = /sick|exhausted|burnout|fever|emergency|no sleep|12 hours/.test(lower);
    const confusion = /confused|don't know|dont know|unclear|overwhelmed/.test(lower);
    const classification = burnout ? 'burnout' : confusion ? 'confusion' : 'avoidance';
    return {
      classification,
      isValid: burnout,
      feedback: burnout
        ? `Rest is the mission today. Protect recovery so ${motivations || 'your bigger reason'} still has energy tomorrow.`
        : `This looks like resistance, not failure. Shrink "${taskTitle}" to a 10-minute start and let momentum return gently.`
    };
  }

  const prompt = `
    The user skipped their task today.
    Task Title: "${taskTitle}"
    User's Excuse: "${excuse}"
    User's Core Motivations: "${motivations}"
    
    Perform two tasks:
    1. Classify the excuse into exactly one of these categories:
       - "burnout" (user is genuinely exhausted, sick, or working 12+ hours)
       - "emotional_resistance" (user feels uncomfortable, anxious, or is avoidance-coping)
       - "fear" (fear of failure, fear of starting)
       - "avoidance" (doing other lower priority things to feel productive)
       - "laziness" (just wanting to watch TV/lounge with no solid barrier)
       - "confusion" (doesn't know where to start, overwhelmed by complexity)
       - "perfectionism" (wants it perfect or won't do it at all)
       
    2. Assess if this excuse is VALID (true for genuine burnout, medical emergencies, extreme life events) or INVALID (for avoidance, fear, laziness, emotional resistance).
    
    3. Generate a highly personalized, supportive, but psychologically firm coaching response.
       - If INVALID: Confront the excuse softly. Remind them of their core motivations ("${motivations}"). Tell them why starting for just 5 minutes beats skipping entirely.
       - If VALID: Validate their state, recommend recovery techniques, and encourage them to rest today to maintain long-term momentum.
       
    Return JSON format matching this EXACT structure:
    {
      "classification": "burnout" | "emotional_resistance" | "fear" | "avoidance" | "laziness" | "confusion" | "perfectionism",
      "isValid": true | false,
      "feedback": "Your highly engaging, persuasive, empathetic coaching response goes here."
    }
  `;

  try {
    const responseText = await callGemini(prompt, 'psychologist', true);
    return JSON.parse(responseText);
  } catch {
    return {
      classification: 'avoidance',
      isValid: false,
      feedback: `Start with the smallest visible part of "${taskTitle}". Five calm minutes keeps the promise alive.`
    };
  }
};

/**
 * Step 15: Morning Briefing
 */
export const generateMorningBriefing = async (goalTitle, currentPhase, todayTasks, userMotivations) => {
  if (!ai) {
    return {
      motivation: `One focused session today keeps ${goalTitle} alive.`,
      brief: `Today's Core Mission: complete ${todayTasks?.[0] || 'one meaningful focus block'}.\n\nMental Focus Map: start before checking low-priority distractions, then stop while the next step is still clear.`
    };
  }

  const prompt = `
    Generate a high-performance Morning Briefing for the user.
    
    Overarching Goal: "${goalTitle}"
    Current Execution Phase: "${currentPhase}"
    Today's Scheduled Tasks: ${JSON.stringify(todayTasks)}
    User Motivations: "${userMotivations}"
    
    Format the response in 3 short, high-impact sections:
    1. A single, powerful, highly motivating quote/greeting tailored specifically to their goal.
    2. "Today's Core Mission" - A clear explanation of what they are achieving today and why it matters.
    3. "Mental Focus Map" - One specific tactic to avoid distraction and enter deep work today.
    
    Return JSON format matching this EXACT structure:
    {
      "motivation": "Greeting / energetic custom motivation statement",
      "brief": "Detailed, styled markdown string containing the Daily Mission, tasks to execute, and the Mental Focus Map."
    }
  `;

  try {
    const responseText = await callGemini(prompt, 'briefing', true);
    return JSON.parse(responseText);
  } catch {
    return {
      motivation: `One focused session today keeps ${goalTitle} alive.`,
      brief: `Today's Core Mission: complete ${todayTasks?.[0] || 'one meaningful focus block'}.\n\nMental Focus Map: use a 25-minute sprint and close the loop with a short review.`
    };
  }
};

/**
 * Step 14: Daily Review
 */
export const generateDailyReviewInsight = async (win, struggle, energyLevel, distractionLevel, completedMissions) => {
  if (!ai) {
    const adjustment = energyLevel <= 4 || distractionLevel >= 7
      ? 'Tomorrow should start with a lighter 25-minute session before any heavy work.'
      : 'Keep the same schedule shape tomorrow and protect your first focus window.';
    return `Win noticed: ${win}.\n\nPattern: ${struggle} is useful data, not a verdict.\n\nAdjustment: ${adjustment}`;
  }

  const prompt = `
    The user is wrapping up their day. Here is their performance log:
    Completed Tasks: ${JSON.stringify(completedMissions)}
    User's Main Win: "${win}"
    User's Main Struggle: "${struggle}"
    User's Energy Level (1-10): ${energyLevel}
    User's Distraction Level (1-10): ${distractionLevel}
    
    Analyze their day. Suggest:
    1. One actionable CBT-based habit adjustment or recovery tip.
    2. Encouragement acknowledging their win.
    3. A tactical schedule adjustment if their energy is low or distraction is high.
    
    Keep it concise and highly customized.
    Return a plain text string with rich, sleek formatting (use bullet points).
  `;

  try {
    return await callGemini(prompt, 'psychologist', false);
  } catch {
    return `Win noticed: ${win}.\n\nAdjustment: reduce friction around ${struggle} and begin tomorrow with one short session.`;
  }
};

/**
 * Step 16: Contextual Strategy Chat
 */
export const chatWithCoach = async (chatHistory, message, userContext) => {
  if (!ai) {
    const lower = (message || '').toLowerCase();
    if (lower.includes('tired') || lower.includes('burnout')) {
      return 'Tired is data, not failure. Switch today to recovery mode: one 25-minute light session, then stop cleanly.';
    }
    if (lower.includes('behind')) {
      return `Behind does not mean broken. For ${userContext.goalTitle}, protect the highest-leverage task and let Timbo move the rest forward.`;
    }
    if (lower.includes('stuck') || lower.includes('start')) {
      return 'Lower the entry cost. Open the task, do the first visible action for 10 minutes, and count that as a real session.';
    }
    return `I would schedule your hardest task around ${userContext.peakProductivityHour || 'your strongest focus window'} and keep the evening for a lighter review.`;
  }

  const prompt = `
    You are the user's elite AI Life Operating System Coach and Strategist.
    You have full access to the user's current productivity profiles and state.
    
    User Context:
    - Active Goal: "${userContext.goalTitle}"
    - Deadline: "${userContext.goalDeadline}"
    - Current Roadmap Phase: "${userContext.currentPhase}"
    - User's Peak Energy Hour: "${userContext.peakProductivityHour}"
    - Biggest Distraction: "${userContext.distractions}"
    - Motivations: "${userContext.motivations}"
    - Core Psychological Profile/History: ${JSON.stringify(userContext.history)}
    
    Recent Chat History:
    ${JSON.stringify(chatHistory)}
    
    User's Message: "${message}"
    
    Respond in a highly personalized, smart, structured way. Refer back to their psychological history, wins, or excuses when appropriate to show deep memory. Keep it supportive but challenging. Use simple markdown.
  `;

  try {
    return await callGemini(prompt, 'psychologist', false);
  } catch {
    return `Start with one protected block for ${userContext.goalTitle}. Smaller is smarter when consistency is the goal.`;
  }
};
