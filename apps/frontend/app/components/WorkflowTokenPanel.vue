<script setup lang="ts">
import BaseBadge from '../../../../packages/ui/components/base/badge/index.vue'

defineProps<{
  token: string
  connectionLabel?: string
  isConnected?: boolean
  showDisconnect?: boolean
  errorMessage?: string | null
  debugMessage?: string
  getStatusBadge: (status: string) => { variantText: string, variantBGColor: string }
}>()

const emit = defineEmits<{
  updateToken: [value: string]
  disconnect: []
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 lg:grid-cols-[1.4fr_auto]">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">JWT Token</span>
        <textarea
          :value="token"
          rows="3"
          placeholder="Masukkan JWT. Format raw atau Bearer <token> keduanya diterima."
          class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          @input="emit('updateToken', ($event.target as HTMLTextAreaElement).value)"
        />
        <p class="text-xs text-slate-500">
          FE akan menormalkan prefix <code>Bearer</code> secara otomatis.
        </p>
      </label>

      <div class="flex flex-wrap items-end gap-3">
        <button
          v-if="showDisconnect"
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          @click="emit('disconnect')"
        >
          Disconnect
        </button>
        <BaseBadge
          v-if="connectionLabel"
          rounded="full"
          text-size="xs"
          v-bind="isConnected ? getStatusBadge('running') : getStatusBadge('pending')"
        >
          {{ connectionLabel }}
        </BaseBadge>
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="debugMessage"
      class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700"
    >
      {{ debugMessage }}
    </p>
  </div>
</template>
