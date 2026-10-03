import "server-only";

/** AI bio polish is opt-in: needs both the API key and the public feature flag. */
export function isAiBioEnabled() {
  return !!process.env.ANTHROPIC_API_KEY && process.env.NEXT_PUBLIC_FEATURE_AI_BIO === "true";
}
