import { useTranslations } from 'next-intl'
import { DocumentUploadField } from './document-upload-field'
import { DocumentVerification } from './document-verification'
import { useDocumentUpload } from '@/hooks/use-document-upload'

export function PassportUpload() {
  const t = useTranslations('consular.documents')
  const {
    file,
    status,
    progress,
    error,
    uploadFile,
    reset,
  } = useDocumentUpload({
    maxSize: 10,
    onSuccess: (file) => {
      console.log('Passport uploaded:', file)
    },
  })

  const validationRules = [
    {
      id: 'format',
      label: t('verification.rules.format'),
      status: file ? 'valid' : 'pending',
    },
    {
      id: 'quality',
      label: t('verification.rules.quality'),
      status: file ? 'valid' : 'pending',
    },
    {
      id: 'completeness',
      label: t('verification.rules.completeness'),
      status: file ? 'valid' : 'pending',
    },
  ]

  return (
    <div className="space-y-6">
      <DocumentUploadField
        id="passport"
        label={t('passport.label')}
        helpText={t('passport.help')}
        required
        value={file}
        onChange={uploadFile}
        status={status}
        progress={progress}
        error={error}
      />

      {file && (
        <DocumentVerification
          rules={validationRules}
        />
      )}
    </div>
  )
}