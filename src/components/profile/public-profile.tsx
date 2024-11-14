import { useTranslations } from 'next-intl'
import {
  maritalOptions,
  workStatusOptions,
  profileStatus,
  getTranslatedOptions, genderTypes,
} from '@/assets/autocomplete-datas'
import { FullProfile } from '@/lib/models-types'
import Image from 'next/image'
import defaultProfilPic from '../../assets/default-profil-pic.jpg'
import * as React from 'react'
import Link from 'next/link'
import { Route } from 'next'
import { MoveUpRightIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  SaveContact,
  SendMessage,
  ShareProfile,
  ShowCard,
} from '@/components/profile/profile-actions'
import { Separator } from '@/components/ui/separator'
import CtaContact from '@/components/cta-contact'
import { PAGE_ROUTES } from '@/schemas/app-routes'
import { ProfileActions } from '@/lib/utils'
import { RoleGuard } from '@/components/role-guard'
import { UserRole } from '@prisma/client'
import FilePreview from '@/components/ui/FilePreview'

type ProfileViewProps = {
  data: FullProfile
  showActions?: ProfileActions
}

export default function PublicProfile({
                                        data,
                                        showActions,
                                      }: Readonly<ProfileViewProps>) {
  const t = useTranslations('profile')
  const tAssets = useTranslations('assets')

  const translatedMaritalStatus = getTranslatedOptions(maritalOptions, tAssets, 'marital_status')
  const translatedWorkStatus = getTranslatedOptions(workStatusOptions, tAssets, 'work_status')
  const translatedProfileStatus = getTranslatedOptions(profileStatus, tAssets, 'status')
  const translatedGender = getTranslatedOptions(genderTypes, tAssets, 'gender')

  const statusColor = () => {
    switch (data.status) {
      case 'PENDING':
        return 'bg-yellow-100'
      case 'APPROVED':
        return 'bg-green-100'
      case 'REJECTED':
        return 'bg-red-100'
      case 'INCOMPLETE':
        return 'bg-gray-100'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className={'profile-view'}>
      <div className="profile-content grid grid-cols-12 gap-y-4 py-4 md:container lg:gap-8">
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
              <RoleGuard
                roles={[
                  UserRole.SECRET,
                  UserRole.MANAGER,
                  UserRole.ADMIN,
                  UserRole.SUPER_ADMIN,
                ]}
              >
                {showActions.card && <ShowCard profile={data} />}
              </RoleGuard>
              {showActions.message && <SendMessage profile={data} />}
              {showActions.contact && (
                <SaveContact
                  data={data}
                />
              )}
            </div>
          )}
        </div>
        <Separator className={'col-span-full'} />
        <RoleGuard
          roles={[
            UserRole.SECRET,
            UserRole.MANAGER,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
          ]}
        >
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
                    `${PAGE_ROUTES.view}/consulate/${data.consulateId}` as Route
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
        </RoleGuard>

        <Card className={'col-span-full  border-none shadow-none'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>{t('sections.basic_info')}</h3>
          </CardHeader>
          <CardContent className={'flex flex-col gap-2'}>
            <p>
              <span className={'font-medium'}>{t('labels.name')}: </span>
              <span>{`${data.firstName} ${data.lastName}`}</span>
            </p>
            <RoleGuard
              roles={[
                UserRole.SECRET,
                UserRole.MANAGER,
                UserRole.ADMIN,
                UserRole.SUPER_ADMIN,
              ]}
            >
              <>
                <p>
                  <span className={'font-medium'}>{t('labels.birth_date')}: </span>
                  <span>{data.birthDate}</span>
                </p>
                <p>
                  <span className={'font-medium'}>{t('labels.birth_place')}: </span>
                  <span>
                    {data.birthPlace}/{data.birthCountry}
                  </span>
                </p>
                <p>
                  <span className={'font-medium'}>{t('labels.marital_status')}: </span>
                  <span>{data.maritalStatus ? translatedMaritalStatus[data.maritalStatus] : 'N/A'}</span>
                </p>
                <p>
                  <span className={'font-medium'}>{t('labels.work_status')}: </span>
                  <span>{data.workStatus ? translatedWorkStatus[data.workStatus] : 'N/A'}</span>
                </p>
                <p>
                  <span className={'font-medium'}>{t('labels.gender')}: </span>
                  <span>{translatedGender[data.gender]}</span>
                </p>
              </>
            </RoleGuard>
          </CardContent>
        </Card>
        <Card className={'col-span-full border-none shadow-none'}>
          <CardHeader>
            <h3 className={'text-lg md:text-xl'}>
              {t('sections.contact_info')}
            </h3>
          </CardHeader>
          <CardContent className={'flex flex-col gap-2'}>
            <RoleGuard
              roles={[
                UserRole.SECRET,
                UserRole.MANAGER,
                UserRole.ADMIN,
                UserRole.SUPER_ADMIN,
              ]}
            >
              <p>
                <span className={'font-medium'}>{t('labels.address')}: </span>
                <span>
                  {data.address.firstLine}{' '}
                  {data.address?.secondLine
                    ? `, ${data.address?.secondLine}`
                    : ''}
                  , {data.address.zipCode} {data.address.city},{' '}
                  {data.address.country}
                </span>
              </p>
            </RoleGuard>
            <p>
              <span className={'font-medium'}>{t('labels.email')}: </span>
              <span>{data.email}</span>
            </p>
            <p>
              <span className={'font-medium'}>{t('labels.phone')}: </span>
              <span>{data.phone}</span>
            </p>
          </CardContent>
        </Card>
        <RoleGuard
          roles={[
            UserRole.SECRET,
            UserRole.MANAGER,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
          ]}
        >
          <Card className={'col-span-full  border-none shadow-none'}>
            <CardHeader>
              <h3 className={'text-lg md:text-xl'}>{t('sections.documents')}</h3>
            </CardHeader>
            <CardContent className={'grid grid-cols-2 gap-2 lg:grid-cols-4'}>
              {data.passport && (
                <FilePreview label={t('labels.passport')} url={data.passport.url} />
              )}
              {data.birthCertificate && (
                <FilePreview
                  label={t('labels.birth_certificate')}
                  url={data.birthCertificate.url}
                />
              )}
              {data.residencePermit && (
                <FilePreview
                  label={t('labels.residence_permit')}
                  url={data.residencePermit.url}
                />
              )}
              {data.addressProof && (
                <FilePreview
                  label={t('labels.address_proof')}
                  url={data.addressProof.url}
                />
              )}
            </CardContent>
          </Card>
        </RoleGuard>
        <RoleGuard roles={[UserRole.SECRET]}>
          <Card className={'col-span-full  border-none shadow-none'}>
            <CardHeader>
              <h3 className={'text-lg md:text-xl'}>
                {t('sections.intelligence_file')}
              </h3>
            </CardHeader>
            <CardContent className={'flex flex-col gap-2'}>
              <p>
                <span className={'font-medium'}>{t('labels.political_affiliation')}: </span>
                <span>N/A</span>
              </p>
              <p>
                <span className={'font-medium'}>{t('labels.financial_situation')}: </span>
                <span>N/A</span>
              </p>
              <p>
                <span className={'font-medium'}>{t('labels.properties')}: </span>
                <span>N/A</span>
              </p>
              <p>
                <span className={'font-medium'}>{t('labels.social_media_presence')}: </span>
                <span>N/A</span>
              </p>
              <p>
                <span className={'font-medium'}>{t('labels.travel_habits')}: </span>
                <span>N/A</span>
              </p>
              <p>
                <span className={'font-medium'}>{t('labels.family_situation')}: </span>
                <span>N/A</span>
              </p>
              <p>
                <span className={'font-medium'}>{t('labels.criminal_record')}: </span>
                <span>N/A</span>
              </p>
            </CardContent>
          </Card>
        </RoleGuard>
        <CtaContact />
      </div>
    </div>
  )
}