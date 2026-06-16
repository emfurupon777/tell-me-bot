// Read configuration at call-time (inside handler closures), not at module load.
// In Firebase Functions v2, Secret Manager values and bound env vars are only
// populated in process.env at runtime, so these must not be read at module scope.
export const getSheetId = (): string => process.env.SHEET_ID ?? "";
export const getAskChannelId = (): string => process.env.SLACK_ASK_CHANNEL_ID ?? "";
export const getOpenAiKey = (): string => process.env.OPENAI_KEY ?? "";
