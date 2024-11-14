const STORAGE_KEY = 'consular_form_data'

export function saveFormData(data: any) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving form data:', error)
  }
}

export function loadFormData() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading form data:', error)
    return null
  }
}

export function clearFormData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing form data:', error)
  }
}

export function useFormStorage() {
  const loadSavedData = () => {
    return loadFormData()
  }

  const saveData = (data: any) => {
    saveFormData(data)
  }

  const clearData = () => {
    clearFormData()
  }

  return {
    loadSavedData,
    saveData,
    clearData,
  }
}