import { useState, useCallback } from 'react'

export type AnalysisStep = {
  id: string
  status: 'pending' | 'processing' | 'success' | 'error'
  progress?: number
  result?: {
    isValid: boolean
    message?: string
    details?: string[]
  }
}

interface UseDocumentAnalysisOptions {
  onComplete?: (results: AnalysisStep[]) => void
  onError?: (error: Error) => void
}

export function useDocumentAnalysis({
                                      onComplete,
                                      onError,
                                    }: UseDocumentAnalysisOptions = {}) {
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 'format', status: 'pending' },
    { id: 'authenticity', status: 'pending' },
    { id: 'data_extraction', status: 'pending' },
    { id: 'validation', status: 'pending' },
  ])

  const updateStep = useCallback((
    stepId: string,
    updates: Partial<AnalysisStep>
  ) => {
    setSteps(current =>
      current.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    )
  }, [])

  const simulateAnalysis = useCallback(async () => {
    try {
      // Format verification
      updateStep('format', { status: 'processing', progress: 0 })
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 200))
        updateStep('format', { progress: i })
      }
      updateStep('format', {
        status: 'success',
        result: {
          isValid: true,
          message: 'Format valide',
          details: ['PDF conforme aux normes']
        }
      })

      // Authenticity check
      updateStep('authenticity', { status: 'processing', progress: 0 })
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 150))
        updateStep('authenticity', { progress: i })
      }
      updateStep('authenticity', {
        status: 'success',
        result: {
          isValid: true,
          message: 'Document authentique',
          details: ['Signature numérique valide', 'Pas de modification détectée']
        }
      })

      // Data extraction
      updateStep('data_extraction', { status: 'processing', progress: 0 })
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(r => setTimeout(r, 100))
        updateStep('data_extraction', { progress: i })
      }
      updateStep('data_extraction', {
        status: 'success',
        result: {
          isValid: true,
          message: 'Données extraites avec succès',
          details: ['Informations personnelles', 'Dates', 'Numéros de référence']
        }
      })

      // Final validation
      updateStep('validation', { status: 'processing', progress: 0 })
      for (let i = 0; i <= 100; i += 15) {
        await new Promise(r => setTimeout(r, 150))
        updateStep('validation', { progress: i })
      }
      updateStep('validation', {
        status: 'success',
        result: {
          isValid: true,
          message: 'Document validé',
          details: ['Toutes les vérifications sont passées']
        }
      })

      onComplete?.(steps)
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Analyse échouée'))
    }
  }, [steps, updateStep, onComplete, onError])

  return {
    steps,
    simulateAnalysis,
    updateStep,
  }
}