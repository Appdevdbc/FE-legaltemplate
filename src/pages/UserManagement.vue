<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="people" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Master User</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Master</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Master User</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Table -->
      <q-card-section class="tw-bg-white">
        <q-table
          :rows="users"
          :columns="columns"
          row-key="account_nik"
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
              <q-btn unelevated color="blue-6" label="Tambah Data" icon="add_circle" @click="openAddDialog"
                class="tw-font-semibold tw-px-4 tw-rounded-lg" />
              <q-input outlined dense debounce="300" v-model="filter" placeholder="Search..."
                class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[300px]">
                <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
              </q-input>
            </div>
          </template>

          <template v-slot:body-cell-no="props">
            <q-td :props="props" class="tw-text-center">
              {{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}
            </q-td>
          </template>
        
          <template v-slot:body-cell-employee_stat="props">
              <q-td :props="props">
                  <q-badge v-if="props.value == 'ACTIVE'" color="green-6" class="q-py-xs" label="Aktif" />
                  <q-badge v-if="props.value == 'INACTIVE'" color="red-8" class="q-py-xs" label="Tidak Aktif" />
              </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props">
              <q-btn round dense color="orange" size="sm" icon="edit" @click="openEditDialog(props.row)" class="tw-mr-1">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn round dense color="negative" size="sm" icon="delete" @click="confirmDelete(props.row)">
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog Add User -->
    <q-dialog v-model="dialogAdd" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="add_circle" size="28px" />
            Tambah User
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


            <!-- User NIK (searchable dropdown - always shown) -->
            <q-select
              v-model="addForm.nik"
              outlined
              dense
              label="User NIK *"
              :options="filteredEmployees"
              option-value="employee_id"
              option-label="employee_name"
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterEmployees"
              @update:model-value="onEmployeeSelected"
            >
              <template v-slot:prepend><q-icon name="badge" color="blue-6" /></template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.employee_id }} | {{ scope.opt.bu_name }} - {{ scope.opt.div_nama }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Tidak ada data</q-item-section>
                </q-item>
              </template>
            </q-select>
                        </div>

            <!-- Nama (readonly) -->
            <div class="col-12">
            <q-input
              v-model="addForm.divisi"
              outlined
              dense
              label="Divisi"
              readonly
              class="tw-bg-gray-50"
            >
              <template v-slot:prepend><q-icon name="apartment" color="blue-6" /></template>
            </q-input>
            </div>

            <!-- Email -->
            <div class="col-12">
            <q-input
              v-model="addForm.email"
              outlined
              dense
              label="Email *"
              type="email"
              placeholder="Input Email"
            >
              <template v-slot:prepend><q-icon name="email" color="blue-6" /></template>
            </q-input>
            </div>



            <!-- Username (shown for non-employee role = 3 / Admin BU) -->
            <!-- <div class="col-12" v-if="addForm.role === 3">
            <q-input              
              v-model="addForm.username"
              outlined
              dense
              label="Username *"
              placeholder="Input Username"
            >
              <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
            </q-input>
            </div> -->

            <!-- Nama Akun (shown for non-employee role = 3) -->
            <!-- <div class="col-12" v-if="addForm.role === 3">
            <q-input              
              v-model="addForm.nama"
              outlined
              dense
              label="Nama Akun *"
              placeholder="Input Nama Akun"
            >
              <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
            </q-input>
            </div> -->

            <!-- Business Unit Single (always shown, for roles != 6/Chief) -->
            <div class="col-12">
            <q-select
              v-model="addForm.bu"
              outlined
              dense
              label="Bisnis Unit *"
              :options="filteredBuAdd"
              option-value="bu_id"
              option-label="bu_id"
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterBuAdd"
            >
              <template v-slot:prepend><q-icon name="business" color="blue-6" /></template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.bu_id }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.bu_name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <!-- </div> -->

            <!-- Business Unit Multiple (for Chief / role 6) -->
            <!-- <div class="col-12"> -->
            <!-- <q-select
              v-if="addForm.role === 6"
              v-model="addForm.buMultiple"
              outlined
              dense
              label="Bisnis Unit * (Multiple)"
              :options="filteredBuAdd"
              option-value="bu_id"
              option-label="bu_id"
              emit-value
              map-options
              multiple
              use-chips
              use-input
              input-debounce="300"
              @filter="filterBuAdd"
            >
              <template v-slot:prepend><q-icon name="business" color="blue-6" /></template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.bu_id }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.bu_name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select> -->
            </div>

                        <!-- Role -->
                        <div class="col-12">
            <q-select
              v-model="addForm.role"
              outlined
              dense
              label="Role *"
              :options="filteredRolesAdd"
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterRolesAdd"
            >
              <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
            </q-select>
            </div>

            <!-- Kontak -->
            <div class="col-12">
            <q-input
              v-model="addForm.contact"
              outlined
              dense
              label="Kontak"
              placeholder="Input Kontak"
            >
              <template v-slot:prepend><q-icon name="phone" color="blue-6" /></template>
            </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="saveAddUser" class="tw-px-6" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Edit User -->
    <q-dialog v-model="dialogEdit" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-2xl tw-rounded-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit" size="28px" />
            Edit User
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
            <!-- NIK (readonly) -->
            <q-input
              v-model="editForm.nik"
              outlined
              dense
              label="NIK"
              readonly
              class="tw-bg-gray-50"
            >
              <template v-slot:prepend><q-icon name="badge" color="blue-6" /></template>
            </q-input>
            </div>

            <!-- Nama (readonly) -->
            <div class="col-12">
            <q-input
              v-model="editForm.nama"
              outlined
              dense
              label="Nama"
              readonly
              class="tw-bg-gray-50"
            >
              <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
            </q-input>
            </div>

            <!-- Email -->
            <div class="col-12">
            <q-input
              v-model="editForm.email"
              outlined
              dense
              label="Email *"
              type="email"
              placeholder="Input Email"
            >
              <template v-slot:prepend><q-icon name="email" color="blue-6" /></template>
            </q-input>
            </div>



            <!-- Business Unit Single (for roles != 6) -->
            <div class="col-12">
              <q-select
                v-model="editForm.bu"
                outlined
                dense
                label="Bisnis Unit *"
                :options="filteredBuEdit"
                option-value="bu_id"
                option-label="bu_id"
                emit-value
                map-options
                use-input
                input-debounce="300"
                @filter="filterBuEdit"
              >
                <template v-slot:prepend><q-icon name="business" color="blue-6" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.bu_id }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.bu_name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <div class="tw-text-sm tw-mt-1 tw-text-gray-600">
                <b>Current Business Unit</b> : {{ editForm.currentBuName }}
              </div>
            </div>

            <!-- Business Unit Multiple (for Chief / role 6) -->
            <!-- <div class="col-12" v-if="editForm.role === 6">
              <q-select
                v-model="editForm.buMultiple"
                outlined
                dense
                label="Bisnis Unit * (Multiple)"
                :options="filteredBuEdit"
                option-value="bu_id"
                option-label="bu_id"
                emit-value
                map-options
                multiple
                use-chips
                use-input
                input-debounce="300"
                @filter="filterBuEdit"
              >
                <template v-slot:prepend><q-icon name="business" color="blue-6" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.bu_id }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.bu_name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <div class="tw-text-sm tw-mt-1 tw-text-gray-600">
                <b>Current Business Unit</b> : {{ editForm.currentBuName }}
              </div>
            </div> -->

            <!-- Role with current info -->
            <div class="col-12">
              <q-select
                v-model="editForm.role"
                outlined
                dense
                label="Role *"
                :options="filteredRolesEdit"
                emit-value
                map-options
                use-input
                input-debounce="300"
                @filter="filterRolesEdit"
                @update:model-value="onEditRoleChange"
              >
                <template v-slot:prepend><q-icon name="security" color="blue-6" /></template>
              </q-select>
              <div class="tw-text-sm tw-mt-1 tw-text-gray-600">
                <b>Current Type</b> : {{ editForm.currentRoleName }}
              </div>
            </div>
            </div>

            <!-- Kontak -->
            <div class="col-12">
            <q-input
              v-model="editForm.contact"
              outlined
              dense
              label="Kontak"
              placeholder="Input Kontak"
            >
              <template v-slot:prepend><q-icon name="phone" color="blue-6" /></template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Update" color="blue-6" push icon="save" @click="saveEditUser" class="tw-px-6" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { domain, empid, spinnerBall } from "../utils.js";
import * as yup from "yup";
import { useRouter, useRoute } from "vue-router";
import { useNotify } from "../composables/useNotify";

const router = useRouter();
const { success, error } = useNotify();
const modulName = 'Role';

const $q = useQuasar();
const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const filter = ref("");
const dialogAdd = ref(false);
const dialogEdit = ref(false);

const pagination = ref({ sortBy: "account_name", descending: false, page: 1, rowsPerPage: 10 });

const columns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false },
  { name: "account_nik", label: "NIK", field: "account_nik", align: "left", sortable: true },
  { name: "account_name", label: "Nama", field: "account_name", align: "left", sortable: true },
  // { name: "account_bu_name", label: "Business Unit", field: "account_bu_name", align: "left", sortable: true },
  { name: "account_bu", label: "Bisnis Unit", field: "account_bu", align: "left", sortable: true },
  { name: "account_div", label: "Divisi", field: "account_div", align: "left", sortable: true },
  { name: "role_name", label: "Role", field: "role_name", align: "left", sortable: true },
  { name: "account_email", label: "Email", field: "account_email", align: "left", sortable: true },
  { name: "account_contact", label: "Kontak", field: "account_contact", align: "left", sortable: true },
  { name: "employee_stat", label: "Status", field: "employee_stat", align: "left", sortable: true },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false },
];

// Role options sesuai legacy
const roleOptions = ref([]);
const buOptions = ref([]);
const employeeList = ref([]);
const filteredEmployees = ref([]);
const filteredRolesAdd = ref([]);
const filteredRolesEdit = ref([]);
const filteredBuAdd = ref([]);
const filteredBuEdit = ref([]);

// ADD form
const addForm = ref({
  role: null,
  nik: null,
  username: "",
  nama: "",
  divisi: "",
  bu: null,
  buMultiple: [],
  email: "",
  contact: "",
});

// EDIT form
const editForm = ref({
  nik: "",
  nama: "",
  divisi: "",
  role: null,
  bu: null,
  buMultiple: [],
  email: "",
  contact: "",
  currentRoleName: "",
  currentBuName: "",
  encryptedNik: "",
});

// BU selector always visible in add form (except for Chief role 6 which uses multiple)

const loadUsers = async () => {
  loading.value = true;
  try {
    const userType = localStorage.getItem("type") || "4";
    const bu = localStorage.getItem("bu") || "";
    const div = localStorage.getItem("div") || "";
    const res = await axios.get(`${import.meta.env.VITE_API}user-management/list`, {
      params: { type: userType, bu, div },
    });
    users.value = res.data;
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal memuat data user", position: "bottom" });
  } finally {
    loading.value = false;
  }
};

const loadRoles = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}user-management/roles`);
    roleOptions.value = res.data.map((r) => ({ label: r.role_name, value: parseInt(r.id) }));
    // Pre-fill filtered lists so q-select can resolve the label via map-options
    // even before the user opens/types in the dropdown.
    filteredRolesAdd.value = roleOptions.value;
    filteredRolesEdit.value = roleOptions.value;
  } catch (error) {
    console.log("Failed to load roles:", error.message);
  }
};

const loadBusinessUnits = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}user-management/business-units`);
    buOptions.value = res.data;
    // buOptions.value = res.data.map((r) => ({ label: r.bu_name, value: r.bu_id }));
    // filterBuAdd.value = buOptions.value;
    // filterBuEdit.value = buOptions.value;
  } catch (error) {
    console.log("Failed to load BU:", error.message);
  }
};

const loadEmployees = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}user-management/employees`);
    employeeList.value = res.data;
    filteredEmployees.value = res.data;
  } catch (error) {
    console.log("Failed to load employees:", error.message);
  }
};

const filterEmployees = (val, update) => {
  update(() => {
    if (!val) {
      filteredEmployees.value = employeeList.value;
    } else {
      const needle = val.toLowerCase();
      filteredEmployees.value = employeeList.value.filter(
        (e) =>
          e.employee_name.toLowerCase().includes(needle) ||
          e.employee_id.toLowerCase().includes(needle)
      );
    }
  });
};

const filterRolesAdd = (val, update) => {
  update(() => {
    if (!val) {
      filteredRolesAdd.value = roleOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredRolesAdd.value = roleOptions.value.filter(
        (r) => r.label.toLowerCase().includes(needle)
      );
    }
  });
};

const filterRolesEdit = (val, update) => {
  update(() => {
    if (!val) {
      filteredRolesEdit.value = roleOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredRolesEdit.value = roleOptions.value.filter(
        (r) => r.label.toLowerCase().includes(needle)
      );
    }
  });
};

const filterBuAdd = (val, update) => {
  update(() => {
    if (!val) {
      filteredBuAdd.value = buOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredBuAdd.value = buOptions.value.filter(
        (b) => b.bu_name.toLowerCase().includes(needle) || b.bu_id.toLowerCase().includes(needle)
      );
    }
  });
};

const filterBuEdit = (val, update) => {
  update(() => {
    if (!val) {
      filteredBuEdit.value = buOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredBuEdit.value = buOptions.value.filter(
        (b) => b.bu_name.toLowerCase().includes(needle) || b.bu_id.toLowerCase().includes(needle)
      );
    }
  });
};

const onEmployeeSelected = async (nik) => {
  if (!nik) return;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}user-management/employee-detail`, {
      params: { nik },
    });
    addForm.value.nama = res.data.employee_name || "";
    addForm.value.divisi = res.data.div_nama || "";
    addForm.value.email = res.data.employee_email || "";
  } catch (error) {
    console.log("Failed to get employee detail:", error.message);
  }
};

const onAddRoleChange = () => {
  // Reset fields when role changes
  // addForm.value.nik = null;
  // addForm.value.username = "";
  // addForm.value.nama = "";
  // addForm.value.divisi = "";
  // addForm.value.email = "";
  // addForm.value.bu = null;
  // addForm.value.buMultiple = [];
};

const onEditRoleChange = () => {
  // Reset BU fields when role changes in edit
  // editForm.value.bu = null;
  // editForm.value.buMultiple = [];
};

const openAddDialog = () => {
  addForm.value = {
    role: null,
    nik: null,
    username: "",
    nama: "",
    bu: null,
    buMultiple: [],
    email: "",
    contact: "",
  };
  dialogAdd.value = true;
};

const openEditDialog = (row) => {
  // Parse BU - could be single or comma-separated for Chief
  const buValue = row.account_bu || "";
  const isMultipleBU = buValue.includes(",");

  // Ensure the role select has its full option list so map-options can
  // resolve the selected id into its label immediately when the dialog opens.
  filteredRolesEdit.value = roleOptions.value;

  editForm.value = {
    nik: row.account_nik,
    nama: row.account_name || row.employee_name || "",
    role: parseInt(row.account_type),
    bu: isMultipleBU ? null : buValue,
    buMultiple: isMultipleBU ? buValue.split(",").map((b) => b.trim()).filter(Boolean) : [],
    email: row.account_email || "",
    contact: row.account_contact || "",
    currentRoleName: row.role_name || "",
    // currentBuName: row.bu_name_resolved || row.bu_name || getBuNameFromId(buValue),
    currentBuName: row.account_bu || "",
    encryptedNik: row.encrypted_nik,
  };
  dialogEdit.value = true;
};

const getBuNameFromId = (buId) => {
  if (!buId) return "";
  if (buId.includes(",")) {
    return buId
      .split(",")
      .map((id) => {
        const found = buOptions.value.find((b) => b.bu_id === id.trim());
        return found ? found.bu_name : id.trim();
      })
      .join(", ");
  }
  const found = buOptions.value.find((b) => b.bu_id === buId);
  return found ? found.bu_name : buId;
};

const saveAddUser = async () => {

  if (addForm.value.role !== 3 && !addForm.value.nik) {
    $q.notify({ type: "warning", message: "User NIK wajib dipilih", position: "bottom" });
    return;
  }

  // Validations
  if (!addForm.value.email) {
    $q.notify({ type: "warning", message: "Email wajib diisi", position: "bottom" });
    return;
  }

  // Validations
  if (!addForm.value.bu) {
    $q.notify({ type: "warning", message: "Bisnis Unit wajib dipilih", position: "bottom" });
    return;
  }

  // Validations
  if (!addForm.value.role) {
    $q.notify({ type: "warning", message: "Role wajib dipilih", position: "bottom" });
    return;
  }



  if (addForm.value.role === 3 && (!addForm.value.username || !addForm.value.nama)) {
    $q.notify({ type: "warning", message: "Username dan Nama wajib diisi", position: "bottom" });
    return;
  }

  if (!addForm.value.email) {
    $q.notify({ type: "warning", message: "Email wajib diisi", position: "bottom" });
    return;
  }

  // Determine BU value
  let buValue = "";
  if (addForm.value.role === 6) {
    buValue = addForm.value.buMultiple.join(",");
  } else {
    buValue = addForm.value.bu || "";
  }

  saving.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}user-management/add`, {
      nik: addForm.value.role !== 3 ? addForm.value.nik : addForm.value.username,
      username: addForm.value.role !== 3 ? addForm.value.nik : addForm.value.username,
      nama: addForm.value.nama,
      role: addForm.value.role,
      bu: buValue,
      email: addForm.value.email,
      contact: addForm.value.contact,
      creator: empid(),
    });
    $q.notify({ type: "positive", message: "User berhasil ditambahkan", position: "bottom" });
    dialogAdd.value = false;
    await loadUsers();
    await loadEmployees(); // Refresh employee list (remove newly added)
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan data", position: "bottom" });
  } finally {
    saving.value = false;
  }
};

const saveEditUser = async () => {


  if (!editForm.value.email) {
    $q.notify({ type: "warning", message: "Email wajib diisi", position: "bottom" });
    return;
  }

  // Validations
  if (!editForm.value.bu) {
    $q.notify({ type: "warning", message: "Bisnis Unit wajib dipilih", position: "bottom" });
    return;
  }

  if (!editForm.value.role) {
    $q.notify({ type: "warning", message: "Role wajib dipilih", position: "bottom" });
    return;
  }

  // Determine BU value
  let buValue = "";
  if (editForm.value.role === 6) {
    buValue = editForm.value.buMultiple.join(",");
  } else {
    buValue = editForm.value.bu || "";
  }

  saving.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}user-management/update`, {
      nik: editForm.value.encryptedNik,
      nama: editForm.value.nama,
      role: editForm.value.role,
      bu: buValue,
      email: editForm.value.email,
      contact: editForm.value.contact,
      creator: empid(),
    });
    $q.notify({ type: "positive", message: "User berhasil diperbarui", position: "bottom" });
    dialogEdit.value = false;
    await loadUsers();
  } catch (error) {
    $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menyimpan data", position: "bottom" });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: "Konfirmasi",
    message: `Apakah Anda yakin ingin menghapus user <b>${row.account_name || row.account_nik}</b>?`,
    html: true,
    ok: { push: true, color: "blue-6", label: "Ya, Hapus", icon: "check_circle" },
    cancel: { push: true, color: "red-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API}user-management/delete`, { nik: row.encrypted_nik });
      $q.notify({ type: "positive", message: "User berhasil dihapus", position: "bottom" });
      await loadUsers();
    } catch (error) {
      $q.notify({ type: "negative", message: error?.response?.data?.message || "Gagal menghapus user", position: "bottom" });
    }
  });
};

onMounted(async () => {
  await Promise.all([loadRoles(), loadBusinessUnits(), loadEmployees()]);
  await loadUsers();
});
</script>
