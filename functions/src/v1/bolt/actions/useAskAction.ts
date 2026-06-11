import { App, BlockButtonAction } from "@slack/bolt";
import { askBlock, askCompleteBlock } from "../blocks/askBlock";
import { errorBlock } from "../blocks/errorBlock";
import { fetchChannelName } from "../../../lib/utils";
import { config } from "../../../lib/config";

export const useAskAction = (app: App) => {
  app.action<BlockButtonAction>(
    "ask",
    async ({ ack, client, action, body, logger }) => {
      const channelId = body.channel!.id;
      try {
        await ack();
        const targetWord = action.value ?? "";
        await client.chat.postMessage({
          channel: config.slack.askChannelId,
          blocks: askBlock(targetWord),
        });

        const askChannelName = await fetchChannelName(
          client,
          config.slack.askChannelId
        );
        await client.chat.postMessage({
          channel: channelId,
          blocks: askCompleteBlock(targetWord, askChannelName),
          link_names: true,
        });
      } catch (e) {
        logger.error(e);
        await client.chat.postMessage({
          channel: channelId,
          blocks: errorBlock(),
          link_names: true,
        });
      }
    }
  );
};
