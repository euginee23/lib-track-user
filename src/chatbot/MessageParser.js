class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  async parse(message) {
    // All messages go through the main handler
    // The backend will handle pattern matching and intent detection
    return this.actionProvider.handleMessage(message);
  }
}

export default MessageParser;