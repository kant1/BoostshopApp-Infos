import { ref } from 'vue'

const STORAGE_KEY = 'api_auth_token'

function readInitial(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored.trim().length > 0) return stored
  } catch {
    // localStorage indisponible
  }
  return null
}

const token = ref<string | null>(readInitial())

export function useAuthToken() {
  function setToken(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    token.value = trimmed
    try {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } catch {
      // ignore
    }
  }

  function clearToken() {
    token.value = null
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return { token, setToken, clearToken }
}
