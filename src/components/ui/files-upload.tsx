import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { uploadFiles } from '@/actions/uploads'
import { useTranslations } from 'next-intl'
import { Cross1Icon, TrashIcon } from '@radix-ui/react-icons'
import { CrossIcon, DeleteIcon } from 'lucide-react'

type FileUploadProps = {
  onUpload: (files: Array<{ url: string; filename: string; mimeType: string }>) => void
  accept?: string
  multiple?: boolean
}

export function FilesUpload({ onUpload, accept, multiple = false }: FileUploadProps) {
  const t = useTranslations('uploads')
  const [files, setFiles] = React.useState<Array<{ url: string; filename: string; mimeType: string }>>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('files', file)
        const [uploadedFile] = await uploadFiles(formData)
        return {
          url: uploadedFile.data?.url ?? '',
          filename: file.name,
          mimeType: file.type,
        }
      }),
    )

    setFiles(prev => [...prev, ...uploadedFiles])
    onUpload([...files, ...uploadedFiles])
  }, [files, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
  })

  return (
    <div>
      <div {...getRootProps()}
           className="cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>{t('drop_files')}</p>
        ) : (
          <p>{t('drag_drop_files')}</p>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-2">
          <h4>{t('attached_files')}</h4>
          <ul>
            {files.map((file, index) => (
              <li className={'flex items-center gap-1'} key={index}>
                <span>{file.filename}</span>
                <Button type="button" variant={'ghost'} onClick={() => setFiles([])}
                        className="aspect-square rounded-full !p-1">
                  <TrashIcon color={'red'} className={'size-5'} />
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" onClick={() => setFiles([])} variant={'ghost'}
                  className="aspect-square items-center self-end">
            {t('clear_files')}
            <DeleteIcon color={'red'} className={'ml-1 mt-2 size-5'} />
          </Button>
        </div>
      )}
    </div>
  )
}