import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getUserProfile } from '@/lib/user'

export const useCurrentUser = () => {
  const session = useSession()

  return session.data?.user
}

export const useUserCountry = () => {
  const user = useCurrentUser()
  const [userCountry, setUserCountry] = useState<undefined | string>(undefined)

  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then(userProfile => {
        if (userProfile && userProfile?.residenceCountry) {
          setUserCountry(userProfile.residenceCountry)
        }
      })
    }
  }, [user])

  return userCountry
}