<script setup lang="ts">
import { computed, ref } from 'vue'
import { ApiError, creditPoints } from '@/services/api'

const props = defineProps<{ userId: string; token: string }>()
const emit = defineEmits<{ (e: 'credited'): void }>()

interface CreditReason {
  key: string
  label: string
}

/** Motifs de crédit : la `key` sert de clé d'idempotence côté edge function. */
const reasons: CreditReason[] = [
  { key: 'geste_commercial', label: 'Geste commercial' },
  { key: 'bonus', label: 'Bonus / opération spéciale' },
  { key: 'correction', label: 'Correction de solde' },
  { key: 'autre', label: 'Autre' },
]

const amount = ref<number | null>(null)
const reasonKey = ref<string>(reasons[0].key)
const pending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const selectedReason = computed(
  () => reasons.find((r) => r.key === reasonKey.value) ?? reasons[0],
)

const isValid = computed(() => {
  const val = amount.value
  return val !== null && Number.isFinite(val) && val > 0 && Number.isInteger(val)
})

async function onSubmit() {
  error.value = null
  success.value = null

  const val = amount.value
  if (val === null || !Number.isFinite(val) || val <= 0) {
    error.value = 'Saisir un nombre de points valide (entier positif).'
    return
  }
  const points = Math.floor(val)
  const label = selectedReason.value.label
  const formatted = points.toLocaleString('fr-FR')

  if (!confirm(`Confirmer : créditer +${formatted} pts (${label}) ?`)) return

  pending.value = true
  try {
    await creditPoints(props.userId, props.token, `credit_${selectedReason.value.key}`, points)
    success.value = `+${formatted} pts crédités (${label}).`
    amount.value = null
    emit('credited')
  } catch (e) {
    error.value =
      e instanceof ApiError
        ? `Erreur ${e.status} : ${e.message}`
        : e instanceof Error
          ? e.message
          : String(e)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section
    class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
  >
    <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
      Créditer des points
    </h3>
    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
      Ajoute des points sans facture liée (geste commercial, bonus, correction…).
    </p>

    <form class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" @submit.prevent="onSubmit">
      <div class="flex flex-1 flex-col gap-1">
        <label for="credit-reason" class="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Motif
        </label>
        <select
          id="credit-reason"
          v-model="reasonKey"
          class="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <option v-for="r in reasons" :key="r.key" :value="r.key">{{ r.label }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label for="credit-amount" class="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Points
        </label>
        <input
          id="credit-amount"
          v-model.number="amount"
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          placeholder="pts"
          class="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none sm:w-28 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <button
        type="submit"
        :disabled="pending || !isValid"
        class="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ pending ? '…' : 'Créditer' }}
      </button>
    </form>

    <p v-if="error" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
      {{ error }}
    </p>
    <p v-if="success" class="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
      {{ success }}
    </p>
  </section>
</template>
