<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="upload_file" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Upload File Baru</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Upload File</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Form Content -->
      <q-card-section class="tw-bg-white tw-p-6">
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
            v-model="form.name"
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
            v-model="form.type"
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
            v-model="form.desc"
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
            v-model="form.security"
            :options="securityOptions"
            outlined
            emit-value
            map-options
            label-slot
            class="tw-rounded-lg"
            :rules="[val => !!val || 'Security wajib dipilih']"
          >
            <template v-slot:prepend>
              <q-icon name="security" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Security</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
          </q-select>

          <!-- Keywords -->
          <q-input
            v-model="form.keywords"
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
            v-if="form.type === 'renewable'"
            v-model="form.duedate"
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
                  <q-date v-model="form.duedate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Tutup" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- BU -->
          <q-select
            v-model="form.bu"
            :options="buOptions"
            outlined
            emit-value
            map-options
            label-slot
            class="tw-rounded-lg"
            :rules="[val => !!val || 'BU wajib dipilih']"
          >
            <template v-slot:prepend>
              <q-icon name="business" color="blue-6" />
            </template>
            <template v-slot:label>
              <span class="tw-font-semibold tw-text-slate-700">Business Unit</span>
              <span class="tw-text-red-500 tw-font-bold"> *</span>
            </template>
          </q-select>

          <!-- Division -->
          <q-input
            v-model="form.div"
            outlined
            label-slot
            class="tw-rounded-lg"
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
            v-model="form.owner"
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
            v-model="form.keeper"
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
            v-model="form.dic"
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

        <!-- File Upload Section -->
        <div class="tw-mt-6">
          <div class="tw-font-semibold tw-text-slate-700 tw-mb-2">
            Upload File <span class="tw-text-red-500 tw-font-bold">*</span>
          </div>
          <q-uploader
            ref="uploaderRef"
            :max-file-size="10485760"
            :max-files="1"
            label="Drag & drop file atau klik untuk memilih (Maks. 10MB)"
            flat
            bordered
            class="tw-w-full tw-rounded-lg"
            color="blue-6"
            @added="onFileAdded"
            @removed="onFileRemoved"
            @rejected="onFileRejected"
            :auto-upload="false"
            hide-upload-btn
          >
            <template v-slot:header="scope">
              <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                <q-icon name="cloud_upload" size="24px" color="blue-6" />
                <div class="tw-text-sm tw-text-slate-600">
                  {{ scope.files.length > 0 ? scope.files[0].name : 'Drag & drop file atau klik untuk memilih' }}
                </div>
                <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" round dense flat>
                  <q-uploader-add-trigger />
                  <q-tooltip>Pilih File</q-tooltip>
                </q-btn>
              </div>
            </template>
          </q-uploader>
          <div class="tw-text-xs tw-text-slate-500 tw-mt-1">
            Semua tipe file diperbolehkan. Ukuran maksimal 10MB.
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-separator />
      <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
        <q-btn
          label="Kembali"
          color="red-7"
          push
          icon="arrow_back"
          @click="goBack"
          class="tw-px-6 tw-font-semibold"
        />
        <q-btn
          label="Upload"
          color="blue-6"
          push
          icon="cloud_upload"
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

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// Route param: folderId
const folderId = route.params.folderId;

// --- Form State ---
const form = ref({
  name: "",
  desc: "",
  type: "non-renewable",
  security: "non-restricted",
  keywords: "",
  duedate: "",
  owner: "",
  keeper: "",
  dic: "",
  bu: "",
  div: "",
});

const selectedFile = ref(null);
const submitting = ref(false);
const uploaderRef = ref(null);

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
    // Fallback: try without tingkat filter
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

const onFileAdded = (files) => {
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
};

const onFileRemoved = () => {
  selectedFile.value = null;
};

const onFileRejected = (rejectedEntries) => {
  if (rejectedEntries && rejectedEntries.length > 0) {
    const reason = rejectedEntries[0].failedPropValidation;
    if (reason === "max-file-size") {
      $q.notify({ type: "negative", message: "Ukuran file melebihi batas 10MB", position: "bottom" });
    } else {
      $q.notify({ type: "negative", message: "File ditolak", position: "bottom" });
    }
  }
};

const validateForm = () => {
  if (!form.value.name.trim()) {
    $q.notify({ type: "warning", message: "Nama file wajib diisi", position: "bottom" });
    return false;
  }
  if (!form.value.type) {
    $q.notify({ type: "warning", message: "Tipe dokumen wajib dipilih", position: "bottom" });
    return false;
  }
  if (!form.value.security) {
    $q.notify({ type: "warning", message: "Security wajib dipilih", position: "bottom" });
    return false;
  }
  if (!form.value.bu) {
    $q.notify({ type: "warning", message: "Business Unit wajib dipilih", position: "bottom" });
    return false;
  }
  if (!form.value.owner) {
    $q.notify({ type: "warning", message: "Owner wajib dipilih", position: "bottom" });
    return false;
  }
  if (!form.value.keeper) {
    $q.notify({ type: "warning", message: "Keeper wajib dipilih", position: "bottom" });
    return false;
  }
  if (form.value.type === "renewable" && !form.value.duedate) {
    $q.notify({ type: "warning", message: "Due date wajib diisi untuk dokumen renewable", position: "bottom" });
    return false;
  }
  if (!selectedFile.value) {
    $q.notify({ type: "warning", message: "File wajib dipilih untuk diupload", position: "bottom" });
    return false;
  }
  return true;
};

const submitForm = async () => {
  if (!validateForm()) return;

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("name", form.value.name.trim());
    formData.append("desc", form.value.desc || "");
    formData.append("type", form.value.type);
    formData.append("security", form.value.security);
    formData.append("keywords", form.value.keywords || "");
    formData.append("duedate", form.value.type === "renewable" ? form.value.duedate : "");
    formData.append("owner", form.value.owner);
    formData.append("keeper", form.value.keeper);
    formData.append("dic", form.value.dic || "");
    formData.append("bu", form.value.bu);
    formData.append("div", form.value.div || "");
    formData.append("folder_id", folderId);

    await axios.post(`${import.meta.env.VITE_API}document/file`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    $q.notify({ type: "positive", message: "File berhasil diupload", position: "bottom" });
    router.push("/document");
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal mengupload file";
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
  await loadEmployees();
});
</script>
