class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
    this.useAI = true; // Set to true to use Ollama AI backend
  }

  async parse(message) {
    // Use AI backend for all messages
    if (this.useAI) {
      return this.actionProvider.handleAIResponse(message);
    }

    // Fallback to original parsing logic if AI is disabled
    return this.fallbackParse(message);
  }

  // Fallback keyword-based parsing (backup if AI is disabled)
  fallbackParse(message) {
    const lowerCaseMessage = message.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || 
        lowerCaseMessage.includes('hi') || 
        lowerCaseMessage.includes('hey')) {
      return this.actionProvider.handleGreeting();
    }
    
    if (lowerCaseMessage.includes('available') || 
        lowerCaseMessage.includes('availability') ||
        lowerCaseMessage.includes('in stock')) {
      return this.actionProvider.handleBookAvailability();
    }
    
    if (lowerCaseMessage.includes('recommend') || 
        lowerCaseMessage.includes('suggestion') ||
        lowerCaseMessage.includes('what should i read')) {
      return this.actionProvider.handlePersonalizedRecommendations();
    }
    
    if (lowerCaseMessage.includes('how to') || 
        lowerCaseMessage.includes('guide') ||
        lowerCaseMessage.includes('help me') ||
        lowerCaseMessage.includes('navigate')) {
      return this.actionProvider.handleSystemGuidance();
    }
    
    if (lowerCaseMessage.includes('faq') || 
        lowerCaseMessage.includes('frequently asked') ||
        lowerCaseMessage.includes('common questions')) {
      return this.actionProvider.handleFAQ();
    }
    
    if (lowerCaseMessage.includes('book') || 
        lowerCaseMessage.includes('find') || 
        lowerCaseMessage.includes('search')) {
      return this.actionProvider.handleBookSearch(message);
    }
    
    if (lowerCaseMessage.includes('borrow') || 
        lowerCaseMessage.includes('loan') || 
        lowerCaseMessage.includes('checkout')) {
      return this.actionProvider.handleBorrowInfo();
    }
    
    if (lowerCaseMessage.includes('hours') || 
        lowerCaseMessage.includes('open') || 
        lowerCaseMessage.includes('close') ||
        lowerCaseMessage.includes('time')) {
      return this.actionProvider.handleLibraryHours();
    }
    
    if (lowerCaseMessage.includes('help') || 
        lowerCaseMessage.includes('assist') || 
        lowerCaseMessage.includes('support')) {
      return this.actionProvider.handleHelp();
    }

    return this.actionProvider.handleDefault();
  }
}

export default MessageParser;