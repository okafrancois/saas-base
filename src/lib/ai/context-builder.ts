import { User, Profile, Consulate, Address, Country } from '@prisma/client'
import { UserContext } from './types';

// TypeScript
export class ContextBuilder {
  static async buildContext(
    user?: User | null,
    profile?: Profile & {
      address: Address
    } | null,
    consulate?: Consulate & {
      countries: Omit<Country, "consulateId">[]
    } | null
  ): Promise<UserContext> {

    return {
      user: user || null,
      profile: profile || null,
      consulate: consulate || null
    };
  }
}