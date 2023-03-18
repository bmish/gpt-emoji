import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function GPT35Turbo(
  messages: { role: 'user' | 'system' | 'assistant'; content: string }[]
) {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  });

  if (
    !response.data.choices[0].message ||
    response.data.choices[0].message.content === ''
  ) {
    throw new Error('no message returned');
  }

  return response.data.choices[0].message.content;
}

function stringOrArrayToArray<T extends string | readonly string[]>(
  stringOrArray: T
): readonly string[] {
  return stringOrArray instanceof Array ? stringOrArray : [stringOrArray]; // eslint-disable-line unicorn/no-instanceof-array -- using Array.isArray() loses type information about the array.
}

function messageQuestion(texts: readonly string[]) {
  return `What are the best emojis to represent the strings: ${texts
    .map((t) => `"${t}"`)
    .join(', ')}?`;
}

function messageCount(count?: number | undefined) {
  return count
    ? `Choose exactly ${count} emoji${
        count === 1 ? '' : 's'
      } to represent each string.`
    : 'Choose as many emojis as is needed to best represent each string.';
}

/**
 * Generates the emoji(s) that best represent the given string(s).
 * This is non-deterministic.
 * @param text the text/concept(s) to generate emoji(s) for
 * @param options an object containing optional parameters
 * @param options.count the number of emoji(s) to represent the text with. If omitted, the AI will decide how many emojis are needed to best represent the string.
 * @returns an array of emojis, or an array of arrays of emojis if multiple strings were provided.
 */
export async function getEmojis<T extends string | readonly string[]>(
  text: T,
  options: { count?: number } = {}
): Promise<readonly T[]> {
  const textArray = stringOrArrayToArray(text);
  if (textArray.some((t) => typeof t !== 'string' || t.length === 0)) {
    throw new Error('text parameter must be a non-empty string');
  }
  const count = options.count;
  if (count && (typeof count !== 'number' || count <= 0)) {
    throw new Error('optional count parameter must be a positive number');
  }

  const messageIntro = [
    'You answer questions about which emoji or emojis best represent the given strings.',
    'You respond in the specified computer-readable format.',
    'Reply with only the emoji or emojis.',
    'The results for each string should be on a separate line in the same order as the input.',
    'Use CSV formatting for each line.',
  ].join(' ');

  const result = await GPT35Turbo([
    // Introduce the task.
    {
      role: 'system',
      content: messageIntro,
    },

    // Demonstrate usage with sample.
    {
      role: 'user',
      content: `${messageQuestion([
        'machine learning',
        'rodeo',
      ])} ${messageCount()}`,
    },
    { role: 'assistant', content: '🤖,📈,💻,🧠\n🤠,🐴,🐂' },

    // Actual question.
    {
      role: 'user',
      // The system message is repeated because:
      // > gpt-3.5-turbo-0301 does not always pay strong attention to system messages. Future models will be trained to pay stronger attention to system messages.
      // https://platform.openai.com/docs/guides/chat/introduction
      content: `${messageQuestion(textArray)} ${messageCount(
        textArray.length
      )} ${messageIntro} `,
    },
  ]);

  // @ts-expect-error -- TS template variable issue.
  return Array.isArray(text)
    ? result.split('\n').map((str) => (str === '' ? [] : str.split(',')))
    : result.split(',');
}
