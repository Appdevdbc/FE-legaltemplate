<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="dataset" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Menu</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Master</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Master Menu</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="menuList"
          :columns="columns"
          row-key="id"
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
            <q-select borderless dense v-model="pagination.rowsPerPage" :options="[5, 10, 25, 50, 100]">
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

          <template v-slot:body-cell-icon="props">
            <q-td :props="props">
              <q-icon v-if="props.row.icon" :name="props.row.icon" size="20px" color="blue-6" />
              <span v-else class="tw-text-slate-400">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-parent_name="props">
            <q-td :props="props">
              <q-badge v-if="props.row.parent_name" color="blue-2" text-color="blue-9" :label="props.row.parent_name" />
              <span v-else class="tw-text-slate-400 tw-text-xs">Root</span>
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props">
              <q-btn round dense color="orange-7" size="sm" icon="edit" @click="openEditDialog(props.row)" class="tw-mr-1">
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
    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon :name="isEdit ? 'edit' : 'add_circle'" size="28px" />
            {{ isEdit ? 'Edit Menu' : 'Tambah Menu' }}
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="tw-p-6">
          <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 q-mb-md">
            <template v-slot:avatar><q-icon name="info" color="red" /></template>
            <span class="tw-text-red-700 tw-font-medium">Field bertanda (*) wajib diisi</span>
          </q-banner>

          <div class="q-gutter-md">
            <q-input v-model="form.name" outlined label="Nama Menu *" :rules="[val => !!val || 'Nama wajib diisi']">
              <template v-slot:prepend><q-icon name="label" color="blue-6" /></template>
            </q-input>

            <q-select v-model="form.parent" outlined label="Parent Menu" :options="parentOptions" emit-value map-options clearable>
              <template v-slot:prepend><q-icon name="account_tree" color="blue-6" /></template>
            </q-select>

            <q-input v-model="form.icon" outlined label="Icon (Material Icon name)" placeholder="contoh: folder, description, settings">
              <template v-slot:prepend><q-icon :name="form.icon || 'help_outline'" color="blue-6" /></template>
            </q-input>

            <q-input v-model="form.link" outlined label="Link / Route *" placeholder="contoh: /document atau # untuk parent"
              :rules="[val => !!val || 'Link wajib diisi']"
              @keydown.space.prevent>
              <template v-slot:prepend><q-icon name="link" color="blue-6" /></template>
            </q-input>

            <q-input v-model.number="form.order_menu" outlined label="Urutan" type="number" min="0">
              <template v-slot:prepend><q-icon name="sort" color="blue-6" /></template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="saveMenu" class="tw-px-6" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { domain } from "../utils.js";

const $q = useQuasar();
const menuList = ref([]);
const loading = ref(false);
const saving = ref(false);
const filter = ref("");
const dialogForm = ref(false);
const isEdit = ref(false);
const parentOptions = ref([]);

const pagination = ref({ sortBy: "order_menu", descending: false, page: 1, rowsPerPage: 10 });

const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 50px" },
  { name: "name", label: "Nama Menu", field: "name", align: "left", sortable: true },
  { name: "icon", label: "Icon", field: "icon", align: "center", sortable: false, style: "width: 60px" },
  { name: "link", label: "Link", field: "link", align: "left", sortable: true },
  { name: "parent_name", label: "Parent", field: "parent_name", align: "left", sortable: true },
  { name: "order_menu", label: "Urutan", field: "order_menu", align: "center", sortable: true, style: "width: 80px" },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 100px" },
];

const form = ref({ name: "", icon: "", link: "", parent: null, order_menu: 0 });
const editId = ref("");

const loadMenus = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}menu-management/list`);
    const menus = res.data;
    // Resolve parent names
    const menuMap = new Map(menus.map(m => [m.id, m.name]));
    menuList.value = menus.map(m => ({
      ...m,
      parent_name: m.parent ? menuMap.get(m.parent) || "" : "",
    }));
  } catch (error) {
    $q.notify({ type: "negative", message: "Gagal memuat data menu", position: "bottom" });
  } finally {
    loading.value = false;
  }
};

const loadParents = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}menu-management/parents`);
    parentOptions.value = res.data.map(p => ({ label: p.name, value: p.id }));
  } catch { /* silent */ }
};

const openAddDialog = () => {
  isEdit.value = false;
  form.value = { name: "", icon: "", link: "", parent: null, order_menu: 0 };
  dialogForm.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  editId.value = row.encrypted_id;
  form.value = {
    name: row.name || "",
    icon: row.icon || "",
    link: row.link || "",
    parent: row.parent || null,
    order_menu: row.order_menu || 0,
  };
  dialogForm.value = true;
};

const saveMenu = async () => {
  if (!form.value.name.trim()) {
    $q.notify({ type: "warning", message: "Nama menu wajib diisi", position: "bottom" });
    return;
  }
  saving.value = true;
  try {
    if (isEdit.value) {
      await axios.post(`${import.meta.env.VITE_API}menu-management/update`, { id: editId.value, ...form.value });
      $q.notify({ type: "positive", message: "Menu berhasil diperbarui", position: "bottom" });
    } else {
      await axios.post(`${import.meta.env.VITE_API}menu-management/add`, form.value);
      $q.notify({ type: "positive", message: "Menu berhasil ditambahkan", position: "bottom" });
    }
    dialogForm.value = false;
    await loadMenus();
    await loadParents();
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan menu", position: "bottom" });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Hapus menu <b>${row.name}</b>? Sub-menu di bawahnya juga akan dihapus.`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}menu-management/delete`, { id: row.encrypted_id });
      $q.notify({ type: "positive", message: "Menu berhasil dihapus", position: "bottom" });
      await loadMenus();
      await loadParents();
    } catch (error) {
      $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menghapus menu", position: "bottom" });
    }
  });
};

onMounted(async () => {
  await loadParents();
  await loadMenus();
});
</script>
