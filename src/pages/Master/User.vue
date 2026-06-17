<template>
  <div class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="people" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master User</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px"/>
              <q-icon name="chevron_right" size="14px"/>
              <span>Master User</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="tw-bg-white">
        <q-table
          v-if="tmpPage.view =='1'||tmpPage.admin =='1'"
          :rows="listUser"
          :columns="columns"
          row-key="id"
          v-model:pagination="pagination"
          :rows-per-page-options="[]"
          :loading="loading"
          :filter="pagination.filter"
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
             <div class="row q-col-gutter-sm">
               <div class="col-12">
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
                </div>
             </div>    
          </template>
          <template v-slot:top-right>
            <div class="tw-flex tw-gap-3 tw-items-center">
              <q-btn
                v-if="tmpPage.add =='1'||tmpPage.admin == '1'"
                unelevated
                color="blue-6"
                label="Tambah Data"
                icon="add"
                @click="addUser"
                class="tw-font-semibold tw-px-4 tw-rounded-lg hover:tw-brightness-110 tw-transition-all"
              />
              <q-input
                outlined
                dense
                debounce="300"
                v-model="pagination.filter"
                placeholder="Search users..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="blue-6" />
                </template>
              </q-input>
            </div>
          </template>
        <!--   <template v-slot:body-cell-domain="props">
            <q-td :props="props">
              {{ parseDomain(props.row.domains) }}
            </q-td>
          </template> -->
          <template v-slot:body-cell="props">
            <q-td :props="props" class="tw-py-4 tw-text-slate-700">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="tw-py-4 sticky-column-left">
                <q-btn 
                  round
                  dense
                  color="light-blue-9"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="editUser(props.row)"
                  icon="edit"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Edit
                  </q-tooltip>
                </q-btn>

                <!-- <q-btn 
                  v-if="(tmpPage.admin=='0' && tmpPage.delete == '1') ||tmpPage.admin=='1'"
                  round
                  dense
                  color="negative"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="deleteUser(props.row)"
                  icon="delete"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Delete
                  </q-tooltip>
                </q-btn> -->
                
                <q-btn 
                  round
                  dense
                  color="teal-7"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="setDomain(props.row)"
                  icon="fact_check"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Mapping Domain
                  </q-tooltip>
                </q-btn>

                <q-btn 
                  round
                  dense
                  color="deep-orange-7"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="setSite(props.row)"
                  icon="fact_check"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Mapping Site
                  </q-tooltip>
                </q-btn>

                <q-btn 
                  round
                  dense
                  color="purple-7"
                  size="sm"
                  class="tw-mr-1 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-110 tw-transition-all"
                  @click="grantRole(props.row)"
                  icon="admin_panel_settings"
                >
                  <q-tooltip class="tw-bg-slate-800 tw-text-xs">
                    Grant Role
                  </q-tooltip>
                </q-btn>
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
            Form User
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
                v-model="tmpForm.nik"
                outlined
                counter maxlength="50" 
                :readonly = "updateForm"
                :rules="[val => !!val || 'Field is required']"
                @blur="getHrisByNIK"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">NIK</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.nama"
                outlined
                label="Nama"
                counter maxlength="100" 
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.email" 
                outlined 
                type="email"
                counter maxlength="100" 
                :rules="[val => !!val || 'Field is required',
                (val, rules) => rules.email(val) || 'Please enter a valid email address' ]"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Email</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.jabatan"
                outlined
                label="Jabatan"
                counter maxlength="100" 
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.dept"
                outlined
                label="Departemen"
                counter maxlength="100" 
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.div"
                outlined
                label="Divisi"
                counter maxlength="100" 
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-input
                v-model="tmpForm.dir"
                outlined
                label="Direktorat"
                counter maxlength="100" 
                readonly
                class="tw-rounded-lg tw-bg-slate-50"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="blue-6"/>
                </template>
              </q-input>
            </div>
            <div class="col-12">
              <q-select
                outlined
                v-model="tmpForm.domain"
                use-input
                emit-value
                map-options
                input-debounce="0"
                option-value="value"
                option-label="description"
                :options="listDomain"
                @filter="filterDomainFunction"
                @popup-hide="getSiteByDomain(true)"
                :rules="[val => !!val || 'Field is required']"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="domain" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Default Domain</span>
                  <span class="tw-text-red-500 tw-font-bold">*</span>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">No results</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12">
              <q-select
                outlined
                v-model="tmpForm.site"
                use-input
                emit-value
                map-options
                input-debounce="0"
                option-value="site_code"
                :option-label="opt =>`${opt.site_code} - ${opt.site_desc}`"
                :options="listSiteDefault"
                @filter="filterSiteFunction"
                label-slot
                class="tw-rounded-lg"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="blue-6"/>
                </template>
                <template v-slot:label>
                  <span class="tw-font-semibold tw-text-slate-700">Default Site</span>
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
            @click="validateUser"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <UserDomainDialog v-model="dialogDomain" :userData="selectedUser" @saved="updateTable" />
    <UserSiteDialog v-model="dialogSite" :userData="selectedUser" @saved="updateTable" />
    <GrantRole v-model="dialogGrantRole" :roleData="selectedUser" />

  </div>

  


</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"
import { ParseError, excelDownload, 
        domain, role, 
        empid,admin,
        card,header, 
        spinnerBall,
        formatDateDMY,
        formatDateDMYHM,
        decrypt,
        site,
        decryptMessage} from "./../../utils";
import { useQuasar,Loading,QSpinnerCube  } from "quasar";
import * as yup from "yup";
import { useRouter as useVueRouter, useRoute} from "vue-router";
import { useNotify } from "./../../composables/useNotify";
import UserDomainDialog from "./../../components/master/UserDomainDialog.vue";
import UserSiteDialog from "./../../components/master/UserSiteDialog.vue";
import GrantRole from "./../../components/master/GrantRole.vue";
import "./../../assets/styles/table.css";

const route = useRoute();
const router = useVueRouter();
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
    name: "user_nik",
    required: true,
    label: "NIK",
    align: "left",
    field: "user_nik",
    sortable: true,
  },
  {
    name: "user_name",
    align: "left",
    label: "Nama",
    field: "user_name",
    sortable: true,
  },
  {
    name: "user_email",
    label: "Email",
    align: "left",
    field: "user_email",
    sortable: true,
  },
  {
    name: "user_jabatan",
    label: "Jabatan",
    align: "left",
    field: "user_jabatan",
    sortable: true,
  },
  {
    name: "user_domain",
    label: "Domain (Default)",
    align: "left",
    field: row => `${row.user_domain} - ${row.domain_shortname}`,
    sortable: true,
  }
];
const $q = useQuasar();
const listUser = ref([]);

const tmpRole = reactive({
  code: null,
  needle:null,
});


const listDomain = ref([]);
const listApp = ref([]);
const listSiteDefault = ref([]);
const listRole = ref([]);

const loading = ref(false);
const updateForm = ref(false);
const dialogForm = ref(false);
const dialogDomain = ref(false);
const dialogSite = ref(false);
const dialogGrantRole = ref(false);
const selectedUser = ref(null);

const pagination = ref({
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  filter: null,
  domain: domain(),
});

const tmpForm = reactive({
  fldid: null,
  nik: null,
  empid: null,
  nama: null,
  email: null,
  jabatan: null,
  domain: null,
  site: null,
  grade: null,
  dept_id:null,
  dept:null,
  div_id:null,
  div:null,
  dir_id:null,
  dir:null,
  role:null,
  admin:'0',
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
  nik:yup.string().required("NIK wajib diisi").nullable(),
  email: yup.string().required("Email wajib diisi")
        .nullable()
        .email('Format email tidak sesuai'),
  domain:  yup.string().required("Domain wajib diisi").nullable(),
  site:  yup.string().required("Site wajib diisi").nullable(),
});

const getPageAkses = async () => {
  try {
    spinnerBall()
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role:empid(),
        page:'/user'
      }
    });
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit =decryptMessage(res.data.edit);
    tmpPage.delete =decryptMessage(res.data.delete);
    tmpPage.view =decryptMessage(res.data.view);
    tmpPage.admin=decryptMessage(admin());
    Loading.hide()
  } catch (error) {
    Loading.hide()
    router.push('/404');
  }
};

const getUser = async () => {
  try {
    spinnerBall()
    loading.value = true;
    if (pagination.value.rowsPerPage == 'All')
     pagination.value.rowsPerPage = pagination.value.rowsNumber;
    const res = await axios.get(`${import.meta.env.VITE_API}users`, {
      params: pagination.value
    });
    
    if (typeof res.data.data === "undefined") {
      listUser.value = res.data;
    } else {
      listUser.value = res.data.data;
    }

    pagination.value.rowsNumber = res.data.pagination.total;
    loading.value = false;
    Loading.hide()
  } catch (error) {
    loading.value = false;
    Loading.hide()
  }
};

const getDomain = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getDomains`);
    listDomain.value = res.data;
  } catch (error) {
  }
};

const getRole = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}role`,
    {
      params: {
        ...tmpRole,
        }
    });
    listRole.value = res.data;
  } catch (error) {
  }
};

const addUser = async () => {
  updateForm.value = false;
  dialogForm.value = true;
  reset();
};

const editUser = (value) => {
  try{
  reset();
  updateForm.value = true;
  dialogForm.value = true;
 
  tmpForm.fldid = value.id;
  tmpForm.empid = value.user_id;
  tmpForm.nik = value.user_nik;
  tmpForm.email = value.user_email;
  tmpForm.nama = value.user_name;
  tmpForm.jabatan = value.user_jabatan;
  tmpForm.grade = value.user_grade;
  tmpForm.domain = value.user_domain;
  tmpForm.dept_id = value.user_dept_id;
  tmpForm.dept = value.user_dept_name;
  tmpForm.div_id = value.user_div_id;
  tmpForm.div = value.user_div_name;
  tmpForm.dir_id = value.user_dir_id;
  tmpForm.dir = value.user_dir_name;
  tmpForm.site = value.user_site;
  tmpForm.role = value.user_role;
  tmpRole.code = value.user_role;
  //tmpForm.admin =  decryptMessage(value.user_admin);
  console.log(value.user_site);
  getRole();
  getSiteByDomain();
  }catch (error){
    console.log(error)
  }
};

const validateUser = async () => {
  let validate = {
    nik: tmpForm.nik,
    email: tmpForm.email,
    domain: tmpForm.domain,
    site:tmpForm.site,
    role:tmpForm.role,
    admin:tmpForm.admin,
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
       await saveUser();
    } catch (error) {
      /* $q.notify({
        type: "negative",
        message: ParseError(error),
      }); */
    }
  });
};

const saveUser = async () => {
  if (updateForm.value) {
    try {
      await axios.post(`${import.meta.env.VITE_API}users`, tmpForm);
      dialogForm.value = false;
      reset();
      success('Data berhasil diubah');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
    }
  } else {
    try {
      await axios.post(`${import.meta.env.VITE_API}users`, tmpForm);
      dialogForm.value = false;
      reset();
      success('Data berhasil disimpan');
      onRequest({
        pagination: pagination.value,
      });
    } catch (error) {      
    }
  }
};

const getHrisByNIK = async () => { 
  try {
    spinnerBall();
    if(tmpForm.nik != null){
      const res = await axios.get(`${import.meta.env.VITE_API}getHrisByNIK`, {
      params: {
        nik: tmpForm.nik,
      },
      });
      tmpForm.nama = res.data.name;
      tmpForm.email = res.data.email;
      tmpForm.empid = res.data.empid;
      tmpForm.grade = res.data.grade;
      tmpForm.jabatan = res.data.jabatan;
      tmpForm.dept_id = res.data.dept_id; 
      tmpForm.dept = res.data.dept_name;
      tmpForm.div_id = res.data.div_id;
      tmpForm.div = res.data.div_name;
      tmpForm.dir_id = res.data.dir_id;
      tmpForm.dir = res.data.dir_name;
    }
    Loading.hide();
  } catch (error) {
    Loading.hide();
  }
};

const getSiteByDomain = async (isreset=null) => {
  try {
    listSiteDefault.value=[];
    if(isreset!=null)
    tmpForm.site = null;
    if(tmpForm.domain != null){
      const res = await axios.get(`${import.meta.env.VITE_API}listSiteByDomain`, {
        params: {
          empid: tmpForm.empid,
          domain : tmpForm.domain,
          creator:tmpForm.empid,
        },
      });
      listSiteDefault.value = res.data;
    } 
  } catch (error) {
    console.log(error.message);
    /* $q.notify({
      type: "negative",
      message: ParseError(error),
    }); */
  }
};

const deleteUser = (value) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah anda ingin menghapus data <span class="text-bold">${value.user_nik} - ${value.user_name}</span>?`,
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
      await axios.post(`${import.meta.env.VITE_API}deleteusers`,{
        empid:value.user_id,
        creator:empid(),
      });
      dialogForm.value = false;
      reset();
      success('Data berhasil dihapus');
      await onRequest({
        pagination: pagination.value,
      });
    } catch (error) {
      error(ParseError(error));
    }
  });
};



const reset = () => {
  tmpForm.empid = null;
  tmpForm.nik = null;
  tmpForm.nama = null;
  tmpForm.email = null;
  tmpForm.site = null;
  tmpForm.domain = null;
  tmpForm.jabatan = null;
  tmpForm.grade = null;
  tmpForm.dept_id=null
  tmpForm.dept_name=null
  tmpForm.div_id=null
  tmpForm.div_name=null
  tmpForm.dir=null
  tmpForm.dir_name=null
  tmpForm.role = null
  tmpForm.admin = '0'
};

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending, filter } = props.pagination;
  pagination.value.filter = filter;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getUser();
};


const setDomain = async (value) => {
  selectedUser.value = value;
  dialogDomain.value = true;
};

const setSite = async (value) => {
  selectedUser.value = value;
  dialogSite.value = true;
};

const grantRole = async (value) => {
  selectedUser.value = value;
    console.log(selectedUser.value)
  dialogGrantRole.value = true;
};




const updateTable = async () => {
  onRequest({
    pagination: pagination.value,
  });
};

const filterDomainFunction = async (val, update) => {
        if (val === '') {
            update(() => {
                getDomain();
            })
        }

        update(() => {
            const neddle = val.toLowerCase();
            listDomain.value = listDomain.value.filter(option => {
                return option.description.toLowerCase().includes(neddle)
            }) 
        })
}

const filterSiteFunction = async (val, update) => {
      if (val === '') {
          update(() => {
              getSiteByDomain(true);
          })
      }

      update(() => {
          const neddle = val.toLowerCase();
          listSiteDefault.value = listSiteDefault.value.filter(option => {
              return (option.site_code.toLowerCase().includes(neddle)||option.site_desc.toLowerCase().includes(neddle))
          }) 
      })
}

onMounted(() => {
  getPageAkses();
  getDomain();
  onRequest({
    pagination: pagination.value,
  });
});

</script>