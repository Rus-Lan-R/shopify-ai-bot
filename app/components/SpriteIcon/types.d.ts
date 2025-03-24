export const spriteIconNames = ["send-message", "test"] as const;
export type SpriteIconName = (typeof spriteIconNames)[number];
