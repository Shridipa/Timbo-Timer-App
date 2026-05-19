import { analyzeMentalState } from '../psychology/analyzeMentalState';
import { retrieveResearch } from '../research/retrieveResearch';
import { coachMemory } from '../../store/coachMemory';

export const generateCoachReply = async (userInput, onChunk) => {
  return new Promise((resolve) => {
    // 1. Analyze mental state
    const mentalState = analyzeMentalState(userInput);
    
    // 2. Retrieve research
    const research = retrieveResearch(mentalState.emotion);
    
    // 3. Build coaching strategy based on memory
    const memory = coachMemory.getMemory();
    
    // Simulate streaming response generation (Mocking Gemini Stream)
    let messageType = "coaching";
    let title = "Strategic Insight";
    let content = "";
    let nextAction = "";
    
    if (mentalState.emotion === "burnout") {
      messageType = "burnout";
      title = "Burnout Protocol Initiated";
      content = `I'm detecting high levels of cognitive exhaustion. According to research on occupational burnout, ${research.researchFinding.toLowerCase()} Pushing through right now will only increase your recovery debt.\n\nLet's apply the intervention: ${research.intervention.toLowerCase()}`;
      nextAction = "Close all tabs and step away for 30 minutes.";
    } else if (mentalState.emotion === "self_doubt") {
      messageType = "self_doubt";
      title = "Cognitive Reframing";
      content = `It's completely normal to feel behind. Remember that ${research.researchFinding.toLowerCase()} You are comparing your behind-the-scenes struggles to everyone else's highlight reel.\n\nI noticed you've been struggling with ${memory.recentStruggles[0]}, which often triggers this. Let's shift our metric to personal growth.`;
      nextAction = "List 3 things you understand today that you didn't last week.";
    } else if (mentalState.emotion === "procrastination") {
      messageType = "motivation";
      title = "Friction Reduction";
      content = `I see the resistance building up. Clinical research shows that ${research.researchFinding.toLowerCase()}\n\nWe need to apply the friction reduction protocol: ${research.intervention.toLowerCase()}`;
      nextAction = "Open your editor and write just one line of code. Don't worry about the whole feature.";
    } else {
      messageType = "strategy";
      title = "Deep Work Optimization";
      content = `Your momentum is currently at ${memory.momentumScore}%. To maximize this block, remember that ${research.researchFinding.toLowerCase()} \n\nLet's optimize your current roadmap phase.`;
      nextAction = "Initiate a 45-minute strict focus block right now.";
    }

    const fullResponse = {
      role: "assistant",
      type: messageType,
      emotionDetected: mentalState.emotion,
      intervention: mentalState.interventionType,
      title: title,
      content: content,
      nextAction: nextAction,
      researchSource: research.topic
    };

    // Simulate streaming delays
    const words = content.split(" ");
    let streamedContent = "";
    let i = 0;
    
    const streamInterval = setInterval(() => {
      if (i < words.length) {
        streamedContent += words[i] + " ";
        onChunk({ ...fullResponse, content: streamedContent });
        i++;
      } else {
        clearInterval(streamInterval);
        resolve({ ...fullResponse, content: streamedContent.trim() });
      }
    }, 50); // 50ms per word for streaming effect
  });
};
