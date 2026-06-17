<template>
    <div class="q-pa-md">
      <q-card>
         <q-card-section :class="`side-${domain()}-1`">
           <div class="text-h6">Role Akses</div>
           <div class="tw-text-xs">
              <q-icon name="chevron_right"/>
              <router-link :to="{ path: '/role' }"
              class="hover:tw-text-blue-100 hover:tw-font-semibold">
              Role
              </router-link>
              <q-icon name="chevron_right"/>
              <router-link :to="{ path: '/menu-detail/'+route.params.id }"
              class="hover:tw-text-blue-100 hover:tw-font-semibold">
              Role Akses
              </router-link>
              <q-btn
              dense color="deep-orange-13" 
              class="text-weight-regular text-caption tw-absolute tw-top-4 tw-right-2"
              icon="arrow_back"
              @click="back"
              >
              Back
                  <q-tooltip :class="'tw-bg-black/90'">
                      Back
                  </q-tooltip>
              </q-btn>
          </div>
        </q-card-section>
  
        <q-separator />
  
        <q-card-section>
          <q-table v-if="tmpPage.view == '1'||tmpPage.admin=='1'"
            :rows="listRoleAkses"
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
            <template v-slot:body-cell-name="props">
              <q-td :props="props" v-if="props.row.link == '#'">
                <b style="font-size:14px">{{ props.row.name }}</b>
              </q-td>
              <q-td :props="props" v-if="props.row.link != '#'">
                &emsp;&emsp;&emsp;{{ props.row.name }}
              </q-td>
            </template>
            <template v-slot:body-cell-access_view="props">
              <q-td :props="props">
                <q-checkbox v-if="props.row.link != '#'"
                    color="blue"
                    :disable="((tmpPage.admin!='1' && (tmpPage.add != '1'|| tmpPage.edit != '1'))||tmpPage.admin=='1')"
                    :model-value="props.row.access_view === 1"
                    @update:model-value="val => saveRole(props.row, 'access_view', val)"
                />
              </q-td>
            </template>
            
            <template v-slot:body-cell-access_add="props">
              <q-td :props="props">
                <q-checkbox v-if="props.row.link != '#'"
                    color="green"
                    :disable="(tmpPage.admin!='1' && (tmpPage.add != '1'|| tmpPage.edit != '1'))||tmpPage.admin=='1'"
                    :model-value="props.row.access_add === 1"
                    @update:model-value="val => saveRole(props.row, 'access_add', val)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-access_edit="props">
              <q-td :props="props">
                <q-checkbox v-if="props.row.link != '#'"
                    color="teal"
                    :disable="(tmpPage.admin!='1' && (tmpPage.add != '1'|| tmpPage.edit != '1'))||tmpPage.admin=='1'"
                    :model-value="props.row.access_edit === 1"
                    @update:model-value="val => saveRole(props.row, 'access_edit', val)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-access_delete="props">
              <q-td :props="props">
                <q-checkbox v-if="props.row.link != '#'"
                    color="red"
                    :disable="(tmpPage.admin!='1' && (tmpPage.add != '1'|| tmpPage.edit != '1'))||tmpPage.admin=='1'"
                    :model-value="props.row.access_delete === 1"
                    @update:model-value="val => saveRole(props.row, 'access_delete', val)"
                />
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
  import { ParseError, excelDownload, domain, 
  role, empid,table,card,
  header,
  admin,
  decrypt,
  spinnerBall,
  decryptMessage} from "./../../utils";
  import { useQuasar } from "quasar";
  import * as yup from "yup";
  import { useRouter, useRoute} from "vue-router";
  
  const router = useRouter();
  const route = useRoute();
  const columns = [
    {
      name: "name",
      required: true,
      label: "Menu Name",
      align: "left",
      field: "name",
      sortable: true,
    },
    {
      name: "access_view",
      required: true,
      label: "View",
      align: "center",
      field: "access_view",
    },
    {
      name: "access_add",
      required: true,
      label: "Add",
      align: "center",
      field: "access_add",
    },
    {
      name: "access_edit",
      required: true,
      label: "Edit",
      align: "center",
      field: "access_edit",
    },
    {
      name: "access_delete",
      required: true,
      label: "Delete",
      align: "center",
      field: "access_delete",
    },
  ];
  const $q = useQuasar();
  const listRoleAkses = ref([]);
  const listParent = ref([]);
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

const tmpPage = reactive({
  add:'0',
  edit:'0',
  delete:'0',
  view:'0',
  admin:'1',
});
  
  const getMenu = async () => {
    try {
      loading.value = true;
       if (pagination.value.rowsPerPage == 'All')
       pagination.value.rowsPerPage = pagination.value.rowsNumber;
       const parent = await decrypt(route.params.id);
       pagination.value.parent = parent;
      const res = await axios.get(`${import.meta.env.VITE_API}roleakses`, {
        params: pagination.value,
      });
      // listRoleAkses.value = res.data.data;
      if (typeof res.data.data === "undefined") {
        listRoleAkses.value = res.data;
      } else {
        listRoleAkses.value = res.data.data;
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
  
  const saveRole = async (row, data, val) => {
    try {
      const newValue = val ? 1 : 0
      row[data] = newValue
      await axios.post(`${import.meta.env.VITE_API}saveroleakses`, {
        creator:empid(),
        menu:row.menu,
        role:pagination.value.parent,
        view:row.access_view,
        add:row.access_add,
        edit:row.access_edit,
        delete:row.access_delete,
      });
      $q.notify({
        type: "positive",
        message: "Data berhasil diupdate",
      });
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      row[data] = row[data] === 1 ? 0 : 1
    }
};

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:role(),
        page:'/role'
      }
    });
    console.log(decryptMessage(admin()));
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin())
    $q.loading.hide()
  } catch (error) {
    $q.loading.hide()
  }
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
   router.push({path: `/role`})
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
   getPageAkses();

  </script>