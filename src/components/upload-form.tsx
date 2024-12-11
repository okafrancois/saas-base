"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

// Pour l'exemple, on fait juste un console.log du fichier
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Input type="file" onChange={handleFileChange} accept="image/*" />

      <Button
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </Button>
    </div>
  )
}