<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="autorenew" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Report Renewable</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Report Renewable</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Legend -->
      <q-card-section class="tw-bg-slate-50 tw-py-3">
        <div class="tw-flex tw-items-center tw-gap-4 tw-flex-wrap">
          <span class="tw-text-sm tw-font-medium tw-text-slate-600">Keterangan Level:</span>
          <q-badge color="grey-4" text-color="grey-8" label="PUTIH (> 90 hari)" class="tw-text-xs tw-px-3 tw-py-1" />
          <q-badge color="green-3" text-color="green-9" label="HIJAU (61-90 hari)" class="tw-text-xs tw-px-3 tw-py-1" />
          <q-badge color="yellow-3" text-color="yellow-10" label="KUNING (31-60 hari)" class="tw-text-xs tw-px-3 tw-py-1" />
          <q-badge color="red-3" text-color="red-9" label="MERAH (≤ 30 hari)" class="tw-text-xs tw-px-3 tw-py-1" />
        </div>
      </q-card-section>
      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white tw-p-0">
        <q-table
          :rows="documents"
          :columns="columns"
          row-key="content_id"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="filter"
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
            <q-select borderless dense v-model="pagination.rowsPerPage" :options="[10, 25, 50, 100]">
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
              v-model="filter"
              placeholder="Cari dokumen renewable..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[280px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="blue-6" />
              </template>
            </q-input>
          </template>

          <!-- Body cells -->
          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-text-center tw-text-sm">
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_name="props">
            <q-td :props="props" class="tw-text-sm tw-font-medium">
              {{ props.row.content_name }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_bu="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              {{ props.row.content_bu || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_duedate="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              {{ props.row.content_duedate ? formatDate(props.row.content_duedate) : '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-days_remaining="props">
            <q-td :props="props" class="tw-text-sm tw-text-center tw-font-semibold">
              {{ props.row.days_remaining }} hari
            </q-td>
          </template>

          <template v-slot:body-cell-level="props">
            <q-td :props="props" class="tw-text-center">
              <q-badge
                :color="getLevelColor(props.row.level)"
                :text-color="getLevelTextColor(props.row.level)"
                :label="props.row.level"
                class="tw-text-xs tw-font-bold tw-px-3 tw-py-1"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-owner_name="props">
            <q-td :props="props" class="tw-text-sm">
              {{ props.row.owner_name || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-keeper_name="props">
            <q-td :props="props" class="tw-text-sm">
              {{ props.row.keeper_name || '-' }}
            </q-td>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-12 tw-text-slate-400">
              <q-icon name="autorenew" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Tidak ada dokumen renewable</div>
              <div class="tw-text-sm tw-mt-1">Data dokumen renewable akan muncul di sini</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
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
const documents = ref([]);
const loading = ref(false);
const filter = ref("");

const pagination = ref({
  sortBy: "days_remaining",
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

// --- Columns ---
const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  { name: "content_name", label: "Nama Dokumen", field: "content_name", align: "left", sortable: true },
  { name: "folder_name", label: "Folder", field: "folder_name", align: "left", sortable: true },
  { name: "content_bu", label: "BU", field: "content_bu", align: "center", sortable: true, style: "width: 80px" },
  { name: "content_duedate", label: "Due Date", field: "content_duedate", align: "center", sortable: true, style: "width: 120px" },
  { name: "days_remaining", label: "Sisa Hari", field: "days_remaining", align: "center", sortable: true, style: "width: 100px" },
  { name: "level", label: "Level", field: "level", align: "center", sortable: true, style: "width: 110px" },
  { name: "owner_name", label: "Owner", field: "owner_name", align: "left", sortable: true },
  { name: "keeper_name", label: "Keeper", field: "keeper_name", align: "left", sortable: true },
];

// --- Methods ---

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD-MM-YYYY");
};

const getLevelColor = (level) => {
  switch (level) {
    case "MERAH": return "red-3";
    case "KUNING": return "yellow-3";
    case "HIJAU": return "green-3";
    case "PUTIH": return "grey-4";
    default: return "grey-4";
  }
};

const getLevelTextColor = (level) => {
  switch (level) {
    case "MERAH": return "red-9";
    case "KUNING": return "yellow-10";
    case "HIJAU": return "green-9";
    case "PUTIH": return "grey-8";
    default: return "grey-8";
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/report/renewable`);
    documents.value = res.data;
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Gagal memuat data report renewable",
      position: "bottom",
    });
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  loadData();
});
</script>
