import { User, Profile, Consulate, Address, Country } from '@prisma/client'

export type UserContext = {
  user: User | null;
  profile?: Profile & {
    address: Address;
  } | null;
  consulate?: Consulate & {
    countries: Omit<Country, "consulateId">[];
  } | null;
};

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type AssistantResponse = {
  message: string;
  suggestedActions?: string[];
  error?: string;
};