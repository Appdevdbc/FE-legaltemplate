<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="track_changes" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Target Management</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Target</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Content -->
      <q-card-section class="tw-bg-white tw-p-0">
        <q-table
          :rows="targets"
          :columns="columns"
          row-key="target_bu"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
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
            <div class="tw-text-sm tw-text-slate-500">
              Perbandingan target vs aktual dokumen per Business Unit
            </div>
          </template>

          <!-- Body cells -->
          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-text-center tw-text-sm">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-target_bu="props">
            <q-td :props="props" class="tw-text-sm tw-font-semibold">
              {{ props.row.target_bu }}
            </q-td>
          </template>

          <template v-slot:body-cell-target_total="props">
            <q-td :props="props" class="tw-text-center">
              <template v-if="isAdmin && editingBU === props.row.target_bu">
                <q-input
                  v-model.number="editTargetValue"
                  type="number"
                  dense
                  outlined
                  min="1"
                  max="99999"
                  class="tw-max-w-[120px] tw-mx-auto"
                  @keyup.enter="saveTarget(props.row.target_bu)"
                  @keyup.escape="cancelEdit"
                />
              </template>
              <template v-else>
                <span class="tw-text-sm tw-font-medium">{{ props.row.target_total }}</span>
              </template>
            </q-td>
          </template>

          <template v-slot:body-cell-actual_count="props">
            <q-td :props="props" class="tw-text-center tw-text-sm">
              {{ props.row.actual_count }}
            </q-td>
          </template>

          <template v-slot:body-cell-progress="props">
            <q-td :props="props" class="tw-text-center">
              <div class="tw-flex tw-items-center tw-gap-2 tw-justify-center">
                <q-linear-progress
                  :value="getProgress(props.row)"
                  :color="getProgressColor(props.row)"
                  rounded
                  size="8px"
                  class="tw-w-24"
                />
                <span class="tw-text-xs tw-font-medium tw-text-slate-600">
                  {{ getProgressPercent(props.row) }}%
                </span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-text-center">
              <template v-if="isAdmin">
                <template v-if="editingBU === props.row.target_bu">
                  <q-btn
                    round
                    dense
                    color="green-6"
                    size="sm"
                    icon="check"
                    :loading="saving"
                    @click="saveTarget(props.row.target_bu)"
                    class="tw-mr-1 tw-shadow-md"
                  >
                    <q-tooltip>Simpan</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    dense
                    color="grey-6"
                    size="sm"
                    icon="close"
                    @click="cancelEdit"
                    class="tw-shadow-md"
                  >
                    <q-tooltip>Batal</q-tooltip>
                  </q-btn>
                </template>
                <template v-else>
                  <q-btn
                    round
                    dense
                    color="light-blue-9"
                    size="sm"
                    icon="edit"
                    @click="startEdit(props.row)"
                    class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  >
                    <q-tooltip>Edit Target</q-tooltip>
                  </q-btn>
                </template>
              </template>
              <template v-else>
                <span class="tw-text-xs tw-text-slate-400">-</span>
              </template>
            </q-td>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-12 tw-text-slate-400">
              <q-icon name="track_changes" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Tidak ada data target</div>
              <div class="tw-text-sm tw-mt-1">Data target per BU akan muncul di sini</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();

// --- State ---
const targets = ref([]);
const loading = ref(false);
const saving = ref(false);
const editingBU = ref(null);
const editTargetValue = ref(0);

const pagination = ref({
  sortBy: "target_bu",
  descending: false,
  page: 1,
  rowsPerPage: 20,
});

// Check if user is Admin_Corporate (role 4)
const isAdmin = computed(() => {
  try {
    const token = window.localStorage.getItem("token");
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return parseInt(payload.role) === 4;
  } catch {
    return false;
  }
});

// --- Columns ---
const columns = computed(() => {
  const cols = [
    { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
    { name: "target_bu", label: "Business Unit", field: "target_bu", align: "left", sortable: true },
    { name: "target_total", label: "Target", field: "target_total", align: "center", sortable: true, style: "width: 150px" },
    { name: "actual_count", label: "Aktual", field: "actual_count", align: "center", sortable: true, style: "width: 120px" },
    { name: "progress", label: "Progress", field: "progress", align: "center", sortable: false, style: "width: 200px" },
  ];

  if (isAdmin.value) {
    cols.push({ name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 120px" });
  }

  return cols;
});

// --- Methods ---

const getProgress = (row) => {
  if (!row.target_total || row.target_total === 0) return 0;
  const progress = row.actual_count / row.target_total;
  return Math.min(progress, 1);
};

const getProgressPercent = (row) => {
  if (!row.target_total || row.target_total === 0) return 0;
  return Math.round((row.actual_count / row.target_total) * 100);
};

const getProgressColor = (row) => {
  const percent = getProgressPercent(row);
  if (percent >= 100) return "green-6";
  if (percent >= 75) return "light-blue-6";
  if (percent >= 50) return "orange-6";
  return "red-6";
};

const startEdit = (row) => {
  editingBU.value = row.target_bu;
  editTargetValue.value = row.target_total;
};

const cancelEdit = () => {
  editingBU.value = null;
  editTargetValue.value = 0;
};

const saveTarget = async (bu) => {
  if (!editTargetValue.value || editTargetValue.value < 1) {
    $q.notify({
      type: "warning",
      message: "Target harus minimal 1",
      position: "bottom",
    });
    return;
  }

  saving.value = true;
  try {
    await axios.put(`${import.meta.env.VITE_API}document/report/target`, {
      target_bu: bu,
      target_total: editTargetValue.value,
    });

    $q.notify({
      type: "positive",
      message: "Target berhasil diperbarui",
      position: "bottom",
    });

    editingBU.value = null;
    await loadData();
  } catch (err) {
    const message = err.response?.data?.message || "Gagal menyimpan target";
    $q.notify({
      type: "negative",
      message,
      position: "bottom",
    });
  } finally {
    saving.value = false;
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/report/target`);
    targets.value = res.data;
  } catch (err) {
    $q.notify({
      type: "negative",
      message: "Gagal memuat data target",
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
