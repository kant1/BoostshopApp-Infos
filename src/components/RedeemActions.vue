<script setup lang="ts">
import { computed, ref } from 'vue'
import { ApiError, redeemPoints } from '@/services/api'

const props = defineProps<{ userId: string; token: string; balance: number }>()
const emit = defineEmits<{ (e: 'redeemed', newBalance: number): void }>()

interface RewardOption {
  key: string
  label: string
  cost: number | null // null = montant libre
}

const options: RewardOption[] = [
  { key: 'brake_clean_2', label: '2 brake clean', cost: 500 },
  { key: 'engine_flush_1', label: '1 engine flush', cost: 1000 },
  { key: 'mecacyl_1', label: '1 produit Mecacyl', cost: 1500 },
  { key: 'tshirt_hard_1', label: '1 tshirt Hard', cost: 2500 },
  { key: 'sweat_hard_1', label: '1 sweat Hard', cost: 5000 },
  { key: 'diagnostic_custom', label: '1 diagnostic sur mesure', cost: 10000 },
  { key: 'mo_std_2h', label: '2h de MO std', cost: 15000 },
  { key: 'reduction', label: 'Réduction', cost: null },
]

const pendingKey = ref<string | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const customAmount = ref<number | null>(null)

const formattedBalance = computed(() => props.balance.toLocaleString('fr-FR'))

async function onClick(opt: RewardOption) {
  error.value = null
  success.value = null

  let amount = opt.cost
  if (opt.cost === null) {
    const val = customAmount.value
    if (!val || val <= 0 || !Number.isFinite(val)) {
      error.value = 'Saisir un montant de réduction valide.'
      return
    }
    amount = Math.floor(val)
  }

  if (amount! > props.balance) {
    error.value = 'Solde insuffisant.'
    return
  }

  if (!confirm(`Confirmer : ${opt.label} (-${amount!.toLocaleString('fr-FR')} pts) ?`)) return

  pendingKey.value = opt.key
  try {
    const res = await redeemPoints(props.userId, props.token, opt.key, amount!)
    success.value = `${opt.label} validé (-${amount!.toLocaleString('fr-FR')} pts).`
    emit('redeemed', res.points_balance)
    if (opt.cost === null) customAmount.value = null
  } catch (e) {
    error.value =
      e instanceof ApiError
        ? `Erreur ${e.status} : ${e.message}`
        : e instanceof Error
          ? e.message
          : String(e)
  } finally {
    pendingKey.value = null
  }
}
</script>

<template>
  <section
    class="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
  >
    <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
      Utiliser les points
    </h3>
    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
      Solde disponible : {{ formattedBalance }} pts
    </p>

    <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <template v-for="opt in options" :key="opt.key">
        <div v-if="opt.cost === null" class="flex flex-col gap-1 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
          <label class="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {{ opt.label }} (montant libre)
          </label>
          <div class="flex gap-2">
            <input
              v-model.number="customAmount"
              type="number"
              min="1"
              step="1"
              placeholder="pts"
              class="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <button
              type="button"
              :disabled="pendingKey !== null"
              class="flex-1 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="onClick(opt)"
            >
              {{ pendingKey === opt.key ? '…' : 'Valider' }}
            </button>
          </div>
        </div>
        <button
          v-else
          type="button"
          :disabled="pendingKey !== null || opt.cost > balance"
          class="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-left text-sm font-medium text-zinc-800 transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-sky-600 dark:hover:bg-sky-950/30"
          @click="onClick(opt)"
        >
          <span>{{ opt.label }}</span>
          <span class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            {{ pendingKey === opt.key ? '…' : `${opt.cost.toLocaleString('fr-FR')} pts` }}
          </span>
        </button>
      </template>
    </div>

    <p v-if="error" class="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
      {{ error }}
    </p>
    <p v-if="success" class="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
      {{ success }}
    </p>
  </section>
</template>
