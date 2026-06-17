<template>
  <q-dialog v-model="isOpen">
    <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${props.domain}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="notifications" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Pengaturan Notifikasi</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="settings" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Notifikasi</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <div class="tw-space-y-6">
          <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
            <template v-slot:avatar>
              <q-icon name="info" color="red" size="24px"/>
            </template>
            <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
          </q-banner>

          <div>
            <q-input
              v-model="tmpForm.user_email"
              outlined
              class="tw-rounded-xl"
              :rules="[val => !!val || 'Field is required']"
              label-slot
            >
              <template v-slot:prepend>
                <div class="tw-flex tw-gap-1">
                  <q-icon name="mail" size="16px" class="tw-text-blue-600"/>
                </div>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Email</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
            </q-input>
          </div>

          <div>
            <q-input
              v-model="tmpForm.user_phone"
              outlined
              class="tw-rounded-xl"
              :rules="[val => !!val || 'Field is required']"
              @keypress="(e) => !/[0-9]/.test(e.key) && e.preventDefault()"
              counter
              maxlength="15"
              label-slot
            >
              <template v-slot:prepend>
                <div class="tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-bg-blue-50 tw-rounded-lg">
                  <q-icon name="phone" size="16px" class="tw-text-blue-600"/>
                  <span class="tw-text-xs tw-font-medium tw-text-blue-600">ID</span>
                </div>
              </template>
              <template v-slot:label>
                <span class="tw-font-semibold tw-text-slate-700">Nomor Whatsapp</span>
                <span class="tw-text-red-500 tw-font-bold">*</span>
              </template>
            </q-input>
            <p class="tw-text-xs tw-text-gray-500 tw-mt-1">Contoh : 081456789xxx (8-15 digit)</p>
          </div>

          <q-btn
            label="Simpan"
            color="blue-6"
            unelevated
            no-caps
            icon="save"
            class="tw-w-full tw-py-3 tw-px-6 tw-font-bold tw-rounded-xl tw-shadow-lg hover:tw-shadow-xl hover:tw-scale-[1.02] tw-transition-all tw-duration-300"
            @click="validateNotifikasi"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import * as yup from 'yup';
import { empid, domain } from './../utils';
import { useNotify } from './../composables/useNotify';

const $q = useQuasar();
const { success, error } = useNotify();

const props = defineProps({
  modelValue: Boolean,
  domain: String
});

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const tmpForm = reactive({
  user_email: '',
  user_phone: '',
  empid: empid()
});

const schema = yup.object({
  user_email: yup.string().email("Format email tidak valid").required("Email wajib diisi").nullable(),
  user_phone: yup.string().min(8, "Nomor WhatsApp minimal 8 digit").max(15, "Nomor WhatsApp maksimal 15 digit").required("No. Whatsapp wajib diisi").nullable(),
});

const validateNotifikasi = async () => {
  let validate = {
    user_email: tmpForm.user_email,
    user_phone: tmpForm.user_phone,
  };
  schema.validate(validate, { abortEarly: false })
    .then(() => {
      saveDialog();
    })
    .catch(err => {
      err.inner.forEach(e => {
        error(e.message);
      });
    });
};

const saveDialog = async () => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Pastikan data yang anda isi sudah sesuai?`,
    html: true,
    class: `side-${props.domain} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color: "blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await saveNotifikasi();
    } catch (error) {
      console.log(error);
    }
  });
};

const saveNotifikasi = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API}design/saveNotifikasi`, tmpForm, {
      skipErrorInterceptor: true
    });
    success('Data berhasil diubah');
    isOpen.value = false;
  } catch (err) {
    error(err?.response?.data?.message || err?.message || 'Gagal mengubah data');
  }
};

const getDataNotifikasi = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API}design/getDataNotifikasi`, {
      empid: empid()
    }, {
      skipErrorInterceptor: true
    });
    res.data.forEach(element => {
      tmpForm.user_email = element.user_email == null ? '' : element.user_email;
      tmpForm.user_phone = element.user_phone == null ? '' : element.user_phone;
    });
  } catch (err) {
    error(err?.response?.data?.message || err?.message || 'Gagal memuat data');
  }
};

onMounted(() => {
  //getDataNotifikasi();
});
</script>
