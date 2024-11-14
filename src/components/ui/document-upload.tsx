import React, { useEffect } from 'react'
import { ACCEPTED_FILE_TYPES } from '@/lib/utils'
import { UseFormReturn, UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { FileIcon, UploadIcon } from 'lucide-react'
import Image from 'next/image'

interface DocumentUploadFieldProps {
  field: UseFormRegisterReturn;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  id: string;
  accept?: string;
  existingFile?: FileList | null;
  disabled?: boolean;
  aspectRatio?: 'document' | 'square';
}

const DocumentUploadField = ({
                               field,
                               form,
                               id,
                               existingFile,
                               accept = ACCEPTED_FILE_TYPES.join(', '),
                               disabled = false,
                               aspectRatio = 'document',
                             }: DocumentUploadFieldProps) => {
  const t = useTranslations('common.upload')
  const [currentValue, setCurrentValue] = React.useState<FileList | null>(null);
  const [noFile, setNoFile] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e).then(() => {
      if (e.target.files) {
        setCurrentValue(e.target.files);
      }
    });
  };

  function getPreviewUi() {
    if (!currentValue) return undefined;

    const files = Array.from(currentValue);
    if (files.length === 0) return undefined;
    const fileType = files[0].type;

    if (fileType.startsWith('image/')) {
      return (
        <Image
          width={1024}
          height={1024}
          src={URL.createObjectURL(files[0])}
          alt={files[0].name}
          className={'size-full rounded object-cover'}
        />
      );
    }

    if (fileType.startsWith('application/pdf')) {
      return (
        <div className={"flex size-full flex-col items-center justify-center gap-2 object-cover p-2"}>
          <FileIcon className={'size-8 text-gray-400'} />
          <p className={'text-center text-xs text-gray-400'}>{
            files[0].name
          }</p>
        </div>
      );
    }
  }

  useEffect(() => {
    if (existingFile && (currentValue?.length === 0 || !currentValue)) {
      setCurrentValue(existingFile);
    }
  }, [existingFile, currentValue]);

  useEffect(() => {
    setNoFile((!currentValue || currentValue.length === 0) && (!existingFile || existingFile.length === 0))
  }, [currentValue, existingFile])


  return (
    <div className={`${aspectRatio === 'document' ?  'aspect-document' : 'aspect-square'} relative rounded border-2 border-dashed p-2`}>
      <Input
        {...field}
        type={'file'}
        id={id}
        name={id}
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className={"absolute inset-0 z-0 size-full opacity-0"}
      />
      {noFile && (
        <div className={"flex h-full flex-col items-center justify-center gap-2"}>
          <UploadIcon className={"size-6 text-gray-400"} />
          <p className={"text-center text-xs text-gray-400"}>{t('drag_drop_files_or_click')}</p>
        </div>
      )
      }
      {!noFile && (
        <>
          {getPreviewUi()}
          <Button variant={"ghost"} typeof={"button"} className={"z-1 absolute right-2 top-2 aspect-square size-8 rounded-full bg-red-100 !p-1 text-lg text-red-500"} onClick={() => {
            const emptyFileList = new DataTransfer();
            form.setValue(field.name, emptyFileList.files);
            setCurrentValue(null);
          }}>
            x
          </Button>
        </>
      )}
    </div>
  );
};

export default DocumentUploadField