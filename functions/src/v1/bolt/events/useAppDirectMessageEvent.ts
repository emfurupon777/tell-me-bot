import { App } from "@slack/bolt";
import { SpreadsheetClient } from "../../../lib/spreadsheetClient";
import { search } from "../../../lib/search";
import {
  extractMessageFromText,
  fetchChannelName,
  isMentionMessage,
} from "../../../lib/utils";
import { searchResultBlock } from "../blocks/searchResultBlock";

import { errorBlock } from "../blocks/errorBlock";
import { config } from "../../../lib/config";
export const useAppDirectMessageEvent = (app: App) => {
  app.event("message", async ({ event, logger, client }) => {
    try {
      if (event.channel_type === "im") {
        const text = (event as { text?: string }).text ?? "";
        const spreadsheetClient = await SpreadsheetClient.build();
        const searchItems = await spreadsheetClient.getValues(config.sheet.id);
        const searchWord = isMentionMessage(text)
          ? extractMessageFromText(text)
          : text;
        const searchResult = search(searchItems, searchWord);

        const askChannelName = await fetchChannelName(
          client,
          config.slack.askChannelId
        );
        await client.chat.postMessage({
          channel: event.channel,
          blocks: searchResultBlock({
            searchResult,
            searchWord,
            askChannelName,
          }),
        });
        return
      }
    } catch (e) {
      logger.error(e);
      await client.chat.postMessage({
        channel: event.channel,
        blocks: errorBlock(),
      });
    }
  });
};
