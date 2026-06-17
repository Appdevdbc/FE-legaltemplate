<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="summarize" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Rekap Template</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document Management</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Laporan Rekap Template Dokumen</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Content -->
      <q-card-section class="tw-bg-white">
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

          <!-- Top Left: Rows per page -->
          <template v-slot:top-left>
            <q-select borderless dense v-model="pagination.rowsPerPage" :options="[10, 25, 50, 100]">
              <template v-slot:before>
                <q-icon name="reorder"><q-tooltip>Rows per page</q-tooltip></q-icon>
              </template>
            </q-select>
          </template>

          <!-- Top Right: Search + Export -->
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <!-- <q-btn
                unelevated
                color="green-7"
                label="Export Excel"
                icon="file_download"
                :loading="exporting"
                @click="exportExcel"
                class="tw-font-semibold tw-px-4 tw-rounded-lg"
              /> -->
              <q-input
                outlined
                dense
                debounce="300"
                v-model="filter"
                placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
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

          <template v-slot:body-cell-folder_name="props">
            <q-td :props="props" class="tw-text-sm">
              <q-badge color="blue-2" text-color="blue-9" :label="props.row.folder_name" />
            </q-td>
          </template>

          <template v-slot:body-cell-content_bu="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              {{ props.row.content_bu || '-' }}
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

          <template v-slot:body-cell-content_entrydate="props">
            <q-td :props="props" class="tw-text-sm tw-text-center">
              {{ props.row.content_entrydate ? formatDateTime2(props.row.content_entrydate) : '-' }}
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
              <q-icon name="description" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Tidak ada data dokumen</div>
              <div class="tw-text-sm tw-mt-1">Data rekap template akan muncul di sini</div>
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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { domain, formatDateTime2 } from "./../../utils";

const $q = useQuasar();

// --- State ---
const documents = ref([]);
const loading = ref(false);
const exporting = ref(false);
const filter = ref("");

const pagination = ref({
  sortBy: "content_name",
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

// --- Columns ---
const columns = [
  // { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  
  // { name: "folder_name", label: "Folder", field: "folder_name", align: "left", sortable: true },
  // { name: "content_name", label: "Template Dokumen", field: "content_name", align: "left", sortable: true },
  // { name: "content_bu", label: "BU", field: "content_bu", align: "center", sortable: true, style: "width: 80px" },
  // { name: "content_div", label: "Divisi", field: "content_div", align: "center", sortable: true, style: "width: 100px" },
  // { name: "content_type", label: "Tipe", field: "content_type", align: "center", sortable: true, style: "width: 130px" },
  // { name: "content_duedate", label: "Upload Date", field: "content_duedate", align: "center", sortable: true, style: "width: 120px" },
  // { name: "owner_name", label: "Owner", field: "owner_name", align: "left", sortable: true },
  // { name: "keeper_name", label: "Keeper", field: "keeper_name", align: "left", sortable: true },

  { name: "no", label: "No", field: "no", align: "center", sortable: false,  },
  { name: "folder_name", label: "Folder", field: "folder_name", align: "left", sortable: true },
  { name: "content_file", label: "Template Dokumen", field: "content_file", align: "left", sortable: true },
  { name: "content_entrydate", label: "Upload Date", field: "content_entrydate", align: "center", sortable: true,  },
];

// --- Methods ---

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD-MM-YYYY");
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/report/rekap-template`);
    documents.value = res.data;
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Gagal memuat data rekap template",
      position: "bottom",
    });
  } finally {
    loading.value = false;
  }
};

const exportExcel = async () => {
  if (documents.value.length === 0) {
    $q.notify({
      type: "warning",
      message: "Tidak ada data untuk diekspor",
      position: "bottom",
    });
    return;
  }

  exporting.value = true;
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Template");

    // Header row
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Dokumen", key: "content_name", width: 40 },
      { header: "Folder", key: "folder_name", width: 25 },
      { header: "BU", key: "content_bu", width: 10 },
      { header: "Divisi", key: "content_div", width: 15 },
      { header: "Tipe", key: "content_type", width: 15 },
      { header: "Due Date", key: "content_duedate", width: 15 },
      { header: "Owner", key: "owner_name", width: 25 },
      { header: "Keeper", key: "keeper_name", width: 25 },
    ];

    // Style header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1565C0" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Data rows
    documents.value.forEach((doc, index) => {
      worksheet.addRow({
        no: index + 1,
        content_name: doc.content_name,
        folder_name: doc.folder_name,
        content_bu: doc.content_bu || "",
        content_div: doc.content_div || "",
        content_type: doc.content_type === "renewable" ? "Renewable" : "Non-Renewable",
        content_duedate: doc.content_duedate ? formatDate(doc.content_duedate) : "-",
        owner_name: doc.owner_name || "",
        keeper_name: doc.keeper_name || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Rekap_Template_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);

    $q.notify({
      type: "positive",
      message: "File Excel berhasil diunduh",
      position: "bottom",
    });
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Gagal mengekspor data ke Excel",
      position: "bottom",
    });
  } finally {
    exporting.value = false;
  }
};

// --- Lifecycle ---
onMounted(() => {
  loadData();
});
</script>
