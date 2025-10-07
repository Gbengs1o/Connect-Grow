'use server';

/**
 * @fileOverview An AI agent that generates a personalized follow-up message for a visitor.
 *
 * - generateFollowUpMessage - A function that generates the follow-up message.
 * - GenerateFollowUpMessageInput - The input type for the generateFollowUpMessage function.
 * - GenerateFollowUpMessageOutput - The return type for the generateFollowUpMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFollowUpMessageInputSchema = z.object({
  visitorName: z.string().describe('The full name of the visitor.'),
  visitDate: z.string().describe('The date the visitor visited, in ISO format.'),
  prayerRequest: z.string().describe('The prayer request of the visitor.'),
  serviceType: z.string().describe('The type of service the visitor attended.'),
  additionalContext: z
    .string()
    .optional()
    .describe('Any additional information about the visitor.'),
});
export type GenerateFollowUpMessageInput = z.infer<
  typeof GenerateFollowUpMessageInputSchema
>;

const GenerateFollowUpMessageOutputSchema = z.object({
  followUpMessage: z
    .string()
    .describe('A personalized follow-up message for the visitor.'),
});
export type GenerateFollowUpMessageOutput = z.infer<
  typeof GenerateFollowUpMessageOutputSchema
>;

export async function generateFollowUpMessage(
  input: GenerateFollowUpMessageInput
): Promise<GenerateFollowUpMessageOutput> {
  return generateFollowUpMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFollowUpMessagePrompt',
  input: {schema: GenerateFollowUpMessageInputSchema},
  output: {schema: GenerateFollowUpMessageOutputSchema},
  prompt: `You are an AI assistant tasked with generating personalized follow-up messages for church visitors.

  Given the following information about a visitor, create a warm and inviting follow-up message. The message should be brief (under 100 words) and encourage the visitor to connect with the church further.

  Visitor Name: {{{visitorName}}}
  Visit Date: {{{visitDate}}}
  Service Type: {{{serviceType}}}
  Prayer Request: {{{prayerRequest}}}
  Additional Context: {{{additionalContext}}}

  Follow-up Message:`,
});

const generateFollowUpMessageFlow = ai.defineFlow(
  {
    name: 'generateFollowUpMessageFlow',
    inputSchema: GenerateFollowUpMessageInputSchema,
    outputSchema: GenerateFollowUpMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
