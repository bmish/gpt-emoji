import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Generates the emoji(s) that best represent a given string.
 * This is non-deterministic.
 * @param text the text/concept to generate emoji(s) for
 * @param count the number of emoji(s) to generate. If omitted, the AI will decide how many emojis are needed to best represent the string.
 * @returns an array of emojis
 */
export async function getEmojis(
  text: string,
  count?: number | undefined
): Promise<string[]> {
  let prompt = `Please return the emoji or emojis that best describe the following text: "${text}".`;
  prompt += count
    ? ` Return ${count} emoji${count === 1 ? '' : 's'}.`
    : ' Return as many emojis as is needed to represent the text.';
  prompt += 'Return only the emoji or emojis.';
  prompt += 'Separate the emojis with CSV formatting.';

  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
  });

  return completion.data.choices[0].text?.trim().split(',') || [];
}
