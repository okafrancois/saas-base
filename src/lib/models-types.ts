import { Prisma } from '@prisma/client'

export type FullProfile = Prisma.ProfileGetPayload<{
  include: {
    address: true
    passport: {
      select: {
        url: true
        type: true
      }
    }
    birthCertificate: {
      select: {
        url: true
        type: true
      }
    }
    addressProof: {
      select: {
        url: true
        type: true
      }
    }
    residencePermit: {
      select: {
        url: true
        type: true
      }
    }
    identityPicture: {
      select: {
        url: true
        type: true
      }
    }
    consulate: {
      select: {
        id: true
        name: true
        website: true
        isGeneral: true
        logo: {
          select: {
            url: true
          }
        }
        address: true
        phone: true
      }
    }
    emergencyContact: {
      select: {
        fullName: true
        relationship: true
        phone: true
      }
    }
  }
}>

export type ListingProfile = Prisma.ProfileGetPayload<{
  select: {
    id: true
    firstName: true
    lastName: true
    status: true
  }
}>

export type FullConsulate = Prisma.ConsulateGetPayload<{
  include: {
    address: true
    logo: {
      select: {
        url: true
        key: true
      }
    }
    profiles: {
      select: {
        id: true
        firstName: true
        lastName: true
        status: true
        address: true
      }
    }
    countries: {
      select: {
        id: true
        name: true
      }
    }
  }
}>

export type ListingCountry = Prisma.CountryGetPayload<{
  select: {
    id: true
    name: true
    consulateId: true
  }
}>

export type ListingConsulate = Prisma.ConsulateGetPayload<{
  select: {
    id: true
    name: true
    website: true
    address: true
    logo: {
      select: {
        url: true
      }
    }
  }
}>