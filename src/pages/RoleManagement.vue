<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="accessibility_new" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Role</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Master</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Master Role</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="roles"
          :columns="columns"
          row-key="role_id"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="filter"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
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

          <template v-slot:top-left>
            <q-select borderless dense v-model="pagination.rowsPerPage" :options="[5, 10, 25, 50]">
              <template v-slot:before>
                <q-icon name="reorder"><q-tooltip>Rows per page</q-tooltip></q-icon>
              </template>
            </q-select>
          </template>

          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn unelevated color="blue-6" label="Tambah Data" icon="add_circle" @click="openAddDialog"
                class="tw-font-semibold tw-px-4 tw-rounded-lg" />
              <q-input outlined dense debounce="300" v-model="filter" placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]">
                <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
              </q-input>
            </div>
          </template>

          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-text-center">
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props">
              <q-btn round dense color="purple-6" size="sm" icon="visibility" @click="openMenuAccessDialog(props.row)" class="tw-mr-1">
                <q-tooltip>Akses Menu</q-tooltip>
              </q-btn>
              <q-btn round dense color="orange-8" size="sm" icon="edit" @click="openEditDialog(props.row)" class="tw-mr-1">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn round dense color="negative" size="sm" icon="delete" @click="confirmDelete(props.row)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Add/Edit -->
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon :name="isEdit ? 'edit' : 'add_circle'" size="28px" />
            {{ isEdit ? 'Edit Role' : 'Tambah Role' }}
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="tw-p-6">
          <q-input v-model="form.role_name" outlined label="Nama Role *" autofocus
            :rules="[val => !!val || 'Nama role wajib diisi']" @keyup.enter="saveRole">
            <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="saveRole" class="tw-px-6" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Akses Menu -->
    <q-dialog v-model="dialogMenuAccess" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-lg tw-rounded-2xl">
        <q-card-section class="tw-bg-purple-600">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="menu_book" size="28px" />
            Akses Menu — {{ menuAccessRoleName }}
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="tw-p-6">
          <!-- Search -->
          <q-input v-model="menuSearch" outlined dense placeholder="Cari menu..." class="tw-mb-3">
            <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
          </q-input>

          <!-- Tree Checkbox -->
          <div style="max-height: 400px; overflow-y: auto;" class="tw-border tw-border-slate-200 tw-rounded-lg tw-p-3">
            <div v-if="menuTree.length === 0" class="tw-text-center tw-text-slate-400 tw-py-4 tw-text-sm">Tidak ada menu</div>
            <div v-for="parent in filteredMenuTree" :key="parent.id" class="tw-mb-2">
              <q-checkbox
                :model-value="isParentChecked(parent)"
                @update:model-value="toggleParent(parent, $event)"
                :label="parent.name + (parent.link ? ' (' + parent.link + ')' : '')"
                dense class="tw-font-semibold"
              />
              <div v-if="parent.children && parent.children.length > 0" class="tw-ml-6">
                <div v-for="child in parent.children" :key="child.id" class="tw-mb-1">
                  <q-checkbox
                    v-model="selectedMenuIds"
                    :val="child.id"
                    :label="child.name + (child.link ? ' (' + child.link + ')' : '')"
                    dense
                    @update:model-value="onChildToggle(parent)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="tw-text-xs tw-text-slate-500 tw-mt-2">{{ selectedMenuIds.length }} menu dipilih</div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="saveMenuAccess" class="tw-px-6" :loading="savingMenuAccess" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { domain } from "../utils.js";

const $q = useQuasar();
const roles = ref([]);
const loading = ref(false);
const saving = ref(false);
const filter = ref("");
const dialogForm = ref(false);
const isEdit = ref(false);

// Menu Access state
const dialogMenuAccess = ref(false);
const menuAccessRoleId = ref(null);
const menuAccessRoleName = ref("");
const menuSearch = ref("");
const allMenus = ref([]);
const selectedMenuIds = ref([]);
const savingMenuAccess = ref(false);

const menuTree = computed(() => {
  const parents = allMenus.value.filter(m => !m.parent || m.parent === 0 || m.parent === '0');
  const children = allMenus.value.filter(m => m.parent && m.parent !== 0 && m.parent !== '0');
  return parents.map(p => ({
    ...p,
    children: children.filter(c => c.parent === p.id || String(c.parent) === String(p.id)),
  }));
});

const filteredMenuTree = computed(() => {
  if (!menuSearch.value) return menuTree.value;
  const needle = menuSearch.value.toLowerCase();
  return menuTree.value.filter(p =>
    p.name.toLowerCase().includes(needle) || (p.children || []).some(c => c.name.toLowerCase().includes(needle))
  );
});

const isParentChecked = (parent) => {
  // Parent is checked if at least one child is selected OR parent itself is selected
  if (parent.children && parent.children.length > 0) {
    const anyChildChecked = parent.children.some(c => selectedMenuIds.value.includes(c.id));
    return selectedMenuIds.value.includes(parent.id) || anyChildChecked;
  }
  return selectedMenuIds.value.includes(parent.id);
};

const toggleParent = (parent, checked) => {
  const childIds = (parent.children || []).map(c => c.id);
  if (checked) {
    // Check parent + all children
    if (!selectedMenuIds.value.includes(parent.id)) selectedMenuIds.value.push(parent.id);
    childIds.forEach(id => { if (!selectedMenuIds.value.includes(id)) selectedMenuIds.value.push(id); });
  } else {
    // Uncheck parent + all children
    selectedMenuIds.value = selectedMenuIds.value.filter(id => id !== parent.id && !childIds.includes(id));
  }
};

const onChildToggle = (parent) => {
  // Called when a child checkbox changes - manage parent state
  const childIds = (parent.children || []).map(c => c.id);
  const anyChildChecked = childIds.some(id => selectedMenuIds.value.includes(id));
  
  if (anyChildChecked) {
    // At least one child checked -> ensure parent is checked
    if (!selectedMenuIds.value.includes(parent.id)) {
      selectedMenuIds.value.push(parent.id);
    }
  } else {
    // All children unchecked -> uncheck parent too
    selectedMenuIds.value = selectedMenuIds.value.filter(id => id !== parent.id);
  }
};

const openMenuAccessDialog = async (row) => {
  menuAccessRoleId.value = row.role_id;
  menuAccessRoleName.value = row.role_name;
  menuSearch.value = "";
  // Load all menus
  if (allMenus.value.length === 0) {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}role-menu/menus`);
      allMenus.value = res.data;
    } catch { allMenus.value = []; }
  }
  // Load current assigned menus for this role
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role-menu/list`, { params: { role_id: row.role_id } });
    selectedMenuIds.value = (res.data || []).map(rm => rm.menu_id);
  } catch { selectedMenuIds.value = []; }
  dialogMenuAccess.value = true;
};

const saveMenuAccess = async () => {
  savingMenuAccess.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}role-menu/save`, {
      role_id: menuAccessRoleId.value,
      menu_ids: selectedMenuIds.value,
    });
    $q.notify({ type: "positive", message: "Akses menu berhasil disimpan", position: "bottom" });
    dialogMenuAccess.value = false;
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan akses menu", position: "bottom" });
  } finally {
    savingMenuAccess.value = false;
  }
};

const pagination = ref({ sortBy: "role_id", descending: false, page: 1, rowsPerPage: 10 });

const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 70px" },
  // { name: "role_id", label: "ID", field: "role_id", align: "center", sortable: true, style: "width: 60px" },
  { name: "role_name", label: "Nama Role", field: "role_name", align: "left", sortable: true },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 140px" },
];

const form = ref({ role_name: "" });
const editId = ref("");

const loadRoles = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role-management/list`);
    roles.value = res.data;
  } catch (error) {
    $q.notify({ type: "negative", message: "Gagal memuat data role", position: "bottom" });
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  isEdit.value = false;
  form.value = { role_name: "" };
  dialogForm.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  editId.value = row.encrypted_id;
  form.value = { role_name: row.role_name || "" };
  dialogForm.value = true;
};

const saveRole = async () => {
  if (!form.value.role_name.trim()) {
    $q.notify({ type: "warning", message: "Nama role wajib diisi", position: "bottom" });
    return;
  }
  saving.value = true;
  try {
    if (isEdit.value) {
      await axios.post(`${import.meta.env.VITE_API}role-management/update`, { id: editId.value, ...form.value });
      $q.notify({ type: "positive", message: "Role berhasil diperbarui", position: "bottom" });
    } else {
      await axios.post(`${import.meta.env.VITE_API}role-management/add`, form.value);
      $q.notify({ type: "positive", message: "Role berhasil ditambahkan", position: "bottom" });
    }
    dialogForm.value = false;
    await loadRoles();
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan role", position: "bottom" });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Hapus role <b>${row.role_name}</b>?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}role-management/delete`, { id: row.encrypted_id });
      $q.notify({ type: "positive", message: "Role berhasil dihapus", position: "bottom" });
      await loadRoles();
    } catch (error) {
      $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menghapus role", position: "bottom" });
    }
  });
};

onMounted(() => { loadRoles(); });
</script>
