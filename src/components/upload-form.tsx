"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle, FileText } from "lucide-react"
import axios from 'axios'

interface DocumentMetadata {
  documentType: string;
  documentNumber: string;
  holderName: string;
  issueDate: string;
  expiryDate: string;
  birthDate: string;
  nationality: string;
  [key: string]: string;
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ metadata: DocumentMetadata } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image (JPEG ou PNG).")
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (selectedFile.size > maxSize) {
      setError(`Le fichier dépasse la taille maximale de ${maxSize / (1024 * 1024)}MB.`)
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          console.log(`Upload: ${percentCompleted}%`)
        }
      })
      setResult(response.data)
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'analyse.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatFieldName = (key: string): string => {
    const fieldNames: Record<string, string> = {
      documentType: "Type de document",
      documentNumber: "Numéro du document",
      holderName: "Titulaire",
      issueDate: "Date d'émission",
      expiryDate: "Date d'expiration",
      birthDate: "Date de naissance",
      nationality: "Nationalité"
    }
    return fieldNames[key] || key
  }

  const formatValue = (value: string): string => {
    if (!value || value === "Non trouvé") return "Non disponible"
    // Format des dates si c'est une date valide
    if (value.match(/^\d{2}[./]\d{2}[./]\d{4}$/)) {
      try {
        const [day, month, year] = value.split(/[./]/)
        return new Date(`${year}-${month}-${day}`).toLocaleDateString('fr-FR')
      } catch {
        return value
      }
    }
    return value
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="cursor-pointer"
              />
              {file && (
                <div className="mt-2 text-sm text-gray-500">
                  <FileText className="inline-block w-4 h-4 mr-1" />
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                </div>
              )}
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyser
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Résultats de l'analyse</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(result.metadata)
              .filter(([key]) => key !== 'rawText') // Exclure le texte brut
              .map(([key, value]) => (
                <div key={key} className="border rounded-lg p-3">
                  <dt className="text-sm font-medium text-gray-500">
                    {formatFieldName(key)}
                  </dt>
                  <dd className="mt-1 text-sm">
                    {formatValue(value)}
                  </dd>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}