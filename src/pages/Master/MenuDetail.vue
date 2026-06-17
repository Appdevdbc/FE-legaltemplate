<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
       <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="menu" size="28px" class="tw-text-white"/>
            <div>
              <div class="text-h6 tw-text-white tw-font-bold">Master Submenu</div>
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
                <q-icon name="home" size="14px"/>
                <q-icon name="chevron_right" size="14px"/>
                <router-link :to="{ path: '/menu' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                  Master Menu
                </router-link>
                <q-icon name="chevron_right" size="14px"/>
                <span class="tw-text-white">Master Submenu</span>
              </div>
            </div>
          </div>
          <q-btn
            push
            color="deep-orange-13"
            label="Back"
            icon="arrow_back"
            class="tw-font-semibold"
            @click="back"
          >
            <q-tooltip class="tw-bg-slate-800 tw-text-xs">Back</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          :rows="listMenu"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :loading="loading"
          :filter="pagination.filter"
          :rows-per-page-options="[]"
          @request="onRequest"
          binary-state-sort
          flat
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="[
                  `bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`,
                  col.name === 'aksi' ? 'sticky-column-left-header' : ''
                ]"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:top-left>
            <div class="tw-flex tw-items-center tw-gap-2 tw-bg-white tw-px-4 tw-py-2 tw-rounded-lg tw-shadow-sm">
              <q-icon name="view_headline" color="blue-6" size="20px">
                <q-tooltip class="tw-bg-slate-800 tw-text-xs">Rows per page</q-tooltip>
              </q-icon>
              <q-select
                borderless
                dense
                v-model="pagination.rowsPerPage"
                :options="[5,10,25,50,100,200]"
                @update:modelValue="updateTable"
                class="tw-min-w-[80px]"
              />
            </div>
          </template>
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn 
                unelevated
                color="blue-6"
                label="Tambah Data" 
                icon="add"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
                @click="addMenu" 
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search submenu..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-3 sticky-column-left">
              <div class="tw-flex tw-gap-2">
                <q-btn
                  round
                  dense
                  color="light-blue-9"
                  icon="edit"
                  size="sm"
                  @click="editMenu(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Edit</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  dense
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteMenu(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">Delete</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialogForm" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit_note" size="32px"/>
            Form Sub Menu
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
             <div class="col-12">
            <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-shadow-sm">
              <template v-slot:avatar>
                <q-icon name="info" color="red" size="24px"/>
              </template>
              <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
            </q-banner>
            </div>
            <div class="col-12">
              <q-input v-model="tmpForm.name" 
              outlined 
              :rules="[val => !!val || 'Field is required']"
              required
              counter maxlength="50" 
              label-slot
              class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="label" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Menu Name</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                outlined
                v-model="tmpForm.parent"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :rules="[val => !!val || 'Field is required']"
                :options="listParent"
                option-value="id"
                @filter="filterParent"
                option-label="name"
                label-slot
                class="tw-rounded-lg" >
                <template v-slot:prepend>
                  <q-icon name="account_tree" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Parent</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                    <template v-slot:no-option>
                        <q-item>
                        <q-item-section class="text-grey">
                            No results
                        </q-item-section>
                        </q-item>
                    </template>
                </q-select>
            </div>
            <div class="col-12">
              <q-input v-model="tmpForm.link" 
              outlined 
              :rules="[val => !!val || 'Field is required']"
              required
              counter maxlength="50" 
              label-slot
              class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="link" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Link URL</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input v-model="tmpForm.icon" 
              outlined 
              :rules="[val => !!val || 'Field is required']"
              required
              counter maxlength="50" 
              label-slot
              class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="emoji_emotions" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Icon</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:append>
                  <q-icon name="help_outline" color="blue" class="tw-cursor-pointer">
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">Icon menggunakan material icon.</q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input v-model="tmpForm.order" 
              outlined 
              :rules="[val => !!val || 'Field is required']"
              required
              input-class="text-right"
              @update:modelValue="(event)=>handleTobe(event,'order')"
              @focus="readTobe('order')"
              @blur="finalizeTobe('order')" 
              label-slot
              class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="format_list_numbered" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Order</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:append>
                  <q-icon name="help_outline" color="blue" class="tw-cursor-pointer">
                    <q-tooltip class="tw-bg-slate-800 tw-text-xs">Order isi dengan angka.</q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
        <q-separator class="tw-bg-slate-200"/>
        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn
            label="Batal"
            color="red-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
          <q-btn
            label="Simpan"
            color="blue-6"
            push
            icon="save"
            class="tw-px-6 tw-font-semibold"
            @click="validateApp"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import { domain, 
role,
admin,
decryptMessage,
empid,
decrypt,
spinnerBall} from "./../../utils";
import { useNotify } from "./../../composables/useNotify";
import { Loading, useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import "./../../assets/styles/table.css";

const router = useRouter();
const route = useRoute();
const { success, error } = useNotify();
const columns = [
  {
    name: "aksi",
    required: true,
    label: "Aksi",
    align: "left",
    field: "aksi",
    classes: 'sticky-column-left',
    headerClasses: 'sticky-column-left-header'
  },
  {
    name: "name",
    required: true,
    label: "Menu Name",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "parent_name",
    required: true,
    label: "Parent",
    align: "left",
    field: "parent_name",
  },
  {
    name: "link",
    required: true,
    label: "Link URL",
    align: "left",
    field: "link",
    sortable: true,
  },
  {
    name: "icon",
    required: true,
    label: "Icon",
    align: "left",
    field: "icon",
    sortable: true,
  },
  {
    name: "order_menu",
    required: true,
    label: "Urutan",
    align: "left",
    field: "order_menu",
    sortable: true,
  },
];
const $q = useQuasar();
const listMenu = ref([]);
const listParent = ref([]);
const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const pagination = ref({
  sortBy: "asc",
  descending: false,
  parent:null,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  filter: null,
  domain: domain(),
});

const tmpForm = reactive({
  id: null,
  parent: null,
  name: null,
  link:null,
  icon:null,
  order:null,
  dechiper:null,
  creator:empid(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const tmpParent = reactive({
  code: null,
  needle:null,
});

const schema = yup.object({
  name:yup.string().required("Nama Menu wajib diisi").nullable(),
  parent:yup.string().required("Icon wajib diisi").nullable(),
  icon:yup.string().required("Icon wajib diisi").nullable(),
  order:yup.string().required("Order wajib diisi").nullable(),
  link:yup.string().required("Link URL wajib diisi").nullable(),
});

const getParent = async () => {
  try {
    const res =await axios.get(`${import.meta.env.VITE_API}getParentMenu`, {
      params: {
        ...tmpParent,

        },
      skipErrorInterceptor: true
    });
    listParent.value = res.data;
    if(tmpParent.code!=null){
      tmpForm.dechiper = tmpParent.code
      tmpParent.code = res.data[0].id
      tmpForm.parent = res.data[0].id
    }else{
      tmpForm.dechiper = null
    }
  } catch (error) {
    /* $q.notify({
      type: "negative",
      message: ParseError(error),
    }); */
  } 
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/menu'
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin());
    Loading.hide()
  } catch (err) {
    Loading.hide()
    router.push('/404');
  }
};

const filterParent = async (val, update) => {
      if (val === '') {
            update(() => {
                tmpParent.needle = null;
                tmpParent.code = null;
                getParent();
            })
        }

        update(() => {
            tmpParent.needle = val.toLowerCase();
            getParent();
        })
}

const getMenu = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
     const parent = decrypt(route.params.id);
     pagination.value.parent = parent;
    const res = await axios.get(`${import.meta.env.VITE_API}getSubMenu`, {
      params: pagination.value,
      skipErrorInterceptor: true
    });
    // listMenu.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listMenu.value = res.data;
    } else {
      listMenu.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
  } catch (error) {
      console.log(error);
    loading.value = false;
    $q.notify({
      type: "negative",
      message: error,
    });
  }
  //tableColor.value = table();
  //cardColor.value = card();
  //headerColor.value = header();
};

const addMenu = async () => {
  tmpForm.parent = pagination.value.parent
  tmpParent.code = tmpForm.parent
  getParent()
  updateForm.value = false;
  dialogForm.value = true;
  reset();
};

const editMenu = (value) => {
  updateForm.value = true;
  dialogForm.value = true;
  tmpForm.parent = pagination.value.parent
  tmpParent.code = tmpForm.parent
  getParent()
  tmpForm.name = value.name;
  tmpForm.icon = value.icon;
  tmpForm.order = value.order_menu;
  tmpForm.id = value.id;
  tmpForm.link = value.link;
};

const deleteMenu = async (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus data <span class="text-bold">${value.name}</span>?`,
    html: true,
    class:`side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color:"blue-6",
      label: "Ya, Hapus",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
      spinnerBall()
      await axios.post(`${import.meta.env.VITE_API}deleteSubMenu`, {
          id:value.id,
          creator:empid()
        }, {
          skipErrorInterceptor: true
        });
      dialogForm.value = false;
      reset();
      $q.loading.hide()
      success('Data berhasil dihapus');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      $q.loading.hide()
      error('Failed to delete data');
    }
  });
};

const validateApp = async () => {
  let validate = {
    name : tmpForm.name,
    icon : tmpForm.icon,
    order: tmpForm.order,
    parent: tmpForm.parent,
    link:tmpForm.link,
  }
  schema.validate(validate,{ abortEarly: false })
  .then(() => {
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
    class:`side-${domain()} text-semibold tw-rounded-2xl`,
    style: 'border-radius: 16px;',
    ok: {
      push: true,
      color:"blue-6",
      label: "Ya, Simpan",
      icon: "check_circle",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    cancel: {
      push: true,
      color: 'red-7',
      label: "Batal",
      icon: "cancel",
      class: "tw-font-semibold tw-px-6 tw-rounded-lg"
    },
    persistent: true,
  }).onOk(async () => {
    try {
       await  saveMenu();
    } catch (err) {
    }
  });
};

const saveMenu = async () => {
  if (updateForm.value) {
    try {
      spinnerBall();
      await axios.post(`${import.meta.env.VITE_API}saveSubMenu`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      $q.loading.hide();
      success('Data berhasil diubah');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      $q.loading.hide();
      error('Failed to update data');
    }
  } else {
    try {
      spinnerBall()
      await axios.post(`${import.meta.env.VITE_API}saveSubMenu`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      $q.loading.hide();
      success('Data berhasil disimpan');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      $q.loading.hide();
      error('Failed to save data');
    }
  }
};

const handleTobe = (event,name) => {

    // Remove all non-numeric characters except the decimal point
    let value = event.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
    value = parts[0];
    }

    // Update the input value
    tmpForm[`${name}`] = parts[0];
}

const readTobe = (name) => {
    tmpForm[`${name}`] = tmpForm[`${name}`] != null ? tmpForm[`${name}`] : '0';
};

const finalizeTobe = (name) => {
    tmpForm[`${name}`] = tmpForm[`${name}`] != null ? tmpForm[`${name}`] : '0';
};


const reset = () => {
  tmpForm.id = null;
  tmpForm.name = null;
  tmpForm.link = null;
  tmpForm.icon = null;
  tmpForm.order= null;
  tmpForm.parent = pagination.value.parent;
  tmpForm.dechiper = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getMenu();
  
};

const back = async () => {
 router.push({path: `/menu`})
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

onMounted(() => {
  getPageAkses();
  onRequest({
    pagination: pagination.value,
  });
});



</script>