<script setup lang="ts">
import { computed, ref } from 'vue'
import { isEmail } from '@/utils/format'

const emit = defineEmits<{ (e: 'submit', email: string): void }>()

const value = ref('')
const canSubmit = computed(() => isEmail(value.value))

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', value.value.trim())
}
</script>

<template>
  <form
    class="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    @submit.prevent="onSubmit"
  >
    <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300" for="lookup-email">
      Ou saisissez l'adresse e-mail de l'utilisateur
    </label>
    <div class="mt-1 flex gap-2">
      <input
        id="lookup-email"
        v-model="value"
        type="email"
        inputmode="email"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        placeholder="utilisateur@exemple.fr"
        class="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-sky-900"
      />
      <button
        type="submit"
        :disabled="!canSubmit"
        class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Rechercher
      </button>
    </div>
  </form>
</template>
