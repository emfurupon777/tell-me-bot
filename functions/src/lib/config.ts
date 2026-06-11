const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const config = {
  slack: {
    signinSecret: requireEnv("SLACK_SIGNIN_SECRET"),
    botToken: requireEnv("SLACK_BOT_TOKEN"),
    askChannelId: process.env["SLACK_ASK_CHANNEL_ID"] ?? "",
  },
  sheet: { id: requireEnv("SHEET_ID") },
  openai: { key: process.env["OPENAI_KEY"] ?? "" },
} as const;
