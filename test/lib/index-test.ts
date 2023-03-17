import { getEmojis } from '../../lib/index.js';
import { OpenAIApi } from 'openai';
import * as sinon from 'sinon';

function generateCreateCompletionResponse(text: string | undefined) {
  return {
    data: {
      id: 'abc',
      object: 'completion',
      created: 123,
      model: 'text-davinci-003',
      choices: [
        {
          text,
        },
      ],
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

function isEmoji(char: string): boolean {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{1F300}-\u{1F5FF}\u{1F650}-\u{1F6FF}\u{1F30D}-\u{1F567}]/u;

  return emojiRegex.test(char);
}

describe('getEmojis', () => {
  it('behaves correctly with no count specified', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createCompletion')
      .resolves(generateCreateCompletionResponse('❗,😃,😈'));

    const result = await getEmojis('japanese cherry blossom festival');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(3);
    expect(result.every((char) => isEmoji(char))).toBe(true);

    stub.restore();
  });

  it('behaves correctly with count = 1', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createCompletion')
      .resolves(generateCreateCompletionResponse('❗'));

    const result = await getEmojis('japanese cherry blossom festival', 1);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(1);
    expect(result.every((char) => isEmoji(char))).toBe(true);

    stub.restore();
  });

  it('behaves correctly with count = 2', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createCompletion')
      .resolves(generateCreateCompletionResponse('❗,😈'));

    const result = await getEmojis('japanese cherry blossom festival', 2);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(2);
    expect(result.every((char) => isEmoji(char))).toBe(true);

    stub.restore();
  });

  it('returns empty array when response was empty', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createCompletion')
      .resolves(generateCreateCompletionResponse(undefined));

    const result = await getEmojis('japanese cherry blossom festival', 2);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(0);

    stub.restore();
  });
});
