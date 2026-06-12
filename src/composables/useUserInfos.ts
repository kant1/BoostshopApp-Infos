import { ref } from 'vue'
import type { UserInfosResponse } from '@/types/user'
import { ApiError, fetchUserInfos } from '@/services/api'
import { isUuid } from '@/utils/format'

export function useUserInfos() {
  const data = ref<UserInfosResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const errorStatus = ref<number | null>(null)

  async function load(userId: string, token: string) {
    const id = userId.trim()
    error.value = null
    errorStatus.value = null
    data.value = null

    if (!isUuid(id)) {
      error.value = `QR code invalide : « ${id} » n'est pas un identifiant utilisateur.`
      return
    }

    loading.value = true
    try {
      data.value = await fetchUserInfos(id, token)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      if (e instanceof ApiError) errorStatus.value = e.status
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = null
    error.value = null
    errorStatus.value = null
    loading.value = false
  }

  return { data, loading, error, errorStatus, load, reset }
}
