<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="tw-flex tw-justify-center tw-items-center tw-min-h-[400px]">
      <q-spinner-dots size="50px" color="blue-6" />
    </div>

    <q-card v-else class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="folder_shared" size="28px" class="tw-text-white" />
          <div class="tw-flex-1">
            <div class="text-h6 tw-text-white tw-font-bold">Permission Folder</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span class="tw-cursor-pointer hover:tw-underline" @click="goToDocument">Document</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Permission Folder</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Content -->
      <q-card-section class="tw-bg-white tw-p-6">
        <!-- Folder Info -->
        <div class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-rounded-lg tw-p-4 tw-mb-6">
          <div class="tw-text-sm tw-text-blue-800 tw-font-semibold">Folder: {{ folderName || '-' }}</div>
        </div>

        <!-- Permission Table -->
        <q-table
          :rows="permissions"
          :columns="columns"
          row-key="scope_key"
          :pagination="pagination"
          :rows-per-page-options="[10, 25, 50]"
          :loading="loadingTable"
          :filter="filter"
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="tw-bg-slate-700 tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                unelevated color="blue-6" label="Tambah Permission" icon="add"
                @click="openAddDialog"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined dense debounce="300" v-model="filter"
                placeholder="Cari..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>

          <!-- No column -->
          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700 tw-text-center tw-font-medium">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <!-- Scope column -->
          <template v-slot:body-cell-scope="props">
            <q-td :props="props" class="tw-py-4">
              <q-badge v-if="props.row.aksesfolder_nik" color="blue-6" :label="'NIK: ' + props.row.aksesfolder_nik" />
              <q-badge v-else-if="props.row.aksesfolder_bu && props.row.aksesfolder_div" color="teal-6" :label="'Div: ' + props.row.aksesfolder_bu + ' / ' + props.row.aksesfolder_div" />
              <q-badge v-else-if="props.row.aksesfolder_bu" color="orange-7" :label="'BU: ' + props.row.aksesfolder_bu" />
              <q-badge v-else color="grey-6" label="Unknown" />
            </q-td>
          </template>

          <!-- User name column -->
          <template v-slot:body-cell-user_name="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.row.user_name || '-' }}
            </q-td>
          </template>

          <!-- Permission flags -->
          <template v-slot:body-cell-view="props">
            <q-td :props="props" class="tw-py-4 tw-text-center">
              <q-icon :name="props.row.aksesfolder_view ? 'check_circle' : 'cancel'" :color="props.row.aksesfolder_view ? 'green' : 'red-4'" size="20px" />
            </q-td>
          </template>
          <template v-slot:body-cell-upload="props">
            <q-td :props="props" class="tw-py-4 tw-text-center">
              <q-icon :name="props.row.aksesfolder_upload ? 'check_circle' : 'cancel'" :color="props.row.aksesfolder_upload ? 'green' : 'red-4'" size="20px" />
            </q-td>
          </template>
          <template v-slot:body-cell-manage="props">
            <q-td :props="props" class="tw-py-4 tw-text-center">
              <q-icon :name="props.row.aksesfolder_manage ? 'check_circle' : 'cancel'" :color="props.row.aksesfolder_manage ? 'green' : 'red-4'" size="20px" />
            </q-td>
          </template>

          <!-- Actions column -->
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-4 tw-text-center">
              <q-btn
                round dense color="light-blue-9" size="sm" icon="edit"
                @click="openEditDialog(props.row)"
                class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
              </q-btn>
              <q-btn
                round dense color="negative" size="sm" icon="delete"
                @click="confirmDelete(props.row)"
                class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
              >
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="tw-text-center tw-py-8 tw-text-slate-400">
              <q-icon name="lock_open" size="48px" class="tw-mb-2" />
              <div class="tw-text-sm">Belum ada permission untuk folder ini</div>
            </div>
          </template>
        </q-table>
      </q-card-section>

      <!-- Footer Actions -->
      <q-separator />
      <q-card-actions align="left" class="tw-p-4 tw-bg-slate-50">
        <q-btn label="Kembali" color="red-7" push icon="arrow_back" @click="goToDocument" class="tw-px-6 tw-font-semibold" />
      </q-card-actions>
    </q-card>

    <!-- Add/Edit Permission Dialog -->
    <q-dialog v-model="dialogPermission" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-lg tw-rounded-2xl tw-shadow-2xl">
        <q-card-section class="tw-bg-blue-600">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon :name="isEditing ? 'edit' : 'add_circle'" size="24px" />
            {{ isEditing ? 'Edit Permission' : 'Tambah Permission' }}
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="tw-p-6">
          <!-- Required field banner -->
          <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="red" size="24px" />
            </template>
            <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
          </q-banner>

          <!-- Scope Selection (disabled when editing) -->
          <div class="tw-mb-4">
            <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">
              Scope <span class="tw-text-red-500">*</span>
            </div>
            <q-option-group
              v-model="form.scopeType"
              :options="scopeOptions"
              type="radio"
              inline
              :disable="isEditing"
              class="tw-mb-3"
            />
          </div>

          <!-- NIK Selection (User Search) -->
          <div v-if="form.scopeType === 'nik'" class="tw-mb-4">
            <q-select
              v-model="form.nik"
              :options="filteredUsers"
              option-value="account_nik"
              option-label="display_label"
              label="Pilih User (NIK)"
              outlined
              use-input
              input-debounce="300"
              @filter="filterUsers"
              :disable="isEditing"
              :rules="[val => !!val || 'User wajib dipilih']"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="person" color="blue-6" />
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="person" color="blue-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                    <q-item-label caption>NIK: {{ scope.opt.account_nik }} | {{ scope.opt.account_bu }} - {{ scope.opt.account_div }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="tw-text-slate-400">Tidak ada user ditemukan</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- BU Selection -->
          <div v-if="form.scopeType === 'bu'" class="tw-mb-4">
            <q-select
              v-model="form.bu"
              :options="buOptions"
              label="Business Unit"
              outlined
              :disable="isEditing"
              :rules="[val => !!val || 'BU wajib dipilih']"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="orange-7" />
              </template>
            </q-select>
          </div>

          <!-- Division Selection -->
          <div v-if="form.scopeType === 'div'" class="tw-mb-4">
            <q-select
              v-model="form.bu"
              :options="buOptions"
              label="Business Unit"
              outlined
              :disable="isEditing"
              :rules="[val => !!val || 'BU wajib dipilih']"
              class="tw-mb-3"
            >
              <template v-slot:prepend>
                <q-icon name="business" color="teal-6" />
              </template>
            </q-select>
            <q-input
              v-model="form.div"
              outlined
              label="Division"
              :disable="isEditing"
              :rules="[val => !!val && val.trim().length > 0 || 'Division wajib diisi']"
            >
              <template v-slot:prepend>
                <q-icon name="account_tree" color="teal-6" />
              </template>
            </q-input>
          </div>

          <q-separator class="tw-my-4" />

          <!-- Permission Flags -->
          <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-3">
            Permission Flags <span class="tw-text-red-500">*</span>
          </div>
          <div class="tw-flex tw-flex-wrap tw-gap-4">
            <q-toggle v-model="form.view" label="View" color="green" />
            <q-toggle v-model="form.upload" label="Upload" color="blue-6" />
            <q-toggle v-model="form.manage" label="Manage" color="orange-7" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6 tw-font-semibold" />
          <q-btn
            :label="isEditing ? 'Simpan' : 'Tambah'"
            color="blue-6" push icon="save"
            @click="savePermission" :loading="saving"
            class="tw-px-6 tw-font-semibold"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

// Route param (encrypted folder ID)
const folderId = route.params.id;

// --- State ---
const loading = ref(true);
const loadingTable = ref(false);
const folderName = ref("");
const permissions = ref([]);
const filter = ref("");
const pagination = ref({ sortBy: "scope", descending: false, page: 1, rowsPerPage: 10 });

// Dialog state
const dialogPermission = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const editingScopeValue = ref("");

// Form
const form = ref({
  scopeType: "nik",
  nik: null,
  bu: null,
  div: "",
  view: true,
  upload: false,
  manage: false,
});

// User list for NIK selection
const userList = ref([]);
const filteredUsers = ref([]);

// Scope options
const scopeOptions = [
  { label: "User (NIK)", value: "nik" },
  { label: "Business Unit", value: "bu" },
  { label: "Division", value: "div" },
];

// BU options
const buOptions = ["DBC", "DJM", "WDJR", "GBC", "DFR", "DTU", "WTUR"];

// Table columns
const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 60px" },
  { name: "scope", label: "Scope", field: "scope_key", align: "left", sortable: true },
  { name: "user_name", label: "Nama", field: "user_name", align: "left", sortable: true },
  { name: "view", label: "View", field: "aksesfolder_view", align: "center", sortable: true },
  { name: "upload", label: "Upload", field: "aksesfolder_upload", align: "center", sortable: true },
  { name: "manage", label: "Manage", field: "aksesfolder_manage", align: "center", sortable: true },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false },
];

// --- Methods ---
const loadPermissions = async () => {
  loadingTable.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/folder/${folderId}`);
    permissions.value = (res.data || []).map((p) => ({
      ...p,
      scope_key: p.aksesfolder_nik || (p.aksesfolder_bu && p.aksesfolder_div ? `${p.aksesfolder_bu}/${p.aksesfolder_div}` : p.aksesfolder_bu || ""),
    }));
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal memuat permission folder";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
  } finally {
    loadingTable.value = false;
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/users`, {
      params: { tingkat: 0 },
    });
    userList.value = (res.data || []).map((u) => ({
      ...u,
      display_label: `${u.account_nik} - ${u.employee_name}`,
    }));
  } catch {
    // Silently fail — user list is optional
  }
};

const filterUsers = (val, update) => {
  update(() => {
    if (!val) {
      filteredUsers.value = userList.value;
    } else {
      const needle = val.toLowerCase();
      filteredUsers.value = userList.value.filter(
        (u) =>
          u.account_nik.toLowerCase().includes(needle) ||
          u.employee_name.toLowerCase().includes(needle)
      );
    }
  });
};

const loadFolderInfo = async () => {
  try {
    // Try to get folder name from the tree endpoint or just show the ID
    const treeRes = await axios.get(`${import.meta.env.VITE_API}document/folder/tree`);
    const findFolder = (nodes) => {
      for (const node of nodes) {
        if (String(node.folder_id) === String(folderId) || node.encrypted_id === folderId) {
          return node.folder_name;
        }
        if (node.children && node.children.length > 0) {
          const found = findFolder(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const name = findFolder(treeRes.data || []);
    folderName.value = name || `ID: ${folderId}`;
  } catch {
    folderName.value = `ID: ${folderId}`;
  }
};

// --- Dialog Methods ---
const resetForm = () => {
  form.value = {
    scopeType: "nik",
    nik: null,
    bu: null,
    div: "",
    view: true,
    upload: false,
    manage: false,
  };
  isEditing.value = false;
  editingScopeValue.value = "";
};

const openAddDialog = () => {
  resetForm();
  dialogPermission.value = true;
};

const openEditDialog = (row) => {
  isEditing.value = true;
  editingScopeValue.value = row.scope_key;

  if (row.aksesfolder_nik) {
    form.value.scopeType = "nik";
    form.value.nik = row.aksesfolder_nik;
  } else if (row.aksesfolder_bu && row.aksesfolder_div) {
    form.value.scopeType = "div";
    form.value.bu = row.aksesfolder_bu;
    form.value.div = row.aksesfolder_div;
  } else if (row.aksesfolder_bu) {
    form.value.scopeType = "bu";
    form.value.bu = row.aksesfolder_bu;
  }

  form.value.view = !!row.aksesfolder_view;
  form.value.upload = !!row.aksesfolder_upload;
  form.value.manage = !!row.aksesfolder_manage;

  dialogPermission.value = true;
};

const savePermission = async () => {
  // Validate scope
  if (form.value.scopeType === "nik" && !form.value.nik) {
    $q.notify({ type: "warning", message: "User wajib dipilih", position: "bottom" });
    return;
  }
  if (form.value.scopeType === "bu" && !form.value.bu) {
    $q.notify({ type: "warning", message: "Business Unit wajib dipilih", position: "bottom" });
    return;
  }
  if (form.value.scopeType === "div" && (!form.value.bu || !form.value.div.trim())) {
    $q.notify({ type: "warning", message: "BU dan Division wajib diisi", position: "bottom" });
    return;
  }

  saving.value = true;
  try {
    const payload = {
      nik: form.value.scopeType === "nik" ? form.value.nik : null,
      bu: form.value.scopeType === "bu" ? form.value.bu : form.value.scopeType === "div" ? form.value.bu : null,
      div: form.value.scopeType === "div" ? form.value.div.trim() : null,
      view: form.value.view,
      upload: form.value.upload,
      manage: form.value.manage,
    };

    if (isEditing.value) {
      await axios.put(
        `${import.meta.env.VITE_API}document/permission/folder/${folderId}/${editingScopeValue.value}`,
        payload
      );
      $q.notify({ type: "positive", message: "Permission berhasil diperbarui", position: "bottom" });
    } else {
      await axios.post(
        `${import.meta.env.VITE_API}document/permission/folder/${folderId}`,
        payload
      );
      $q.notify({ type: "positive", message: "Permission berhasil ditambahkan", position: "bottom" });
    }

    dialogPermission.value = false;
    await loadPermissions();
  } catch (err) {
    const msg = err?.response?.data?.message || "Gagal menyimpan permission";
    $q.notify({ type: "negative", message: msg, position: "bottom" });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (row) => {
  const scopeLabel = row.aksesfolder_nik
    ? `NIK: ${row.aksesfolder_nik}`
    : row.aksesfolder_bu && row.aksesfolder_div
    ? `Div: ${row.aksesfolder_bu}/${row.aksesfolder_div}`
    : `BU: ${row.aksesfolder_bu}`;

  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Apakah Anda yakin ingin menghapus permission untuk <span class="text-bold">${scopeLabel}</span>?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API}document/permission/folder/${folderId}/${row.scope_key}`
      );
      $q.notify({ type: "positive", message: "Permission berhasil dihapus", position: "bottom" });
      await loadPermissions();
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menghapus permission";
      $q.notify({ type: "negative", message: msg, position: "bottom" });
    }
  });
};

// --- Navigation ---
const goToDocument = () => {
  router.push("/document");
};

// --- Lifecycle ---
onMounted(async () => {
  await Promise.all([loadPermissions(), loadUsers(), loadFolderInfo()]);
});
</script>
