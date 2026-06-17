<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="error" size="28px" class="tw-text-white"/>
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Error List</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Error List</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6">
        <q-table
          :rows="formattedListGencode"
          :columns="columns"
          row-key="name"
          :loading="loading"
          :filter="filter"
          :pagination="{ rowsPerPage: 0 }"
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

          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-input
                outlined
                dense
                debounce="300"
                v-model="filter"
                placeholder="Search errors..."
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
                  icon="visibility"
                  size="sm"
                  @click="viewLogs(props.row)"
                  class="tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">View Logs</q-tooltip>
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
      <q-card class="tw-w-full tw-max-w-6xl tw-rounded-2xl tw-shadow-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h5 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="description" size="32px"/>
            Error Log: {{ logData.filename }}
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section v-if="logData.lines?.length" style="max-height: 70vh" class="scroll tw-p-3">
          <q-banner dense rounded class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm tw-mb-2">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" size="20px"/>
            </template>
            <span class="tw-text-blue-700 tw-text-sm tw-font-medium">Total Lines: {{ logData.totalLines }} | Showing: {{ logData.from }} - {{ logData.to }}</span>
          </q-banner>
          <div class="tw-bg-slate-100 tw-rounded-lg tw-p-2 tw-overflow-auto tw-space-y-1" style="max-height: 60vh">
            <div 
              v-for="(line, index) in logData.lines" 
              :key="index" 
              class="tw-font-mono tw-text-xs tw-bg-white tw-rounded tw-px-3 tw-py-2 tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-border-l-4"
              :class="line.includes('Error') ? 'tw-border-red-500 tw-text-red-700' : 'tw-border-blue-500 tw-text-slate-700'"
            >
              <span class="tw-text-slate-400 tw-mr-2 tw-font-bold">#{{ index + 1 }}</span>{{ line }}
            </div>
          </div>
        </q-card-section>
        <q-card-section v-else class="tw-p-6">
          <q-banner rounded class="tw-bg-slate-50 tw-border-l-4 tw-border-slate-400">
            <template v-slot:avatar>
              <q-icon name="info" color="grey" size="24px"/>
            </template>
            <span class="tw-text-slate-600 tw-font-medium">No logs available</span>
          </q-banner>
        </q-card-section>
        <q-separator v-if="logData.lines?.length" class="tw-bg-slate-200"/>
        <q-card-actions v-if="logData.lines?.length" class="tw-p-6 tw-bg-slate-50 tw-justify-between">
          <div class="tw-flex tw-gap-2">
            <q-btn
              round
              color="blue-6"
              icon="chevron_left"
              :disable="tmpForm.from === 0"
              @click="navigateLogs('back')"
            >
              <q-tooltip>Back</q-tooltip>
            </q-btn>
            <q-btn
              round
              color="blue-6"
              icon="chevron_right"
              :disable="tmpForm.to >= logData.totalLines"
              @click="navigateLogs('next')"
            >
              <q-tooltip>Next</q-tooltip>
            </q-btn>
          </div>
          <q-btn
            label="Close"
            color="red-7"
            push
            icon="close"
            class="tw-px-6 tw-font-semibold"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import axios from "axios"
import dayjs from "dayjs";
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
import numeral from "numeral";
import { symSharpTempPreferencesCustom } from "@quasar/extras/material-symbols-sharp";
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
    name: "name",
    required: true,
    label: "File Name",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "date",
    required: true,
    label: "Date",
    align: "left",
    field: "dateFormatted",
    sortable: true,
  },
  {
    name: "size",
    required: true,
    label: "Size (KB)",
    align: "right",
    field: "size",
    sortable: true,
  },
];
const $q = useQuasar();
const listGencode = ref([]);
const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const filter = ref(null);
const logData = ref({ filename: '', totalLines: 0, from: 0, to: 0, lines: [] });

const formattedListGencode = computed(() => {
  return listGencode.value.map(item => ({
    ...item,
    dateFormatted: item.date === 'current' ? 'current' : dayjs(item.date).format('DD-MM-YYYY')
  }))
})
const tmpForm = reactive({
  id: null,
  domain:domain(),
  filename:null,
  from:0,
  to:50,
  creator:empid(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});


const getErrorLogs = async () => {
  try {
    loading.value = true;
    const res = await axios.get(`${import.meta.env.VITE_API}logs/files`, {
      skipErrorInterceptor: true
    });
    listGencode.value = res.data;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    error(err?.response?.data?.message || err?.message || 'Gagal memuat data');
  }
};

const getErrorDataLogs = async () => {
  try {
    loading.value = true;
    logData.value = { filename: '', totalLines: 0, from: 0, to: 0, lines: [] };
    const res = await axios.get(`${import.meta.env.VITE_API}logs/content`, {
        params: {
          filename:tmpForm.filename,
          from:tmpForm.from,
          to:tmpForm.to
        },
      skipErrorInterceptor: true
    });
    logData.value = res.data;
    loading.value = false;
  } catch (err) {
    loading.value = false;
    logData.value = { filename: '', totalLines: 0, from: 0, to: 0, lines: [] };
    error(err?.response?.data?.message || err?.message || 'Gagal memuat data');
  }
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/error-list'
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


const viewLogs = async (value) => {
  updateForm.value = true;
  reset();
  tmpForm.filename = value.name;
  await getErrorDataLogs();
  dialogForm.value = true;
}

const navigateLogs = async (direction) => {
  if (direction === 'next') {
    tmpForm.from = tmpForm.to;
    tmpForm.to = tmpForm.from + 50;
  } else {
    tmpForm.to = tmpForm.from;
    tmpForm.from = Math.max(0, tmpForm.from - 50);
  }
  await getErrorDataLogs();
};

const reset = () => {
  tmpForm.filename = null;
  tmpForm.from = 0;
  tmpForm.to = 50;
};

onMounted(() => {
  getPageAkses();
  getErrorLogs();
});



</script>