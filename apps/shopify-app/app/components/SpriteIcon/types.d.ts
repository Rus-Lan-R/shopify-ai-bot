export const spriteIconNames = ["send-message", "message", "cross"] as const;
export type SpriteIconName = (typeof spriteIconNames)[number];
