import { UploadForm } from '@/components/upload-form'

export default function UploadPage() {
  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Analyser un document</h1>
          <p className="text-muted-foreground">
            Uploadez une image de document d'identité pour l'analyser automatiquement
          </p>
        </div>
        <UploadForm />
      </div>
    </div>
  )
}