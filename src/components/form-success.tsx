import { CheckCircledIcon } from '@radix-ui/react-icons'

type FormSuccessProps = {
  message?: string
}

export function FormSuccess({ message }: Readonly<FormSuccessProps>) {
  return (
    <>
      {message && (
        <div className="flex items-center space-x-2 rounded-md bg-emerald-100 p-3 text-sm text-emerald-500">
          <CheckCircledIcon className={'size-4'} />
          <p>{message}</p>
        </div>
      )}
    </>
  )
}