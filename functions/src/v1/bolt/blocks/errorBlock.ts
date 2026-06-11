import { Block, KnownBlock } from "@slack/types";

export const errorBlock = (): (Block | KnownBlock)[] => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "ごめーん..なんかエラーっぽい",
      },
    },
    {
      type: "divider",
    },
  ];
};
