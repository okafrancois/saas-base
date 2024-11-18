import { getCurrentUser } from '@/actions/user'

export default async function Page() {
  const current = await getCurrentUser()

  if (!current) {
    return
  }

  return (
    <div className={"container"}>
      <h1>
        Welcome back on admin, {current.name ?? current.phone ?? current.email}
      </h1>
    </div>
  )
}