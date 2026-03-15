/**
 * Avatar Library for Agent Default Avatars
 * 头像库 - 为Agent提供随机默认头像
 */

// Avatar categories with emoji-based avatars
export const AVATAR_LIBRARY = {
  robots: [
    '🤖', // Classic robot
    '🦾', // Mechanical arm
    '🦿', // Mechanical leg
    '⚙️', // Gear
    '🔧', // Wrench
    '🔩', // Nut and bolt
    '⚡', // Electric
    '💫', // Dizzy/stars
  ],

  animals: [
    '🦁', // Lion
    '🦅', // Eagle
    '🐺', // Wolf
    '🐯', // Tiger
    '🐉', // Dragon
    '🦊', // Fox
    '🐻', // Bear
    '🦉', // Owl
    '🦈', // Shark
    '🦌', // Deer
  ],

  cosmic: [
    '🌟', // Star
    '✨', // Sparkles
    '💫', // Dizzy
    '⭐', // White star
    '🌙', // Crescent moon
    '☄️', // Comet
    '🪐', // Saturn
    '🌌', // Milky way
  ],

  fantasy: [
    '👑', // Crown
    '🗡️', // Sword
    '🛡️', // Shield
    '🏹', // Bow and arrow
    '🔮', // Crystal ball
    '💎', // Gem
    '🎭', // Masks
    '🎪', // Circus tent
  ],

  nature: [
    '🌸', // Cherry blossom
    '🌺', // Hibiscus
    '🌻', // Sunflower
    '🌲', // Evergreen
    '🍃', // Leaf
    '🌿', // Herb
    '🌊', // Water wave
    '🔥', // Fire
    '❄️', // Snowflake
    '⚡', // Lightning
  ],

  abstract: [
    '💠', // Diamond with dot
    '🔷', // Blue diamond
    '🔶', // Orange diamond
    '🔹', // Small blue diamond
    '🔸', // Small orange diamond
    '🎯', // Target
    '🎨', // Artist palette
    '🧩', // Puzzle piece
  ]
}

// All avatars in a flat array for random selection
export const ALL_AVATARS = [
  ...AVATAR_LIBRARY.robots,
  ...AVATAR_LIBRARY.animals,
  ...AVATAR_LIBRARY.cosmic,
  ...AVATAR_LIBRARY.fantasy,
  ...AVATAR_LIBRARY.nature,
  ...AVATAR_LIBRARY.abstract
]

/**
 * Get a random avatar from the library
 * 从库中获取随机头像
 */
export function getRandomAvatar(): string {
  return ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)]
}

/**
 * Get a random avatar from a specific category
 * 从指定类别获取随机头像
 */
export function getRandomAvatarFromCategory(
  category: keyof typeof AVATAR_LIBRARY
): string {
  const avatars = AVATAR_LIBRARY[category]
  return avatars[Math.floor(Math.random() * avatars.length)]
}

/**
 * Get multiple unique random avatars
 * 获取多个不重复的随机头像
 */
export function getUniqueRandomAvatars(count: number): string[] {
  const shuffled = [...ALL_AVATARS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, ALL_AVATARS.length))
}

/**
 * Get avatar by agent role/type (suggested mapping)
 * 根据Agent角色/类型获取建议头像
 */
export function getAvatarByRole(role: string): string {
  const roleLower = role.toLowerCase()

  if (roleLower.includes('leader') || roleLower.includes('manager')) {
    return getRandomAvatarFromCategory('fantasy') // 👑 Crown, etc.
  }

  if (roleLower.includes('warrior') || roleLower.includes('fighter')) {
    return getRandomAvatarFromCategory('fantasy') // 🗡️ Sword, etc.
  }

  if (roleLower.includes('analyst') || roleLower.includes('researcher')) {
    return getRandomAvatarFromCategory('cosmic') // 🌟 Star, etc.
  }

  if (roleLower.includes('creator') || roleLower.includes('artist')) {
    return getRandomAvatarFromCategory('abstract') // 🎨 Palette, etc.
  }

  if (roleLower.includes('support') || roleLower.includes('helper')) {
    return getRandomAvatarFromCategory('nature') // 🌸 Flower, etc.
  }

  // Default: random from all categories
  return getRandomAvatar()
}

/**
 * Validate if a string is a valid emoji
 * 验证字符串是否为有效emoji
 */
export function isValidEmoji(str: string): boolean {
  // Simple emoji detection (may not be 100% accurate)
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u
  return emojiRegex.test(str)
}

/**
 * Get avatar display (handles both emoji and URL)
 * 获取头像显示（处理emoji和URL）
 */
export function getAvatarDisplay(avatar: string | undefined): string {
  if (!avatar) {
    return getRandomAvatar()
  }

  // If it's a URL, return as-is
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
    return avatar
  }

  // If it's an emoji, return as-is
  if (isValidEmoji(avatar)) {
    return avatar
  }

  // Otherwise, return a random avatar
  return getRandomAvatar()
}

// Color palette for avatars (if using colored backgrounds)
export const AVATAR_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#f97316', // Orange
  '#84cc16', // Lime
  '#6366f1', // Indigo
]

/**
 * Get a random color for avatar background
 * 获取随机背景色
 */
export function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

/**
 * Generate a deterministic color based on agent ID
 * 根据Agent ID生成固定颜色（同一ID总是同一颜色）
 */
export function getColorForAgent(agentId: string): string {
  let hash = 0
  for (let i = 0; i < agentId.length; i++) {
    hash = agentId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}
