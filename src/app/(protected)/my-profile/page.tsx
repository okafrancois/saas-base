import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProfileView from '@/components/profile/profile-view'
import { ProfileFormContent } from '@/components/profile/profile-form'
import ProfileSettings from '@/components/profile/profile-settings'
import { getProfileFromUser } from '@/actions/profile'
import { getCurrentUser } from '@/actions/user'
import { getTranslations } from 'next-intl/server'

type Props = {
  searchParams: { edit?: string }
}

enum MODE {
  VIEW = 'view',
  EDIT = 'edit',
  SETTINGS = 'settings',
}

export default async function MyProfilePage({ searchParams }: Readonly<Props>) {
  const t = await getTranslations('profile')

  const { edit } = searchParams
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const data = await getProfileFromUser(user.id)

  if (!data) {
    return (
      <div className="container space-x-6">
        <ProfileFormContent />
      </div>
    )
  }

  if (edit === '') {

    return (
      <div className="container space-x-6">
        <Tabs defaultValue={MODE.EDIT}>
          <TabsList className={'grid w-full grid-cols-3 rounded-full bg-input'}>
            {Object.values(MODE).map((value) => (
              <TabsTrigger key={value} value={value}>
                {t(`tabs.${value}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="pt-4">
            <TabsContent value={MODE.VIEW}>
              <ProfileView
                data={data}
                showActions={{
                  contact: true,
                  share: true,
                  message: true,
                  card: true,
                }}
              />
            </TabsContent>
            <TabsContent value={MODE.EDIT}>
              <ProfileFormContent data={data} />
            </TabsContent>
            <TabsContent value={MODE.SETTINGS}>
              <ProfileSettings data={data} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    )
  }

  return (
    <ProfileView
      data={data}
      showActions={{
        share: true,
        message: true,
        card: true,
        edit: true,
      }}
    />
  )
}