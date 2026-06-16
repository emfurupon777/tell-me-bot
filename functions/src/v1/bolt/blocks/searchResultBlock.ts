import { Block, Button, KnownBlock } from "@slack/types";
import { randomIcon } from "../../../lib/utils";
import { getSheetId } from "../../../lib/config";

const addAndAskElements = (
  searchWord: string,
  askChannelName: string
): Button[] => {
  const elements: Button[] = [
    {
      type: "button",
      text: {
        type: "plain_text",
        text: "用語を追加する",
        emoji: true,
      },
      value: searchWord,
      action_id: "show_add_item_modal",
    },
  ];
  if (askChannelName) {
    elements.push({
      type: "button",
      text: {
        type: "plain_text",
        text: `#${askChannelName}で質問する`,
        emoji: true,
      },
      value: searchWord,
      action_id: "ask",
    });
  }
  return elements;
};

type BlockArgs = {
  searchResult: SearchResult;
  searchWord: string;
  askChannelName: string;
};
export const searchResultBlock = ({
  searchResult,
  searchWord = "",
  askChannelName = "",
}: BlockArgs): (Block | KnownBlock)[] => {
  const searchItems = searchResult.searchItems;

  // perfect match case
  if (searchResult.isExactMatch) {
    const searchItem = searchItems[0];
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "おっけ〜。これだよ！",
        },
      },
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${randomIcon()} ${searchItem.word}`,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`\`\`${searchItem.description}\`\`\``,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `結果を編集する場合は<https://docs.google.com/spreadsheets/d/${getSheetId()}|こちら>`,
          },
        ],
      },
      {
        type: "divider",
      },
    ];
  }

  // fuzzy match case
  if (searchResult.searchItems.length) {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "関係ありそうな用語が見つかったヨ！",
        },
      },
      {
        type: "actions",
        elements: [
          ...searchItems.slice(0, 6).map((item, i): Button => ({
            type: "button",
            text: {
              type: "plain_text",
              text: item.word,
              emoji: true,
            },
            value: item.word,
            action_id: `search_${i}`,
          })),
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "もし新しい用語の場合は、こちらで対応してね。",
        },
      },
      {
        type: "actions",
        elements: addAndAskElements(searchWord, askChannelName),
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `スプレッドシートを直接開く場合は<https://docs.google.com/spreadsheets/d/${getSheetId()}|こちら>`,
          },
        ],
      },
      {
        type: "divider",
      },
    ];
  }

  // unmatch case
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "ごめ〜ん... 見つからなかった...",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "新しい用語だと思うから追加してね",
      },
    },
    {
      type: "actions",
      elements: addAndAskElements(searchWord, askChannelName),
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `スプレッドシートを直接開く場合は<https://docs.google.com/spreadsheets/d/${getSheetId()}|こちら>`,
        },
      ],
    },
    {
      type: "divider",
    },
  ];
};
