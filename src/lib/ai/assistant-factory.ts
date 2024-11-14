import { OpenAI } from 'openai';
import { ConsularAssistant } from './assistants/consular-assistant';
import { UserContext } from '@/lib/ai/types'

export class AssistantFactory {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  static createAssistant(context: UserContext): ConsularAssistant {
    return new ConsularAssistant(this.openai, context);
  }
}