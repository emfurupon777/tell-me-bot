import { App, ViewSubmitAction } from "@slack/bolt";
import { SpreadsheetClient } from "../../../lib/spreadsheetClient";
import { addedItemBlock } from "../blocks/addedItemBlock";
import { config } from "../../../lib/config";

export const useAddItemView = (app: App) => {
  app.view<ViewSubmitAction>(
    "add_item_view",
    async ({ ack, view, logger, client, body }) => {
      await ack();
      try {
        const word = view.state.values.word.word_input.value as string;
        const description = view.state.values.description.description_input
          .value as string;

        // スプレッドシートに登録
        const spreadsheetClient = await SpreadsheetClient.build();
        await spreadsheetClient.setValues(config.sheet.id, {
          word,
          description,
        });

        const metadata = JSON.parse(view.private_metadata);

        // 結果を投稿
        await client.chat.postMessage({
          channel: metadata.channelId,
          blocks: addedItemBlock(body.user.id, { word, description }),
        });
      } catch (e) {
        logger.error(e);
      }
    }
  );
};
