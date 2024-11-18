import { useEffect, useRef } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { debounce } from 'lodash'

export function useFormAutosave<T extends FieldValues>(
  form: UseFormReturn<T>,
  key: string,
  debounceMs = 1000
) {
  const formData = form.watch()

  // Référence pour le timeout de debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Sauvegarder dans le sessionStorage
  const saveToStorage = (data: T) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }

  // Charger depuis le sessionStorage
  const loadFromStorage = (): T | null => {
    try {
      const saved = sessionStorage.getItem(key)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Error loading form data:', error)
      return null
    }
  }

  // Sauvegarder avec debounce
  const debouncedSave = debounce(saveToStorage, debounceMs)

  // Effet pour la sauvegarde automatique
  useEffect(() => {
    debouncedSave(formData)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData])

  // Charger les données au montage
  useEffect(() => {
    const savedData = loadFromStorage()
    if (savedData) {
      form.reset(savedData)
    }
  }, [])

  return {
    clearSavedData: () => sessionStorage.removeItem(key),
    hasSavedData: () => !!loadFromStorage(),
  }
}