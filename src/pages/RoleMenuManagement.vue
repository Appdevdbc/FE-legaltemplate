<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-400 tw-py-6">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="admin_panel_settings" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Role Menu Management</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Role Menu</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Role Selector -->
      <q-card-section class="tw-bg-slate-50 tw-py-4">
        <div class="tw-flex tw-items-end tw-gap-4">
          <q-select
            v-model="selectedRole"
            :options="roleOptions"
            label="Pilih Role"
            outlined dense
            emit-value map-options
            class="tw-min-w-[250px]"
            @update:model-value="loadRoleMenus"
          >
            <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
          </q-select>
          <q-btn unelevated color="blue-6" label="Tambah Menu" icon="add" @click="openAddDialog"
            :disable="!selectedRole" class="tw-font-semibold tw-px-4 tw-rounded-lg" />
        </div>
      </q-card-section>
      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="roleMenuList"
          :columns="columns"
          row-key="menu_id"
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
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                class="bg-primary text-white text-weight-bold" style="font-size: 13px; padding: 12px 8px;">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:top-right>
            <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari menu..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[250px]">
              <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
            </q-input>
          </template>

          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-text-center">
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-menu_icon="props">
            <q-td :props="props" class="tw-text-center">
              <q-icon v-if="props.row.menu_icon" :name="props.row.menu_icon" size="20px" color="blue-6" />
              <span v-else class="tw-text-slate-400">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-menu_parent="props">
            <q-td :props="props">
              <q-badge v-if="props.row.parent_name" color="blue-2" text-color="blue-9" :label="props.row.parent_name" />
              <span v-else class="tw-text-slate-400 tw-text-xs">Root</span>
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-text-center">
              <q-btn round dense color="negative" size="sm" icon="delete" @click="confirmDelete(props.row)">
                <q-tooltip>Hapus dari role</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="tw-text-center tw-py-8 tw-text-slate-400">
              <q-icon name="admin_panel_settings" size="48px" class="tw-mb-2" />
              <div class="tw-text-sm">{{ selectedRole ? 'Belum ada menu untuk role ini' : 'Pilih role terlebih dahulu' }}</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Add Menu to Role (Multiple Select with Checkboxes) -->
    <q-dialog v-model="dialogAdd" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-lg tw-rounded-2xl">
        <q-card-section class="tw-bg-blue-600">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="add_circle" size="28px" />
            Tambah Menu ke Role
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="tw-p-6">
          <div class="tw-text-sm tw-text-slate-600 tw-mb-4">
            Role: <strong>{{ selectedRoleName }}</strong>
          </div>

          <!-- Search -->
          <q-input v-model="menuSearch" outlined dense placeholder="Cari menu..." class="tw-mb-3">
            <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
          </q-input>

          <!-- Tree Checkbox List -->
          <div style="max-height: 350px; overflow-y: auto;" class="tw-border tw-border-slate-200 tw-rounded-lg tw-p-3">
            <div v-if="filteredAvailableMenuTree.length === 0" class="tw-text-center tw-text-slate-400 tw-py-4 tw-text-sm">
              Tidak ada menu tersedia
            </div>
            <div v-for="parent in filteredAvailableMenuTree" :key="parent.id" class="tw-mb-2">
              <!-- Parent checkbox -->
              <q-checkbox
                :model-value="isParentChecked(parent)"
                :indeterminate-value="isParentIndeterminate(parent)"
                @update:model-value="toggleParent(parent, $event)"
                :label="parent.name + (parent.link ? ' (' + parent.link + ')' : '')"
                dense
                class="tw-font-semibold"
              />
              <!-- Children checkboxes (indented) -->
              <div v-if="parent.children && parent.children.length > 0" class="tw-ml-6">
                <q-checkbox
                  v-for="child in parent.children"
                  :key="child.id"
                  v-model="selectedMenuIds"
                  :val="child.id"
                  :label="child.name + (child.link ? ' (' + child.link + ')' : '')"
                  dense
                  class="tw-block tw-mb-1"
                />
              </div>
            </div>
          </div>

          <div class="tw-text-xs tw-text-slate-500 tw-mt-2">
            {{ selectedMenuIds.length }} menu dipilih
          </div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="addMultipleMenusToRole" class="tw-px-6" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();
const roleMenuList = ref([]);
const allMenus = ref([]);
const loading = ref(false);
const saving = ref(false);
const filter = ref("");
const selectedRole = ref(null);
const roleOptions = ref([]);
const dialogAdd = ref(false);
const selectedMenuToAdd = ref(null);
const selectedMenuIds = ref([]);
const menuSearch = ref("");

const filteredAvailableMenus = computed(() => {
  const assignedIds = new Set(roleMenuList.value.map(rm => rm.menu_id));
  let available = allMenus.value.filter(m => !assignedIds.has(m.id));
  if (menuSearch.value) {
    const needle = menuSearch.value.toLowerCase();
    available = available.filter(m => m.name.toLowerCase().includes(needle) || (m.link || "").toLowerCase().includes(needle));
  }
  return available;
});

// Build tree structure from ALL menus (show all, pre-check assigned ones)
const filteredAvailableMenuTree = computed(() => {
  const available = allMenus.value;

  // Separate parents and children
  const parents = available.filter(m => !m.parent || m.parent === 0 || m.parent === '0');
  const children = available.filter(m => m.parent && m.parent !== 0 && m.parent !== '0');

  // Build tree
  const tree = parents.map(p => ({
    ...p,
    children: children.filter(c => c.parent === p.id || String(c.parent) === String(p.id)),
  }));

  // Add orphan children (parent not in list) as top-level
  const parentIds = new Set(parents.map(p => p.id));
  const orphans = children.filter(c => !parentIds.has(c.parent) && !parentIds.has(parseInt(c.parent)));
  orphans.forEach(o => tree.push({ ...o, children: [] }));

  // Filter by search
  if (menuSearch.value) {
    const needle = menuSearch.value.toLowerCase();
    return tree.filter(p =>
      p.name.toLowerCase().includes(needle) ||
      (p.link || "").toLowerCase().includes(needle) ||
      (p.children || []).some(c => c.name.toLowerCase().includes(needle) || (c.link || "").toLowerCase().includes(needle))
    );
  }

  return tree;
});

// Check if all children of a parent are selected
const isParentChecked = (parent) => {
  const ids = [parent.id, ...(parent.children || []).map(c => c.id)];
  return ids.every(id => selectedMenuIds.value.includes(id));
};

// Check if some (but not all) children are selected
const isParentIndeterminate = (parent) => {
  const ids = [parent.id, ...(parent.children || []).map(c => c.id)];
  const someChecked = ids.some(id => selectedMenuIds.value.includes(id));
  const allChecked = ids.every(id => selectedMenuIds.value.includes(id));
  return someChecked && !allChecked ? true : undefined;
};

// Toggle parent: check/uncheck all children
const toggleParent = (parent, checked) => {
  const ids = [parent.id, ...(parent.children || []).map(c => c.id)];
  if (checked) {
    // Add all that aren't already selected
    ids.forEach(id => {
      if (!selectedMenuIds.value.includes(id)) {
        selectedMenuIds.value.push(id);
      }
    });
  } else {
    // Remove all
    selectedMenuIds.value = selectedMenuIds.value.filter(id => !ids.includes(id));
  }
};

const pagination = ref({ sortBy: "menu_name", descending: false, page: 1, rowsPerPage: 25 });

const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  { name: "menu_icon", label: "Icon", field: "menu_icon", align: "center", sortable: false, style: "width: 60px" },
  { name: "menu_name", label: "Nama Menu", field: "menu_name", align: "left", sortable: true },
  { name: "menu_link", label: "Link", field: "menu_link", align: "left", sortable: true },
  { name: "menu_parent", label: "Parent", field: "menu_parent", align: "left", sortable: true },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 80px" },
];

const selectedRoleName = computed(() => {
  const r = roleOptions.value.find(o => o.value === selectedRole.value);
  return r ? r.label : "";
});

const loadRoles = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role-menu/roles`);
    roleOptions.value = res.data.map(r => ({ label: `${r.role_id} - ${r.role_name}`, value: r.role_id }));
  } catch { /* silent */ }
};

const loadAllMenus = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role-menu/menus`);
    allMenus.value = res.data;
  } catch { /* silent */ }
};

const loadRoleMenus = async () => {
  if (!selectedRole.value) { roleMenuList.value = []; return; }
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role-menu/list`, { params: { role_id: selectedRole.value } });
    // Resolve parent names
    const menuMap = new Map(allMenus.value.map(m => [m.id, m.name]));
    roleMenuList.value = res.data.map(rm => ({
      ...rm,
      parent_name: rm.menu_parent ? menuMap.get(rm.menu_parent) || "" : "",
    }));
  } catch (error) {
    $q.notify({ type: "negative", message: "Gagal memuat data", position: "bottom" });
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  // Pre-check currently assigned menus
  selectedMenuIds.value = [...roleMenuList.value.map(rm => rm.menu_id)];
  menuSearch.value = "";
  dialogAdd.value = true;
};

const addMultipleMenusToRole = async () => {
  saving.value = true;
  try {
    // Save replaces all — delete existing then insert selected
    await axios.post(`${import.meta.env.VITE_API}role-menu/save`, {
      role_id: selectedRole.value,
      menu_ids: selectedMenuIds.value,
    });
    $q.notify({ type: "positive", message: "Menu role berhasil disimpan", position: "bottom" });
    dialogAdd.value = false;
    await loadRoleMenus();
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan menu", position: "bottom" });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Hapus menu <b>${row.menu_name}</b> dari role <b>${row.role_name}</b>?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}role-menu/delete`, {
        role_id: row.role_id,
        menu_id: row.menu_id,
      });
      $q.notify({ type: "positive", message: "Menu berhasil dihapus dari role", position: "bottom" });
      await loadRoleMenus();
    } catch (error) {
      $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menghapus", position: "bottom" });
    }
  });
};

onMounted(async () => {
  await loadRoles();
  await loadAllMenus();
});
</script>
