class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
    this.useAI = true; // Set to true to use Ollama AI backend
    
    // Quick response cache for common patterns
    this.quickResponses = {
      hours: /\b(hours?|open|close|time|schedule|when)\b/i,
      greeting: /^(hi|hello|hey|greetings?|good\s+(morning|afternoon|evening))[!.?\s]*$/i,
      thanks: /^(thanks?|thank\s*you|thx|appreciated?)[!.?\s]*$/i,
      help: /^(help|assist|support)[!.?\s]*$/i
    };
  }
  
  // Fast pattern matching for instant responses
  getQuickResponse(message) {
    const trimmed = message.trim();
    
    // Greeting
    if (this.quickResponses.greeting.test(trimmed)) {
      return 'greeting';
    }
    
    // Thanks
    if (this.quickResponses.thanks.test(trimmed)) {
      return 'thanks';
    }
    
    // Library hours
    if (trimmed.length < 50 && this.quickResponses.hours.test(trimmed) && 
        /(library|open|close|hours?|time)/.test(trimmed)) {
      return 'hours';
    }
    
    // Help
    if (this.quickResponses.help.test(trimmed)) {
      return 'help';
    }
    
    return null;
  }

  async parse(message) {
    // Quick response check for instant feedback
    const quickResponse = this.getQuickResponse(message);
    
    if (quickResponse === 'greeting') {
      return this.actionProvider.handleGreeting();
    }
    
    if (quickResponse === 'thanks') {
      return this.actionProvider.updateChatbotState(
        this.actionProvider.createChatbotMessage("You're welcome! Let me know if you need anything else. 😊")
      );
    }
    
    if (quickResponse === 'hours') {
      return this.actionProvider.handleLibraryHours();
    }
    
    if (quickResponse === 'help') {
      return this.actionProvider.handleHelp();
    }
    
    // Use AI backend for complex messages
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