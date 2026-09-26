import { ref } from 'vue'
import type { UserInfosResponse } from '@/types/user'
import { ApiError, fetchUserInfos, type UserLookup } from '@/services/api'
import { isEmail, isUuid } from '@/utils/format'

export function useUserInfos() {
  const data = ref<UserInfosResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const errorStatus = ref<number | null>(null)

  async function load(lookup: UserLookup, token: string) {
    error.value = null
    errorStatus.value = null
    data.value = null

    let normalized: UserLookup
    if ('userId' in lookup) {
      const id = lookup.userId.trim()
      if (!isUuid(id)) {
        error.value = `QR code invalide : « ${id} » n'est pas un identifiant utilisateur.`
        return
      }
      normalized = { userId: id }
    } else {
      const email = lookup.email.trim()
      if (!isEmail(email)) {
        error.value = `Adresse e-mail invalide : « ${email} ».`
        return
      }
      normalized = { email }
    }

    loading.value = true
    try {
      data.value = await fetchUserInfos(normalized, token)
    } catch (e) {
      if (e instanceof ApiError) {
        errorStatus.value = e.status
        error.value =
          e.status === 404 && 'email' in normalized
            ? `Aucun utilisateur trouvé pour « ${normalized.email} ».`
            : e.message
      } else {
        error.value = e instanceof Error ? e.message : String(e)
      }
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
