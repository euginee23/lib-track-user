import { processMessage, extractIntent, extractEntities, extractTraits } from './services/witaiService';

class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  async parse(message) {
    try {
      // Process message with Wit.ai NLP
      const witResponse = await processMessage(message);
      
      // Extract intent, entities, and traits
      const intent = extractIntent(witResponse);
      const entities = extractEntities(witResponse, 'book_title:book_title');
      const traits = extractTraits(witResponse);
      
      console.log('Wit.ai Response:', { intent, entities, traits, witResponse });

      // Handle based on detected intent
      if (traits.wit$greetings) {
        return this.actionProvider.handleGreeting();
      }

      switch (intent) {
        case 'book_availability':
          return this.actionProvider.handleBookAvailability(entities);
          
        case 'book_search':
          // Extract book title if present
          const bookTitle = entities.length > 0 ? entities[0].value : null;
          return this.actionProvider.handleBookSearch(message, bookTitle);
          
        case 'get_recommendations':
          return this.actionProvider.handlePersonalizedRecommendations();
          
        case 'system_guidance':
        case 'how_to':
          return this.actionProvider.handleSystemGuidance();
          
        case 'faq':
          return this.actionProvider.handleFAQ();
          
        case 'borrow_info':
          return this.actionProvider.handleBorrowInfo();
          
        case 'library_hours':
          return this.actionProvider.handleLibraryHours();
          
        case 'help':
          return this.actionProvider.handleHelp();
          
        default:
          // Fallback to keyword matching if no intent detected
          return this.fallbackParse(message);
      }
      
    } catch (error) {
      console.error('Error processing message with Wit.ai:', error);
      // Fallback to keyword-based parsing if Wit.ai fails
      return this.fallbackParse(message);
    }
  }

  // Fallback keyword-based parsing (backup if Wit.ai fails or has low confidence)
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