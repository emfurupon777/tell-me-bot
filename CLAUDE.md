# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A Slack bot that acts as an internal glossary. Users mention the bot with a term to look up; it performs exact-match then fuzzy-search (Fuse.js) against a Google Spreadsheet. It also supports adding new terms via a Slack modal, proxy-posting questions to a dedicated ask channel, and an optional ChatGPT conversation mode.

Deployed as a single Cloud Function (`v1/bolt/slack`) on Firebase (region: `asia-northeast1`), using `@slack/bolt` with an Express receiver.

## Commands

All commands run from the `functions/` directory (`npm --prefix ./functions <command>` from root).

```bash
# Install dependencies
npm --prefix ./functions i

# Build TypeScript
npm --prefix ./functions run build

# Lint
npm --prefix ./functions run lint

# Format
npm --prefix ./functions run format

# Run tests
npm --prefix ./functions run test

# Local emulator (builds first, then starts Firebase emulator on port 5001)
npm --prefix ./functions run serve

# Deploy
npm --prefix ./functions run deploy         # default project
npm --prefix ./functions run deploy:stg     # stage project
npm --prefix ./functions run deploy:prd     # prod project
```

`firebase deploy` runs `lint` and `build` as predeploy hooks automatically.

## Architecture

```
functions/src/
  index.ts                      # Re-exports v1
  v1/
    index.ts                    # Re-exports bolt
    bolt/
      app.ts                    # Entry point: sets up ExpressReceiver + Bolt App,
                                # registers handlers conditionally, exports Cloud Function
      events/                   # Bolt event handlers (app_mention, message.im, message reply)
      actions/                  # Bolt action handlers (button clicks, modal open)
      views/                    # Bolt view submission handlers (add-item modal)
      blocks/                   # Slack Block Kit builder functions
  lib/
    registerActionOrEvents.ts   # Helper: registers [handler, condition] pairs onto the Bolt app
    search.ts                   # Exact-match then Fuse.js fuzzy search
    spreadsheetClient.ts        # Google Sheets API wrapper (read/append)
    utils.ts                    # extractMessageFromText, fetchChannelName
    constants.ts                # REGION, FUSE_OPTIONS, GPT_BOT_NAME, CHAT_START_MESSAGES
    __tests__/                  # Jest tests (ts-jest)
  @types/types.d.ts             # Global types: SearchItem, SearchResult
```

**Key design note:** `registerActionOrEvents` takes an array of `[handler, boolean]` pairs. The boolean gates whether the handler is registered at all — used to make `useAskAction` and `useReplyEvent` (OpenAI GPT chat) optional depending on whether `slack.ask_channel_id` / `openai.key` are set in Firebase config.

## Firebase config keys

Set via `firebase functions:config:set`:

| Key | Purpose |
|-----|---------|
| `slack.bot_token` | Bot User OAuth Token |
| `slack.signin_secret` | Slack Signing Secret |
| `slack.ask_channel_id` | (Optional) Channel ID for proxy questions |
| `sheet.id` | Google Spreadsheet ID (col A = word, col B = description, data from row 2) |
| `openai.key` | (Optional) OpenAI API key — enables GPT chat mode |

## Spreadsheet format

Sheet 1, row 1: headers (`用語` / `説明`). Data starts at A2. `SpreadsheetClient.getValues` reads `A2:B`.

## Slack event endpoint

The Cloud Function listens at `/events`. Slack retries are short-circuited by checking `x-slack-retry-num` header before passing to Bolt.
