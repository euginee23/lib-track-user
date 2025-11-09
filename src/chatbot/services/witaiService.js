import axios from 'axios';

/**
 * Wit.ai Service for Natural Language Processing
 * Communicates with backend proxy to keep API token secure
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Send message to Wit.ai for NLP processing
 * @param {string} message - User's message text
 * @returns {Promise<Object>} Wit.ai response with intents and entities
 */
export async function processMessage(message) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/witai/message`, {
      message: message.trim()
    });

    return response.data.data;
  } catch (error) {
    console.error('Wit.ai service error:', error.response?.data || error.message);  
    throw new Error('Failed to process message with NLP');
  }
}

/**
 * Extract the primary intent from Wit.ai response
 * @param {Object} witResponse - Response from Wit.ai
 * @returns {string|null} Intent name or null
 */
export function extractIntent(witResponse) {
  if (!witResponse || !witResponse.intents || witResponse.intents.length === 0) {
    return null;
  }

  // Get the intent with highest confidence
  const sortedIntents = [...witResponse.intents].sort((a, b) => b.confidence - a.confidence);
  return sortedIntents[0].confidence > 0.5 ? sortedIntents[0].name : null;
}

/**
 * Extract entities from Wit.ai response
 * @param {Object} witResponse - Response from Wit.ai
 * @param {string} entityName - Name of entity to extract
 * @returns {Array} Array of entity values
 */
export function extractEntities(witResponse, entityName) {
  if (!witResponse || !witResponse.entities || !witResponse.entities[entityName]) {
    return [];
  }

  return witResponse.entities[entityName].map(entity => ({
    value: entity.value,
    confidence: entity.confidence,
    body: entity.body
  }));
}

/**
 * Extract all entities from Wit.ai response
 * @param {Object} witResponse - Response from Wit.ai
 * @returns {Object} Object containing all entities
 */
export function extractAllEntities(witResponse) {
  if (!witResponse || !witResponse.entities) {
    return {};
  }

  const entities = {};
  Object.keys(witResponse.entities).forEach(entityName => {
    entities[entityName] = witResponse.entities[entityName].map(entity => ({
      value: entity.value,
      confidence: entity.confidence,
      body: entity.body
    }));
  });

  return entities;
}

/**
 * Get traits from Wit.ai response (for things like sentiment, greetings, etc.)
 * @param {Object} witResponse - Response from Wit.ai
 * @returns {Object} Object containing all traits
 */
export function extractTraits(witResponse) {
  if (!witResponse || !witResponse.traits) {
    return {};
  }

  const traits = {};
  Object.keys(witResponse.traits).forEach(traitName => {
    traits[traitName] = witResponse.traits[traitName][0]?.value || null;
  });

  return traits;
}

export default {
  processMessage,
  extractIntent,
  extractEntities,
  extractAllEntities,
  extractTraits
};
