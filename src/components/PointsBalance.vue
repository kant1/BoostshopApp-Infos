<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ balance: number }>()

const label = computed(() => (Math.abs(props.balance) <= 1 ? 'point' : 'points'))
</script>

<template>
  <section
    class="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center shadow-sm dark:border-amber-900/50 dark:from-amber-950 dark:to-amber-900/40"
  >
    <div class="text-sm font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
      Solde de points
    </div>
    <div class="mt-1 text-5xl font-extrabold text-amber-900 dark:text-amber-100">
      {{ balance.toLocaleString('fr-FR') }}
    </div>
    <div class="mt-1 text-sm text-amber-700 dark:text-amber-300">{{ label }}</div>
  </section>
</template>
