<template>
  <div class="q-pa-md">
    <q-card>
       <q-card-section :class="`side-${domain()}-1`">
         <div class="text-h6">Master Item</div>
         <div class="tw-text-xs hover:tw-text-blue-100 hover:tw-font-semibold">
            <q-icon name="chevron_right"/>
            <router-link :to="{ path: '/item' }">
            Master Item
            </router-link>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div :class="`side-r-lighter-${domain()} row q-col-gutter-sm tw-border-solid tw-border-2 tw-rounded-md tw-border-sky-200 tw-p-2 tw-m-3`">
            <div class="col-2">
                <q-select
                dense
                outlined
                v-model="tmpForm.status"
                use-input
                emit-value
                map-options
                multiple
                input-debounce="0"
                :options="listStatus"
                option-value="data"
                option-label="data"
                bg-color="white"
                @filter="filterStatusFunction"
                class="tw-appearance-none"
                label-slot >
                    <template v-slot:label>
                        <span class="tw-font-bold">
                            Status
                        </span> 
                    </template>
                    <template v-slot:append>
                        <q-icon name="help" color="primary">
                        <q-tooltip :class="'tw-bg-black/70'">
                            <p>- Ketik untuk melakukan pencarian</p>
                        </q-tooltip>
                        </q-icon>
                    </template>
                </q-select>
            </div>
            <div class="col-2">
                <q-select
                dense
                outlined
                v-model="tmpForm.prodline"
                use-input
                emit-value
                map-options
                multiple
                bg-color="white"
                input-debounce="0"
                :options="listProdline"
                option-value="data"
                option-label="data"
                @filter="filterProdlineFunction"
                label-slot >
                    <template v-slot:label>
                        <span class="tw-font-bold">
                            Prodline
                        </span> 
                    </template>
                    <template v-slot:append>
                        <q-icon name="help" color="primary">
                        <q-tooltip :class="'tw-bg-black/70'">
                            <p>- Ketik untuk melakukan pencarian</p>
                        </q-tooltip>
                        </q-icon>
                    </template>
                </q-select>
            </div>
            <div class="col-2">
                <q-select
                dense
                outlined
                v-model="tmpForm.type"
                use-input
                emit-value
                map-options
                multiple
                input-debounce="0"
                option-value="data"
                option-label="data"
                :options="listType"
                bg-color="white"
                @filter="filterTypeFunction"
                label-slot >
                    <template v-slot:label>
                        <span class="tw-font-bold">
                            Type
                        </span> 
                    </template>
                    <template v-slot:append>
                        <q-icon name="help" color="primary">
                        <q-tooltip :class="'tw-bg-black/70'">
                            <p>- Ketik untuk melakukan pencarian</p>
                        </q-tooltip>
                        </q-icon>
                    </template>
                </q-select>
            </div>
            <div class="col-2">
                <q-select
                dense
                outlined
                v-model="tmpForm.group"
                use-input
                emit-value
                map-options
                multiple
                bg-color="white"
                input-debounce="0"
                option-value="data"
                option-label="data"
                :options="listGroup"
                @filter="filterGroupFunction"
                label-slot >
                    <template v-slot:label>
                        <span class="tw-font-bold">
                            Group
                        </span> 
                    </template>
                    <template v-slot:append>
                        <q-icon name="help" color="primary">
                        <q-tooltip :class="'tw-bg-black/70'">
                            <p>- Ketik untuk melakukan pencarian</p>
                        </q-tooltip>
                        </q-icon>
                    </template>
                </q-select>
            </div>
            <div class="col-4">
                <div class="tw-px-2">
                    <div class="row tw-mx-2">
                        <q-btn class="tw-mx-2 tw-w-1/4" icon="search" color="primary" @click="getItem">
                            search
                            <q-tooltip :class="'tw-bg-black/70'">
                                search
                            </q-tooltip>
                        </q-btn>
                        <q-btn 
                        v-if="(tmpPage.admin=='0' && (tmpPage.add == '1'|| tmpPage.edit == '1'))||tmpPage.admin=='1'"
                        class="tw-w-1/4" color="secondary" icon="sync" @click="showSync">
                            sync
                            <q-tooltip :class="'tw-bg-black/70'">
                                sync
                            </q-tooltip>
                        </q-btn>
                    </div>
                    <div class="row tw-px-2 q-mt-sm">
                        <q-btn icon="cancel" class="tw-mx-2 tw-w-1/4" color="negative" @click="reset">
                            reset
                            <q-tooltip :class="'tw-bg-black/70'">
                                reset
                            </q-tooltip>
                        </q-btn>
                    </div>
                </div>
            </div>
        </div>

        <q-table
          v-if="tmpPage.view =='1'||tmpPage.admin =='1'"
          :rows="listItem"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :loading="loading"
          :filter="pagination.filter"
          :rows-per-page-options="[]"
          @request="onRequest"
          binary-state-sort
        >
        <template v-slot:header="props">
            <q-tr :props="props" class="bg-gray-100">
                <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    :class="`bg-${domain()} !tw-text-center !tw-border-r-2 !tw-border-slate-100`"
                >
                        {{ col.label }}
                </q-th>
            </q-tr>
          </template>
          <template v-slot:top-left>
             <q-select
              borderless
              dense
              debounce="300"
              v-model="pagination.rowsPerPage"
              :options="[5,10,25,50,100,200]"
              @update:modelValue="updateTable"
            >
              <template v-slot:before>
                <q-icon name="reorder">
                   <q-tooltip :class="'tw-bg-black/90'">
                    Rows per page
                  </q-tooltip>
                </q-icon>
              </template>
            </q-select>             
          </template>
          <template v-slot:top-right> 
            <q-input
              borderless
              dense
              debounce="300"
              v-model="pagination.filter"
              placeholder="Search"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
  <SyncItem v-if="dialogSync" :dialog="dialogSync" :data="tmpForm" @close="refreshData"></SyncItem>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import {domain, 
role, empid,
admin,
decryptMessage,
encrypt,
spinnerBall,
formatRupiahFixedCustom} from "./../../utils";
import { useQuasar } from "quasar";
import * as yup from "yup";
import { useRouter, useRoute} from "vue-router";
import SyncItem from "../../components/master/syncItem.vue";

const router = useRouter();
const columns = [
  {
    name: "idqad",
    required: true,
    label: "Item Number",
    align: "left",
    field: "idqad",
    sortable: true,
  },
  {
    name: "nmprod",
    required: true,
    label: "Deskripsi",
    align: "left",
    field: "nmprod",
    sortable: true,
  },
  {
    name: "prodLine",
    required: true,
    label: "Prodline",
    align: "left",
    field: "prodLine",
    sortable: true,
  },
  {
    name: "part_type",
    required: true,
    label: "Item Type",
    align: "left",
    field: "part_type",
    sortable: true,
  },
  {
    name: "group",
    required: true,
    label: "Group",
    align: "left",
    field: "group",
    sortable: true,
  },
  {
    name: "pt_status",
    required: true,
    label: "Status",
    align: "left",
    field: "pt_status",
    sortable: true,
  },
  {
    name: "berat",
    required: true,
    label: "Net Weight",
    align: "right",
    field: "berat",
    sortable: true,
    format:val =>formatRupiahFixedCustom(val,5),
  },
  {
    name: "nesting_volume",
    required: true,
    label: "Volume",
    align: "right",
    field: "nesting_volume",
    sortable: true,
    format:val =>formatRupiahFixedCustom(val,5),
  },
  {
    name: "nesting_ukuran",
    required: true,
    label: "Ukuran",
    align: "right",
    field: "nesting_ukuran",
    sortable: true,
    format:val =>formatRupiahFixedCustom(val,5),
  },
  {
    name: "pt_chr08",
    required: true,
    label: "@Qty",
    align: "right",
    field: "pt_chr08",
    sortable: true,
    format:val =>formatRupiahFixedCustom(val,5),
  },
  {
    name: "nesting_vinner",
    required: true,
    label: "Inner",
    align: "right",
    field: "nesting_vinner",
    sortable: true,
    format:val =>formatRupiahFixedCustom(val,5),
  },
];
const $q = useQuasar();
const listItem = ref([]);
const listStatus = ref([]);
const listProdline = ref([]);
const listType = ref([]);
const listGroup = ref([]);
const loading = ref(false);
const dialogSync = ref(false);
const pagination = ref({
  sortBy: "asc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 10,
  filter: null,
  domain: domain(),
});

const tmpForm = reactive({
  status: [],
  prodline: [],
  type:[],
  group:[],
});

const tmpStatus = reactive({
  code: null,
  needle:null,
  field:'pt_status',
  domain:domain(),
});

const tmpProdline = reactive({
  code: null,
  needle:null,
  field:'prodLine',
  domain:domain(),
});

const tmpType = reactive({
  code: null,
  needle:null,
  field:'part_type',
  domain:domain(),
});

const tmpGroup = reactive({
  code: null,
  needle:null,
  field:'group',
  domain:domain(),
});

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'0',
});

const showSync = () => {
  dialogSync.value = true;
};

const getItem = async () => {
  try {
    loading.value = true;
    spinnerBall()
     if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}itemmaster`, {
      params:{ 
        ...pagination.value,
        ...tmpForm,
      }
    });
    // listItem.value = res.data.data;
    if (typeof res.data.data === "undefined") {
      listItem.value = res.data;
    } else {
      listItem.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
    $q.loading.hide()
  } catch (error) {
    $q.loading.hide();
    loading.value = false;
  }
  //tableColor.value = table();
  //cardColor.value = card();
  //headerColor.value = header();
};

const getStatus = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}fielddbmaster`,
    {
      params: {
        ...tmpStatus,
        }
    });
    listStatus.value = res.data;
  } catch (error) {
  }
};

const getProdline = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}fielddbmaster`,
    {
      params: {
        ...tmpProdline,
        }
    });
    listProdline.value = res.data;
  } catch (error) {
  }
};

const getType = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}fielddbmaster`,
    {
      params: {
        ...tmpType,
        }
    });
    listType.value = res.data;
  } catch (error) {
  }
};

const getGroup = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}fielddbmaster`,
    {
      params: {
        ...tmpGroup,
        }
    });
    listGroup.value = res.data;
  } catch (error) {
  }
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:role(),
        page:'/item'
      }
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin());
    $q.loading.hide()
  } catch (error) {
    $q.loading.hide()
  }
};

const filterStatusFunction = async (val, update) => {
        if (val === '') {
          update(() => {
            tmpStatus.needle = null;
            tmpStatus.code = null;
            getStatus();
          })
        }

        update(() => {
            const neddle = val.toLowerCase();
            tmpStatus.needle = val.toLowerCase();
            getStatus();
        })
}

const filterProdlineFunction = async (val, update) => {
        if (val === '') {
          update(() => {
            tmpProdline.needle = null;
            tmpProdline.code = null;
            getProdline();
          })
        }

        update(() => {
            const neddle = val.toLowerCase();
            tmpProdline.needle = val.toLowerCase();
            getProdline();
        })
}

const filterTypeFunction = async (val, update) => {
        if (val === '') {
          update(() => {
            tmpType.needle = null;
            tmpType.code = null;
            getType();
          })
        }

        update(() => {
            const neddle = val.toLowerCase();
            tmpType.needle = val.toLowerCase();
            getType();
        })
}

const filterGroupFunction = async (val, update) => {
        if (val === '') {
          update(() => {
            tmpGroup.needle = null;
            tmpGroup.code = null;
            getType();
          })
        }

        update(() => {
            const neddle = val.toLowerCase();
            tmpGroup.needle = val.toLowerCase();
            getGroup();
        })
}

const refreshData = async () => {
 dialogSync.value = false;
  getItem();
}


const reset = async () => {
  tmpForm.status = [];
  tmpForm.prodline = [];
  tmpForm.type = [];
  tmpForm.group= [];
  await onRequest({
        pagination: pagination.value,
  });
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getItem();
  
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