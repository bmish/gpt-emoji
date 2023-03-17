# gpt-emoji<!-- omit from toc -->

[![npm version][npm-image]][npm-url] ![test coverage](https://img.shields.io/badge/test%20coverage-100%25-green)

[npm-image]: https://badge.fury.io/js/gpt-emoji.svg
[npm-url]: https://www.npmjs.com/package/gpt-emoji

Get the emoji(s) that best represent the given text/concept.

Uses [OpenAI's GPT-3.5](https://platform.openai.com/docs/models/gpt-3-5) `text-davinci-003` API.

## Table of contents<!-- omit from toc -->

- [Setup](#setup)
- [API](#api)
  - [`getEmojis(text: string, count?: number | undefined): string[]`](#getemojistext-string-count-number--undefined-string)
- [Usage](#usage)

## Setup

Install it:

```sh
npm i gpt-emoji
```

Set your [OpenAI key](https://platform.openai.com/account/api-keys):

```sh
export OPENAI_API_KEY=sk-...
```

## API

### `getEmojis(text: string, count?: number | undefined): string[]`

Returns an array of emojis that best represent the given text.

Choose how many emojis to use, or let the AI decide how many are needed.

Note that this function is non-deterministic and could return different emojis each time.

## Usage

Specify that you want only one emoji:

```js
import { getEmojis } from 'gpt-emoji';

getEmojis('japanese cherry blossom festival', 1); // ['🌸']
```

Allow the AI to decide how many emojis to use:

```js
import { getEmojis } from 'gpt-emoji';

getEmojis('japanese cherry blossom festival'); // ['🌸', '🇯🇵, '🎎']
```
