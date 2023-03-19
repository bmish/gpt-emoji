import { getEmojis } from '../../lib/index.js';
import { OpenAIApi, CreateChatCompletionResponse } from 'openai';
import * as sinon from 'sinon';

function generateCreateChatCompletionResponse(
  text: string
): import('axios').AxiosResponse<CreateChatCompletionResponse, unknown> {
  return {
    data: {
      id: 'abc',
      object: 'completion',
      created: 123,
      model: 'text-davinci-003',
      choices: [
        {
          message: {
            content: text,
            role: 'assistant',
          },
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
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(generateCreateChatCompletionResponse('🌸,🎉,🎎'));

    const result = await getEmojis('japanese cherry blossom festival');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(3);
    expect(result.every((char) => isEmoji(char))).toBe(true);

    stub.restore();
  });

  it('behaves correctly with array input of multiple strings', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(
        generateCreateChatCompletionResponse(
          ['🌸,🎉,🎎', '🏮,🎑,🥮,🍊,🎉,🐲'].join('\n')
        )
      );

    const result = await getEmojis([
      'japanese cherry blossom festival',
      'chinese lantern festival',
    ]);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(2);
    expect(result[0].length).toStrictEqual(3);
    expect(result[1].length).toStrictEqual(6);
    expect(result.every((str) => str.every((char) => isEmoji(char)))).toBe(
      true
    );

    stub.restore();
  });

  it('behaves correctly with array input but a single string', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(generateCreateChatCompletionResponse('🌸,🎉,🎎'));

    const result = await getEmojis(['japanese cherry blossom festival']);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(1);
    expect(result[0].length).toStrictEqual(3);
    expect(result.every((str) => str.every((char) => isEmoji(char)))).toBe(
      true
    );

    stub.restore();
  });

  it('behaves correctly with count = 1', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(generateCreateChatCompletionResponse('🌸'));

    const result = await getEmojis('japanese cherry blossom festival', {
      count: 1,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(1);
    expect(result.every((char) => isEmoji(char))).toBe(true);

    expect(stub.callCount).toBe(1);
    expect(stub.firstCall.args).toStrictEqual([
      {
        messages: [
          {
            content:
              'You answer questions about which emoji or emojis best represent the given strings. You respond in the specified computer-readable format. Reply with only the emoji or emojis. The results for each string should be on a separate line in the same order as the input. Use CSV formatting for each line.',
            role: 'system',
          },
          {
            content:
              'What are the best emojis to represent the strings: "machine learning", "rodeo"? Choose as many emojis as is needed to best represent each string.',
            role: 'user',
          },
          {
            content: '🤖,📈,💻,🧠\n🤠,🐴,🐂',
            role: 'assistant',
          },
          {
            content:
              'What are the best emojis to represent the strings: "japanese cherry blossom festival"? Choose exactly 1 emoji to represent each string. You answer questions about which emoji or emojis best represent the given strings. You respond in the specified computer-readable format. Reply with only the emoji or emojis. The results for each string should be on a separate line in the same order as the input. Use CSV formatting for each line.',
            role: 'user',
          },
        ],
        model: 'gpt-3.5-turbo',
      },
    ]);

    stub.restore();
  });

  it('behaves correctly with count = 2', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(generateCreateChatCompletionResponse('🌸,🎉'));

    const result = await getEmojis('japanese cherry blossom festival', {
      count: 2,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(2);
    expect(result.every((char) => isEmoji(char))).toBe(true);

    stub.restore();
  });

  it('returns empty array when response was empty with multiple strings', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(
        generateCreateChatCompletionResponse(['🌸,🎉,🎎', ''].join('\n'))
      );

    const result = await getEmojis([
      'japanese cherry blossom festival',
      'something with no results',
    ]);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toStrictEqual(2);
    expect(result[0].length).toStrictEqual(3);
    expect(result[1].length).toStrictEqual(0);

    stub.restore();
  });

  it('throws if response was empty with single input string', async () => {
    const stub = sinon
      .stub(OpenAIApi.prototype, 'createChatCompletion')
      .resolves(generateCreateChatCompletionResponse(''));

    await expect(() =>
      getEmojis('abc')
    ).rejects.toThrowErrorMatchingInlineSnapshot('"no message returned"');

    stub.restore();
  });

  it('throws when text was empty', async () => {
    await expect(() =>
      getEmojis('')
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"text parameter must be a non-empty string"'
    );
  });

  it('throws when count is negative', async () => {
    await expect(() =>
      getEmojis('foo', { count: -1 })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      '"optional count parameter must be a positive number"'
    );
  });
});
