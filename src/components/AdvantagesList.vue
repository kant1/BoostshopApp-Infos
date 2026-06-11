<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ advantages: unknown[] | null }>()

const items = computed(() => (Array.isArray(props.advantages) ? props.advantages : []))

function entries(item: unknown): Array<[string, unknown]> {
  if (item && typeof item === 'object') return Object.entries(item as Record<string, unknown>)
  return [['valeur', item]]
}

function display(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
</script>

<template>
  <section class="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <h3 class="mb-3 text-lg font-semibold">Avantages</h3>
    <p v-if="items.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
      Aucun avantage.
    </p>
    <ul v-else class="space-y-3">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="rounded-xl border bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <template v-for="[k, v] in entries(item)" :key="k">
            <dt class="font-medium text-zinc-500 dark:text-zinc-400">{{ k }}</dt>
            <dd class="break-words">{{ display(v) }}</dd>
          </template>
        </dl>
      </li>
    </ul>
  </section>
</template>
