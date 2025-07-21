// conversationsStore.js
// Simple in-memory conversation store for each user/admin

const conversations = {};

/**
 * Get the conversation history for a userId (or adminId)
 * @param {string} userId
 * @returns {Array} messages
 */
function getConversation(userId) {
  if (!conversations[userId]) {
    conversations[userId] = [];
  }
  return conversations[userId];
}

/**
 * Add a message to the conversation for a userId
 * @param {string} userId
 * @param {object} message {role, content}
 */
function addMessage(userId, message) {
  if (!conversations[userId]) {
    conversations[userId] = [];
  }
  conversations[userId].push(message);
}

/**
 * Reset the conversation for a userId
 * @param {string} userId
 */
function resetConversation(userId) {
  conversations[userId] = [];
}

const conversationsStore = {
  getConversation,
  addMessage,
  resetConversation
};

export default conversationsStore;
