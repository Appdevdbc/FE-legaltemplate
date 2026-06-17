<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="location_on" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master Site</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <router-link :to="{ path: '/site' }" class="tw-text-white hover:tw-text-blue-200 tw-transition-colors tw-no-underline">
                Master Site
              </router-link>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          :rows="listSite"
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
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-sm tw-uppercase tw-tracking-wide tw-py-4`"
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
                label="Sync"
                icon="sync"
                :loading="loadingsync"
                :disable="loadingsync"
                @click="addSite"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              >
                <template v-slot:loading>
                  <q-spinner-facebook size="20px" />
                </template>
              </q-btn>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search sites..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import { ParseError, admin, domain, role, 
empid,decryptMessage,spinnerBall } from "./../../utils";
import { useQuasar,Loading,QSpinnerCube } from "quasar";
import { useRouter, useRoute} from "vue-router";
import { useNotify } from "./../../composables/useNotify";

const router = useRouter();
const { success, error } = useNotify();
const columns = [
  {
    name: "site_code",
    required: true,
    label: "Site Code",
    align: "left",
    field: "site_code",
    sortable: true,
  },
  {
    name: "site_desc",
    required: true,
    label: "Description",
    align: "left",
    field: "site_desc",
    sortable: true,
  }
];
const $q = useQuasar();
const listSite = ref([]);
const loading = ref(false);
const loadingsync = ref(false);
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

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'1',
});

const getSite = async () => {
  try {
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}sites`, {
      params: pagination.value,
      domain:domain(),
      skipErrorInterceptor: true
    });
    // listSite.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listSite.value = res.data;
    } else {
      listSite.value = res.data.data;
    }
   // pagination.value.page = res.data.data.pagination.current_page;
   // pagination.value.rowsPerPage = res.data.data.pagination.per_page; 
    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || err?.message || 'Gagal memuat data');
  }
  
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/site'
      },
      skipErrorInterceptor: true
    });
    console.log(decryptMessage(admin()));
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin())
    $q.loading.hide()
  } catch (err) {
    $q.loading.hide()
    router.push('/404');
  }
};


const addSite = async () => {
  try {
      loading.value = true;
      loadingsync.value = true
      let tmpdata = {};
      await axios.post(`${import.meta.env.VITE_API}sites`, {
        domain:domain(),
        creator:empid()
      }, {
        skipErrorInterceptor: true
      });
      loading.value = false;
      loadingsync.value = false;
      success('Data berhasil sync');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (err) {
      loading.value = false;
      loadingsync.value = false;
      error(err?.response?.data?.message || err?.message || 'Gagal sync data');
    }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getSite();
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