import chatbotService from '../../api/chatbot/chatbotService';
import authService from '../utils/auth';

class ActionProvider {
  constructor(createChatbotMessage, setStateFunc, createClientMessage) {
    this.createChatbotMessage = createChatbotMessage;
    this.setState = setStateFunc;
    this.createClientMessage = createClientMessage;
  }

  // This method will be called by MessageParser to handle AI responses
  async handleAIResponse(userMessage) {
    try {
      // Show typing indicator
      const typingMessage = this.createChatbotMessage('Thinking...');
      this.updateChatbotState(typingMessage);

      // Get user info if available
      let userInfo = {};
      try {
        const user = authService.getUser();
        if (user) {
          userInfo = {
            userId: user.user_id,
            userName: user.first_name || 'User',
            userRole: user.role || 'student'
          };
        }
      } catch (error) {
        console.log('Could not get user info:', error);
      }

      // Try streaming API for faster perceived responsiveness
      let usedStream = false;
      let streamEmitted = false; // whether we received at least one content chunk
      try {
        // Mark that we attempted streaming immediately to avoid falling back
        // to the non-streaming path if the stream is long-lived.
        usedStream = true;
        await chatbotService.sendMessageStream(userMessage, userInfo, (chunk) => {
          // chunk: { type, content, ... }
          if (!chunk || !chunk.type) return;

          // ignore session/info meta chunks
          if (chunk.type === 'session' || chunk.type === 'info') return;

          if (chunk.type === 'content') {
            // sanitize JSON-like tool-call emissions (some backends emit tool-calls as JSON)
            const isLikelyToolCallString = (txt) => {
              if (!txt || typeof txt !== 'string') return false;
              const s = txt.trim();
              if (!(s.startsWith('{') || s.startsWith('['))) return false;
              try {
                const p = JSON.parse(s);
                if (Array.isArray(p)) return p.length > 0 && (p[0].type === 'function' || p[0].function || p[0].name);
                return p && (p.type === 'function' || p.function || p.name);
              } catch (e) {
                return false;
              }
            };

            if (isLikelyToolCallString(chunk.content)) {
              // show a single info message once instead of raw JSON
              if (!streamEmitted) {
                // replace typing with a small info message
                this.setState((prevState) => {
                  const msgs = prevState.messages.slice();
                  if (msgs.length > 0 && msgs[msgs.length - 1].message === 'Thinking...') {
                    msgs.pop();
                    msgs.push(this.createChatbotMessage('Invoking tools...'));
                    return { ...prevState, messages: msgs };
                  }
                  // otherwise append info
                  msgs.push(this.createChatbotMessage('Invoking tools...'));
                  return { ...prevState, messages: msgs };
                });
                streamEmitted = true;
              }
              return;
            }

            streamEmitted = true;
            // On first content chunk, replace typing indicator with assistant message
            this.setState((prevState) => {
              const msgs = prevState.messages.slice();
              // Remove typing indicator if still present
              if (msgs.length > 0 && msgs[msgs.length - 1].message === 'Thinking...') {
                msgs.pop();
                msgs.push(this.createChatbotMessage(chunk.content));
                return { ...prevState, messages: msgs };
              }

              // Otherwise append/concatenate to last assistant message
              if (msgs.length > 0) {
                const last = msgs[msgs.length - 1];
                // Update only if last message is from bot (no widget)
                if (last && !last.widget) {
                  const updated = this.createChatbotMessage((last.message || '') + chunk.content);
                  msgs[msgs.length - 1] = updated;
                  return { ...prevState, messages: msgs };
                }
              }

              // Fallback: just push
              msgs.push(this.createChatbotMessage(chunk.content));
              return { ...prevState, messages: msgs };
            });
          } else if (chunk.type === 'error') {
            // Replace typing with error message
            console.error('ChatbotService: received error chunk:', chunk);
            this.setState((prevState) => {
              const msgs = prevState.messages.slice(0, -1);
              msgs.push(this.createChatbotMessage("I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later."));
              return { ...prevState, messages: msgs };
            });
          }
        });
      } catch (streamErr) {
        console.warn('Streaming failed:', streamErr);
        // If the stream setup failed synchronously, mark usedStream false
        // If the stream failed after emitting content, DO NOT automatically fallback
        // to the non-streaming request to avoid duplicate or restarted replies.
        if (!streamEmitted) {
          console.warn('No content received from stream; falling back to non-streaming request');
          usedStream = false;
        } else {
          console.warn('Stream failed after partial content was received; not falling back to avoid duplicate responses');
          // append a short message indicating interruption and offer retry
          this.setState((prevState) => {
            const msgs = prevState.messages.slice();
            msgs.push(this.createChatbotMessage('⚠️ Response interrupted. Tap resend to try again.'));
            return { ...prevState, messages: msgs };
          });
          // do not fallback
          usedStream = true;
        }
      }

      if (!usedStream) {
        // Fallback to non-streaming send
        const response = await chatbotService.sendMessage(userMessage, userInfo);

        // Remove typing indicator and add AI response
        this.setState((prevState) => {
          const messages = prevState.messages.slice(0, -1); // Remove typing message
          return {
            ...prevState,
            messages: [...messages, this.createChatbotMessage(response.message)]
          };
        });
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove typing indicator and show error
      this.setState((prevState) => {
        const messages = prevState.messages.slice(0, -1);
        return {
          ...prevState,
          messages: [
            ...messages,
            this.createChatbotMessage(
              "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later."
            )
          ]
        };
      });
    }
  }

  handleGreeting() {
    // Try to get user info from auth service
    let userName = 'there';
    try {
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