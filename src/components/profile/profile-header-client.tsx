'use client'

import { useRouter } from 'next/navigation'
import { ProfileHeader } from './profile-header'
import { User, Profile } from '@prisma/client'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { generateVCardString } from '@/lib/utils'
import { Route } from 'next'

interface ProfileHeaderClientProps {
  user: User & {
    profile: Profile | null
  }
}

export function ProfileHeaderClient({ user }: ProfileHeaderClientProps) {
  const router = useRouter()

  const handleEdit = () => {
    router.push(`${PAGE_ROUTES.profile}/edit` as Route<string>)
  }

  const handleShare = async () => {
    if (!user.profile) return

    const vCardData = {
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      emails: user.email ? [{ value: user.email }] : [],
      phones: user.profile.phone ? [{ value: user.profile.phone }] : [],
      photoUrl: user.profile.identityPicture || undefined
    }

    const vCard = generateVCardString(vCardData)
    const blob = new Blob([vCard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)

    if (navigator.share) {
      try {
        await navigator.share({
          title: user.name || 'Contact',
          text: 'Carte de contact consulaire',
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = `${user.name || 'contact'}.vcf`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleDownload = () => {
    // Implémentation du téléchargement de la carte consulaire
    // À implémenter plus tard
  }

  return (
    <ProfileHeader
      user={user}
      onEdit={handleEdit}
      onShare={handleShare}
      onDownload={handleDownload}
    />
  )
}