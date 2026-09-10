<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="restore_from_trash" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Restore Data</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Restore</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        class="tw-bg-slate-50 text-blue-8"
        active-color="blue-6"
        indicator-color="blue-6"
        align="left"
      >
        <q-tab name="files" icon="description" label="File Terhapus" />
        <q-tab name="folders" icon="folder_off" label="Folder Terhapus" />
      </q-tabs>
      <q-separator />

      <!-- Tab Panels -->
      <q-tab-panels v-model="activeTab" animated>
        <!-- Deleted Files Panel -->
        <q-tab-panel name="files" class="tw-p-0">
          <q-table
            :rows="deletedFiles"
            :columns="fileColumns"
            row-key="content_id"
            v-model:pagination="filePagination"
            :rows-per-page-options="[]"
            :loading="loadingFiles"
            :filter="fileFilter"
            binary-state-sort
            flat
            class="tw-shadow-sm tw-overflow-hidden"
          >
            <!-- Header -->
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="tw-bg-blue-600 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <!-- Top Left -->
            <template v-slot:top-left>
              <q-select borderless dense v-model="filePagination.rowsPerPage" :options="[10, 25, 50, 100]">
                <template v-slot:before>
                  <q-icon name="reorder"><q-tooltip>Rows per page</q-tooltip></q-icon>
                </template>
              </q-select>
            </template>

            <!-- Top Right: Search -->
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="fileFilter"
                placeholder="Cari file..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </template>

            <!-- Body cells -->
            <template v-slot:body-cell-no="props">
              <q-td :props="props" class="tw-text-center tw-text-sm">
                {{ (filePagination.page - 1) * filePagination.rowsPerPage + props.rowIndex + 1 }}
              </q-td>
            </template>

            <template v-slot:body-cell-content_name="props">
              <q-td :props="props" class="tw-text-sm tw-font-medium">
                {{ props.row.content_name }}
                <div class="tw-text-xs tw-text-slate-400">{{ props.row.folder_name || '-' }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-content_bu="props">
              <q-td :props="props" class="tw-text-sm">
                <q-badge color="blue-6" :label="props.row.content_bu" class="tw-text-xs" />
              </q-td>
            </template>

            <template v-slot:body-cell-content_lastmodified="props">
              <q-td :props="props" class="tw-text-sm">
                {{ formatDateTime(props.row.content_lastmodified) }}
              </q-td>
            </template>

            <template v-slot:body-cell-aksi="props">
              <q-td :props="props" class="tw-text-center">
                <q-btn
                  round
                  dense
                  color="green-6"
                  size="sm"
                  icon="restore"
                  @click="confirmRestoreFile(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Restore File</q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <!-- Empty state -->
            <template v-slot:no-data>
              <div class="tw-text-center tw-py-12 tw-text-slate-400">
                <q-icon name="check_circle" size="64px" class="tw-mb-4" />
                <div class="tw-text-lg tw-font-medium">Tidak ada file terhapus</div>
                <div class="tw-text-sm tw-mt-1">Semua file dalam kondisi aktif</div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>

        <!-- Deleted Folders Panel -->
        <q-tab-panel name="folders" class="tw-p-0">
          <q-table
            :rows="deletedFolders"
            :columns="folderColumns"
            row-key="folder_id"
            v-model:pagination="folderPagination"
            :rows-per-page-options="[]"
            :loading="loadingFolders"
            :filter="folderFilter"
            binary-state-sort
            flat
            class="tw-shadow-sm tw-overflow-hidden"
          >
            <!-- Header -->
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="tw-bg-blue-600 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <!-- Top Left -->
            <template v-slot:top-left>
              <q-select borderless dense v-model="folderPagination.rowsPerPage" :options="[10, 25, 50, 100]">
                <template v-slot:before>
                  <q-icon name="reorder"><q-tooltip>Rows per page</q-tooltip></q-icon>
                </template>
              </q-select>
            </template>

            <!-- Top Right: Search -->
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="folderFilter"
                placeholder="Cari folder..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </template>

            <!-- Body cells -->
            <template v-slot:body-cell-no="props">
              <q-td :props="props" class="tw-text-center tw-text-sm">
                {{ (folderPagination.page - 1) * folderPagination.rowsPerPage + props.rowIndex + 1 }}
              </q-td>
            </template>

            <template v-slot:body-cell-folder_name="props">
              <q-td :props="props" class="tw-text-sm tw-font-medium">
                <q-icon name="folder" color="amber-7" size="18px" class="tw-mr-1" />
                {{ props.row.folder_name }}
              </q-td>
            </template>

            <template v-slot:body-cell-folder_bu="props">
              <q-td :props="props" class="tw-text-sm">
                <q-badge color="blue-6" :label="props.row.folder_bu" class="tw-text-xs" />
              </q-td>
            </template>

            <template v-slot:body-cell-folder_lastmodified="props">
              <q-td :props="props" class="tw-text-sm">
                {{ formatDateTime(props.row.folder_lastmodified) }}
              </q-td>
            </template>

            <template v-slot:body-cell-parent_active="props">
              <q-td :props="props" class="tw-text-center tw-text-sm">
                <q-badge
                  :color="props.row.parent_active ? 'green-6' : 'red-6'"
                  :label="props.row.parent_active ? 'Aktif' : 'Terhapus'"
                  class="tw-text-xs"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-aksi="props">
              <q-td :props="props" class="tw-text-center">
                <q-btn
                  round
                  dense
                  color="green-6"
                  size="sm"
                  icon="restore"
                  @click="confirmRestoreFolder(props.row)"
                  :disable="!props.row.parent_active"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    {{ props.row.parent_active ? 'Restore Folder' : 'Folder parent harus di-restore terlebih dahulu' }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <!-- Empty state -->
            <template v-slot:no-data>
              <div class="tw-text-center tw-py-12 tw-text-slate-400">
                <q-icon name="check_circle" size="64px" class="tw-mb-4" />
                <div class="tw-text-lg tw-font-medium">Tidak ada folder terhapus</div>
                <div class="tw-text-sm tw-mt-1">Semua folder dalam kondisi aktif</div>
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import dayjs from "dayjs";

const $q = useQuasar();

// --- State ---
const activeTab = ref("files");
const deletedFiles = ref([]);
const deletedFolders = ref([]);
const loadingFiles = ref(false);
const loadingFolders = ref(false);
const fileFilter = ref("");
const folderFilter = ref("");

const filePagination = ref({
  sortBy: "content_lastmodified",
  descending: true,
  page: 1,
  rowsPerPage: 10,
});

const folderPagination = ref({
  sortBy: "folder_lastmodified",
  descending: true,
  page: 1,
  rowsPerPage: 10,
});

// --- Columns ---
const fileColumns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  { name: "content_name", label: "Nama File", field: "content_name", align: "left", sortable: true },
  { name: "content_bu", label: "BU", field: "content_bu", align: "center", sortable: true, style: "width: 80px" },
  { name: "content_lastmodified", label: "Tanggal Hapus", field: "content_lastmodified", align: "left", sortable: true, style: "width: 160px" },
  { name: "owner_name", label: "Owner", field: "owner_name", align: "left", sortable: true },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 80px" },
];

const folderColumns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  { name: "folder_name", label: "Nama Folder", field: "folder_name", align: "left", sortable: true },
  { name: "folder_bu", label: "BU", field: "folder_bu", align: "center", sortable: true, style: "width: 80px" },
  { name: "folder_lastmodified", label: "Tanggal Hapus", field: "folder_lastmodified", align: "left", sortable: true, style: "width: 160px" },
  { name: "parent_active", label: "Status Parent", field: "parent_active", align: "center", sortable: true, style: "width: 120px" },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 80px" },
];

// --- Methods ---

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD-MM-YYYY HH:mm");
};

const loadDeletedFiles = async () => {
  loadingFiles.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/report/deleted-files`);
    deletedFiles.value = res.data;
  } catch (err) {
    const message = err.response?.data?.message || "Gagal memuat data file terhapus";
    $q.notify({ type: "negative", message, position: "bottom" });
  } finally {
    loadingFiles.value = false;
  }
};

const loadDeletedFolders = async () => {
  loadingFolders.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/report/deleted-folders`);
    deletedFolders.value = res.data;
  } catch (err) {
    const message = err.response?.data?.message || "Gagal memuat data folder terhapus";
    $q.notify({ type: "negative", message, position: "bottom" });
  } finally {
    loadingFolders.value = false;
  }
};

const confirmRestoreFile = (row) => {
  // Check if parent folder is active
  if (row.folder_active === 0) {
    $q.notify({
      type: "warning",
      message: `Folder "${row.folder_name}" harus di-restore terlebih dahulu sebelum file ini dapat di-restore`,
      position: "bottom",
      timeout: 5000,
    });
    return;
  }

  $q.dialog({
    title: "Konfirmasi Restore",
    message: `Apakah Anda yakin ingin me-restore file <strong>${row.content_name}</strong>?`,
    html: true,
    ok: {
      push: true,
      color: "green-6",
      label: "Ya, Restore",
      icon: "restore",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    await restoreFileAction(row.content_id);
  });
};

const restoreFileAction = async (contentId) => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API}document/file/${contentId}/restore`);
    $q.notify({
      type: "positive",
      message: res.data?.message || "File berhasil di-restore",
      position: "bottom",
    });
    // Reload data
    await loadDeletedFiles();
  } catch (err) {
    const message = err.response?.data?.message || "Gagal me-restore file";
    $q.notify({ type: "negative", message, position: "bottom", timeout: 5000 });
  }
};

const confirmRestoreFolder = (row) => {
  // Check if parent folder is active
  if (!row.parent_active) {
    $q.notify({
      type: "warning",
      message: "Folder parent harus di-restore terlebih dahulu sebelum folder ini dapat di-restore",
      position: "bottom",
      timeout: 5000,
    });
    return;
  }

  $q.dialog({
    title: "Konfirmasi Restore",
    message: `Apakah Anda yakin ingin me-restore folder <strong>${row.folder_name}</strong>?`,
    html: true,
    ok: {
      push: true,
      color: "green-6",
      label: "Ya, Restore",
      icon: "restore",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    cancel: {
      push: true,
      color: "red-7",
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg",
    },
    persistent: true,
  }).onOk(async () => {
    await restoreFolderAction(row.folder_id);
  });
};

const restoreFolderAction = async (folderId) => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API}document/folder/${folderId}/restore`);
    $q.notify({
      type: "positive",
      message: res.data?.message || "Folder berhasil di-restore",
      position: "bottom",
    });
    // Reload both tabs since restoring a folder may affect file restore eligibility
    await Promise.all([loadDeletedFiles(), loadDeletedFolders()]);
  } catch (err) {
    const message = err.response?.data?.message || "Gagal me-restore folder";
    $q.notify({ type: "negative", message, position: "bottom", timeout: 5000 });
  }
};

// --- Lifecycle ---
onMounted(() => {
  loadDeletedFiles();
  loadDeletedFolders();
});
</script>
