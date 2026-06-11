<script setup lang="ts">
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

const emit = defineEmits<{
  (e: 'detect', userId: string): void
}>()

const cameraError = ref<string | null>(null)
const paused = ref(false)

type DetectedBarcode = { rawValue: string }

function onDetect(results: DetectedBarcode[]) {
  const raw = results?.[0]?.rawValue?.trim()
  if (!raw) return
  paused.value = true
  emit('detect', raw)
}

function onCameraError(err: unknown) {
  const name = (err as { name?: string })?.name ?? ''
  switch (name) {
    case 'NotAllowedError':
      cameraError.value = "Accès caméra refusé. Autorisez l'accès dans votre navigateur."
      break
    case 'NotFoundError':
      cameraError.value = 'Aucune caméra détectée sur cet appareil.'
      break
    case 'NotSupportedError':
    case 'InsecureContextError':
      cameraError.value = 'La caméra requiert un contexte sécurisé (HTTPS ou localhost).'
      break
    case 'NotReadableError':
      cameraError.value = 'La caméra est déjà utilisée par une autre application.'
      break
    case 'OverconstrainedError':
      cameraError.value = 'Aucune caméra compatible avec les contraintes demandées.'
      break
    case 'StreamApiNotSupportedError':
      cameraError.value = "Votre navigateur ne supporte pas l'accès à la caméra."
      break
    default:
      cameraError.value = `Erreur caméra : ${(err as Error)?.message ?? 'inconnue'}`
  }
}

function rescan() {
  cameraError.value = null
  paused.value = false
}

defineExpose({ rescan })
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
    <div class="text-center">
      <h1 class="text-2xl font-bold">Scanner un QR code</h1>
      <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Pointez la caméra vers le QR code utilisateur.
      </p>
    </div>

    <div
      class="relative w-full max-w-md overflow-hidden rounded-2xl border bg-black shadow-lg aspect-square"
    >
      <QrcodeStream
        :paused="paused"
        @detect="onDetect"
        @error="onCameraError"
        class="h-full w-full"
      />
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="h-2/3 w-2/3 rounded-xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>
    </div>

    <div v-if="cameraError" class="w-full max-w-md rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
      {{ cameraError }}
    </div>

    <button
      v-if="paused"
      type="button"
      class="rounded-full bg-sky-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-sky-700"
      @click="rescan"
    >
      Re-scanner
    </button>
  </div>
</template>
