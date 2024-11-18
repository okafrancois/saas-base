'use server'

import { getCurrentUser } from '@/actions/user';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { AssistantFactory } from '@/lib/ai/assistant-factory';

export async function chatWithAssistant(message: string) {
  try {
    const user = await getCurrentUser();
    const profile = user;
    const consulate = null;

    const context = await ContextBuilder.buildContext(user, profile, consulate);
    const assistant = AssistantFactory.createAssistant(context);

    return await assistant.handleMessage(message);
  } catch (error) {
    console.error('Error in chat action:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get response: ${error.message}`);
    }
    throw new Error('An unknown error occurred');
  }
}