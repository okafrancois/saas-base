'use server'

import { getCurrentUser } from '@/actions/user';
import { getProfileFromUser } from '@/actions/profile';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { AssistantFactory } from '@/lib/ai/assistant-factory';
import { getConsulate } from '@/actions/consulate'
import { Consulate, Country } from '@prisma/client'

export async function chatWithAssistant(message: string) {
  try {
    const user = await getCurrentUser();
    const profile = user ? await getProfileFromUser(user.id) : null;
    const consulate: Consulate & {
      countries: Omit<Country, "consulateId">[];
    } | null = profile?.consulateId ? await getConsulate(profile.consulateId) : null;

    const context = await ContextBuilder.buildContext(user, profile, consulate);
    const assistant = AssistantFactory.createAssistant(context);

    console.log({ message, context });

    return await assistant.handleMessage(message);
  } catch (error) {
    console.error('Error in chat action:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get response: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
}