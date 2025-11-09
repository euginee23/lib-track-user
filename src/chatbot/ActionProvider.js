class ActionProvider {
  constructor(createChatbotMessage, setStateFunc, createClientMessage) {
    this.createChatbotMessage = createChatbotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  handleGreeting() {
    // Try to get user info from auth service
    let userName = 'there';
    try {
      const authService = require('../utils/auth').default;
      const user = authService.getUser();
      userName = user ? user.first_name : 'there';
    } catch (error) {
      console.log('Could not get user info:', error);
    }
    
    const message = this.createChatbotMessage(`Hello ${userName}! I'm your virtual library assistant. How can I help you today?`, {
      widget: 'mainOptions',
    });
    
    this.updateChatbotState(message);
  }

  handleBookAvailability(query) {
    const message = this.createChatbotMessage('Let me help you check book availability. Please provide the book title or author:', {
      widget: 'bookAvailability',
    });
    
    this.updateChatbotState(message);
  }

  handleSystemGuidance() {
    const message = this.createChatbotMessage('I can help you navigate our library system. What would you like guidance on?', {
      widget: 'systemGuidance',
    });
    
    this.updateChatbotState(message);
  }

  handlePersonalizedRecommendations() {
    const message = this.createChatbotMessage('Based on your reading history and current trends, here are some recommendations for you:', {
      widget: 'personalizedRecommendations',
    });
    
    this.updateChatbotState(message);
  }

  handleFAQ() {
    const message = this.createChatbotMessage('Here are some frequently asked questions:', {
      widget: 'dynamicFAQ',
    });
    
    this.updateChatbotState(message);
  }

  handleSpecificBookSearch(bookTitle) {
    // This would make an API call to check book availability
    const loadingMessage = this.createChatbotMessage('Searching for the book... Please wait.');
    this.updateChatbotState(loadingMessage);
    
    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const resultMessage = this.createChatbotMessage(`I found information about "${bookTitle}":`, {
        widget: 'bookAvailabilityResult',
        payload: { bookTitle }
      });
      this.updateChatbotState(resultMessage);
    }, 1500);
  }

  handleSystemGuideSelection(guideType) {
    let guideContent = '';
    
    switch(guideType) {
      case 'borrowing':
        guideContent = 'To borrow a book: 1) Search for the book in our catalog, 2) Check availability, 3) Visit the kiosk or librarian, 4) Present your student ID, 5) Complete the checkout process.';
        break;
      case 'returning':
        guideContent = 'To return a book: 1) Visit any library kiosk, 2) Scan your student ID, 3) Place the book in the return slot, 4) Confirm return on screen.';
        break;
      case 'searching':
        guideContent = 'To search for books: 1) Use the Search Books page, 2) Enter title, author, or keywords, 3) Use filters to narrow results, 4) Click on any book for details.';
        break;
      case 'account':
        guideContent = 'To manage your account: 1) Go to Profile page, 2) Update personal information, 3) View borrowing history, 4) Check due dates and renewals.';
        break;
      default:
        guideContent = 'Please select a specific area you need help with.';
    }
    
    const message = this.createChatbotMessage(guideContent);
    this.updateChatbotState(message);
  }



  handleHelp() {
    const message = this.createChatbotMessage(
      'I can help you with:',
      {
        widget: 'mainOptions',
      }
    );
    
    this.updateChatbotState(message);
  }

  handleBookSearch(query, bookTitle = null) {
    if (bookTitle) {
      // If Wit.ai extracted a book title, use it
      this.handleSpecificBookSearch(bookTitle);
    } else {
      // Otherwise, ask for more details
      const message = this.createChatbotMessage('Let me help you search for books. Please provide more details:', {
        widget: 'bookAvailability',
      });
      
      this.updateChatbotState(message);
    }
  }

  handleBorrowInfo() {
    const message = this.createChatbotMessage('Here\'s information about borrowing books from our library:', {
      widget: 'systemGuidance',
    });
    
    this.updateChatbotState(message);
  }

  handleLibraryHours() {
    const message = this.createChatbotMessage('Our library hours are:\n\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 4:00 PM\nSunday: Closed\n\nDuring exam periods, we extend hours until 8:00 PM on weekdays.');
    
    this.updateChatbotState(message);
  }

  handleDefault() {
    const message = this.createChatbotMessage(
      "I'm not sure I understand. Would you like help with one of these topics?",
      {
        widget: 'mainOptions',
      }
    );
    
    this.updateChatbotState(message);
  }

  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;