'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { EditableSection } from '../editable-section'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { DocumentUploadField } from '@/components/ui/document-upload'
import { FileIcon, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentType, DocumentStatus, Document } from '@prisma/client'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DocumentsSchema, type DocumentsFormData } from '@/schemas/registration'
import { postProfile } from '@/actions/profile'

interface DocumentsSectionProps {
  documents: {
    passport?: Document
    birthCertificate?: Document
    residencePermit?: Document
    addressProof?: Document
  }
}

interface DocumentCardProps {
  type: DocumentType
  document?: Document
  required?: boolean
  onView?: (doc: Document) => void
  onDownload?: (doc: Document) => void
}

function DocumentCard({ type, document, required = true, onView, onDownload }: DocumentCardProps) {
  const t = useTranslations('common.documents')

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'VALIDATED':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <FileIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="space-y-1">
              <div className="font-medium">
                {t(`types.${type.toLowerCase()}`)}
              </div>
              {document ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(document.status)}
                    <span>
                      {t(`status.${document.status.toLowerCase()}`)}
                    </span>
                  </div>
                  {document.expiresAt && (
                    <div className="text-sm text-muted-foreground">
                      {t('expires_on')}: {format(new Date(document.expiresAt), 'PPP', { locale: fr })}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document && onView?.(document)}
                    >
                      {t('actions.view')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document && onDownload?.(document)}
                    >
                      {t('actions.download')}
                    </Button>
                  </div>
                </>
              ) : (
                <Badge
                  variant={required ? "destructive" : "outline"}
                  className="mt-2"
                >
                  {required ? t('status.required') : t('status.optional')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  const t = useTranslations('registration')
  const t_section = useTranslations('profile.sections')
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<DocumentsFormData>({
    resolver: zodResolver(DocumentsSchema),
    defaultValues: {
      passportFile: null,
      birthCertificateFile: null,
      residencePermitFile: null,
      addressProofFile: null,
    }
  })

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const data = form.getValues()

      const formData = new FormData()

      // Ajouter uniquement les fichiers qui ont été modifiés
      Object.entries(data).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file)
        }
      })

      const result = await postProfile(formData)

      if (result.error) {
        toast({
          title: t('messages.errors.update_failed'),
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: t('messages.success.update_title'),
        description: t('messages.success.update_description'),
        variant: "success"
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: t('messages.errors.update_failed'),
        description: t('messages.errors.unknown'),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const handleViewDocument = async (document: Document) => {
    window.open(document.fileUrl, '_blank')
  }

  const handleDownloadDocument = async (document: Document) => {
    try {
      const response = await fetch(document.fileUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${document.type.toLowerCase()}.${document.fileUrl.split('.').pop()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: t('messages.errors.download_failed'),
        description: t('messages.errors.unknown'),
        variant: "destructive"
      })
    }
  }

  return (
    <EditableSection
      title={t_section('documents')}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      isLoading={isLoading}
    >
      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DocumentUploadField
                id="passportFile"
                field={form.register('passportFile')}
                form={form}
                label={t('documents.passport.label')}
                description={t('documents.passport.description')}
                required
              />
              <DocumentUploadField
                id="birthCertificateFile"
                field={form.register('birthCertificateFile')}
                form={form}
                label={t('documents.birth_certificate.label')}
                description={t('documents.birth_certificate.description')}
                required
              />
              <DocumentUploadField
                id="residencePermitFile"
                field={form.register('residencePermitFile')}
                form={form}
                label={t('documents.residence_permit.label')}
                description={t('documents.residence_permit.description')}
              />
              <DocumentUploadField
                id="addressProofFile"
                field={form.register('addressProofFile')}
                form={form}
                label={t('documents.address_proof.label')}
                description={t('documents.address_proof.description')}
                required
              />
            </div>
          </form>
        </Form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <DocumentCard
            type="PASSPORT"
            document={documents.passport}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
          />
          <DocumentCard
            type="BIRTH_CERTIFICATE"
            document={documents.birthCertificate}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
          />
          <DocumentCard
            type="RESIDENCE_PERMIT"
            document={documents.residencePermit}
            required={false}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
          />
          <DocumentCard
            type="PROOF_OF_ADDRESS"
            document={documents.addressProof}
            onView={handleViewDocument}
            onDownload={handleDownloadDocument}
          />
        </div>
      )}
    </EditableSection>
  )
}