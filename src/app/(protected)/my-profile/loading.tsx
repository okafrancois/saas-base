import CustomLoader from '@/components/ui/custom-loader'

export default function Loading() {
  return (
    <div className={'container flex size-full items-center justify-center'}>
      <CustomLoader />
    </div>
  )
}