<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="tw-flex tw-justify-center tw-items-center tw-min-h-[400px]">
      <q-spinner-dots size="50px" color="blue-6" />
    </div>

    <q-card v-else-if="fileDetail" class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="description" size="28px" class="tw-text-white" />
          <div class="tw-flex-1">
            <div class="text-h6 tw-text-white tw-font-bold">{{ fileDetail.content_name }}</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span class="tw-cursor-pointer hover:tw-underline" @click="goToDocument">Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Detail File</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- File Metadata Section -->
      <q-card-section class="tw-bg-white tw-p-6">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div class="tw-text-lg tw-font-bold tw-text-slate-700">Informasi File</div>
          <div class="tw-flex tw-gap-2">
            <q-btn
              v-if="fileDetail.permissions?.view"
              unelevated color="teal-6" icon="visibility" label="Preview" size="sm"
              @click="viewFile" class="tw-font-semibold tw-rounded-lg"
            />
            <q-btn
              v-if="fileDetail.permissions?.download"
              unelevated color="green-7" icon="download" label="Download" size="sm"
              @click="downloadFile" class="tw-font-semibold tw-rounded-lg"
            />
            <q-btn
              v-if="fileDetail.content_type === 'renewable' && fileDetail.permissions?.upload"
              unelevated color="orange-7" icon="autorenew" label="Renew" size="sm"
              @click="dialogRenew = true" class="tw-font-semibold tw-rounded-lg"
            />
          </div>
        </div>

        <!-- Metadata Grid -->
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Nama File</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.content_name }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Folder</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.folder_name || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4 md:tw-col-span-2">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Deskripsi</div>
            <div class="tw-text-sm tw-text-slate-800 tw-mt-1">{{ fileDetail.content_desc || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Tipe Dokumen</div>
            <div class="tw-mt-1">
              <q-badge :color="fileDetail.content_type === 'renewable' ? 'orange' : 'grey-6'"
                :label="fileDetail.content_type === 'renewable' ? 'Renewable' : 'Non-Renewable'" />
            </div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Security</div>
            <div class="tw-mt-1">
              <q-badge :color="fileDetail.content_security === 'restricted' ? 'red' : 'blue-6'"
                :label="fileDetail.content_security === 'restricted' ? 'Restricted' : 'Non-Restricted'" />
            </div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Due Date</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">
              {{ fileDetail.content_duedate ? formatDate(fileDetail.content_duedate) : '-' }}
            </div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Keywords</div>
            <div class="tw-text-sm tw-text-slate-800 tw-mt-1">{{ fileDetail.content_keywords || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Business Unit</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.content_bu || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Division</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.content_div || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Owner</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.owner_name || fileDetail.content_owner || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Keeper</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.keeper_name || fileDetail.content_keeper || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">DIC</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ fileDetail.dic_name || fileDetail.content_dic || '-' }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Versi</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">v{{ fileDetail.content_ver || 1 }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Tanggal Upload</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ formatDateTime(fileDetail.content_entrydate) }}</div>
          </div>
          <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4">
            <div class="tw-text-xs tw-text-slate-500 tw-uppercase tw-tracking-wide">Terakhir Diubah</div>
            <div class="tw-text-sm tw-font-medium tw-text-slate-800 tw-mt-1">{{ formatDateTime(fileDetail.content_lastmodified) }}</div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Keeper Status Section -->
      <q-card-section class="tw-bg-white tw-p-6">
        <div class="tw-text-lg tw-font-bold tw-text-slate-700 tw-mb-4">Status Keeper</div>
        <div class="tw-flex tw-items-center tw-gap-4 tw-flex-wrap">
          <q-badge
            :color="getStatusKeeperColor(fileDetail.content_statuskeeper)"
            :label="getStatusKeeperLabel(fileDetail.content_statuskeeper)"
            class="tw-text-sm tw-px-3 tw-py-1"
          />
          <span v-if="fileDetail.content_confirmdate" class="tw-text-xs tw-text-slate-500">
            Diproses: {{ formatDateTime(fileDetail.content_confirmdate) }}
          </span>
          <span v-if="fileDetail.content_statuskeeper === 2 && fileDetail.content_ket" class="tw-text-xs tw-text-red-600">
            Alasan: {{ fileDetail.content_ket }}
          </span>
        </div>

        <!-- Keeper Action Buttons (only visible to assigned keeper when status is pending) -->
        <div v-if="isAssignedKeeper && fileDetail.content_statuskeeper === 0" class="tw-mt-4 tw-flex tw-gap-3">
          <q-btn
            unelevated color="green-7" icon="check_circle" label="Konfirmasi Keeper"
            @click="confirmKeeper" :loading="processingKeeper"
            class="tw-font-semibold tw-rounded-lg"
          />
          <q-btn
            unelevated color="red-7" icon="cancel" label="Tolak Keeper"
            @click="dialogRejectKeeper = true" :loading="processingKeeper"
            class="tw-font-semibold tw-rounded-lg"
          />
        </div>
      </q-card-section>
      <q-separator />

      <!-- Activity Log Section -->
      <q-card-section class="tw-bg-white tw-p-6">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div class="tw-text-lg tw-font-bold tw-text-slate-700">Log Aktivitas</div>
          <q-btn flat dense icon="refresh" size="sm" @click="loadFileLog" :loading="loadingLog">
            <q-tooltip>Refresh log</q-tooltip>
          </q-btn>
        </div>

        <q-table
          :rows="activityLog"
          :columns="logColumns"
          row-key="log_date"
          :pagination="logPagination"
          @update:pagination="val => logPagination = val"
          :rows-per-page-options="[5, 10, 25]"
          :loading="loadingLog"
          flat dense
          class="tw-shadow-sm tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                class="tw-bg-slate-600 tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-3">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body-cell-log_date="props">
            <q-td :props="props" class="tw-text-xs">
              {{ formatDateTime(props.row.log_date) }}
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-4 tw-text-slate-400 tw-text-sm">Belum ada aktivitas</div>
          </template>
        </q-table>
      </q-card-section>
      <q-separator />

      <!-- Comments/Updates Section -->
      <q-card-section class="tw-bg-white tw-p-6">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div class="tw-text-lg tw-font-bold tw-text-slate-700">Komentar / Update</div>
          <q-btn flat dense icon="refresh" size="sm" @click="loadUpdates" :loading="loadingUpdates">
            <q-tooltip>Refresh komentar</q-tooltip>
          </q-btn>
        </div>

        <!-- Add Comment Form -->
        <div class="tw-bg-slate-50 tw-rounded-lg tw-p-4 tw-mb-4">
          <q-input
            v-model="newComment"
            outlined
            type="textarea"
            rows="3"
            placeholder="Tulis komentar atau update..."
            maxlength="2000"
            counter
            class="tw-rounded-lg tw-mb-2"
          />
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-text-xs tw-text-slate-500">Maksimal 2000 karakter</div>
            <q-btn
              unelevated color="blue-6" icon="send" label="Kirim"
              size="sm" @click="submitComment" :loading="submittingComment"
              :disable="!newComment.trim()"
              class="tw-font-semibold tw-rounded-lg"
            />
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="loadingUpdates" class="tw-text-center tw-py-4">
          <q-spinner-dots size="30px" color="blue-6" />
        </div>
        <div v-else-if="updates.length === 0" class="tw-text-center tw-py-4 tw-text-slate-400 tw-text-sm">
          Belum ada komentar
        </div>
        <div v-else class="tw-space-y-3">
          <div v-for="(update, idx) in updates" :key="idx"
            class="tw-bg-white tw-border tw-border-slate-200 tw-rounded-lg tw-p-4">
            <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
              <div class="tw-flex tw-items-center tw-gap-2">
                <q-icon name="person" size="18px" color="blue-6" />
                <span class="tw-text-sm tw-font-semibold tw-text-slate-700">
                  {{ update.creator_name || update.update_createdby }}
                </span>
              </div>
              <span class="tw-text-xs tw-text-slate-400">{{ formatDateTime(update.update_date) }}</span>
            </div>
            <div class="tw-text-sm tw-text-slate-600 tw-whitespace-pre-wrap">{{ update.update_isi }}</div>
            <div v-if="update.update_attach" class="tw-mt-2 tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-blue-600">
              <q-icon name="attach_file" size="14px" />
              <span>{{ update.update_attach }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-separator />
      <q-card-actions align="left" class="tw-p-4 tw-bg-slate-50">
        <q-btn label="Kembali" color="red-7" push icon="arrow_back" @click="goToDocument" class="tw-px-6 tw-font-semibold" />
      </q-card-actions>
    </q-card>

    <!-- Dialog: Reject Keeper -->
    <q-dialog v-model="dialogRejectKeeper" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl">
        <q-card-section class="tw-bg-red-600">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="cancel" size="24px" />
            Tolak Keeper
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="tw-p-6">
          <q-input
            v-model="rejectReason"
            outlined
            type="textarea"
            rows="3"
            label="Alasan Penolakan"
            placeholder="Masukkan alasan penolakan..."
            :rules="[val => !!val && val.trim().length > 0 || 'Alasan wajib diisi']"
          >
            <template v-slot:prepend><q-icon name="notes" color="red-6" /></template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Batal" color="grey-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Tolak" color="red-7" push icon="cancel" @click="rejectKeeper" :loading="processingKeeper" class="tw-px-6" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Renew File -->
    <q-dialog v-model="dialogRenew" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl">
        <q-card-section class="tw-bg-orange-600">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="autorenew" size="24px" />
            Renew Dokumen
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="tw-p-6">
          <q-input
            v-model="renewDueDate"
            outlined
            label="Due Date Baru"
            readonly
            :rules="[val => !!val || 'Due date baru wajib diisi']"
            class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="event" color="orange-7" /></template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="renewDueDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Tutup" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-uploader
            ref="renewUploaderRef"
            :max-file-size="10485760"
            :max-files="1"
            label="Pilih file baru (Maks. 10MB)"
            flat bordered
            class="tw-w-full tw-rounded-lg"
            color="orange-7"
            @added="onRenewFileAdded"
            @removed="renewFile = null"
            @rejected="onRenewFileRejected"
            :auto-upload="false"
            hide-upload-btn
          />
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Batal" color="grey-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Renew" color="orange-7" push icon="autorenew" @click="submitRenew" :loading="submittingRenew" class="tw-px-6" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// Route param
const fileId = route.params.id;

// --- State ---
const loading = ref(true);
const fileDetail = ref(null);
const activityLog = ref([]);
const updates = ref([]);
const loadingLog = ref(false);
const loadingUpdates = ref(false);

// Keeper workflow
const processingKeeper = ref(false);
const dialogRejectKeeper = ref(false);
const rejectReason = ref("");

// Comments
const newComment = ref("");
const submittingComment = ref(false);

// Renew
const dialogRenew = ref(false);
const renewDueDate = ref("");
const renewSelectedFile = ref(null);
const renewUploaderRef = ref(null);
const submittingRenew = ref(false);

// Pagination
const logPagination = ref({ sortBy: "log_date", descending: true, page: 1, rowsPerPage: 5 });

// Log table columns
const logColumns = [
  { name: "log_action", label: "Aksi", field: "log_action", align: "left", sortable: true },
  { name: "user_name", label: "User", field: "user_name", align: "left", sortable: true },
  { name: "log_nik", label: "NIK", field: "log_nik", align: "left", sortable: true },
  { name: "log_date", label: "Tanggal", field: "log_date", align: "left", sortable: true },
];

// --- Computed ---
const currentUserNik = computed(() => {
  try {
    const data = JSON.parse(window.localStorage.getItem("data"));
    return data?.data?.nik || "";
  } catch {
    return "";
  }
});

const isAssignedKeeper = computed(() => {
  if (!fileDetail.value || !currentUserNik.value) return false;
  return fileDetail.value.content_keeper === currentUserNik.value;
});

// --- Helpers ---
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD-MM-YYYY");
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("DD-MM-YYYY HH:mm");
};

const getStatusKeeperColor = (status) => {
  switch (status) {
    case 0: return "orange";
    case 1: return "green";
    case 2: return "red";
    default: return "grey";
  }
};

const getStatusKeeperLabel = (status) => {
  switch (status) {
    case 0: return "Pending";
    case 1: return "Confirmed";
    case 2: return "Rejected";
    default: return "Unknown";
  }
};

// --- API Methods ---
const loadFileDetail = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/file/${fileId}`);
    fileDetail.value = res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal memuat detail file";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
    fileDetail.value = null;
  } finally {
    loading.value = false;
  }
};

const loadFileLog = async () => {
  loadingLog.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/file/${fileId}/log`);
    activityLog.value = res.data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat log aktivitas", position: "bottom" });
  } finally {
    loadingLog.value = false;
  }
};

const loadUpdates = async () => {
  loadingUpdates.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/file/${fileId}/updates`);
    updates.value = res.data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat komentar", position: "bottom" });
  } finally {
    loadingUpdates.value = false;
  }
};

// --- Keeper Workflow ---
const confirmKeeper = async () => {
  $q.dialog({
    title: "Konfirmasi Keeper",
    message: "Apakah Anda yakin ingin mengkonfirmasi sebagai keeper untuk dokumen ini?",
    ok: { push: true, color: "green-7", label: "Ya, Konfirmasi", icon: "check_circle" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    processingKeeper.value = true;
    try {
      await axios.post(`${import.meta.env.VITE_API}document/file/${fileId}/confirm-keeper`);
      $q.notify({ type: "positive", message: "Keeper berhasil dikonfirmasi", position: "bottom" });
      await loadFileDetail();
      await loadFileLog();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal mengkonfirmasi keeper";
      $q.notify({ type: "negative", message: msg, position: "bottom" });
    } finally {
      processingKeeper.value = false;
    }
  });
};

const rejectKeeper = async () => {
  if (!rejectReason.value.trim()) {
    $q.notify({ type: "warning", message: "Alasan penolakan wajib diisi", position: "bottom" });
    return;
  }
  processingKeeper.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}document/file/${fileId}/reject-keeper`, {
      reason: rejectReason.value.trim(),
    });
    $q.notify({ type: "positive", message: "Keeper berhasil ditolak", position: "bottom" });
    dialogRejectKeeper.value = false;
    rejectReason.value = "";
    await loadFileDetail();
    await loadFileLog();
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal menolak keeper";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
  } finally {
    processingKeeper.value = false;
  }
};

// --- Comments ---
const submitComment = async () => {
  if (!newComment.value.trim()) {
    $q.notify({ type: "warning", message: "Komentar tidak boleh kosong", position: "bottom" });
    return;
  }
  submittingComment.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}document/file/${fileId}/update`, {
      update_isi: newComment.value.trim(),
    });
    $q.notify({ type: "positive", message: "Komentar berhasil ditambahkan", position: "bottom" });
    newComment.value = "";
    await loadUpdates();
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal menambahkan komentar";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
  } finally {
    submittingComment.value = false;
  }
};

// --- File Actions ---
const viewFile = () => {
  // Direct URL to FTP web server (like legacy)
  if (fileDetail.value?.content_file) {
    window.open(`${import.meta.env.VITE_FTP_URL || 'https://app-files.dbc.co.id/legaltemplate/'}${fileDetail.value.content_file}`, "_blank");
  } else {
    const token = window.localStorage.getItem("token");
    window.open(`${import.meta.env.VITE_API}document/file/${fileId}/view?token=${token}`, "_blank");
  }
};

const downloadFile = () => {
  // Direct URL to FTP web server with download (like legacy)
  if (fileDetail.value?.content_file) {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_FTP_URL || 'https://app-files.dbc.co.id/legaltemplate/'}${fileDetail.value.content_file}`;
    link.download = fileDetail.value.content_name || fileDetail.value.content_file;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const token = window.localStorage.getItem("token");
    window.open(`${import.meta.env.VITE_API}document/file/${fileId}/download?token=${token}`, "_blank");
  }
};

// --- Renew ---
const onRenewFileAdded = (files) => {
  if (files && files.length > 0) {
    renewSelectedFile.value = files[0];
  }
};

const onRenewFileRejected = (rejectedEntries) => {
  if (rejectedEntries && rejectedEntries.length > 0) {
    const reason = rejectedEntries[0].failedPropValidation;
    if (reason === "max-file-size") {
      $q.notify({ type: "negative", message: "Ukuran file melebihi batas 10MB", position: "bottom" });
    } else {
      $q.notify({ type: "negative", message: "File ditolak", position: "bottom" });
    }
  }
};

const submitRenew = async () => {
  if (!renewDueDate.value) {
    $q.notify({ type: "warning", message: "Due date baru wajib diisi", position: "bottom" });
    return;
  }
  if (!renewSelectedFile.value) {
    $q.notify({ type: "warning", message: "File baru wajib dipilih", position: "bottom" });
    return;
  }
  submittingRenew.value = true;
  try {
    const formData = new FormData();
    formData.append("file", renewSelectedFile.value);
    formData.append("duedate", renewDueDate.value);

    await axios.post(`${import.meta.env.VITE_API}document/file/${fileId}/renew`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    $q.notify({ type: "positive", message: "File berhasil diperbarui (renew)", position: "bottom" });
    dialogRenew.value = false;
    renewDueDate.value = "";
    renewSelectedFile.value = null;
    await loadFileDetail();
    await loadFileLog();
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal memperbarui file";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
  } finally {
    submittingRenew.value = false;
  }
};

// --- Navigation ---
const goToDocument = () => {
  router.push("/document");
};

// --- Lifecycle ---
onMounted(async () => {
  await loadFileDetail();
  await Promise.all([loadFileLog(), loadUpdates()]);
});
</script>
