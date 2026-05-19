export const analyzeMentalState = (input) => {
  const lowerInput = input.toLowerCase();
  
  // Default state
  let state = {
    emotion: "stable",
    intensity: 0.5,
    burnoutRisk: "low",
    confidenceLevel: "high",
    interventionType: "strategy"
  };

  if (lowerInput.includes("exhausted") || lowerInput.includes("burnout") || lowerInput.includes("tired")) {
    state = { emotion: "burnout", intensity: 0.9, burnoutRisk: "high", confidenceLevel: "medium", interventionType: "recovery_protocol" };
  } else if (lowerInput.includes("behind") || lowerInput.includes("imposter") || lowerInput.includes("not good enough") || lowerInput.includes("dumb")) {
    state = { emotion: "self_doubt", intensity: 0.8, burnoutRisk: "medium", confidenceLevel: "low", interventionType: "reassurance_plus_micro_action" };
  } else if (lowerInput.includes("procrastinate") || lowerInput.includes("can't start") || lowerInput.includes("delay")) {
    state = { emotion: "procrastination", intensity: 0.7, burnoutRisk: "low", confidenceLevel: "medium", interventionType: "friction_reduction" };
  } else if (lowerInput.includes("distracted") || lowerInput.includes("focus")) {
    state = { emotion: "distracted", intensity: 0.6, burnoutRisk: "low", confidenceLevel: "high", interventionType: "environment_design" };
  }

  return state;
};
