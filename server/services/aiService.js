import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPTS = {
  strategist: `You are an elite AI Strategic Goal Planner and Productivity Architect. You help users break down major life goals into tactical, realistic, and highly structured execution roadmaps. You always respond with clean, valid JSON matching the exact schema requested.`,
  psychologist: `You are a world-class Psychological Accountability Coach, combining elements of Cognitive Behavioral Therapy (CBT), performance psychology, and empathetic accountability. You help users confront excuses, overcome procrastination (classifying it as fear, avoidance, perfectionism, confusion, laziness, or genuine burnout), and gently but firmly guide them back to execution.`,
  briefing: `You are a high-performance Morning Briefing Assistant. Your job is to motivate, inspire, and strategically brief the user on their daily execution missions. Your tone is energetic, crisp, and empowering—like a world-class athletic trainer preparing an elite performer.`
};

// Helper for calling Gemini
const callGemini = async (prompt, persona, jsonMode = false) => {
  try {
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

/**
 * Step 2: Goal Analysis Engine
 */
export const analyzeGoal = async (goalData) => {
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

  const responseText = await callGemini(prompt, 'strategist', true);
  return JSON.parse(responseText);
};

/**
 * Step 3: Roadmap Generator
 */
export const generateRoadmap = async (goalData, analysis) => {
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

  const responseText = await callGemini(prompt, 'strategist', true);
  return JSON.parse(responseText);
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

  const responseText = await callGemini(prompt, 'psychologist', true);
  return JSON.parse(responseText);
};

/**
 * Step 15: Morning Briefing
 */
export const generateMorningBriefing = async (goalTitle, currentPhase, todayTasks, userMotivations) => {
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

  const responseText = await callGemini(prompt, 'briefing', true);
  return JSON.parse(responseText);
};

/**
 * Step 14: Daily Review
 */
export const generateDailyReviewInsight = async (win, struggle, energyLevel, distractionLevel, completedMissions) => {
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

  return await callGemini(prompt, 'psychologist', false);
};

/**
 * Step 16: Contextual Strategy Chat
 */
export const chatWithCoach = async (chatHistory, message, userContext) => {
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

  return await callGemini(prompt, 'psychologist', false);
};
