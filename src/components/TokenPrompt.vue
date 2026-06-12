<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ initial?: string | null }>()
const emit = defineEmits<{ (e: 'submit', token: string): void }>()

const value = ref(props.initial ?? '')
const show = ref(false)

const canSubmit = computed(() => value.value.trim().length > 0)

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', value.value.trim())
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6">
    <form
      class="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      @submit.prevent="onSubmit"
    >
      <h1 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Token d'authentification
      </h1>
      <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Saisissez le token utilisé pour appeler l'API.
      </p>

      <label class="mt-5 block text-sm font-medium text-zinc-700 dark:text-zinc-300" for="token">
        Token
      </label>
      <div class="mt-1 flex gap-2">
        <input
          id="token"
          v-model="value"
          :type="show ? 'text' : 'password'"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          placeholder="Token d'authentification"
          class="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-sky-900"
        />
        <button
          type="button"
          class="rounded-xl border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          @click="show = !show"
        >
          {{ show ? 'Masquer' : 'Afficher' }}
        </button>
      </div>

      <button
        type="submit"
        :disabled="!canSubmit"
        class="mt-5 w-full rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continuer
      </button>
    </form>
  </div>
</template>
