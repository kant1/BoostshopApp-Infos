<script setup lang="ts">
import { computed, ref } from 'vue'
import QrScanner from '@/components/QrScanner.vue'
import UserHeader from '@/components/UserHeader.vue'
import PointsBalance from '@/components/PointsBalance.vue'
import InvoicesTable from '@/components/InvoicesTable.vue'
import { useUserInfos } from '@/composables/useUserInfos'

const { data, loading, error, load, reset } = useUserInfos()
const scanning = ref(true)

const view = computed<'scanner' | 'loading' | 'error' | 'result'>(() => {
  if (scanning.value) return 'scanner'
  if (loading.value) return 'loading'
  if (error.value) return 'error'
  if (data.value) return 'result'
  return 'scanner'
})

async function onDetect(userId: string) {
  scanning.value = false
  await load(userId)
}

function rescan() {
  reset()
  scanning.value = true
}
</script>

<template>
  <main class="min-h-full">
    <div v-if="view === 'scanner'" class="h-screen">
      <QrScanner @detect="onDetect" />
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
      </div>
      <button
        type="button"
        class="rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-sky-700"
        @click="rescan"
      >
        Réessayer
      </button>
    </div>

    <div v-else-if="view === 'result' && data" class="mx-auto max-w-3xl space-y-4 px-4 py-6 pb-24">
      <UserHeader :user="data.user" />
      <PointsBalance :balance="data.points_balance" />
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
