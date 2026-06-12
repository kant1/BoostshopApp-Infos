<script setup lang="ts">
import { computed, ref } from 'vue'
import QrScanner from '@/components/QrScanner.vue'
import TokenPrompt from '@/components/TokenPrompt.vue'
import UserHeader from '@/components/UserHeader.vue'
import PointsBalance from '@/components/PointsBalance.vue'
import RedeemActions from '@/components/RedeemActions.vue'
import InvoicesTable from '@/components/InvoicesTable.vue'
import { useUserInfos } from '@/composables/useUserInfos'
import { useAuthToken } from '@/composables/useAuthToken'

const { token, setToken, clearToken } = useAuthToken()
const { data, loading, error, errorStatus, load, reset } = useUserInfos()
const scanning = ref(true)

const view = computed<'token' | 'scanner' | 'loading' | 'error' | 'result'>(() => {
  if (!token.value) return 'token'
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  if (data.value) return 'result'
  if (scanning.value) return 'scanner'
  return 'scanner'
})

const isAuthError = computed(
  () => errorStatus.value === 401 || errorStatus.value === 403,
)

async function onDetect(userId: string) {
  scanning.value = false
  if (!token.value) return
  await load(userId, token.value)
}

function rescan() {
  reset()
  scanning.value = true
}

function onTokenSubmit(value: string) {
  setToken(value)
  reset()
  scanning.value = true
}

function changeToken() {
  clearToken()
  reset()
  scanning.value = true
}
</script>

<template>
  <main class="min-h-full">
    <TokenPrompt v-if="view === 'token'" :initial="token" @submit="onTokenSubmit" />

    <div v-else-if="view === 'scanner'" class="relative h-screen">
      <QrScanner @detect="onDetect" />
      <button
        type="button"
        class="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow hover:bg-white dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-900"
        @click="changeToken"
      >
        Changer le token
      </button>
    </div>

    <div v-else-if="view === 'loading'" class="flex h-screen items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
        <p class="text-sm text-zinc-600 dark:text-zinc-400">Chargement des informations…</p>
      </div>
    </div>

    <div v-else-if="view === 'error'" class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <div class="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
        <h2 class="text-lg font-semibold">Erreur</h2>
        <p class="mt-2 break-words text-sm">{{ error }}</p>
        <p v-if="isAuthError" class="mt-2 text-xs text-red-700 dark:text-red-300">
          Le token semble invalide. Veuillez le mettre à jour.
        </p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          class="rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-sky-700"
          @click="rescan"
        >
          Réessayer
        </button>
        <button
          type="button"
          class="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          @click="changeToken"
        >
          Changer le token
        </button>
      </div>
    </div>

    <div v-else-if="view === 'result' && data" class="mx-auto max-w-3xl space-y-4 px-4 py-6 pb-24">
      <UserHeader :user="data.user" />
      <PointsBalance :balance="data.points_balance" />
      <RedeemActions
        v-if="token"
        :user-id="data.user.id"
        :token="token"
        :balance="data.points_balance"
        @redeemed="() => token && load(data!.user.id, token)"
      />
      <InvoicesTable :invoices="data.invoices" />

      <button
        type="button"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700"
        @click="rescan"
      >
        Scanner un autre
      </button>
    </div>
  </main>
</template>
