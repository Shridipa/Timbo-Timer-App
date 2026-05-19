class CoachMemory {
  constructor() {
    this.memory = {
      recentStruggles: ["Dynamic Programming", "Consistency at night"],
      emotionalTrends: ["Increasing self-doubt", "Evening fatigue"],
      momentumScore: 82,
      burnoutHistory: "Low",
      procrastinationPatterns: ["Avoiding large unstructured tasks"],
    };
  }

  getMemory() {
    return this.memory;
  }

  updateMemory(key, value) {
    this.memory[key] = value;
  }
}

export const coachMemory = new CoachMemory();
