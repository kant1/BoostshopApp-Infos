<script setup lang="ts">
import { computed } from 'vue'
import type { UserCore } from '@/types/user'
import { formatDate, getInitials } from '@/utils/format'

const props = defineProps<{ user: UserCore }>()

const avatarUrl = computed(
  () => props.user.user_metadata?.avatar_url || props.user.user_metadata?.picture || '',
)

const displayName = computed(
  () =>
    props.user.user_metadata?.full_name ||
    props.user.user_metadata?.name ||
    props.user.email,
)

const initials = computed(() => getInitials(displayName.value, '?'))

const provider = computed(() => props.user.app_metadata?.provider)
const companyId = computed(() => props.user.app_metadata?.company_id)
</script>

<template>
  <section class="rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div class="flex items-center gap-4">
      <div class="relative h-16 w-16 shrink-0">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          referrerpolicy="no-referrer"
          alt=""
          class="h-16 w-16 rounded-full object-cover ring-2 ring-sky-500/40"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div
          v-else
          class="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-200"
        >
          {{ initials }}
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="truncate text-xl font-semibold">{{ displayName }}</h2>
        <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span class="truncate">{{ user.email }}</span>
          <span
            v-if="user.user_metadata?.email_verified"
            class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
          >
            vérifié
          </span>
        </div>
        <div v-if="user.phone" class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          📞 {{ user.phone }}
        </div>
      </div>
    </div>

    <dl class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      <div v-if="provider">
        <dt class="text-zinc-500 dark:text-zinc-400">Provider</dt>
        <dd class="font-medium capitalize">{{ provider }}</dd>
      </div>
      <div v-if="companyId">
        <dt class="text-zinc-500 dark:text-zinc-400">Company ID</dt>
        <dd class="font-mono text-xs">{{ companyId }}</dd>
      </div>
      <div>
        <dt class="text-zinc-500 dark:text-zinc-400">Inscrit le</dt>
        <dd class="font-medium">{{ formatDate(user.created_at) }}</dd>
      </div>
      <div>
        <dt class="text-zinc-500 dark:text-zinc-400">Dernière connexion</dt>
        <dd class="font-medium">{{ formatDate(user.last_sign_in_at) }}</dd>
      </div>
    </dl>

    <div class="mt-3 truncate font-mono text-[10px] text-zinc-400">id: {{ user.id }}</div>
  </section>
</template>
