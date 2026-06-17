<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="history" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Log Activity</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document Management</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Laporan Log Activity</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Filters -->
      <!-- <q-card-section class="tw-bg-slate-50 tw-py-4">
        <div class="tw-flex tw-items-end tw-gap-4 tw-flex-wrap">
          <q-input
            v-model="filterDateFrom"
            outlined
            dense
            type="date"
            label="Tanggal Dari"
            class="tw-min-w-[180px]"
          />
          <q-input
            v-model="filterDateTo"
            outlined
            dense
            type="date"
            label="Tanggal Sampai"
            class="tw-min-w-[180px]"
          />
          <q-select
            v-model="filterBU"
            outlined
            dense
            :options="buOptions"
            label="Business Unit"
            clearable
            emit-value
            map-options
            class="tw-min-w-[150px]"
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
      </q-card-section> -->
      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="logs"
          :columns="columns"
          row-key="log_date"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="searchFilter"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <!-- Header -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <!-- <q-th v-for="col in props.cols" :key="col.name" :props="props"
                class="bg-primary text-white text-weight-bold" style="font-size: 13px; padding: 12px 8px;">
                {{ col.label }}
              </q-th> -->
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
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
              v-model="searchFilter"
              placeholder="Search..."
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
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-log_date="props">
            <q-td :props="props" class="tw-text-sm">
              {{ formatDateTime2(props.row.log_date) }}
            </q-td>
          </template>

          <template v-slot:body-cell-log_action="props">
            <q-td :props="props" class="tw-text-sm">
              <q-badge
                :color="getActionColor(props.row.log_action)"
                :label="props.row.log_action"
                class="tw-text-xs"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-user_name="props">
            <q-td :props="props" class="tw-text-sm">
              {{ props.row.user_name || props.row.log_nik }}
            </q-td>
          </template>

          <template v-slot:body-cell-content_name="props">
            <q-td :props="props" class="tw-text-sm tw-font-medium">
              {{ props.row.content_name || '-' }}
            </q-td>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-12 tw-text-slate-400">
              <q-icon name="history" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Tidak ada log aktivitas</div>
              <div class="tw-text-sm tw-mt-1">Gunakan filter tanggal untuk melihat log aktivitas</div>
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
import { domain, formatDateTime2 } from "./../../utils";

const $q = useQuasar();

// --- State ---
const logs = ref([]);
const loading = ref(false);
const searchFilter = ref("");
const filterDateFrom = ref("");
const filterDateTo = ref("");
const filterBU = ref(null);

const buOptions = [
  { label: "DBC", value: "DBC" },
  { label: "DJM", value: "DJM" },
  { label: "WDJR", value: "WDJR" },
  { label: "GBC", value: "GBC" },
  { label: "DFR", value: "DFR" },
  { label: "DTU", value: "DTU" },
  { label: "WTUR", value: "WTUR" },
];

const pagination = ref({
  sortBy: "log_date",
  descending: true,
  page: 1,
  rowsPerPage: 10,
});

// --- Columns ---
const columns = [
  // { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  // { name: "log_date", label: "DateTime", field: "log_date", align: "left", sortable: true, style: "width: 170px" },
  // { name: "log_date", label: "NIK", field: "log_date", align: "left", sortable: true, style: "width: 170px" },  
  // { name: "user_name", label: "Nama User", field: "user_name", align: "left", sortable: true },
  // { name: "log_action", label: "Activity", field: "log_action", align: "left", sortable: true, style: "width: 150px" },
  // { name: "content_name", label: "Template Dokumen", field: "content_name", align: "left", sortable: true },

  { name: "no", label: "No", field: "no", align: "center", sortable: false,  },
  { name: "log_date", label: "DateTime", field: "log_date", align: "left", sortable: true,  },
  { name: "log_nik", label: "NIK", field: "log_nik", align: "left", sortable: true,  },  
  { name: "user_name", label: "Nama User", field: "user_name", align: "left", sortable: true },
  { name: "log_action", label: "Activity", field: "log_action", align: "left", sortable: true, },
  { name: "content_file", label: "Template Dokumen", field: "content_file", align: "left", sortable: true },
];

// --- Methods ---

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD-MM-YYYY HH:mm");
};

const getActionColor = (action) => {
  if (!action) return "grey-6";
  const lower = action.toLowerCase();
  if (lower.includes("upload") || lower.includes("renew")) return "green-6";
  if (lower.includes("delete")) return "red-6";
  if (lower.includes("download")) return "blue-6";
  if (lower.includes("view")) return "cyan-6";
  if (lower.includes("update")) return "orange-6";
  if (lower.includes("confirm")) return "teal-6";
  if (lower.includes("reject")) return "deep-orange-6";
  if (lower.includes("restore")) return "purple-6";
  return "grey-6";
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filterDateFrom.value) params.start_date = filterDateFrom.value;
    if (filterDateTo.value) params.end_date = filterDateTo.value;
    if (filterBU.value) params.bu = filterBU.value;

    const res = await axios.get(`${import.meta.env.VITE_API}document/report/log-activity`, { params });
    logs.value = res.data;
    pagination.value.page = 1;
  } catch (err) {
    const message = err.response?.data?.message || "Gagal memuat log aktivitas";
    $q.notify({
      type: "negative",
      message,
      position: "bottom",
    });
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filterDateFrom.value = "";
  filterDateTo.value = "";
  filterBU.value = null;
  searchFilter.value = "";
  loadData();
};

// --- Lifecycle ---
onMounted(() => {
  loadData();
});
</script>
