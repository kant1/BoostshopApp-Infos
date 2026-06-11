<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '@/types/user'
import { formatDateOnly, formatEuros } from '@/utils/format'

const props = defineProps<{ invoices: Invoice[] }>()

const sorted = computed(() =>
  [...props.invoices].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
)

const totals = computed(() => ({
  amount: props.invoices.reduce((s, i) => s + (i.amount_eur ?? 0), 0),
  points: props.invoices.reduce((s, i) => s + (i.points ?? 0), 0),
}))
</script>

<template>
  <section class="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div class="mb-3 flex items-baseline justify-between">
      <h3 class="text-lg font-semibold">Factures</h3>
      <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ invoices.length }} au total</span>
    </div>

    <p v-if="invoices.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
      Aucune facture.
    </p>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden overflow-x-auto sm:block">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left text-xs uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th class="py-2 pr-3 font-medium">Date</th>
              <th class="py-2 pr-3 font-medium">Réf.</th>
              <th class="py-2 pr-3 text-right font-medium">Montant</th>
              <th class="py-2 pr-3 text-right font-medium">Points</th>
              <th class="py-2 font-medium">PDF</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inv in sorted"
              :key="inv.id"
              class="border-b last:border-0 dark:border-zinc-800"
            >
              <td class="py-2 pr-3">{{ formatDateOnly(inv.created_at) }}</td>
              <td class="py-2 pr-3 font-mono text-xs">{{ inv.external_id }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ formatEuros(inv.amount_eur) }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ inv.points }}</td>
              <td class="py-2">
                <a
                  v-if="inv.url"
                  :href="inv.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sky-600 hover:underline dark:text-sky-400"
                >
                  Ouvrir
                </a>
                <span v-else class="text-zinc-400">—</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 font-semibold dark:border-zinc-700">
              <td class="py-2 pr-3" colspan="2">Total</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ formatEuros(totals.amount) }}</td>
              <td class="py-2 pr-3 text-right tabular-nums">{{ totals.points }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Mobile cards -->
      <ul class="space-y-2 sm:hidden">
        <li
          v-for="inv in sorted"
          :key="inv.id"
          class="rounded-xl border bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div class="flex items-baseline justify-between">
            <span class="font-medium">{{ formatDateOnly(inv.created_at) }}</span>
            <span class="font-semibold tabular-nums">{{ formatEuros(inv.amount_eur) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span class="font-mono">{{ inv.external_id }}</span>
            <span>{{ inv.points }} pts</span>
          </div>
          <a
            v-if="inv.url"
            :href="inv.url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 inline-block text-sm text-sky-600 hover:underline dark:text-sky-400"
          >
            Ouvrir le PDF →
          </a>
        </li>
        <li class="rounded-xl border-2 border-zinc-300 bg-white p-3 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-900">
          <div class="flex justify-between">
            <span>Total</span>
            <span class="tabular-nums">{{ formatEuros(totals.amount) }}</span>
          </div>
          <div class="flex justify-between text-zinc-500 dark:text-zinc-400">
            <span>Points cumulés</span>
            <span class="tabular-nums">{{ totals.points }}</span>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>
