import { App, BlockButtonAction } from "@slack/bolt";
import { askBlock, askCompleteBlock } from "../blocks/askBlock";
import { errorBlock } from "../blocks/errorBlock";
import { fetchChannelName } from "../../../lib/utils";
import { getAskChannelId } from "../../../lib/config";

export const useAskAction = (app: App) => {
  app.action<BlockButtonAction>(
    "ask",
    async ({ ack, client, action, body, logger }) => {
      const channelId = body.channel!.id;
      try {
        await ack();
        await client.chat.postMessage({
          channel: getAskChannelId(),
          blocks: askBlock(action.value ?? ""),
        });

        const askChannelName = await fetchChannelName(
          client,
          getAskChannelId()
        );
        await client.chat.postMessage({
          channel: channelId,
          blocks: askCompleteBlock(action.value ?? "", askChannelName),
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
