<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="collections_bookmark" size="28px" class="tw-text-white"/>
            <div>
              <div class="text-h6 tw-text-white tw-font-bold">
                Master Collection Detail
                <q-icon name="chevron_right" size="20px"/>
                {{decrypt(route.params.parentName)}}
              </div>
              <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
                <q-icon name="home" size="14px"/>
                <q-icon name="chevron_right" size="14px"/>
                <router-link :to="{ path: '/collection' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                  Master Collection
                </router-link>
                <q-icon name="chevron_right" size="14px"/>
                <span class="tw-text-white">Detail</span>
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
                placeholder="Search menus..."
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
            Form Collection Detail
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section style="max-height: 60vh" class="scroll tw-p-6">
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
              <q-select
                outlined
                v-model="tmpForm.menu"
                use-input
                emit-value
                map-options
                input-debounce="0"
                :rules="[val => !!val || 'Field is required']"
                :options="listCollectionNot"
                option-value="id"
                @filter="filterMenu"
                option-label="name"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="menu" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Menu</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
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
import { ParseError, excelDownload, domain, 
role, empid,table,card,
header,
decrypt} from "./../../utils";
import { useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "./../../composables/useNotify";
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
    name: "link",
    required: true,
    label: "Link URL",
    align: "left",
    field: "link",
    sortable: true,
  },
];
const $q = useQuasar();
const listMenu = ref([]);
const listCollectionNot = ref([]);
const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const tableColor = ref(false);
const cardColor = ref(false);
const headerColor = ref(false);
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
  parent:null,
  menu: null,
  creator:empid(),
});

const tmpMenu = reactive({
  parent:null,
  code: null,
  needle:null,
});

const schema = yup.object({
  menu:yup.string().required("Nama Menu wajib diisi").nullable(),
});

const getMenuNotCollection = async () => {
  try {
    
    const res =await axios.get(`${import.meta.env.VITE_API}getCollectionDetail`, {
      params: {
        ...tmpMenu,

        },
      skipErrorInterceptor: true
    });
    listCollectionNot.value = res.data;
  } catch (error) {
    /* $q.notify({
      type: "negative",
      message: ParseError(error),
    }); */
  } 
};

const filterMenu = async (val, update) => {
      if (val === '') {
            update(() => {
                tmpMenu.needle = null;
                tmpMenu.code = null;
                getMenuNotCollection();
            })
        }

        update(() => {
            tmpMenu.needle = val.toLowerCase();
            getMenuNotCollection();
        })
}

const getMenu = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
     const parent = await decrypt(route.params.id);
     pagination.value.parent = parent;
    const res = await axios.get(`${import.meta.env.VITE_API}getCollectionDetail`, {
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
    error(error?.message || error || 'Terjadi kesalahan');
  }
  //tableColor.value = table();
  //cardColor.value = card();
  //headerColor.value = header();
};

const addMenu = async () => {
  tmpMenu.code = tmpForm.menu
  tmpMenu.parent = await decrypt(route.params.parent)
  getMenuNotCollection()
  updateForm.value = false;
  dialogForm.value = true;
  reset();
  tmpForm.id = await decrypt(route.params.id)
};

const editMenu = async (value) => {
  updateForm.value = true;
  dialogForm.value = true;
  tmpMenu.parent = await decrypt(route.params.parent)
  tmpMenu.code = parseInt(value.coldet_menu);
  await getMenuNotCollection()
  tmpForm.id = value.coldet_colid;
  tmpForm.menu = parseInt(value.coldet_menu);
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
      // await api.post("deleteMenu", value);
      // const res = await api.delete("domains/" + value.id);
      // console.log(res.data);
      await axios.post(`${import.meta.env.VITE_API}deleteCollectionDetail`, {
          id:value.coldet_colid,
          menu:value.coldet_menu,
          creator:empid()}, {
          skipErrorInterceptor: true
        });
      dialogForm.value = false;
      reset();
      success('Data berhasil dihapus');
      // await getMenu();
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      //$q.notify({
       // type: "negative",
        //message: ParseError(error),
      //});
    }
  });
};

const validateApp = async () => {
  let validate = {
    menu : tmpForm.menu,
  }
  schema.validate(validate,{ abortEarly: false })
  .then(() => {
         // success process
          saveMenu();
    })
    .catch(err => {
      err.inner.forEach(err => {
        error(err.message);
      });
    });
};

const saveMenu = async () => {
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}saveCollectionDetail`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil diubah');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      }); */
    }
  } else {
    try {
      await axios.post(`${import.meta.env.VITE_API}saveCollectionDetail`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil disimpan');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      });  */
    }
  }
};

const reset = () => {
  tmpForm.id = null;
  tmpForm.menu = null;
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
 router.push({path: `/collection`})
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
  });
});



</script>