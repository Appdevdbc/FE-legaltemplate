<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="edit_document" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Edit File</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Edit File</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Loading State -->
      <q-card-section v-if="loadingDetail" class="tw-bg-white tw-p-12 tw-text-center">
        <q-spinner-dots color="blue-6" size="48px" />
        <div class="tw-text-slate-500 tw-mt-4">Memuat data file...</div>
      </q-card-section>

      <!-- Form Content -->
      <q-card-section v-else class="tw-bg-white tw-p-6">
        <!-- Required field banner -->
        <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm q-mb-lg">
          <template v-slot:avatar>
            <q-icon name="info" color="red" size="24px" />
          </template>
          <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
        </q-banner>

        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
          <!-- Nama File -->
          <q-input
            v-model="form.content_name"
            outlined
            label-slot
            class="tw-rounded-lg"
            :rules="[val => !!val || 'Nama file wajib diisi']"
          >
            <template v-slot:prepend>
              <q-icon name="description" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Nama File</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
          </q-input>

          <!-- Tipe Dokumen -->
          <q-select
            v-model="form.content_type"
            :options="typeOptions"
            outlined
            emit-value
            map-options
            label-slot
            class="tw-rounded-lg"
            :rules="[val => !!val || 'Tipe dokumen wajib dipilih']"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Tipe Dokumen</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
          </q-select>

          <!-- Deskripsi (full width) -->
          <q-input
            v-model="form.content_desc"
            outlined
            label-slot
            type="textarea"
            rows="3"
            class="tw-rounded-lg md:tw-col-span-2"
          >
            <template v-slot:prepend>
              <q-icon name="notes" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Deskripsi</span>
            </template>
          </q-input>

          <!-- Security -->
          <q-select
            v-model="form.content_security"
            :options="securityOptions"
            outlined
            emit-value
            map-options
            label-slot
            class="tw-rounded-lg"
            disabled
          >
            <template v-slot:prepend>
              <q-icon name="security" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Security</span>
            </template>
          </q-select>

          <!-- Keywords -->
          <q-input
            v-model="form.content_keywords"
            outlined
            label-slot
            class="tw-rounded-lg"
          >
            <template v-slot:prepend>
              <q-icon name="label" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Keywords</span>
            </template>
          </q-input>

          <!-- Due Date (conditional on type='renewable') -->
          <q-input
            v-if="form.content_type === 'renewable'"
            v-model="form.content_duedate"
            outlined
            label-slot
            class="tw-rounded-lg"
            :rules="[val => !!val || 'Due date wajib diisi untuk dokumen renewable']"
            readonly
          >
            <template v-slot:prepend>
              <q-icon name="event" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Due Date</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.content_duedate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Tutup" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- BU (read-only in edit) -->
          <q-select
            v-model="form.content_bu"
            :options="buOptions"
            outlined
            emit-value
            map-options
            label-slot
            class="tw-rounded-lg"
            disabled
          >
            <template v-slot:prepend>
              <q-icon name="business" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Business Unit</span>
            </template>
          </q-select>

          <!-- Division (read-only in edit) -->
          <q-input
            v-model="form.content_div"
            outlined
            label-slot
            class="tw-rounded-lg"
            disabled
          >
            <template v-slot:prepend>
              <q-icon name="account_tree" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Division</span>
            </template>
          </q-input>

          <!-- Owner -->
          <q-select
            v-model="form.content_owner"
            :options="filteredOwnerOptions"
            outlined
            emit-value
            map-options
            label-slot
            use-input
            input-debounce="300"
            class="tw-rounded-lg"
            :loading="loadingEmployees"
            @filter="filterOwner"
            :rules="[val => !!val || 'Owner wajib dipilih']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Owner</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Keeper -->
          <q-select
            v-model="form.content_keeper"
            :options="filteredKeeperOptions"
            outlined
            emit-value
            map-options
            label-slot
            use-input
            input-debounce="300"
            class="tw-rounded-lg"
            :loading="loadingEmployees"
            @filter="filterKeeper"
            :rules="[val => !!val || 'Keeper wajib dipilih']"
          >
            <template v-slot:prepend>
              <q-icon name="person_outline" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Keeper</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- DIC -->
          <q-select
            v-model="form.content_dic"
            :options="filteredDicOptions"
            outlined
            emit-value
            map-options
            label-slot
            use-input
            input-debounce="300"
            class="tw-rounded-lg"
            :loading="loadingEmployees"
            @filter="filterDic"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="supervisor_account" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">DIC (Director in Charge)</span>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Current File Info -->
        <div class="tw-mt-6 tw-p-4 tw-bg-slate-50 tw-rounded-lg tw-border tw-border-slate-200">
          <div class="tw-font-semibold tw-text-slate-700 tw-mb-2 tw-flex tw-items-center tw-gap-2">
            <q-icon name="attach_file" color="blue-6" />
            File Saat Ini
          </div>
          <div class="tw-text-sm tw-text-slate-600">
            {{ form.content_file || 'Tidak ada file' }}
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-separator />
      <q-card-actions v-if="!loadingDetail" align="right" class="tw-p-4 tw-bg-slate-50">
        <q-btn
          label="Kembali"
          color="red-7"
          push
          icon="arrow_back"
          @click="goBack"
          class="tw-px-6 tw-font-semibold"
        />
        <q-btn
          label="Simpan"
          color="blue-6"
          push
          icon="save"
          @click="submitForm"
          :loading="submitting"
          class="tw-px-6 tw-font-semibold"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// Route param: file id (encrypted)
const fileId = route.params.id;

// --- Form State ---
const form = ref({
  content_name: "",
  content_desc: "",
  content_type: "non-renewable",
  content_security: "non-restricted",
  content_keywords: "",
  content_duedate: "",
  content_owner: "",
  content_keeper: "",
  content_dic: "",
  content_bu: "",
  content_div: "",
  content_file: "",
});

const loadingDetail = ref(true);
const submitting = ref(false);

// --- Options ---
const typeOptions = [
  { label: "Renewable", value: "renewable" },
  { label: "Non-Renewable", value: "non-renewable" },
];

const securityOptions = [
  { label: "Restricted", value: "restricted" },
  { label: "Non-Restricted", value: "non-restricted" },
];

const buOptions = [
  { label: "DBC", value: "DBC" },
  { label: "DJM", value: "DJM" },
  { label: "WDJR", value: "WDJR" },
  { label: "GBC", value: "GBC" },
  { label: "DFR", value: "DFR" },
  { label: "DTU", value: "DTU" },
  { label: "WTUR", value: "WTUR" },
];

// --- Employee Data ---
const employeeList = ref([]);
const loadingEmployees = ref(false);
const filteredOwnerOptions = ref([]);
const filteredKeeperOptions = ref([]);
const filteredDicOptions = ref([]);

// --- Methods ---

const loadFileDetail = async () => {
  loadingDetail.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/file/${fileId}`);
    const data = res.data;

    form.value.content_name = data.content_name || "";
    form.value.content_desc = data.content_desc || "";
    form.value.content_type = data.content_type || "non-renewable";
    form.value.content_security = data.content_security || "non-restricted";
    form.value.content_keywords = data.content_keywords || "";
    form.value.content_duedate = data.content_duedate
      ? dayjs(data.content_duedate).format("YYYY-MM-DD")
      : "";
    form.value.content_owner = data.content_owner || "";
    form.value.content_keeper = data.content_keeper || "";
    form.value.content_dic = data.content_dic || "";
    form.value.content_bu = data.content_bu || "";
    form.value.content_div = data.content_div || "";
    form.value.content_file = data.content_file || "";
  } catch (err) {
    $q.notify({
      type: "negative",
      message: err?.response?.data?.message || "Gagal memuat data file",
      position: "bottom",
    });
    router.push("/document");
  } finally {
    loadingDetail.value = false;
  }
};

const loadEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/users`, {
      params: { tingkat: 0 },
    });
    employeeList.value = res.data.map((emp) => ({
      label: `${emp.account_nik} - ${emp.employee_name}`,
      value: emp.account_nik,
    }));
  } catch (err) {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}document/permission/users`, {
        params: { tingkat: 3 },
      });
      employeeList.value = res.data.map((emp) => ({
        label: `${emp.account_nik} - ${emp.employee_name}`,
        value: emp.account_nik,
      }));
    } catch (err2) {
      $q.notify({ type: "negative", message: "Gagal memuat data karyawan", position: "bottom" });
    }
  } finally {
    loadingEmployees.value = false;
  }
};

const filterOwner = (val, update) => {
  update(() => {
    if (!val) {
      filteredOwnerOptions.value = employeeList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredOwnerOptions.value = employeeList.value.filter(
        (opt) => opt.label.toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

const filterKeeper = (val, update) => {
  update(() => {
    if (!val) {
      filteredKeeperOptions.value = employeeList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredKeeperOptions.value = employeeList.value.filter(
        (opt) => opt.label.toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

const filterDic = (val, update) => {
  update(() => {
    if (!val) {
      filteredDicOptions.value = employeeList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredDicOptions.value = employeeList.value.filter(
        (opt) => opt.label.toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

const validateForm = () => {
  if (!form.value.content_name.trim()) {
    $q.notify({ type: "warning", message: "Nama file wajib diisi", position: "bottom" });
    return false;
  }
  if (!form.value.content_type) {
    $q.notify({ type: "warning", message: "Tipe dokumen wajib dipilih", position: "bottom" });
    return false;
  }
  if (!form.value.content_owner) {
    $q.notify({ type: "warning", message: "Owner wajib dipilih", position: "bottom" });
    return false;
  }
  if (!form.value.content_keeper) {
    $q.notify({ type: "warning", message: "Keeper wajib dipilih", position: "bottom" });
    return false;
  }
  if (form.value.content_type === "renewable" && !form.value.content_duedate) {
    $q.notify({ type: "warning", message: "Due date wajib diisi untuk dokumen renewable", position: "bottom" });
    return false;
  }
  return true;
};

const submitForm = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  try {
    const payload = {
      content_name: form.value.content_name.trim(),
      content_desc: form.value.content_desc || "",
      content_type: form.value.content_type,
      content_keywords: form.value.content_keywords || "",
      content_duedate: form.value.content_type === "renewable" ? form.value.content_duedate : null,
      content_owner: form.value.content_owner,
      content_keeper: form.value.content_keeper,
      content_dic: form.value.content_dic || null,
    };

    await axios.put(`${import.meta.env.VITE_API}document/file/${fileId}`, payload);

    $q.notify({ type: "positive", message: "File berhasil diperbarui", position: "bottom" });
    router.push("/document");
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal memperbarui file";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push("/document");
};

// --- Lifecycle ---
onMounted(async () => {
  await Promise.all([loadFileDetail(), loadEmployees()]);
});
</script>
