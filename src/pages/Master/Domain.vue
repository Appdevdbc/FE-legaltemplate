<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="domain" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Domain</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master Domain</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          :rows="listDomain"
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
                @click="addDomain"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search domains..."
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
                  @click="editDomain(props.row)"
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
                  @click="deleteDomain(props.row)"
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
            Form Domain
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
              <q-input
                v-model="tmpForm.fldcode"
                outlined
                counter maxlength="10"
                :rules="[val => !!val || 'Field is required']"
                :readonly="updateForm == true"
                label-slot
                class="tw-rounded-lg"
                :class="updateForm ? 'tw-bg-slate-50' : ''"
              >
                <template v-slot:prepend>
                  <q-icon name="code" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Code</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.fldinitial"
                outlined
                counter maxlength="20"
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="short_text" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Short Name</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.fldname"
                outlined
                counter maxlength="60"
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="text_fields" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Long Name</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.fldentity"
                type="number"
                outlined
                counter maxlength="10"
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="numbers" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Entity</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
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
            @click="validateDomain"
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
spinnerBall,
formatDateDMYHM,} from "./../../utils";
import { useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import "./../../assets/styles/table.css";

const router = useRouter();
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
    name: "domain_code",
    required: true,
    label: "Domain Code",
    align: "left",
    field: "domain_code",
    sortable: true,
  },
  {
    name: "domain_shortname",
    required: true,
    label: "Short Name",
    align: "left",
    field: "domain_shortname",
    sortable: true,
  },
  {
    name: "domain_longname",
    required: true,
    label: "Long Name",
    align: "left",
    field: "domain_longname",
    sortable: true,
  },
  {
    name: "domain_entity",
    label: "Entity",
    align: "left",
    field: "domain_entity",
    sortable: true,
  },
];
const $q = useQuasar();
const listDomain = ref([]);
const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const tableColor = ref(false);
const cardColor = ref(false);
const headerColor = ref(false);
const editAccess = ref(0);
const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  filter: null,
  domain: domain(),
});
const tmpForm = reactive({
  fldid: null,
  fldcode: null,
  fldinitial: null,
  fldname: null,
  fldentity: null,
  creator:empid(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const schema = yup.object({
  kode:yup.string().required("Kode Domain wajib diisi").nullable(),
  shortname: yup.string().required("Short Name wajib diisi").nullable(),
  longname:  yup.string().required("Long Name wajib diisi").nullable(),
  entity:  yup.number().required("Entity wajib diisi").nullable(),
});


const getDomain = async () => {
  try {
    loading.value = true;
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}domains`, {
      params: pagination.value,
      skipErrorInterceptor: true
    });
    // listDomain.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listDomain.value = res.data;
    } else {
      listDomain.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || err?.message || 'Gagal memuat data');
  }
  //tableColor.value = table();
  //cardColor.value = card();
  //headerColor.value = header();
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/domain'
      },
      skipErrorInterceptor: true
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin());
    $q.loading.hide()
  } catch (err) {
    $q.loading.hide()
    router.push('/404');
  }
};

const addDomain = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
};

const editDomain = (value) => {
  updateForm.value = true;
  dialogForm.value = true;
  tmpForm.fldcode = value.domain_code;
  tmpForm.fldinitial = value.domain_shortname;
  tmpForm.fldname = value.domain_longname;
  tmpForm.fldentity = value.domain_entity;
};

const deleteDomain = async (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus data <span class="text-bold">${value.domain_code} - ${value.domain_shortname}</span>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deletedomain`,{
        code:value.domain_code,
        creator:empid(),
      }, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Domain berhasil dihapus');
      // await getDomain();
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      error(err?.response?.data?.message || err?.message || 'Gagal menghapus data');
    }
  });
};

const validateDomain = async () => {
  let validate = {
    kode: tmpForm.fldcode,
    shortname: tmpForm.fldinitial,
    longname: tmpForm.fldname,
    entity:  tmpForm.fldentity,
  }
  schema.validate(validate,{ abortEarly: false })
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
       await saveDomain();
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      }); */
    }
  });
};

const saveDomain = async () => {
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}domains`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil diubah');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      error(err?.response?.data?.message || err?.message || 'Gagal mengubah data');
    }
  } else {
    try {
      await axios.post(`${import.meta.env.VITE_API}domains`, tmpForm, {
        skipErrorInterceptor: true
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil disimpan');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      error(err?.response?.data?.message || err?.message || 'Gagal menyimpan data');
    }
  }
};

const reset = () => {
  tmpForm.fldid = null;
  tmpForm.fldcode = null;
  tmpForm.fldinitial = null;
  tmpForm.fldname = null;
  tmpForm.fldentity = null;
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getDomain();
  
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