import { ConsularFormData } from '@/schemas/registration'

const STORAGE_KEY = 'registration_form'

export function saveFormProgress(data: Partial<ConsularFormData>, getCurrentStep: () => number) {
  try {
    const existingData = loadFormProgress()
    const updatedData = { ...existingData, ...data }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      data: updatedData,
      lastUpdated: new Date().toISOString(),
      step: getCurrentStep()
    }))
  } catch (error) {
    console.error('Error saving form progress:', error)
  }
}

export function loadFormProgress(): Partial<ConsularFormData> | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved).data : null
  } catch (error) {
    console.error('Error loading form progress:', error)
    return null
  }
}