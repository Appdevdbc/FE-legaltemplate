<template>
  <q-dialog v-model="show" transition-show="slide-up" transition-hide="slide-down">
    <q-card class="tw-w-full tw-max-w-6xl tw-rounded-2xl tw-shadow-2xl">
      <q-card-section :class="`bg-${domain()}`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="security" size="32px" class="tw-text-white"/>
            <div>
              <div class="text-h5 tw-text-white tw-font-bold">Role Access Management</div>
              <div class="tw-text-blue-100 tw-text-sm">{{ roleData?.user_name }} - {{ roleData?.urole_desc }}</div>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="show = false"
            class="tw-shadow-md hover:tw-bg-white/20 tw-transition-all"
          >
            <q-tooltip class="tw-bg-slate-800 tw-text-xs">Close</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
        <div class="tw-flex tw-gap-2 tw-mb-3">
          <q-btn
            dense
            unelevated
            color="green-6"
            label="Grant All"
            icon="done_all"
            @click="checkAll"
            size="sm"
            text-color="white"
            class="tw-font-semibold tw-px-3 tw-rounded-full tw-shadow-md hover:tw-shadow-xl hover:tw-scale-110 tw-transition-all hover:tw-brightness-110"
          />
          <q-btn
            dense
            unelevated
            color="red-6"
            label="Revoke All"
            icon="remove_done"
            @click="uncheckAll"
            size="sm"
            text-color="white"
            class="tw-font-semibold tw-px-3 tw-rounded-full tw-shadow-md hover:tw-shadow-xl hover:tw-scale-110 tw-transition-all hover:tw-brightness-110"
          />
        </div>
        <q-table
          :rows="listRoleAkses"
          :columns="columns"
          row-key="menu"
          v-model:pagination="pagination"
          :loading="loading"
          :filter="pagination.filter"
          :rows-per-page-options="[]"
          @request="onRequest"
          binary-state-sort
          flat
          dense
          class="tw-shadow-md tw-rounded-xl tw-overflow-hidden"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :class="`bg-${domain()} tw-text-white tw-font-bold tw-text-xs tw-uppercase tw-tracking-wide tw-py-2`"
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
            <q-input
              outlined
              dense
              debounce="300"
              v-model="pagination.filter"
              placeholder="Search menu..."
              class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="blue-6" />
              </template>
            </q-input>
          </template>
          <template v-slot:body-cell-has_access="props">
            <q-td :props="props" class="tw-text-center tw-py-1">
              <q-btn
                :label="hasAnyAccess(props.row) ? 'Granted' : 'Denied'"
                :icon="hasAnyAccess(props.row) ? 'check_circle' : 'cancel'"
                :color="hasAnyAccess(props.row) ? 'green-6' : 'red-6'"
                @click="toggleAccess(props.row, !hasAnyAccess(props.row))"
                size="sm"
                unelevated
                text-color="white"
                class="tw-font-semibold tw-px-3 tw-rounded-full tw-shadow-md hover:tw-shadow-lg hover:tw-scale-105 tw-transition-all"
              />
            </q-td>
          </template>
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-2 tw-text-slate-700 tw-text-sm">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import { domain, empid, role, admin, decryptMessage, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  roleData: Object
});

const emit = defineEmits(['update:modelValue']);

const $q = useQuasar();
const { success, error } = useNotify();
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const listRoleAkses = ref([]);
const columns = [
  {
    name: "urole_desc",
    required: true,
    label: "Role Name",
    align: "left",
    field: "urole_desc",
    sortable: true,
  },
  {
    name: "has_access",
    required: true,
    label: "Access",
    align: "center",
    field: "grant_user_id",
  },
];
const pagination = ref({
  sortBy: "asc",
  descending: false,
  empid: null,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 10,
  filter: null,
  domain: domain(),
});
const tmpPage = ref({
  add: '0',
  edit: '0',
  delete: '0',
  view: '0',
  admin: '1'
});


const getMenuAccess = async () => {
  if (!props.roleData?.user_id) return;
  
  try {
    spinnerBall();
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
      pagination.value.rowsPerPage = pagination.value.rowsNumber;
    
    pagination.value.empid = props.roleData.user_id;
    
    const res = await axios.get(`${import.meta.env.VITE_API}grantRole`, {
      params: pagination.value
    });
    
    listRoleAkses.value = typeof res.data.data === "undefined" ? res.data : res.data.data;
    
    if (res.data.pagination) {
      pagination.value.rowsNumber = res.data.pagination.total;
    }
    
    loading.value = false;
    $q.loading.hide();
  } catch (err) {
    loading.value = false;
    $q.loading.hide();
    error('Failed to load menu access');
  }
};

const hasAnyAccess = (row) => {
  return row.grant_user_id !== null;
};

const toggleAccess = async (row, val) => {
  try {
    await axios.post(`${import.meta.env.VITE_API}saveGrantRole`, {
      creator: empid(),
      empid: props.roleData.user_id,
      role: row.urole_id,
      granted: val ? 1 : 0
    });
    
    row.grant_user_id = val ? props.roleData.user_id : null;
    success(`Role ${row.urole_desc} ${val ? 'granted' : 'revoked'} successfully`);
  } catch (err) {
    error('Failed to update access');
  }
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getMenuAccess();
};

const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const checkAll = async () => {
  try {
    spinnerBall();
    for (const row of listRoleAkses.value) {
      row.grant_user_id = props.roleData.user_id;
      await axios.post(`${import.meta.env.VITE_API}saveGrantRole`, {
        creator: empid(),
        empid: props.roleData.user_id,
        role: row.urole_id,
        granted: 1
      });
    }
    $q.loading.hide();
    success('All roles granted successfully');
  } catch (err) {
    $q.loading.hide();
    error('Failed to grant all roles');
  }
};

const uncheckAll = async () => {
  try {
    spinnerBall();
    for (const row of listRoleAkses.value) {
      row.grant_user_id = null;
      await axios.post(`${import.meta.env.VITE_API}saveGrantRole`, {
        creator: empid(),
        empid: props.roleData.user_id,
        role: row.urole_id,
        granted: 0
      });
    }
    $q.loading.hide();
    success('All roles revoked successfully');
  } catch (err) {
    $q.loading.hide();
    error('Failed to revoke all roles');
  }
};

watch(() => props.modelValue, (val) => {
  if (val) {
    onRequest({
      pagination: pagination.value,
    });
  }
});
</script>
