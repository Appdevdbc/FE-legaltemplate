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
              <q-btn unelevated color="blue-6" label="Tambah Data" icon="add_circle" @click="addData"
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
              <q-btn round dense color="orange-7" size="sm" icon="edit" @click="editData(props.row)" class="tw-mr-1">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn round dense color="negative" size="sm" icon="delete" @click="deleteData(props.row)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

<!-- Dialog Add/Edit -->
        <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down" persistent>
            <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
                <q-card-section :class="`bg-${domain()}`">
                    <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
                        <q-icon :name="isEdit ? 'edit' : 'add_circle'" size="28px" />
                        {{ isEdit ? 'Edit ' + modulName : 'Tambah ' + modulName }}
                        <q-space />
                        <q-btn dense flat icon="close" color="white" v-close-popup>
                            <q-tooltip>Close</q-tooltip>
                        </q-btn>
                    </div>                
                </q-card-section>
                <q-separator />

                <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
                    <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 q-mb-md">
                        <template v-slot:avatar>
                            <q-icon name="info" color="red" size="32px" />
                        </template>
                        <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
                    </q-banner>

                    <div class="row q-col-gutter-md">
                        <div class="col-12">
                            <q-input 
                                autofocus
                                v-model="tmpForm.name"
                                dense 
                                outlined 
                                label="Nama Menu *"
                                counter maxlength="50"
                                @keydown="(e) => { if (e.key === ' ' && !tmpForm.name) e.preventDefault() }"
                                @keyup.enter="validateData">
                                <template v-slot:prepend><q-icon name="dataset" color="blue-6" /></template>
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-select 
                                v-model="tmpForm.parent" 
                                dense
                                outlined 
                                label="Parent Menu" 
                                :options="parentOptions" 
                                emit-value
                                map-options 
                                clearable>
                                <template v-slot:prepend><q-icon name="account_tree" color="blue-6" /></template>
                            </q-select>
                        </div>
                        <div class="col-12">
                            <q-input 
                                v-model="tmpForm.icon"
                                dense
                                outlined 
                                label="Icon (Material Icon name) *"
                                placeholder="contoh: folder, description, settings"
                                counter maxlength="50"
                                @keydown="(e) => { if (e.key === ' ' && !tmpForm.icon) e.preventDefault() }"
                                @keypress="NoSpace"
                                @keyup.enter="validateData">
                                <template v-slot:prepend><q-icon name="help_outline" color="blue-6" /></template>
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input 
                                v-model="tmpForm.link"
                                dense 
                                outlined 
                                label="Link / Route *"
                                placeholder="contoh: /document atau # untuk parent"
                                counter maxlength="50"
                                @keydown="(e) => { if (e.key === ' ' && !tmpForm.link) e.preventDefault() }"
                                @keypress="NoSpace"
                                @keyup.enter="validateData">
                                <template v-slot:prepend><q-icon name="link" color="blue-6" /></template>
                            </q-input>
                        </div>
                        <div class="col-12">
                            <q-input 
                                v-model.number="tmpForm.order_menu"
                                dense 
                                outlined 
                                label="Urutan *"
                                counter maxlength="3"
                                @keypress="NumberOnly"
                                @keyup.enter="validateData">
                                <template v-slot:prepend><q-icon name="sort" color="blue-6" /></template>
                            </q-input>
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
                    <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
                    <q-btn label="Simpan" color="blue-6" push icon="save" @click="validateData" class="tw-px-6" :loading="saving" />
                </q-card-actions>
            </q-card>
        </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { domain, empid, spinnerBall, NumberOnly, NoSpace } from "../utils.js";
import * as yup from "yup";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "../composables/useNotify";

const router = useRouter();
const { success, error } = useNotify();
const modulName = 'Menu';

const $q = useQuasar();
const menuList = ref([]);
const loading = ref(false);
const saving = ref(false);
const filter = ref("");
const dialogForm = ref(false);
const isEdit = ref(false);
const parentOptions = ref([]);

// const pagination = ref({ sortBy: "order_menu", descending: false, page: 1, rowsPerPage: 10 });
const pagination = ref({ 
    sortBy: "asc", 
    descending: false, 
    page: 1, 
    rowsPerPage: 10 
});

const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false },
  { name: "name", label: "Nama Menu", field: "name", align: "left", sortable: true },
  { name: "icon", label: "Icon", field: "icon", align: "center", sortable: false },
  { name: "link", label: "Link", field: "link", align: "left", sortable: true },
  { name: "parent_name", label: "Parent", field: "parent_name", align: "left", sortable: true },
  { name: "order_menu", label: "Urutan", field: "order_menu", align: "center", sortable: true },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false },
];

// const form = ref({ name: "", icon: "", link: "", parent: null, order_menu: 0 });
const tmpForm = reactive({
    id: null,
    name: null,
    parent: null,
    icon: null,
    link: null,
    order_menu: null,
    status: 1,
    creator: empid(),
});
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

// const openAddDialog = () => {
//   isEdit.value = false;
//   form.value = { name: "", icon: "", link: "", parent: null, order_menu: 0 };
//   dialogForm.value = true;
// };

// const openEditDialog = (row) => {
//   isEdit.value = true;
//   editId.value = row.encrypted_id;
//   form.value = {
//     name: row.name || "",
//     icon: row.icon || "",
//     link: row.link || "",
//     parent: row.parent || null,
//     order_menu: row.order_menu || 0,
//   };
//   dialogForm.value = true;
// };

const addData = () => {
    isEdit.value = false;
    dialogForm.value = true;
    reset();
    tmpForm.status = 1;
};

const editData = (value) => {
    isEdit.value = true;
    editId.value = value.encrypted_id;
    dialogForm.value = true;
    tmpForm.id = value.id;
    tmpForm.name = value.name;
    tmpForm.icon = value.icon;
    tmpForm.link = value.link;
    tmpForm.parent = value.parent == 0 ? null : value.parent;
    tmpForm.order_menu = value.order_menu;
    tmpForm.status = parseInt(value.status);
};

// const saveMenu = async () => {
//   if (!form.value.name.trim()) {
//     $q.notify({ type: "warning", message: "Nama menu wajib diisi", position: "bottom" });
//     return;
//   }
//   saving.value = true;
//   try {
//     if (isEdit.value) {
//       await axios.post(`${import.meta.env.VITE_API}menu-management/update`, { id: editId.value, ...form.value });
//       $q.notify({ type: "positive", message: "Menu berhasil diperbarui", position: "bottom" });
//     } else {
//       await axios.post(`${import.meta.env.VITE_API}menu-management/add`, form.value);
//       $q.notify({ type: "positive", message: "Menu berhasil ditambahkan", position: "bottom" });
//     }
//     dialogForm.value = false;
//     await loadMenus();
//     await loadParents();
//   } catch (error) {
//     $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan menu", position: "bottom" });
//   } finally {
//     saving.value = false;
//   }
// };

// const confirmDelete = (row) => {
//   $q.dialog({
//     title: "Konfirmasi",
//     message: `Hapus menu <b>${row.name}</b>? Sub-menu di bawahnya juga akan dihapus.`,
//     html: true,
//     ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
//     cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
//     persistent: true,
//   }).onOk(async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_API}menu-management/delete`, { id: row.encrypted_id });
//       $q.notify({ type: "positive", message: "Menu berhasil dihapus", position: "bottom" });
//       await loadMenus();
//       await loadParents();
//     } catch (error) {
//       $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menghapus menu", position: "bottom" });
//     }
//   });
// };

const schema = yup.object({
    name: yup.string().required("Nama Menu wajib diisi").nullable(),
    icon: yup.string().required("Icon (Material Icon Name) wajib diisi").nullable(),
    link: yup.string().required("Link / Route wajib diisi").nullable(),
    order_menu: yup.string().required("Urutan wajib diisi").nullable(),
    // status: yup.mixed().required("Status wajib diisi").nullable(),
});

const validateData = async () => {
    let validate = {
        name: tmpForm.name,
        icon: tmpForm.icon,
        link: tmpForm.link,
        order_menu: tmpForm.order_menu,
        // status: tmpForm.status,
    }
    schema.validate(validate, { abortEarly: false })
    .then(() => {
        // success process
        saveDialog();
    })
    .catch(err => {
        err.inner.forEach(e => {
            error(e.message);
        });
    });
};

const saveDialog = async (value) => {
    $q.dialog({
        title: "Konfirmasi",
        message: `Apakah data sudah sesuai ?`,
        html: true,
        class: `side-${domain()} text-semibold tw-rounded-2xl`,
        style: 'border-radius: 16px;',
        ok: {
            push: true,
            color: "blue-6",
            label: "Ya, Simpan",
            icon: "check_circle",
            class: "tw-px-6 tw-rounded-lg"
        },
        cancel: {
            push: true,
            color: 'red-7',
            label: "Batal",
            icon: "cancel",
            class: "tw-px-6 tw-rounded-lg"
        },
        persistent: true,
    }).onOk(async () => {
        try {
            await saveData();
        } catch (error) {
            $q.notify({
                type: "negative",
                message: ParseError(error),
            });
        }
    });
};

const saveData = async () => {
    saving.value = true;
    try {
        spinnerBall();
        await axios.post(`${import.meta.env.VITE_API}menu-management/save`, tmpForm, {
            skipErrorInterceptor: true
        });

        dialogForm.value = false;
        reset();
        $q.loading.hide()
        if (isEdit.value) {
            success('Data berhasil diubah');
        }
        else {
            success('Data berhasil disimpan');
        }
        await loadMenus();
        await loadParents();
    } catch (error) {
        $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan data", position: "bottom" });
    } finally {
        saving.value = false;
    }
};

const deleteData = (value) => {
    $q.dialog({
        title: "Konfirmasi",
        message: `Apakah anda ingin menghapus data <span class="text-bold">${value.name}</span> ? Sub-menu di bawahnya juga akan dihapus.`,
        html: true,
        class:`side-${domain()} text-semibold tw-rounded-2xl`,
        style: 'border-radius: 16px;',
        ok: {
            push: true,
            color:"blue-6",
            label: "Ya, Hapus",
            icon: "check_circle",
            class: "tw-px-6 tw-rounded-lg"
        },
        cancel: {
            push: true,
            color: 'red-7',
            label: "Batal",
            icon: "cancel",
            class: "tw-px-6 tw-rounded-lg"
        },
        persistent: true,
    }).onOk(async () => {
        try {
            spinnerBall()
            await axios.post(`${import.meta.env.VITE_API}menu-management/delete`, {
                // id: value.id,
                id: value.encrypted_id,
                creator: empid()
            }, 
            {
                skipErrorInterceptor: true
            });
            dialogForm.value = false;
            reset();
            // $q.notify({
            //     type: "positive",
            //     message: `${modulName} berhasil dihapus`,
            // });
            success(`Data berhasil dihapus`);
            await loadMenus();
            await loadParents();
        } catch (err) {
            $q.loading.hide()
            error(err?.response?.data?.message || err?.message || 'Gagal menghapus data');
        }
    });
};

const reset = () => {
    tmpForm.id = null;
    tmpForm.name = null;
    tmpForm.parent = null;
    tmpForm.icon = null;
    tmpForm.link = null;
    tmpForm.order_menu = null;
    tmpForm.status = null;
}

onMounted(async () => {
  await loadParents();
  await loadMenus();
});
</script>
