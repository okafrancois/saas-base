import { UseFormReturn } from 'react-hook-form'
import { ProfileDataInput } from '@/components/consular/schema'
import { useTranslations } from 'next-intl'
import DocumentUploadField from '@/components/ui/document-upload'
import { FullProfile } from '@/lib/models-types'
import { FormControl, FormField, FormItem, FormLabel, TradFormMessage } from '@/components/ui/form'

type Props = {
  form: UseFormReturn<ProfileDataInput>
  existingData?: FullProfile
}

export function SectionDocuments({ form, existingData }: Props) {
  const t = useTranslations('profile')
  function getFileListFromUrl(url?: string | null): FileList | null {
    if (!url) return null
    const file = new File([new Blob()], url)
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    return dataTransfer.files
  }

  const documents = [
    {
      id: 'documents.passportFile' as const,
      label: t('labels.passport'),
      existing: getFileListFromUrl(existingData?.passport?.url),
      required: true
    },
    {
      id: 'documents.birthCertificateFile' as const,
      label: t('labels.birth_certificate'),
      existing: getFileListFromUrl(existingData?.birthCertificate?.url),
      required: true
    },
    {
      id: 'documents.residencePermitFile' as const,
      label: t('labels.residence_permit'),
      existing: getFileListFromUrl(existingData?.residencePermit?.url),
      required: false
    },
    {
      id: 'documents.addressProofFile' as const,
      label: t('labels.address_proof'),
      existing: getFileListFromUrl(existingData?.addressProof?.url),
      required: true
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {documents.map(doc => (
        <FormField
          key={doc.id}
          control={form.control}
          name="basicInfo.identityPictureFile"
          render={() => (
            <FormItem>
              <FormLabel>
                {doc.label} {doc.required && <span className="text-red-500">*</span>}
              </FormLabel>
              <FormControl>
                <DocumentUploadField
                  field={form.register(doc.id)}
                  form={form}
                  id={doc.id}
                  existingFile={doc.existing}
                  aspectRatio={"document"}
                />
              </FormControl>
              <TradFormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  )
}