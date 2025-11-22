/**
 * Emoji Utilities
 * Helper functions for emoji handling in categories
 */

/**
 * Check if a string contains an emoji
 */
export const containsEmoji = (text: string): boolean => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  return emojiRegex.test(text);
};

/**
 * Extract first emoji from a string
 */
export const extractFirstEmoji = (text: string): string | null => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  const match = text.match(emojiRegex);
  return match ? match[0] : null;
};

/**
 * Remove emojis from a string
 */
export const removeEmojis = (text: string): string => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;
  return text.replace(emojiRegex, '').trim();
};

/**
 * Get all emojis from a string
 */
export const getAllEmojis = (text: string): string[] => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;
  return text.match(emojiRegex) || [];
};

/**
 * Validate emoji count (limit to 1 emoji per category name)
 */
export const validateEmojiCount = (text: string): boolean => {
  const emojis = getAllEmojis(text);
  return emojis.length <= 1;
};

/**
 * Parse category name to extract emoji and clean name
 * Returns { emoji, name }
 */
export const parseCategoryName = (fullName: string): { emoji: string | null; name: string } => {
  const emoji = extractFirstEmoji(fullName);
  const name = removeEmojis(fullName);
  
  return {
    emoji,
    name: name || fullName, // Fallback to full name if no text remains
  };
};

/**
 * Format category display name (emoji + name)
 */
export const formatCategoryDisplayName = (name: string, emoji?: string): string => {
  if (emoji) {
    return `${emoji} ${name}`;
  }
  return name;
};

/**
 * Common emoji suggestions for categories
 */
export const EMOJI_SUGGESTIONS = {
  work: ['💼', '💻', '📊', '🏢', '📈'],
  study: ['📚', '✏️', '🎓', '📖', '🧠'],
  fitness: ['💪', '🏃', '⚽', '🏋️', '🧘'],
  health: ['❤️', '🏥', '💊', '🩺', '🧘'],
  food: ['🍽️', '🍕', '🥗', '🍜', '🍰'],
  sleep: ['😴', '🛏️', '💤', '🌙', '⏰'],
  reading: ['📖', '📚', '📰', '📝', '✍️'],
  coding: ['💻', '⌨️', '🖥️', '🔧', '🐛'],
  art: ['🎨', '🖌️', '🖼️', '✨', '🎭'],
  music: ['🎵', '🎸', '🎹', '🎧', '🎤'],
  gaming: ['🎮', '🕹️', '👾', '🎯', '🏆'],
  meditation: ['🧘', '🕉️', '☮️', '🌸', '✨'],
  home: ['🏠', '🏡', '🔑', '🛋️', '🪴'],
  travel: ['✈️', '🚗', '🗺️', '🌍', '🎒'],
  sports: ['⚽', '🏀', '🏈', '⚾', '🎾'],
  social: ['👥', '💬', '🤝', '🎉', '☕'],
  creative: ['✨', '💡', '🎨', '🌟', '⭐'],
  finance: ['💰', '💵', '💳', '📊', '📈'],
  learning: ['📚', '🎓', '🧠', '💡', '✏️'],
  relax: ['🌴', '☕', '🛀', '🌺', '🎵'],
};

/**
 * Get suggested emojis based on category name
 */
export const getSuggestedEmojis = (categoryName: string): string[] => {
  const lowercaseName = categoryName.toLowerCase();
  
  // Find matching suggestion key
  for (const [key, emojis] of Object.entries(EMOJI_SUGGESTIONS)) {
    if (lowercaseName.includes(key)) {
      return emojis;
    }
  }
  
  // Return most common emojis as fallback
  return ['⭐', '✨', '🎯', '💡', '🔥', '✅', '📌', '🎨'];
};