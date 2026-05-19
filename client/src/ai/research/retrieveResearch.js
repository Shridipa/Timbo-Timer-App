import { researchData } from './researchData';

export const retrieveResearch = (emotion) => {
  // Map detected emotion to relevant research topic
  const emotionMap = {
    burnout: "burnout",
    self_doubt: "self_doubt",
    procrastination: "procrastination",
    distracted: "deep_work",
    stable: "deep_work"
  };

  const topicKey = emotionMap[emotion] || "deep_work";
  return researchData[topicKey];
};
