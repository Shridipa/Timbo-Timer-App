import { addDays, format } from "date-fns";

const baseTimeline = [
  { time: "09:00", title: "DSA practice", length: 50, type: "focus", priority: "High" },
  { time: "14:00", title: "Concept revision", length: 35, type: "review", priority: "Medium" },
  { time: "19:00", title: "Mock interview set", length: 45, type: "challenge", priority: "High" },
];

export const fallbackProfile = {
  goal: "Crack FAANG in 6 months",
  deadline: addDays(new Date(), 182),
  level: "Intermediate",
  availability: "2.5h today",
  preferredHours: "Before noon",
  difficulty: "Stretch, not stressful",
};

const readProfile = (user = {}) => {
  if (user?.onboardingProfile) return user.onboardingProfile;
  try {
    const local = localStorage.getItem("timbo_demo_profile");
    return local ? JSON.parse(local) : fallbackProfile;
  } catch {
    return fallbackProfile;
  }
};

const buildTimeline = (profile, recoveryMode) => {
  if (recoveryMode) {
    return [
      { time: "10:00", title: "Light revision", length: 25, type: "recovery", priority: "Gentle" },
      { time: "16:30", title: "One easy problem", length: 25, type: "focus", priority: "Medium" },
    ];
  }
  if (profile.preferredHours === "Evening") {
    return [
      { time: "18:00", title: "Warm-up review", length: 25, type: "review", priority: "Medium" },
      { time: "19:00", title: "Deep practice block", length: 50, type: "focus", priority: "High" },
      { time: "20:10", title: "Tiny recap", length: 15, type: "reflection", priority: "Gentle" },
    ];
  }
  if (profile.preferredHours === "Afternoon") {
    return [
      { time: "13:00", title: "Main skill block", length: 50, type: "focus", priority: "High" },
      { time: "15:00", title: "Revision loop", length: 35, type: "review", priority: "Medium" },
      { time: "17:30", title: "Confidence checkpoint", length: 20, type: "reflection", priority: "Gentle" },
    ];
  }
  return baseTimeline;
};

export const getAdaptiveState = (user = {}) => {
  const profile = readProfile(user);
  const points = user?.points || 140;
  const level = user?.level || 3;
  const momentum = Math.min(96, Math.max(58, user?.momentumScore || 82));
  const skippedEvenings = 3;
  const focusQuality = 88;
  const consistency = 74;
  const streak = Math.max(4, Math.min(21, level * 3));
  const recoveryMode = momentum < 65 || skippedEvenings >= 4 || profile.difficulty === "Gentle";

  return {
    profile,
    mission: {
      title: profile.goal?.includes("FAANG") ? "Win one focused DSA block" : "Move the goal one visible step",
      why: `This keeps ${profile.goal || "your goal"} alive without overloading your day.`,
      progress: 42,
      eta: recoveryMode ? "45 min" : "2h 10m",
      priority: recoveryMode ? "Gentle reset" : "High leverage",
    },
    momentum: {
      score: momentum,
      streak,
      consistency,
      focusQuality,
      points,
      rank: momentum > 85 ? "Calm Executor" : "Momentum Builder",
    },
    timeline: buildTimeline(profile, recoveryMode),
    insights: [
      "Your focus is strongest before noon.",
      "Evening sessions are skipped more often, so Timbo moved the hardest task earlier.",
      "Shorter sessions improve your consistency by about 18%.",
    ],
    recovery: recoveryMode
      ? "Recovery mode is on. Today is intentionally lighter so consistency stays alive."
      : "Workload looks healthy. Keep one session non-negotiable and let the rest stay flexible.",
  };
};

export const getRoadmap = () => [
  {
    phase: "Phase 1",
    title: "Foundation reset",
    dates: `${format(new Date(), "MMM d")} - ${format(addDays(new Date(), 21), "MMM d")}`,
    progress: 82,
    checkpoints: ["Arrays", "Hash maps", "Two pointers"],
    state: "active",
  },
  {
    phase: "Phase 2",
    title: "Patterns and speed",
    dates: `${format(addDays(new Date(), 22), "MMM d")} - ${format(addDays(new Date(), 64), "MMM d")}`,
    progress: 34,
    checkpoints: ["Trees", "Graphs", "Dynamic programming"],
    state: "next",
  },
  {
    phase: "Phase 3",
    title: "Interview simulation",
    dates: `${format(addDays(new Date(), 65), "MMM d")} - ${format(addDays(new Date(), 130), "MMM d")}`,
    progress: 0,
    checkpoints: ["Mock rounds", "System design", "Behavioral stories"],
    state: "locked",
  },
  {
    phase: "Phase 4",
    title: "Final sharpening",
    dates: `${format(addDays(new Date(), 131), "MMM d")} - ${format(addDays(new Date(), 182), "MMM d")}`,
    progress: 0,
    checkpoints: ["Weak topics", "Speed review", "Offer readiness"],
    state: "locked",
  },
];

export const getCoachMessages = (state) => [
  { from: "coach", text: `You are at ${state.momentum.score}% momentum. That is enough to move forward without forcing a perfect day.` },
  { from: "coach", text: "You postpone evening work more often, so I would schedule difficult tasks before noon and keep evenings for review." },
  { from: "user", text: "What should I do if I feel behind?" },
  { from: "coach", text: "Shrink the task, not your identity. Do one 25-minute block and let Timbo rebalance the roadmap tomorrow." },
];

export const getSuggestions = () => [
  "Reduce today's workload by 20%",
  "Move hard work before noon",
  "Start a 25-minute rescue session",
  "Turn on recovery mode",
];
