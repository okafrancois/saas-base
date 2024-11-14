import {
  maritalOptions,
  workStatusOptions,
  profileStatus,
  getTranslatedOptions, genderTypes,
} from '@/assets/autocomplete-datas'
import { FullProfile } from '@/lib/models-types'
import Image from 'next/image'
import defaultProfilPic from '../../assets/default-profil-pic.jpg'
import Link from 'next/link'
import { Route } from 'next'
import { EditIcon, MoveUpRightIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  SaveContact,
  SendMessage,
  ShareProfile,
  ShowCard,
} from '@/components/profile/profile-actions'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { ProfileActions } from '@/lib/utils'
import FilePreview from '@/components/ui/FilePreview'
import { getTranslations } from 'next-intl/server'
import MissingBadge from '@/components/ui/missing-badge'

type ProfileViewProps = {
  data: FullProfile
  showActions?: ProfileActions
}

export default async function ProfileView({
                                      data,
                                      showActions,
                                    }: Readonly<ProfileViewProps>) {
  const t = await getTranslations('profile')
  const tAssets = await getTranslations('assets')

  const translatedMaritalStatus = getTranslatedOptions(maritalOptions, tAssets, 'marital_status')
  const translatedWorkStatus = getTranslatedOptions(workStatusOptions, tAssets, 'work_status')
  const translatedGender = getTranslatedOptions(genderTypes, tAssets, 'gender')
  const translatedProfileStatus = getTranslatedOptions(profileStatus, tAssets, 'status')

  const statusColor = () => {
    switch (data.status) {
      case 'PENDING':
        return 'bg-blue-100 bg-text-500'
      case 'APPROVED':
        return 'bg-green-100 text-green-500'
      case 'REJECTED':
        return 'bg-red-100 text-red-500'
      case 'INCOMPLETE':
        return 'bg-orange-100 text-orange-500'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }

  return (
    <div className={'profile-view'}>
      <div className="profile-content container grid grid-cols-12 gap-y-4 py-4 lg:gap-8">
        <div className="profile-covers col-span-full grid grid-cols-2 gap-4">
          <div>
            <Image
              src={data.identityPicture?.url ?? defaultProfilPic}
              width={200}
              height={200}
              alt={t('labels.identity_picture')}
              className={
                'aspect-square !w-full rounded-md border-2 border-input bg-white object-cover object-center md:!max-w-[150px]'
              }
            />
          </div>
          {showActions && (
            <div className="profile-actions flex flex-col gap-2">
              {showActions.share && <ShareProfile profile={data} />}
              {showActions.card && <ShowCard profile={data} />}
              {showActions.message && <SendMessage profile={data} />}
              {showActions.contact && (
                <SaveContact
                  data={data}
                />
              )}
              {showActions?.edit && (
                <Link
                  href={`${PAGE_ROUTES.my_profile}?edit` as Route}
                  className={buttonVariants({ variant: 'default' }) + ' gap-2 rounded-full'}
                >
                  <span>{t('actions.edit')}</span>
                  <EditIcon className={'size-5'} />

                </Link>
              )}
            </div>
          )}
        </div>
        <Separator className={'col-span-full'} />
        <Card
          className={'col-span-full border-none  shadow-none md:col-span-8'}
        >
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('sections.consulate')}</h3>
          </CardHeader>
          <CardContent className={'flex flex-wrap gap-2'}>
            {data.consulate && (
              <Link
                href={
                  `${PAGE_ROUTES.consulates}/${data.consulateId}` as Route
                }
                target={'_blank'}
                className={
                  'flex h-max items-center gap-2 rounded-md bg-emerald-100 px-6 py-3 dark:text-gray-950'
                }
              >
                <span className={'flex items-center gap-2'}>
                  <Image
                    src={data.consulate.logo?.url ?? defaultProfilPic}
                    alt={`${data.consulate.name} ${t('labels.logo')}`}
                    width={50}
                    height={50}
                    className={
                      'aspect-square max-w-[30px] rounded-full object-cover object-center'
                    }
                    priority={false}
                  />
                  {data.consulate.name}
                </span>
                <MoveUpRightIcon className={'size-4'} />
              </Link>
            )}
          </CardContent>
        </Card>
        <Card className={'col-span-full border-none shadow-none md:col-span-4'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('labels.profile_status')}</h3>
          </CardHeader>
          <CardContent className={'flex flex-wrap gap-2'}>
            <p
              className={`flex gap-2 font-medium uppercase ${statusColor()} items-center rounded-sm px-6 py-3 dark:text-black`}
            >
              {translatedProfileStatus[data.status]}
            </p>
          </CardContent>
        </Card>
        <Card className={'col-span-full  border-none shadow-none'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('sections.basic_info')}</h3>
          </CardHeader>
          <CardContent className={'flex flex-col gap-2'}>
            <p>
              <span className={'font-medium'}>{t('labels.name')}: </span>
              {(data.firstName && data.lastName) ? <span>{data.firstName} {data.lastName}</span> :
                <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.birth_date')}: </span>
              {data.birthDate ? <span>{data.birthDate}</span> : <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.birth_place')}: </span>
              {(data.birthPlace && data.birthPlace) ? <span>{data.birthPlace}/{data.birthPlace}</span> :
                <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.marital_status')}: </span>
              {data.maritalStatus ? <span>{translatedMaritalStatus[data.maritalStatus]}</span> :
                <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.work_status')}: </span>
              {data.workStatus ? <span>{translatedWorkStatus[data.workStatus]}</span> :
                <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.gender')}: </span>
              {data.gender ? <span>{translatedGender[data.gender]}</span> : <MissingBadge isMissing={true} />}
            </p>
          </CardContent>
        </Card>
        <Card className={'col-span-full border-none shadow-none'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>
              {t('sections.contact_info')}
            </h3>
          </CardHeader>
          <CardContent className={'flex flex-col gap-2'}>
            <p>
              <span className={'font-medium'}>{t('labels.address')}: </span>
              {data.address.firstLine ? <span>
                {data.address.firstLine}{' '}
                {data.address?.secondLine
                  ? `, ${data.address?.secondLine}`
                  : ''}
                , {data.address.zipCode} {data.address.city},{' '}
                {data.address.country}
              </span> : <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.email')}: </span>
              {data.email ? <span>{data.email}</span> : <MissingBadge isMissing={true} />}
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.phone')}: </span>
              {data.phone ? <span>{data.phone}</span> : <MissingBadge isMissing={true} />}
            </p>
          </CardContent>
        </Card>
        <Card className={'col-span-full  border-none shadow-none'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('sections.documents')}</h3>
          </CardHeader>
          <CardContent className={'grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-4'}>
            <FilePreview
              label={t('labels.passport')}
              url={data.passport?.url}
              isMissing={!data.passport?.url}
            />
            <FilePreview
              label={t('labels.birth_certificate')}
              url={data.birthCertificate?.url}
              isMissing={!data.birthCertificate?.url}
            />

            <FilePreview
              label={t('labels.residence_permit')}
              url={data.residencePermit?.url}
              isMissing={!data.residencePermit?.url}
            />
            <FilePreview
              label={t('labels.address_proof')}
              url={data.addressProof?.url}
              isMissing={!data.addressProof?.url}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}