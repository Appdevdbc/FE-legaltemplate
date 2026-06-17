<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="search" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">All Documents</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Search</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- BU Filter -->
      <q-card-section class="tw-bg-slate-50 tw-py-4">
        <div class="tw-flex tw-items-end tw-gap-4 tw-flex-wrap">
          <q-select
            v-model="filterBU"
            outlined
            dense
            :options="buOptions"
            label="Business Unit"
            clearable
            emit-value
            map-options
            class="tw-min-w-[200px]"
          />
          <q-btn
            unelevated
            color="blue-6"
            label="Filter"
            icon="filter_alt"
            @click="loadData"
            class="tw-font-semibold tw-px-4 tw-rounded-lg"
          />
          <q-btn
            outline
            color="grey-7"
            label="Reset"
            icon="refresh"
            @click="resetFilter"
            class="tw-font-semibold tw-px-4 tw-rounded-lg"
          />
        </div>
      </q-card-section>
      <q-separator />

      <!-- Results Table -->
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

          <!-- Top Left: Rows per page -->
          <template v-slot:top-left>
            <q-select borderless dense v-model="pagination.rowsPerPage" :options="[10, 25, 50, 100, 200]">
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
              placeholder="Cari dokumen..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="blue-6" />
              </template>
              <template v-slot:append>
                <q-icon v-if="filter" name="close" class="cursor-pointer" @click="filter = ''" />
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
              <span
                class="tw-text-blue-700 tw-cursor-pointer hover:tw-underline"
                @click="goToDetail(props.row)"
              >
                {{ props.row.content_name }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-folder_path="props">
            <q-td :props="props" class="tw-text-sm tw-text-slate-600">
              {{ props.row.folder_path || props.row.folder_name || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_keywords="props">
            <q-td :props="props" class="tw-text-sm tw-text-slate-600">
              {{ props.row.content_keywords || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_type="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              <q-badge
                :color="props.row.content_type === 'renewable' ? 'orange' : 'grey-6'"
                :label="props.row.content_type === 'renewable' ? 'Renewable' : 'Non-Renewable'"
                class="tw-text-xs"
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

          <template v-slot:body-cell-content_bu="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              {{ props.row.content_bu || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_div="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              {{ props.row.content_div || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-text-center">
              <q-btn
                round dense color="teal-6" size="sm" icon="visibility"
                @click="viewFile(props.row)"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">View</q-tooltip>
              </q-btn>
              <q-btn
                round dense color="green-7" size="sm" icon="download"
                @click="downloadFile(props.row)"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Download</q-tooltip>
              </q-btn>
              <q-btn
                round dense color="blue-6" size="sm" icon="info"
                @click="goToDetail(props.row)"
                class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Detail</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-12 tw-text-slate-400">
              <q-icon name="description" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Tidak ada dokumen ditemukan</div>
              <div class="tw-text-sm tw-mt-1">Coba ubah filter atau kata kunci pencarian</div>
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
import { useRouter } from "vue-router";
import axios from "axios";

const $q = useQuasar();
const router = useRouter();

// --- State ---
const documents = ref([]);
const loading = ref(false);
const filter = ref("");
const filterBU = ref(null);

const buOptions = [
  { label: "Semua Business Unit", value: "" },
  { label: "DBC", value: "DBC" },
  { label: "DJM", value: "DJM" },
  { label: "WDJR", value: "WDJR" },
  { label: "GBC", value: "GBC" },
  { label: "DFR", value: "DFR" },
  { label: "DTU", value: "DTU" },
  { label: "WTUR", value: "WTUR" },
];

const pagination = ref({
  sortBy: "content_name",
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

// --- Columns (like legacy: Nama, Folder, Keywords, Type, Owner, Keeper, BU, Divisi, Actions) ---
const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  { name: "content_name", label: "Nama Dokumen", field: "content_name", align: "left", sortable: true },
  { name: "folder_path", label: "Folder", field: "folder_path", align: "left", sortable: true },
  { name: "content_keywords", label: "Keywords", field: "content_keywords", align: "left", sortable: true },
  { name: "content_type", label: "Type", field: "content_type", align: "center", sortable: true, style: "width: 130px" },
  { name: "owner_name", label: "Owner", field: "owner_name", align: "left", sortable: true },
  { name: "keeper_name", label: "Keeper", field: "keeper_name", align: "left", sortable: true },
  { name: "content_bu", label: "BU", field: "content_bu", align: "center", sortable: true, style: "width: 80px" },
  { name: "content_div", label: "Divisi", field: "content_div", align: "center", sortable: true, style: "width: 100px" },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 130px" },
];

// --- Methods ---

const loadData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filterBU.value) params.bu = filterBU.value;

    const res = await axios.get(`${import.meta.env.VITE_API}document/search`, { params });
    documents.value = res.data;
    pagination.value.page = 1;
  } catch (err) {
    const message = err.response?.data?.message || "Gagal memuat data dokumen";
    $q.notify({ type: "negative", message, position: "bottom" });
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filterBU.value = null;
  filter.value = "";
  loadData();
};

const goToDetail = (row) => {
  router.push(`/document/detail/${row.content_id}`);
};

const viewFile = (row) => {
  const url = `${import.meta.env.VITE_API}document/file/${row.content_id}/view`;
  window.open(url, "_blank");
};

const downloadFile = (row) => {
  const url = `${import.meta.env.VITE_API}document/file/${row.content_id}/download`;
  window.open(url, "_blank");
};

// --- Lifecycle ---
onMounted(() => {
  loadData();
});
</script>
