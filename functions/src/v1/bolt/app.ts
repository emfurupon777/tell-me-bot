import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { error, info, warn } from "firebase-functions/logger";
import { App, ExpressReceiver, LogLevel } from "@slack/bolt";
import { REGION } from "../../lib/constants";
import { useMentionEvent } from "./events/useMentionEvent";
import { useSearchAction } from "./actions/useSearchAction";
import { useShowAddItemModalAction } from "./actions/useShowAddItemModalAction";
import { useAddItemView } from "./views/useAddItemView";
import { useAppDirectMessageEvent } from "./events/useAppDirectMessageEvent";
import { useAskAction } from "./actions/useAskAction";
import { useReplyEvent } from "./events/useReplyEvent";
import { registerActionOrEvents } from "../../lib/registerActionOrEvents";

// --- Secret Manager / parameter definitions (module scope, no value access here) ---
const SLACK_SIGNIN_SECRET = defineSecret("SLACK_SIGNIN_SECRET");
const SLACK_BOT_TOKEN = defineSecret("SLACK_BOT_TOKEN");
const OPENAI_KEY = defineSecret("OPENAI_KEY");
// Non-secret config values (available via process.env / .env at runtime)
const SLACK_ASK_CHANNEL_ID = defineString("SLACK_ASK_CHANNEL_ID");

let receiver: ExpressReceiver | undefined;

// Lazily build the Bolt receiver/app on first request. Secret values are only
// populated in process.env at runtime (not during deploy-time analysis), so
// construction must be deferred out of module scope.
const getReceiver = (): ExpressReceiver => {
  if (receiver) {
    return receiver;
  }

  const expressReceiver = new ExpressReceiver({
    signingSecret: SLACK_SIGNIN_SECRET.value(),
    endpoints: "/events",
    processBeforeResponse: true,
  });

  const app = new App({
    receiver: expressReceiver,
    token: SLACK_BOT_TOKEN.value(),
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
      setLevel: () => {},
      getLevel: () => LogLevel.DEBUG,
      setName: () => {},
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
    [useAskAction, !!SLACK_ASK_CHANNEL_ID.value()],
    [useReplyEvent, !!OPENAI_KEY.value()],
  ]);

  receiver = expressReceiver;
  return expressReceiver;
};

export const slack = onRequest(
  {
    region: REGION,
    secrets: [SLACK_SIGNIN_SECRET, SLACK_BOT_TOKEN, OPENAI_KEY],
  },
  (req, res) => {
    // イベントのタイムアウトでの再送を防止
    if (req.headers["x-slack-retry-num"] || req.headers["X-Slack-Retry-Num"]) {
      res.send(JSON.stringify({ message: "No need to resend" }));
      return;
    }
    getReceiver().app(req, res);
  }
);
