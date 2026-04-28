<template>
  <BaseModal
    :model-value="modelValue"
    title="Alamat Utama Diperlukan"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div
        class="rounded-xl border p-3 sm:p-4"
        :class="[themeClass.border.warning, themeClass.background.mist]"
      >
        <p class="ui-body font-medium" :class="themeClass.text.secondary">
          Transaksi belum bisa dibuat karena Anda belum memiliki alamat utama.
        </p>
        <p class="ui-caption mt-2" :class="themeClass.text.subtleMeta">
          Supaya proses Quick Action berjalan lancar, silakan atur alamat utama terlebih dahulu.
        </p>
      </div>

      <div>
        <p class="ui-label mb-2" :class="themeClass.text.secondary">Langkah cepat</p>
        <ol class="list-decimal space-y-1 pl-5">
          <li class="ui-caption" :class="themeClass.text.secondary">Masuk ke menu Profile.</li>
          <li class="ui-caption" :class="themeClass.text.secondary">
            Scroll ke bagian paling bawah.
          </li>
          <li class="ui-caption" :class="themeClass.text.secondary">Klik tombol Tambah Alamat.</li>
          <li class="ui-caption" :class="themeClass.text.secondary">
            Isi data alamat lalu simpan.
          </li>
          <li class="ui-caption" :class="themeClass.text.secondary">
            Klik ikon bintang untuk menjadikannya alamat utama.
          </li>
        </ol>
      </div>

      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <BaseButton
          label="Pergi ke Profile"
          icon="fa-solid fa-user"
          variant="teal"
          class="w-full"
          @click="emit('go-profile')"
        />
        <BaseButton label="Nanti saja" variant="secondary" class="w-full" @click="emit('close')" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'go-profile'): void;
    (e: 'close'): void;
  }>();

  const themeClass = useColorClass();
</script>
