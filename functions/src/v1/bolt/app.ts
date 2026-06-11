import { onRequest } from "firebase-functions/v2/https";
import { App, ExpressReceiver, LogLevel } from "@slack/bolt";
import { REGION } from "../../lib/constants";
import { useMentionEvent } from "./events/useMentionEvent";
import { useSearchAction } from "./actions/useSearchAction";
import { useShowAddItemModalAction } from "./actions/useShowAddItemModalAction";
import { useAddItemView } from "./views/useAddItemView";
import { useAppDirectMessageEvent } from "./events/useAppDirectMessageEvent";
import { useAskAction } from "./actions/useAskAction";
import { error, info, warn } from "firebase-functions/logger";
import { useReplyEvent } from "./events/useReplyEvent";
import { registerActionOrEvents } from "../../lib/registerActionOrEvents";
import { config } from "../../lib/config";

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.signinSecret,
  endpoints: "/events",
  processBeforeResponse: true,
});

const app = new App({
  receiver: expressReceiver,
  token: config.slack.botToken,
  processBeforeResponse: true,
  logger: {
    error(...msg) {
      error(msg);
    },
    debug(...msg) {
      info(msg);
    },
    info(...msg) {
      info(msg);
    },
    warn(...msg) {
      warn(msg);
    },
    setLevel: () => ({}),
    getLevel: () => LogLevel.DEBUG,
    setName: () => ({}),
  },
});

app.error(async (e) => {
  error(e);
});

registerActionOrEvents(app, [
  [useMentionEvent, true],
  [useAppDirectMessageEvent, true],
  [useSearchAction, true],
  [useShowAddItemModalAction, true],
  [useAddItemView, true],
  [useAskAction, !!config.slack.askChannelId],
  [useReplyEvent, !!config.openai.key],
])

export const slack = onRequest({ region: REGION }, (req, res) => {
  // イベントのタイムアウトでの再送を防止
  if (req.headers["x-slack-retry-num"] || req.headers["X-Slack-Retry-Num"]) {
    res.send(JSON.stringify({ message: "No need to resend" }));
    return;
  }
  expressReceiver.app(req, res);
});
