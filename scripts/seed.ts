import {
  PrismaClient,
  UserRole,
  Gender,
  MaritalStatus,
  WorkStatus,
  NationalityAcquisition,
  DocumentType,
  DocumentStatus,
} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Début du seeding...')

    // 1. Créer le consulat
    console.log('Création du consulat...')
    const consulat = await prisma.consulate.create({
      data: {
        name: "Consulat du Gabon en France",
        email: "contact@consulat-gabon.fr",
        phone: "+33123456789",
        isGeneral: true,
        website: "https://consulat-gabon.fr",
        address: {
          create: {
            firstLine: "8 rue de la Paix",
            city: "Paris",
            zipCode: "75002",
            country: "france"
          }
        },
        countries: {
          create: [
            { name: "France", code: "FR" },
            { name: "Belgique", code: "BE" },
            { name: "Luxembourg", code: "LU" }
          ]
        }
      }
    })

    // 2. Créer l'utilisateur avec son profil
    console.log('Création de l\'utilisateur et du profil...')
    const user = await prisma.user.create({
      data: {
        email: "itoutouberny@gmail.com",
        phone: "+33612250393",
        name: "Berny Itoutou",
        role: UserRole.USER,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        lastLogin: new Date(),
        consulateId: consulat.id,
        profile: {
          create: {
            firstName: "John",
            lastName: "Doe",
            gender: Gender.MALE,
            birthDate: "1990-01-01",
            birthPlace: "Paris",
            birthCountry: "france",
            nationality: "gabon",
            email: "itoutouberny@gmail.com",
            phone: "+33612250393",
            maritalStatus: MaritalStatus.SINGLE,
            workStatus: WorkStatus.EMPLOYEE,
            acquisitionMode: NationalityAcquisition.BIRTH,
            identityPicture: "https://utfs.io/f/yMD4lMLsSKvznrMiNYCVFA1bUs9ixXJIwYke3aRG6qo42vpB",
            profession: "Ingénieur informatique",
            employer: "Decathlon",
            employerAddress: "10 rue de l'Innovation, Paris",
            activityInGabon: "Étudiant",
            passportNumber: "GA123456",
            passportIssueDate: new Date("2020-01-01"),
            passportExpiryDate: new Date("2030-01-01"),
            passportIssueAuthority: "Ambassade du Gabon",
            passport: {
              create: {
                type: DocumentType.PASSPORT,
                status: DocumentStatus.PENDING,
                fileUrl: "https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs",
                issuedAt: new Date("2020-01-01"),
                expiresAt: new Date("2030-01-01"),
                metadata: {
                  documentNumber: "GA123456",
                  issuingAuthority: "Ambassade du Gabon",
                }
              }
            },
            birthCertificate: {
              create: {
                type: DocumentType.BIRTH_CERTIFICATE,
                status: DocumentStatus.PENDING,
                fileUrl: "https://utfs.io/f/yMD4lMLsSKvzCwNoT5d18tkLi9WuUPrXjgdzRhvo5IVe4fbs",
                issuedAt: new Date("2020-01-01"),
                expiresAt: new Date("2030-01-01"),
              }
            },
            address: {
              create: {
                firstLine: "15 rue des Lilas",
                secondLine: "Apt 4B",
                city: "Paris",
                zipCode: "75003",
                country: "france"
              }
            },
            addressInGabon: {
              create: {
                address: "123 Boulevard du Bord de Mer",
                district: "Quartier Louis",
                city: "Libreville"
              }
            },
            emergencyContact: {
              create: {
                fullName: "Jane Doe",
                relationship: "Sœur",
                phone: "+33687654321"
              }
            },
          }
        }
      }
    })

    console.log('✅ Seeding terminé avec succès!')
    console.log('Données créées:', {
      consulat: { id: consulat.id, name: consulat.name },
      user: { id: user.id, email: user.email }
    })

  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error)
    await prisma.$disconnect()
    throw error
  }
}

// Exécution avec gestion d'erreur simplifiée
main().catch((error) => {
  console.error('Fatal error:', error)
})