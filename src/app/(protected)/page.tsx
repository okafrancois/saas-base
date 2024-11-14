import { getCurrentUser } from '@/actions/user'
import RedirectUser from '@/components/redirect-user'

export default async function Page() {
  const current = await getCurrentUser()

  if (!current) {
    return <div>Loading...</div>
  }

  return <RedirectUser user={current} />
}