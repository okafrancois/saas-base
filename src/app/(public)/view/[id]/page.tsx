import { getProfile } from '@/actions/profile'
import PublicProfile from '@/components/profile/public-profile'
import { auth } from '@/auth'
import { SessionProvider } from 'next-auth/react'

type Props = {
  params: { id: string }
}

export default async function SingleProfilePage({ params }: Readonly<Props>) {
  const { id } = params
  const data = await getProfile(id)

  const session = await auth()

  return (
    <SessionProvider session={session}>
      <div className="container">
        <PublicProfile
          data={data}
          showActions={{
            contact: true,
            share: true,
            message: true,
            card: true,
          }}
        />
      </div>
    </SessionProvider>
  )
}