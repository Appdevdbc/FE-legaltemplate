<template>
  <q-page class="q-pa-md">
    <q-card class="tw-shadow-2xl tw-rounded-2xl tw-overflow-hidden">
      <!-- Header -->
      <q-card-section :class="`side-${domain()}-1 tw-py-6`">
        <div class="tw-flex tw-items-center tw-gap-3">
          <q-icon name="folder_open" size="28px" class="tw-text-white" />
          <div>
            <div class="text-h6 tw-text-white tw-font-bold">Document</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-blue-100 tw-text-xs">
              <q-icon name="home" size="14px" />
              <q-icon name="chevron_right" size="14px" />
              <span>Document Management</span>
              <q-icon name="chevron_right" size="14px" />
              <span>Document</span>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />

      <!-- Main Content: Folder Tree (left) + File List (right) -->
      <q-card-section class="tw-bg-white tw-p-0">
        <div class="tw-flex tw-min-h-[550px]">

          <!-- Left Panel: Folder Tree (~33%) -->
          <div class="tw-w-[28%] tw-border-r tw-border-slate-200 tw-overflow-auto tw-p-4">
            <!-- Folder Header + Buttons -->
            <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
              <span class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase">Folder</span>
              <div class="tw-flex tw-gap-1">
                    <q-btn v-if="selectedFolderNode && !isRootSelected && folderAccess.rename_folder === 1" icon="edit" size="sm" label="Rename Folder" class="tw-rounded-lg tw-py-1 tw-px-3" color="orange-8" @click="openRenameFolderDialog(selectedFolderNode)">
                  <q-tooltip>Rename Folder</q-tooltip>
                </q-btn>
                <q-btn v-if="folderAccess.add_folder === 1" icon="create_new_folder" size="sm" label="Add Folder" class="tw-rounded-lg tw-py-1 tw-px-3" color="blue-9" @click="openCreateFolderDialog" :disable="!selectedFolderNode">
                  <q-tooltip>Buat Folder</q-tooltip>
                </q-btn>
                              <!-- <q-btn
                v-if="selectedFolderId && !isRootSelected"
                unelevated color="blue-6" label="Add File" icon="upload_file" size="sm"
                @click="openAddFileDialog"
                class="tw-font-semibold tw-rounded-lg"
              /> -->
            
                <!-- <q-btn v-if="selectedFolderNode && !isRootSelected" flat dense round icon="delete" size="sm" color="red-7" @click="confirmDeleteFolder(selectedFolderNode)">
                  <q-tooltip>Hapus Folder</q-tooltip>
                </q-btn> -->
              </div>
            </div>

            <!-- Folder Search -->
            <q-input
              v-model="folderSearch"
              outlined dense
              placeholder="Search..."
              class="tw-mb-3"
            >
              <template v-slot:prepend><q-icon name="search" size="18px" /></template>
              <template v-slot:append>
                <q-icon v-if="folderSearch" name="close" class="cursor-pointer" size="18px" @click="folderSearch = ''" />
              </template>
            </q-input>

            <!-- Tree -->
            <div v-if="loadingTree" class="tw-text-center tw-py-8">
              <q-spinner-dots size="30px" color="blue-6" />
            </div>
            <q-tree
              v-else
              :nodes="folderTree"
              node-key="folder_id"
              label-key="folder_name"
              children-key="children"
              :filter="folderSearch"
              :selected="selectedFolderId"
              selected-color="blue-6"
              default-expand-all
              no-selection-unset
              @update:selected="onFolderSelected"
            >
              <template v-slot:default-header="prop">
                <div class="tw-flex tw-items-center tw-gap-2">
                  <q-icon
                    :name="prop.expanded ? 'folder_open' : 'folder'"
                    :color="selectedFolderId === prop.node.folder_id ? 'blue-6' : 'amber-7'"
                    size="20px"
                  />
                  <span class="tw-text-sm tw-truncate">{{ prop.node.folder_name }}</span>
                </div>
              </template>
            </q-tree>

            <div v-if="!loadingTree && folderTree.length === 0" class="tw-text-center tw-text-slate-400 tw-py-8">
              <q-icon name="folder_off" size="48px" class="tw-mb-2" />
              <div class="tw-text-sm">Tidak ada folder</div>
            </div>

            <!-- Bottom Buttons -->
            <div v-if="selectedFolderNode" class="tw-mt-4 tw-flex tw-gap-2 tw-flex-wrap">
              <q-btn v-if="folderAccess.permission_folder === 1" dense icon="lock" size="sm" label="Permission Folder" class="tw-rounded-lg tw-py-1 tw-px-3" color="purple-6" @click="openPermissionFolder(selectedFolderNode)">
                <q-tooltip>Permission Folder</q-tooltip>
              </q-btn>
              <q-btn v-if="selectedFolderNode && !isRootSelected && folderAccess.delete_folder === 1" dense icon="delete" size="sm" label="Delete Folder" class="tw-rounded-lg tw-py-1 tw-px-3" color="red-7" @click="confirmDeleteFolder(selectedFolderNode)">
                  <q-tooltip>Hapus Folder</q-tooltip>
                </q-btn>
            </div>
          </div>

          <!-- Right Panel: File List (~67%) -->
          <div class="tw-w-[72%] tw-overflow-auto tw-p-4">
            <!-- File Header -->
            <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
              <span class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase">
                {{ selectedFolderNode ? 'File — ' + selectedFolderNode.folder_name : 'FILE' }}
              </span>
              <q-btn
                v-if="selectedFolderId && !isRootSelected && folderAccess.add_file === 1"
                unelevated color="blue-6" label="Add File" icon="upload_file" size="sm"
                @click="openAddFileDialog"
                class="tw-rounded-lg tw-py-1 tw-px-3"
              />
            </div>

            <!-- File Table -->
            <q-table
              v-if="selectedFolderId && !isRootSelected"
              :rows="fileList"
              :columns="fileColumns"
              row-key="content_id"
              v-model:pagination="filePagination"
              :rows-per-page-options="[]"
              :loading="loadingFiles"
              :filter="fileFilter"
              binary-state-sort
              flat
              class="tw-shadow-sm tw-rounded-xl tw-overflow-hidden"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props"
                    class="bg-grey-8 text-white text-weight-bold" style="font-size: 12px;">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:top-right>
                <q-input outlined dense debounce="300" v-model="fileFilter" placeholder="Search..."
                  class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-min-w-[200px]">
                  <template v-slot:prepend><q-icon name="search" color="blue-6" /></template>
                </q-input>
              </template>

              <template v-slot:body-cell-no="props">
                <q-td :props="props" class="tw-text-center tw-text-xs">
                  {{ (filePagination.page - 1) * filePagination.rowsPerPage + props.rowIndex + 1 }}
                </q-td>
              </template>

              <!-- <template v-slot:body-cell-content_name="props">
                <q-td :props="props" class="tw-text-xs">
                  <span class="tw-font-medium tw-text-blue-700 tw-cursor-pointer hover:tw-underline" @click="goToFileDetail(props.row)">
                    {{ props.row.name }}
                  </span>
                </q-td>
              </template> -->

              <template v-slot:body-cell-upload_date="props">
                <q-td :props="props" class="tw-text-xs tw-text-center">
                  {{ formatDateTime2(props.row.lastmodified) }}
                </q-td>
              </template>

              <template v-slot:body-cell-keywords="props">
                <q-td :props="props" class="tw-text-xs">
                  {{ props.row.keywords || '-' }}
                </q-td>
              </template>

              <!-- <template v-slot:body-cell-type="props">
                <q-td :props="props" class="tw-text-xs tw-text-center">
                  <q-badge :color="props.row.type === 'renewable' ? 'orange' : 'grey-6'"
                    :label="props.row.type === 'renewable' ? 'Renewable' : 'Non-Renewable'" class="tw-text-xs" />
                </q-td>
              </template> -->

              <template v-slot:body-cell-view="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn v-if="props.row.can_view" unelevated dense size="sm" color="teal-6" label="View" no-caps @click="viewFile(props.row)" class="tw-min-w-[60px]" />
                  <span v-else class="tw-text-slate-400">-</span>
                </q-td>
              </template>

              <template v-slot:body-cell-download="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn v-if="props.row.can_download" unelevated dense size="sm" color="green-7" label="Download" no-caps @click="downloadFile(props.row)" class="tw-min-w-[60px]" />
                  <span v-else class="tw-text-slate-400">-</span>
                </q-td>
              </template>

              <template v-slot:body-cell-delete="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn v-if="props.row.can_delete" unelevated dense size="sm" color="red-6" label="Delete" no-caps @click="confirmDeleteFile(props.row)" class="tw-min-w-[60px]" />
                  <span v-else class="tw-text-slate-400">-</span>
                </q-td>
              </template>

              <template v-slot:body-cell-edit="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn v-if="props.row.can_upload" unelevated dense size="sm" color="orange-7" label="Edit" no-caps @click="goToEditFile(props.row)" class="tw-min-w-[60px]" />
                  <span v-else class="tw-text-slate-400">-</span>
                </q-td>
              </template>

              <template v-slot:body-cell-permission="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn v-if="folderAccess.permission_file === 1" unelevated dense size="sm" color="purple-6" label="Manage" no-caps @click="goToPermissionFile(props.row)" class="tw-min-w-[60px]" />
                </q-td>
              </template>

              <template v-slot:body-cell-properties="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn unelevated dense size="sm" color="indigo-6" label="Detail" no-caps @click="goToFileDetail(props.row)" class="tw-min-w-[60px]" />
                </q-td>
              </template>

              <template v-slot:no-data>
                <div class="tw-text-center tw-py-8 tw-text-slate-400">
                  <q-icon name="description" size="48px" class="tw-mb-2" />
                  <div class="tw-text-sm">Tidak ada file dalam folder ini</div>
                </div>
              </template>
            </q-table>

            <!-- Placeholder when no folder selected -->
            <div v-if="!selectedFolderId" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-slate-400 tw-py-16">
              <q-icon name="touch_app" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Pilih folder di panel kiri</div>
              <div class="tw-text-sm">Klik folder untuk melihat daftar file</div>
            </div>

            <!-- Message when root is selected -->
            <div v-if="selectedFolderId && isRootSelected" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-slate-400 tw-py-16">
              <q-icon name="folder_open" size="64px" class="tw-mb-4" />
              <div class="tw-text-lg tw-font-medium">Root Folder</div>
              <div class="tw-text-sm">Pilih sub-folder untuk melihat file</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog: Create Folder -->
    <q-dialog v-model="dialogCreateFolder" transition-show="slide-up" transition-hide="slide-down" persistent>
      <q-card class="tw-w-full tw-max-w-lg tw-rounded-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="create_new_folder" size="24px" /> Buat Folder Baru
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="tw-p-6">
          <!-- Nama Folder -->
          <q-input v-model="newFolderName" outlined dense label="Nama Folder" autofocus class="tw-mb-4">
            <template v-slot:prepend><q-icon name="folder" color="blue-6" /></template>
          </q-input>

          <!-- Parent Folder (readonly) -->
          <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_name : '/'" outlined dense label="Parent Folder" readonly class="tw-mb-4">
            <template v-slot:prepend><q-icon name="subdirectory_arrow_right" color="grey-7" /></template>
          </q-input>

          <!-- Tingkat 1: Akses Business Unit -->
          <q-select
            v-if="newFolderTingkat === 1"
            v-model="newFolderSecurity"
            outlined
            dense
            label="Akses Bisnis Unit"
            :options="securityBUOptions"
            emit-value map-options
            class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="security" color="teal-6" /></template>
          </q-select>

          <!-- Mapping Business Unit (tingkat 1, only when restricted) -->
          <q-select
            v-if="newFolderTingkat === 1 && newFolderSecurity === 'restricted'"
            v-model="newFolderBU"
            outlined
            dense
            label="Mapping Bisnis Unit"
            :options="filteredBuOptionsFolder"
            emit-value map-options
            use-input
            input-debounce="300"
            @filter="filterBuFolder"
            class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
          </q-select>
          
          <!-- Mapping Business Unit (tingkat >= 2, readonly from parent) -->
          <q-input
            v-if="newFolderTingkat >= 2"
            :model-value="parentBUName"
            outlined dense label="Mapping Bisnis Unit" readonly class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
          </q-input>

          <!-- Tingkat 2: Akses Divisi -->
          <q-select
            v-if="newFolderTingkat === 2"
            v-model="newFolderSecurity"
            outlined
            dense
            label="Akses Divisi"
            :options="securityDivOptions"
            emit-value map-options
            class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="security" color="teal-6" /></template>
          </q-select>

          <!-- Mapping Divisi (tingkat 2, only when restricted) -->
          <q-select
            v-if="newFolderTingkat === 2 && newFolderSecurity === 'restricted'"
            v-model="newFolderDiv"
            outlined
            dense
            label="Mapping Divisi"
            :options="divOptions"
            emit-value map-options
            class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="account_tree" color="purple-6" /></template>
          </q-select>

          <!-- Mapping Divisi (tingkat > 2, readonly from parent) -->
          <q-input
            v-if="newFolderTingkat > 2"
            :model-value="parentDivName"
            outlined dense label="Mapping Divisi" readonly class="tw-mb-4"
          >
            <template v-slot:prepend><q-icon name="account_tree" color="purple-6" /></template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="createFolder" :loading="savingFolder" class="tw-px-6" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Rename Folder -->
    <q-dialog v-model="dialogRenameFolder" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="tw-w-full tw-max-w-md tw-rounded-2xl">
        <q-card-section :class="`bg-${domain()}`">
          <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
            <q-icon name="edit" size="24px" /> Rename Folder
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="tw-p-6">
          <q-input v-model="renameFolderName" outlined dense label="Nama Folder Baru" autofocus @keyup.enter="renameFolder"
            :rules="[val => !!val || 'Nama folder wajib diisi']">
            <template v-slot:prepend><q-icon name="folder" color="blue-6" /></template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="renameFolder" :loading="savingFolder" class="tw-px-6" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Edit File -->
    <q-dialog v-model="dialogEditFile" transition-show="slide-up" transition-hide="slide-down" backdrop-filter="blur(4px)" persistent full-width>
      <q-card class="tw-w-full tw-max-w-5xl tw-mx-auto tw-my-4 tw-rounded-2xl" style="max-height: 95vh;">
        <q-card-section :class="`bg-${domain()}`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
              <q-icon name="edit_note" size="28px" /> Edit File
            </div>
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <div class="row q-col-gutter-md">
            <!-- LEFT: EDIT FILE -->
            <div class="tw-w-1/2 tw-space-y-4">
              <div class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase tw-border-b tw-pb-2 tw-mb-2">Edit File</div>

              <q-input v-model="editForm.content_name" outlined dense label="File Name *" :rules="[val => !!val || 'Nama file wajib diisi']">
                <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
              </q-input>

              <q-input :model-value="editForm.folder_name" outlined dense label="Folder" readonly>
                <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
              </q-input>

              <q-input v-model="editForm.content_keywords" outlined dense label="Keywords" placeholder="Input Keywords">
                <template v-slot:prepend><q-icon name="label" color="blue-6" /></template>
              </q-input>

              <q-input v-model="editForm.content_desc" outlined dense label="Description" placeholder="Input Description">
                <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
              </q-input>

              <div>
                <q-select v-model="editForm.content_owner" :options="filteredEmployees" option-value="employee_id" option-label="display_label"
                  label="PIC Owner *" outlined dense use-input input-debounce="300" @filter="filterEmployees" emit-value map-options>
                  <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps"><q-item-section><q-item-label>{{ scope.opt.employee_name }}</q-item-label><q-item-label caption>{{ scope.opt.employee_id }} | {{ scope.opt.bu_name }} - {{ scope.opt.div_nama }}</q-item-label></q-item-section></q-item>
                  </template>
                </q-select>
                <div class="tw-text-xs tw-text-slate-500 tw-mt-1">Current PIC Owner: <strong>{{ editForm.current_owner_name || '-' }}</strong></div>
              </div>

              <div>
                <q-select v-model="editForm.content_keeper" :options="filteredEmployees" option-value="employee_id" option-label="display_label"
                  label="PIC Keeper *" outlined dense use-input input-debounce="300" @filter="filterEmployees" emit-value map-options>
                  <template v-slot:prepend><q-icon name="person_outline" color="teal-6" /></template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps"><q-item-section><q-item-label>{{ scope.opt.employee_name }}</q-item-label><q-item-label caption>{{ scope.opt.employee_id }} | {{ scope.opt.bu_name }} - {{ scope.opt.div_nama }}</q-item-label></q-item-section></q-item>
                  </template>
                </q-select>
                <div class="tw-text-xs tw-text-slate-500 tw-mt-1">Current PIC Keeper: <strong>{{ editForm.current_keeper_name || '-' }}</strong></div>
              </div>

              <div>
                <q-input :model-value="editKeeperEmail" outlined dense label="Email Keeper" readonly>
                  <template v-slot:prepend><q-icon name="email" color="grey-6" /></template>
                </q-input>
                <div class="tw-text-xs tw-text-slate-500 tw-mt-1"><em>* jika email salah atau kosong, harap diinformasikan ke Admin BU</em></div>
              </div>

              <q-input :model-value="editForm.content_bu" outlined dense label="Mapping Bisnis Unit" readonly>
                <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
              </q-input>

              <q-input :model-value="editForm.content_div" outlined dense label="Mapping Divisi" readonly>
                <template v-slot:prepend><q-icon name="account_tree" color="purple-6" /></template>
              </q-input>

              <q-select v-model="editForm.content_type" outlined dense label="File Type *"
                :options="[{label:'Renewable', value:'renewable'}, {label:'Non-Renewable', value:'non-renewable'}]"
                emit-value map-options>
                <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
              </q-select>

              <q-input v-model="editForm.content_duedate" outlined dense label="Due Date *" type="date"
                :disable="editForm.content_type !== 'renewable'">
                <template v-slot:prepend><q-icon name="event" color="orange-7" /></template>
              </q-input>
            </div>

            <!-- RIGHT: RENEW FILE -->
            <div class="tw-w-1/2 tw-space-y-4">
              <div class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase tw-border-b tw-pb-2 tw-mb-2">Renew File</div>

              <q-input v-model="renewForm.name" outlined dense label="File Name (baru)" placeholder="Tidak boleh sama dengan nama file lama">
                <template v-slot:prepend><q-icon name="description" color="orange-7" /></template>
              </q-input>
              <div class="tw-text-xs tw-text-slate-500 tw-mt-[-12px] tw-mb-2"><em>note: Tidak boleh sama dengan nama file lama</em></div>

              <q-input v-model="renewForm.duedate" outlined dense label="Due Date (baru) *" type="date">
                <template v-slot:prepend><q-icon name="event" color="orange-7" /></template>
              </q-input>

              <div>
                <q-file v-model="renewForm.file" outlined dense label="Upload File (baru) *" accept=".doc,.docx" max-file-size="15728640" counter @rejected="onFileRejected">
                  <template v-slot:prepend><q-icon name="attach_file" color="orange-7" /></template>
                </q-file>
                <div class="tw-text-xs tw-text-slate-500 tw-mt-1">Extension File : .doc / .docx, Max size : 15MB</div>
              </div>

              <q-btn unelevated color="orange-7" label="Renew" icon="autorenew" @click="submitRenewFile" :loading="renewingFile" class="tw-w-full tw-mt-4" />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-6" push icon="save" @click="saveEditFile" :loading="savingFile" class="tw-px-6" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Add File -->
    <q-dialog v-model="dialogAddFile" transition-show="slide-up" transition-hide="slide-down" backdrop-filter="blur(4px)" persistent full-width>
      <q-card class="tw-w-full tw-max-w-3xl tw-rounded-2xl tw-shadow-2xl">
      <!-- <q-card style="max-width: 100%; width: 1200px"> -->
      <!-- <q-card style="max-width: 55vw;"> -->
        <q-card-section :class="`bg-${domain()}`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
              <q-icon name="upload_file" size="28px" /> Add File
            </div>
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: 70vh" class="scroll tw-p-6">
          <!-- <q-banner rounded class="tw-bg-red-50 tw-border-l-4 tw-border-red-500 q-mb-md">
              <template v-slot:avatar>
                  <q-icon name="info" color="red" size="32px" />
              </template>
              <span class="tw-text-red-700 tw-font-medium">Field bertanda bintang (*) wajib diisi</span>
          </q-banner> -->
          
          <div class="row q-col-gutter-md">
            <!-- LEFT COLUMN (like legacy span6) -->
            <div class="tw-w-1/2 tw-space-y-4">
              <!-- File Name -->
              <q-input v-model="addFileForm.name" outlined dense label="File Name *">
                <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
              </q-input>

              <!-- Folder (readonly) -->
              <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_name : ''" outlined dense label="Folder" readonly>
                <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
              </q-input>

              <!-- Keywords -->
              <q-input v-model="addFileForm.keywords" outlined dense label="Keywords" placeholder="Input Keywords">
                <template v-slot:prepend><q-icon name="label" color="blue-6" /></template>
              </q-input>

              <!-- Description -->
              <q-input v-model="addFileForm.desc" outlined dense label="Description" placeholder="Input Description">
                <template v-slot:prepend><q-icon name="notes" color="blue-6" /></template>
              </q-input>

              <!-- PIC Owner -->
              <q-select v-model="addFileForm.owner" :options="filteredEmployees" option-value="employee_id" option-label="display_label"
                label="PIC Owner *" outlined dense use-input input-debounce="300" @filter="filterEmployees" emit-value map-options>
                <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.employee_id }} | {{ scope.opt.bu_name }} - {{ scope.opt.div_nama }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- PIC Keeper -->
              <q-select v-model="addFileForm.keeper" :options="filteredEmployees" option-value="employee_id" option-label="display_label"
                label="PIC Keeper *" outlined dense use-input input-debounce="300" @filter="filterEmployees" emit-value map-options>
                <template v-slot:prepend><q-icon name="person_outline" color="teal-6" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.employee_id }} | {{ scope.opt.bu_name }} - {{ scope.opt.div_nama }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Email Keeper (readonly) -->
              <div>
                <q-input :model-value="addFileKeeperEmail" outlined dense label="Email Keeper" readonly>
                  <template v-slot:prepend><q-icon name="email" color="grey-6" /></template>
                </q-input>
                <div class="tw-text-xs tw-text-slate-500 tw-mt-1"><em>* jika email salah atau kosong, harap diinformasikan ke Admin Bisnis Unit</em></div>
              </div>

              <!-- Konfirmasi Keeper -->
              <q-select v-model="addFileForm.konfirmasiKeeper" outlined dense label="Konfirmasi Keeper"
                :options="[{label:'Manual Confirm', value:1}, {label:'Auto Confirm', value:0}]"
                emit-value map-options>
                <template v-slot:prepend><q-icon name="verified" color="green-6" /></template>
              </q-select>
            </div>

            <!-- RIGHT COLUMN (like legacy span6) -->
            <div class="tw-w-1/2 tw-space-y-4">
              <!-- Business Unit Mapping (readonly) -->
              <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_bu : ''" outlined dense label="Mapping Bisnis Unit" readonly>
                <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
              </q-input>

              <!-- Division Mapping (readonly) -->
              <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_div : ''" outlined dense label="Mapping Divisi" readonly>
                <template v-slot:prepend><q-icon name="account_tree" color="purple-6" /></template>
              </q-input>

              <!-- DIC (Director in Charge — grade 7/8) -->
              <q-select v-model="addFileForm.dic" :options="filteredDicList" option-value="employee_id" option-label="display_label"
                label="DIC (Director in Charge) *" outlined dense use-input input-debounce="300" @filter="filterDicEmployees" emit-value map-options>
                <template v-slot:prepend><q-icon name="supervisor_account" color="red-6" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.employee_id }} | {{ scope.opt.bu_name }} - {{ scope.opt.div_nama }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <!-- Jenis File -->
              <q-select v-model="addFileForm.type" outlined dense label="Jenis File *"
                :options="[{label:'Renewable', value:'renewable'}, {label:'Non-Renewable', value:'non-renewable'}]"
                emit-value map-options>
                <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
              </q-select>

              <!-- Due Date -->
              <q-input v-if="addFileForm.type === 'renewable'" v-model="addFileForm.duedate" outlined dense label="Due Date *" type="date">
                <template v-slot:prepend><q-icon name="event" color="orange-7" /></template>
              </q-input>

              <!-- Security -->
              <q-select v-model="addFileForm.security" outlined dense label="Security *"
                :options="[{label:'Confidential', value:'confidential'}, {label:'Restricted', value:'restricted'}, {label:'Non-Restricted', value:'non-restricted'}]"
                emit-value map-options>
                <template v-slot:prepend><q-icon name="security" color="teal-6" /></template>
              </q-select>

              <!-- Upload File -->
              <div>
                <q-file v-model="addFileForm.file" outlined dense label="Upload File *" accept=".doc,.docx" max-file-size="15728640" counter @rejected="onFileRejected">
                  <template v-slot:prepend><q-icon name="attach_file" color="blue-6" /></template>
                </q-file>
                <div class="tw-text-xs tw-text-slate-500 tw-mt-1">Extension File : .doc / .docx, Max size : 15MB</div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="tw-p-4 tw-bg-slate-50">
          <q-btn label="Batal" color="red-7" push icon="close" v-close-popup class="tw-px-6" />
          <q-btn label="Simpan" color="blue-7" push icon="save" @click="submitAddFile" :loading="uploadingFile" class="tw-px-6" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Properties (File Detail) -->
    <q-dialog v-model="dialogProperties" transition-show="slide-up" transition-hide="slide-down" backdrop-filter="blur(4px)" persistent full-width>
      <q-card class="tw-w-full tw-max-w-5xl tw-mx-auto tw-my-4 tw-rounded-2xl" style="max-height: 95vh;">
        <q-card-section :class="`bg-${domain()}`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
              <q-icon name="info" size="28px" /> Properties
            </div>
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: calc(95vh - 100px); overflow-y: auto;" class="tw-p-6">
          <div v-if="loadingProperties" class="tw-text-center tw-py-8">
            <q-spinner-dots size="40px" color="teal-6" />
          </div>
          <div v-else-if="propertiesData" class="tw-flex tw-gap-6">
            <!-- Left: PROPERTIES CONTENT -->
            <div class="tw-w-1/2">
              <div class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase tw-mb-4 tw-border-b tw-pb-2">Properties Content</div>
              <table class="tw-w-full tw-text-sm">
                <tbody>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4 tw-w-[140px]">File Name</td><td class="tw-py-2">{{ propertiesData.content_name }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Folder</td><td class="tw-py-2">{{ propertiesData.folder_name || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Keywords</td><td class="tw-py-2">{{ propertiesData.content_keywords || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Description</td><td class="tw-py-2">{{ propertiesData.content_desc || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Owner</td><td class="tw-py-2">{{ propertiesData.owner_name || '-' }} ({{ propertiesData.content_owner || '-' }})</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Keeper</td><td class="tw-py-2">{{ propertiesData.keeper_name || '-' }} ({{ propertiesData.content_keeper || '-' }})</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Keeper Status</td><td class="tw-py-2">{{ propertiesData.content_statuskeeper === 1 ? 'Confirmed' : propertiesData.content_statuskeeper === 2 ? 'Rejected' : 'Pending' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Bisnis Unit</td><td class="tw-py-2">{{ propertiesData.content_bu || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Divisi</td><td class="tw-py-2">{{ propertiesData.content_div || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Type</td><td class="tw-py-2">{{ propertiesData.content_type || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Due Date</td><td class="tw-py-2">{{ propertiesData.content_duedate ? formatDate(propertiesData.content_duedate) : '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Security</td><td class="tw-py-2">{{ propertiesData.content_security || '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Entry Date</td><td class="tw-py-2">{{ propertiesData.content_entrydate ? formatDate(propertiesData.content_entrydate) : '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Last Modified</td><td class="tw-py-2">{{ propertiesData.content_lastmodified ? formatDate(propertiesData.content_lastmodified) : '-' }}</td></tr>
                  <tr class="tw-border-b tw-border-slate-100"><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">DIC</td><td class="tw-py-2">{{ propertiesData.dic_name || propertiesData.content_dic || '-' }}</td></tr>
                  <tr><td class="tw-font-semibold tw-text-slate-600 tw-py-2 tw-pr-4">Ver.</td><td class="tw-py-2">{{ propertiesData.content_ver || 1 }}</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Right: History Log -->
            <div class="tw-w-1/2">
              <div class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase tw-mb-4 tw-border-b tw-pb-2">History Log</div>
              <div v-if="propertiesLog.length === 0" class="tw-text-center tw-text-slate-400 tw-py-8">
                <q-icon name="history" size="40px" class="tw-mb-2" />
                <div class="tw-text-sm">Belum ada log</div>
              </div>
              <div v-else class="tw-space-y-3 tw-max-h-[500px] tw-overflow-y-auto">
                <div v-for="(log, idx) in propertiesLog" :key="idx"
                  class="tw-flex tw-gap-3 tw-p-3 tw-bg-slate-50 tw-rounded-lg">
                  <q-icon name="account_circle" size="32px" color="blue-4" />
                  <div class="tw-flex-1">
                    <div class="tw-flex tw-items-center tw-justify-between">
                      <span class="tw-text-xs tw-font-semibold tw-text-slate-700">{{ log.user_name || log.log_nik }}</span>
                      <span class="tw-text-xs tw-text-slate-400">{{ formatDateTime2(log.log_date) }}</span>
                    </div>
                    <div class="tw-text-sm tw-text-slate-600 tw-mt-1">{{ log.log_action }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Permission File -->
    <q-dialog v-model="dialogPermissionFile" transition-show="slide-up" transition-hide="slide-down" backdrop-filter="blur(4px)" persistent full-width>
      <q-card class="tw-w-full tw-max-w-5xl tw-mx-auto tw-my-4 tw-rounded-2xl" style="max-height: 95vh;">
        <q-card-section :class="`bg-${domain()}`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
              <q-icon name="lock" size="28px" /> Manage Permission File — {{ permissionFileName }}
            </div>
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: calc(95vh - 100px); overflow-y: auto;" class="tw-p-6">
          <div v-if="loadingPermissionFile" class="tw-text-center tw-py-8">
            <q-spinner-dots size="40px" color="purple-6" />
          </div>
          <div v-else>
            <!-- Permission Table -->
            <q-table :rows="permissionFileList" :columns="permFileColumns" row-key="aksesfile_nik" flat :pagination="{ rowsPerPage: 20 }" class="tw-shadow-md tw-rounded-xl tw-overflow-hidden tw-mb-6">
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props"
                    class="bg-grey-8 text-white text-weight-bold" style="font-size: 12px; padding: 10px 8px;">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:body-cell-no="props"><q-td :props="props" class="tw-text-center tw-text-sm">{{ props.rowIndex + 1 }}</q-td></template>
              <template v-slot:body-cell-nik="props"><q-td :props="props" class="tw-text-sm">{{ props.row.aksesfile_nik || '-' }}</q-td></template>
              <template v-slot:body-cell-nama="props"><q-td :props="props" class="tw-text-sm">{{ props.row.user_name || '-' }}</q-td></template>
              <template v-slot:body-cell-bu="props">
                <q-td :props="props" class="tw-text-sm">
                  {{ props.row.aksesfile_bu === 'all' ? 'Semua Bisnis Unit' : (props.row.aksesfile_bu || '-') }}
                </q-td>
              </template>
              <template v-slot:body-cell-div="props"><q-td :props="props" class="tw-text-sm">{{ props.row.div_nama || props.row.aksesfile_div || '-' }}</q-td></template>
              <template v-slot:body-cell-view="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfile_view ? 'check_circle' : 'cancel'" :color="props.row.aksesfile_view ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-download="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfile_download ? 'check_circle' : 'cancel'" :color="props.row.aksesfile_download ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-delete_perm="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfile_delete ? 'check_circle' : 'cancel'" :color="props.row.aksesfile_delete ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-upload="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfile_upload ? 'check_circle' : 'cancel'" :color="props.row.aksesfile_upload ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn unelevated dense size="sm" color="orange-7" label="Edit" no-caps class="tw-mr-1 tw-min-w-[50px]" @click="editPermFileEntry(props.row)" />
                  <q-btn unelevated dense size="sm" color="red-6" label="Delete" no-caps class="tw-min-w-[50px]" @click="deletePermissionEntry(props.row)" />
                </q-td>
              </template>
              <template v-slot:no-data><div class="tw-text-center tw-py-8 tw-text-slate-400"><q-icon name="lock_open" size="40px" class="tw-mb-2" /><div class="tw-text-sm">Belum ada permission</div></div></template>
            </q-table>

            <!-- Add Permission Section -->
            <q-card flat bordered class="tw-rounded-xl">
              <q-card-section class="tw-bg-slate-50 tw-py-3">
                <div class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase">Add Permission</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="tw-p-4">
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  <!-- Nama File (readonly) -->
                  <div>
                    <q-input :model-value="permissionFileName" outlined dense label="Nama File" readonly>
                      <template v-slot:prepend><q-icon name="description" color="blue-6" /></template>
                    </q-input>
                  </div>

                  <!-- Path Folder (readonly) -->
                  <div>
                    <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_name : '/'" outlined dense label="Path Folder" readonly>
                      <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
                    </q-input>
                  </div>

                  <!-- Mapping Business Unit (readonly) -->
                  <div>
                    <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_bu : ''" outlined dense label="Mapping Bisnis Unit" readonly>
                      <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
                    </q-input>
                  </div>

                  <!-- Jenis Mapping -->
                  <div>
                    <q-select v-model="newPermType" outlined dense label="Jenis Mapping"
                      :options="[{label:'Bisnis Unit', value:'bu'}, {label:'Divisi', value:'div'}, {label:'User', value:'user'}]" emit-value map-options>
                      <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
                    </q-select>
                  </div>

                  <!-- Business Unit -->
                  <div v-if="newPermType === 'bu' || newPermType === 'div'" :class="{ 'md:tw-col-span-2': newPermType === 'bu' }">
                    <q-select v-model="newPermBU" outlined dense label="Bisnis Unit"
                      :options="[...buOptions, {label:'Semua Bisnis Unit', value:'all', bu_id:'ALL', bu_name:'Semua Bisnis Unit'}]" emit-value map-options>
                      <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.bu_id }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.bu_name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:selected-item="scope">
                        <div class="tw-flex tw-flex-col tw-leading-tight">
                          <span>{{ scope.opt.bu_id }}</span>
                          <!-- <span class="tw-text-xs tw-text-grey-6">{{ scope.opt.bu_name }}</span> -->
                        </div>
                      </template>
                    </q-select>
                  </div>

                  <!-- Divisi -->
                  <div v-if="newPermType === 'div'">
                    <q-select v-model="newPermDiv" outlined dense label="Divisi"
                      :options="permDivOptions" emit-value map-options
                      :disable="!newPermBU || newPermBU === 'all'"
                      :loading="loadingPermDiv"
                      :placeholder="newPermBU === 'all' ? '-' : 'Pilih divisi'">
                      <template v-slot:prepend><q-icon name="account_tree" color="purple-6" /></template>
                      <template v-slot:no-option>
                        <q-item><q-item-section class="text-grey">Tidak ada divisi</q-item-section></q-item>
                      </template>
                    </q-select>
                  </div>

                  <!-- User -->
                  <div v-if="newPermType === 'user'" class="md:tw-col-span-2">
                    <q-select v-model="newPermUser" :options="filteredPermEmployees" option-value="employee_id" option-label="display_label"
                      label="Pilih User" outlined dense use-input input-debounce="300" @filter="filterPermEmployees" emit-value map-options>
                      <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar><q-icon name="person" color="blue-6" /></q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                            <q-item-label caption>NIK: {{ scope.opt.employee_id }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:no-option><q-item><q-item-section class="tw-text-slate-400">Tidak ditemukan</q-item-section></q-item></template>
                    </q-select>
                  </div>

                  <!-- Permission Flags -->
                  <div class="md:tw-col-span-2">
                    <div class="tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-2">Permission Flags</div>
                    <div class="tw-flex tw-gap-6">
                      <q-toggle v-model="newPermView" label="View" color="green-6" />
                      <q-toggle v-model="newPermDownload" label="Download" color="green-6" />
                      <q-toggle v-model="newPermDelete" label="Delete" color="green-6" />
                      <q-toggle v-model="newPermUpload" label="Edit" color="green-6" />
                    </div>
                  </div>

                  <!-- Save -->
                  <div class="md:tw-col-span-2 tw-flex tw-justify-end">
                    <q-btn unelevated color="blue-6" label="Simpan" push icon="save" @click="addPermissionEntry" :loading="savingPerm" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Permission Folder -->
    <q-dialog v-model="dialogPermFolder" transition-show="slide-up" transition-hide="slide-down" backdrop-filter="blur(4px)" persistent full-width>
      <q-card class="tw-w-full tw-max-w-5xl tw-mx-auto tw-my-4 tw-rounded-2xl" style="max-height: 95vh;">
        <q-card-section :class="`bg-${domain()}`">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="text-h6 tw-text-white tw-font-bold tw-flex tw-items-center tw-gap-3">
              <q-icon name="folder_shared" size="28px" /> Permission Folder — {{ permFolderName }}
            </div>
            <q-btn flat round dense icon="close" color="white" v-close-popup />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section style="max-height: calc(95vh - 100px); overflow-y: auto;" class="tw-p-6">
          <div v-if="loadingPermFolder" class="tw-text-center tw-py-8"><q-spinner-dots size="40px" color="purple-6" /></div>
          <div v-else>
            <!-- Permission Table -->
            <q-table :rows="permFolderList" :columns="permFolderColumns" row-key="aksesfolder_nik" flat :pagination="{ rowsPerPage: 20 }" class="tw-shadow-md tw-rounded-xl tw-overflow-hidden tw-mb-6">
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props"
                    class="bg-grey-8 text-white text-weight-bold" style="font-size: 12px; padding: 10px 8px;">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:body-cell-no="props"><q-td :props="props" class="tw-text-center tw-text-sm">{{ props.rowIndex + 1 }}</q-td></template>
              <template v-slot:body-cell-nik="props"><q-td :props="props" class="tw-text-sm">{{ props.row.aksesfolder_nik || '-' }}</q-td></template>
              <template v-slot:body-cell-bu="props">
                <q-td :props="props" class="tw-text-sm">
                  {{ props.row.aksesfolder_bu === 'all' ? 'Semua Bisnis Unit' : (props.row.aksesfolder_bu || '-') }}
                </q-td>
              </template>
              <template v-slot:body-cell-nama="props"><q-td :props="props" class="tw-text-sm">{{ props.row.user_name || '-' }}</q-td></template>
              <template v-slot:body-cell-div="props"><q-td :props="props" class="tw-text-sm">{{ props.row.div_nama || props.row.aksesfolder_div || '-' }}</q-td></template>
              <template v-slot:body-cell-download="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfolder_download ? 'check_circle' : 'cancel'" :color="props.row.aksesfolder_download ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-upload="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfolder_upload ? 'check_circle' : 'cancel'" :color="props.row.aksesfolder_upload ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-delete="props">
                <q-td :props="props" class="tw-text-center">
                  <q-icon :name="props.row.aksesfolder_delete ? 'check_circle' : 'cancel'" :color="props.row.aksesfolder_delete ? 'green' : 'red-4'" size="20px" />
                </q-td>
              </template>
              <template v-slot:body-cell-aksi="props">
                <q-td :props="props" class="tw-text-center">
                  <q-btn unelevated dense size="sm" color="orange-7" label="Edit" no-caps class="tw-mr-1 tw-min-w-[50px]" @click="editPermFolderEntry(props.row)" />
                  <q-btn unelevated dense size="sm" color="red-6" label="Delete" no-caps class="tw-min-w-[50px]" @click="deletePermFolderEntry(props.row)" />
                </q-td>
              </template>
              <template v-slot:no-data><div class="tw-text-center tw-py-8 tw-text-slate-400"><q-icon name="lock_open" size="40px" class="tw-mb-2" /><div class="tw-text-sm">Belum ada permission</div></div></template>
            </q-table>

            <!-- Add Permission Section -->
            <q-card flat bordered class="tw-rounded-xl">
              <q-card-section class="tw-bg-slate-50 tw-py-3">
                <div class="tw-font-bold tw-text-slate-700 tw-text-sm tw-uppercase">Add Permission</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="tw-p-4">
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  <!-- Nama Folder (readonly) -->
                  <div>
                    <q-input :model-value="permFolderName" outlined dense label="Nama Folder" readonly>
                      <template v-slot:prepend><q-icon name="folder" color="amber-7" /></template>
                    </q-input>
                  </div>

                  <!-- Path Folder (readonly) -->
                  <div>
                    <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_name : '/'" outlined dense label="Path Folder" readonly>
                      <template v-slot:prepend><q-icon name="subdirectory_arrow_right" color="grey-7" /></template>
                    </q-input>
                  </div>

                  <!-- Mapping Business Unit (readonly) -->
                  <div>
                    <q-input :model-value="selectedFolderNode ? selectedFolderNode.folder_bu : ''" outlined dense label="Mapping Bisnis Unit" readonly>
                      <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
                    </q-input>
                  </div>

                  <!-- Jenis Mapping -->
                  <div>
                    <q-select v-model="newPermFolderType" outlined dense label="Jenis Mapping"
                      :options="[{label:'User', value:'user'}, {label:'Bisnis Unit', value:'bu'}, {label:'Divisi', value:'div'}]" emit-value map-options>
                      <template v-slot:prepend><q-icon name="category" color="blue-6" /></template>
                    </q-select>
                  </div>

                  <!-- Business Unit -->
                  <div v-if="newPermFolderType === 'bu' || newPermFolderType === 'div'" :class="{ 'md:tw-col-span-2': newPermFolderType === 'bu' }">
                    <q-select v-model="newPermFolderBU" outlined dense label="Bisnis Unit"
                      :options="[...buOptions, {label:'Semua Bisnis Unit', value:'all', bu_id:'ALL', bu_name:'Semua Bisnis Unit'}]" emit-value map-options>
                      <template v-slot:prepend><q-icon name="business" color="orange-7" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.bu_id }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.bu_name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:selected-item="scope">
                        <div class="tw-flex tw-flex-col tw-leading-tight">
                          <span>{{ scope.opt.bu_id }}</span>
                          <!-- <span class="tw-text-xs tw-text-grey-6">{{ scope.opt.bu_name }}</span> -->
                        </div>
                      </template>
                    </q-select>
                  </div>

                  <!-- Divisi -->
                  <div v-if="newPermFolderType === 'div'">
                    <q-select v-model="newPermFolderDiv" outlined dense label="Divisi"
                      :options="permFolderDivOptions" emit-value map-options
                      :disable="!newPermFolderBU || newPermFolderBU === 'all'"
                      placeholder="Pilih Divisi">
                      <template v-slot:prepend><q-icon name="account_tree" color="purple-6" /></template>
                      <template v-slot:no-option>
                        <q-item><q-item-section class="text-grey">{{ newPermFolderBU ? 'Tidak ada divisi' : 'Pilih Bisnis Unit terlebih dahulu' }}</q-item-section></q-item>
                      </template>
                    </q-select>
                  </div>

                  <!-- User -->
                  <div v-if="newPermFolderType === 'user'" class="md:tw-col-span-2">
                    <q-select v-model="newPermFolderUser" :options="filteredPermFolderEmployees" option-value="employee_id" option-label="display_label"
                      label="Pilih User" outlined dense use-input input-debounce="300" @filter="filterPermFolderEmployees" emit-value map-options>
                      <template v-slot:prepend><q-icon name="person" color="blue-6" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section avatar><q-icon name="person" color="blue-6" /></q-item-section>
                          <q-item-section>
                            <q-item-label>{{ scope.opt.employee_name }}</q-item-label>
                            <q-item-label caption>NIK: {{ scope.opt.employee_id }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:no-option><q-item><q-item-section class="tw-text-slate-400">Tidak ditemukan</q-item-section></q-item></template>
                    </q-select>
                  </div>

                  <!-- Permission Flags -->
                  <div class="md:tw-col-span-2">
                    <div class="tw-text-xs tw-font-semibold tw-text-slate-600 tw-mb-2">Permission Flags</div>
                    <div class="tw-flex tw-gap-6">
                      <q-toggle v-model="newPermFolderDownload" label="View" color="green-6" />
                      <q-toggle v-model="newPermFolderUpload" label="Upload" color="green-6" />
                      <q-toggle v-model="newPermFolderDelete" label="Manage" color="green-6" />
                    </div>
                  </div>

                  <!-- Save -->
                  <div class="md:tw-col-span-2 tw-flex tw-justify-end">
                    <q-btn unelevated color="blue-6" label="Simpan" push icon="save" @click="addPermFolderEntry" :loading="savingPermFolder" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
import { domain, formatDateTime2 } from "./../../utils";

const $q = useQuasar();
const router = useRouter();

// --- State ---
const folderTree = ref([]);
const fileList = ref([]);
const selectedFolderId = ref(null);
const selectedFolderNode = ref(null);
const loadingTree = ref(false);
const loadingFiles = ref(false);
const fileFilter = ref("");
const folderSearch = ref("");
const savingFolder = ref(false);

// Folder-access flags for the logged-in user's role (from master_role)
const folderAccess = ref({
  add_folder: 0,
  rename_folder: 0,
  delete_folder: 0,
  permission_folder: 0,
  add_file: 0,
  permission_file: 0,
});

const filePagination = ref({ sortBy: "name", descending: false, page: 1, rowsPerPage: 10 });

// Computed: check if selected folder is root ("/")
const isRootSelected = ref(false);

// Dialog state
const dialogCreateFolder = ref(false);
const dialogRenameFolder = ref(false);
const dialogEditFile = ref(false);
const newFolderName = ref("");
const renameFolderName = ref("");
const folderToRename = ref(null);
const savingFile = ref(false);
const editFileId = ref(null);
const renewForm = ref({ name: "", duedate: "", file: null });
const renewingFile = ref(false);
const editForm = ref({
  content_name: "",
  content_desc: "",
  content_keywords: "",
  content_type: "non-renewable",
  content_duedate: "",
  content_owner: "",
  content_keeper: "",
  content_dic: "",
  content_bu: "",
  content_div: "",
  content_security: "non-restricted",
  folder_name: "",
  current_owner_name: "",
  current_keeper_name: "",
});

// Employee list for PIC Owner/Keeper dropdowns
const employeeList = ref([]);
const filteredEmployees = ref([]);

// Create folder form fields
const newFolderSecurity = ref("");
const newFolderBU = ref("");
const newFolderDiv = ref("");
const newFolderTingkat = ref(1);
const parentBUName = ref("");
const parentDivName = ref("");
const divOptions = ref([]);

// Options
const securityBUOptions = [
  { label: "Bisnis Unit Tertentu", value: "restricted" },
  // { label: "Semua Business Unit", value: "public" },
  { label: "Semua Bisnis Unit", value: "non-restricted" },
];
const securityDivOptions = [
  { label: "Divisi Tertentu", value: "restricted" },
  { label: "Semua Divisi", value: "public" },
  // { label: "Semua Divisi", value: "non-restricted" },
];
const buOptions = ref([]);

const loadBuOptions = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}user-management/business-units`);
    buOptions.value = (res.data || []).map(b => ({ label: b.bu_name, value: b.bu_id, bu_id: b.bu_id, bu_name: b.bu_name }));
  } catch {
    buOptions.value = [];
  }
};

// --- File Table Columns (like legacy: Nama File, Upload Date, Keywords, Tipe, View, Download, Delete, Edit, Permission, Properties) ---
const fileColumns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 40px" },
  { name: "content_name", label: "Nama File", field: "name", align: "left", sortable: true },
  { name: "upload_date", label: "Upload Date", field: "lastmodified", align: "center", sortable: true, style: "width: 110px" },
  { name: "keywords", label: "Keywords", field: "keywords", align: "left", sortable: true },
  { name: "type", label: "Tipe", field: "type", align: "center", sortable: true, style: "width: 100px" },
  { name: "view", label: "View", field: "view", align: "center", sortable: false, style: "width: 60px" },
  { name: "download", label: "Download", field: "download", align: "center", sortable: false, style: "width: 80px" },
  { name: "delete", label: "Delete", field: "delete", align: "center", sortable: false, style: "width: 60px" },
  { name: "edit", label: "Edit", field: "edit", align: "center", sortable: false, style: "width: 60px" },
  { name: "permission", label: "Permission", field: "permission", align: "center", sortable: false, style: "width: 80px" },
  { name: "properties", label: "Properties", field: "properties", align: "center", sortable: false, style: "width: 80px" },
];

// Permission file table columns (like legacy: No, NIK, Nama, BU, Divisi, View, Download, Delete, Upload, Aksi)
const permFileColumns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 40px" },
  { name: "nik", label: "NIK", field: "aksesfile_nik", align: "left", sortable: true, style: "width: 200px" },
  { name: "nama", label: "Nama", field: "user_name", align: "left", sortable: true },
  { name: "bu", label: "Bisnis Unit", field: "aksesfile_bu", align: "left", sortable: true },
  { name: "div", label: "Divisi", field: "aksesfile_div", align: "left", sortable: true },
  { name: "view", label: "View", field: "aksesfile_view", align: "center", sortable: false, style: "width: 60px" },
  { name: "download", label: "Download", field: "aksesfile_download", align: "center", sortable: false, style: "width: 70px" },
  { name: "delete_perm", label: "Delete", field: "aksesfile_delete", align: "center", sortable: false, style: "width: 60px" },
  { name: "upload", label: "Edit", field: "aksesfile_upload", align: "center", sortable: false, style: "width: 60px" },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 130px" },
];

// Permission folder table columns
const permFolderColumns = [
  { name: "no", label: "No", field: "no", align: "center", sortable: false, style: "width: 40px" },
  { name: "nik", label: "NIK", field: "aksesfolder_nik", align: "left", sortable: true, style: "width: 200px" },
  { name: "nama", label: "Nama", field: "user_name", align: "left", sortable: true },
  { name: "bu", label: "Bisnis Unit", field: "aksesfolder_bu", align: "left", sortable: true },
  { name: "div", label: "Divisi", field: "aksesfolder_div", align: "left", sortable: true },
  { name: "download", label: "View", field: "aksesfolder_download", align: "center", sortable: false, style: "width: 70px" },
  { name: "upload", label: "Upload", field: "aksesfolder_upload", align: "center", sortable: false, style: "width: 60px" },
  { name: "delete", label: "Manage", field: "aksesfolder_delete", align: "center", sortable: false, style: "width: 60px" },
  { name: "aksi", label: "Aksi", field: "aksi", align: "center", sortable: false, style: "width: 130px" },
];

// --- Helpers ---
const formatDate = (d) => d ? dayjs(d).format("DD-MM-YYYY") : "-";

// --- Add File Dialog ---
const dialogAddFile = ref(false);
const uploadingFile = ref(false);
const addFileForm = ref({
  name: "", desc: "", keywords: "", type: "non-renewable", duedate: "",
  owner: "", keeper: "", dic: "", security: "non-restricted", file: null, konfirmasiKeeper: 1,
});

const openAddFileDialog = async () => {
  if (employeeList.value.length === 0) await loadEmployeeList();
  if (dicList.value.length === 0) await loadDicList();
  addFileForm.value = { name: "", desc: "", keywords: "", type: "non-renewable", duedate: "", owner: "", keeper: "", dic: "", security: "non-restricted", file: null, konfirmasiKeeper: 1 };
  dialogAddFile.value = true;
};

// DIC list (grade 7/8 from DBC only)
const dicList = ref([]);
const filteredDicList = ref([]);

const loadDicList = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/users`, { params: { tingkat: 'dic' } });
    dicList.value = (res.data || []).map(e => ({
      ...e,
      employee_id: e.employee_id || e.account_nik,
      employee_name: e.employee_name || "",
      display_label: `${e.employee_name || ""} - ${e.employee_id || e.account_nik || ""}`,
    }));
  } catch {
    dicList.value = [];
  }
};

const filterDicEmployees = (val, update) => {
  update(() => {
    if (!val) {
      filteredDicList.value = dicList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredDicList.value = dicList.value.filter(e =>
        (e.employee_name || "").toLowerCase().includes(needle) ||
        (e.employee_id || "").toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

// Computed: resolve keeper email from employee list
const addFileKeeperEmail = computed(() => {
  if (!addFileForm.value.keeper) return "";
  const emp = employeeList.value.find(e => (e.employee_id || e.account_nik) === addFileForm.value.keeper);
  return emp ? (emp.employee_email || emp.email || "") : "";
});

// Computed: resolve keeper email for edit form
const editKeeperEmail = computed(() => {
  if (!editForm.value.content_keeper) return "";
  const emp = employeeList.value.find(e => (e.employee_id || e.account_nik) === editForm.value.content_keeper);
  return emp ? (emp.employee_email || emp.email || "") : "";
});

const submitAddFile = async () => {
  if (!addFileForm.value.name.trim()) { $q.notify({ type: "warning", message: "Nama file wajib diisi", position: "bottom" }); return; }
  if (!addFileForm.value.file) { $q.notify({ type: "warning", message: "File wajib dipilih", position: "bottom" }); return; }
  if (addFileForm.value.type === 'renewable' && !addFileForm.value.duedate) { $q.notify({ type: "warning", message: "Due date wajib diisi untuk tipe renewable", position: "bottom" }); return; }

  uploadingFile.value = true;
  try {
    const formData = new FormData();
    formData.append("file", addFileForm.value.file);
    formData.append("name", addFileForm.value.name.trim());
    formData.append("desc", addFileForm.value.desc);
    formData.append("keywords", addFileForm.value.keywords);
    formData.append("type", addFileForm.value.type);
    formData.append("duedate", addFileForm.value.duedate);
    formData.append("owner", addFileForm.value.owner || "");
    formData.append("keeper", addFileForm.value.keeper || "");
    formData.append("dic", addFileForm.value.dic || "");
    formData.append("security", addFileForm.value.security);
    formData.append("bu", selectedFolderNode.value?.folder_bu || "");
    formData.append("div", selectedFolderNode.value?.folder_div || "");
    formData.append("folder_id", selectedFolderId.value);

    await axios.post(`${import.meta.env.VITE_API}document/file`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    $q.notify({ type: "positive", message: "File berhasil diupload", position: "bottom" });
    dialogAddFile.value = false;
    await loadFiles(selectedFolderId.value);
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal mengupload file", position: "bottom" });
  } finally {
    uploadingFile.value = false;
  }
};

// --- Load Folder Tree ---
const loadFolderTree = async () => {
  loadingTree.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/folder/tree`);
    folderTree.value = res.data;
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat folder", position: "bottom" });
  } finally {
    loadingTree.value = false;
  }
};

// --- Load Files using browse endpoint ---
const loadFiles = async (folderId) => {
  if (!folderId) { fileList.value = []; return; }
  loadingFiles.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/folder/browse`, {
      params: { parent_id: folderId }
    });
    fileList.value = res.data.files || [];
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat file", position: "bottom" });
    fileList.value = [];
  } finally {
    loadingFiles.value = false;
  }
};

// --- Folder Selection ---
const findFolderNode = (tree, id) => {
  for (const f of tree) {
    if (f.folder_id === id) return f;
    if (f.children?.length) {
      const found = findFolderNode(f.children, id);
      if (found) return found;
    }
  }
  return null;
};

const onFolderSelected = (folderId) => {
  if (!folderId) return;
  selectedFolderId.value = folderId;
  selectedFolderNode.value = findFolderNode(folderTree.value, folderId);
  // Check if this is the root folder (name "/" or no parent)
  isRootSelected.value = selectedFolderNode.value?.folder_name === '/' || selectedFolderNode.value?.folder_parent === '#';
  loadFiles(folderId);
  // Re-evaluate folder action button access for the selected folder
  loadFolderAccess(folderId);
};

// --- Folder CRUD ---
const openCreateFolderDialog = () => {
  newFolderName.value = "";
  newFolderBU.value = "";
  newFolderDiv.value = "";

  // Calculate tingkat of new folder based on selected parent
  if (selectedFolderNode.value) {
    const parentTingkat = parseInt(selectedFolderNode.value.folder_tingkat) || 0;
    newFolderTingkat.value = parentTingkat + 1;
    parentBUName.value = selectedFolderNode.value.folder_bu || "";
    parentDivName.value = selectedFolderNode.value.folder_div || "";
  } else {
    newFolderTingkat.value = 1;
    parentBUName.value = "";
    parentDivName.value = "";
  }

  // Leave security unselected initially — user must choose the access option.
  newFolderSecurity.value = "";

  // Load division options if tingkat 2
  if (newFolderTingkat.value === 2 && parentBUName.value) {
    loadDivOptions(parentBUName.value);
  }

  dialogCreateFolder.value = true;
};

const loadDivOptions = async (bu) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}general/division`, { params: { bu } });
    divOptions.value = (res.data || []).map(d => ({ label: d.div_nama, value: d.div_id || d.div_nama }));
  } catch {
    // Fallback: empty options
    divOptions.value = [];
  }
};

const filteredBuOptionsFolder = ref([]);
const filterBuFolder = (val, update) => {
  update(() => {
    if (!val) {
      filteredBuOptionsFolder.value = buOptions.value;
    } else {
      const needle = val.toLowerCase();
      filteredBuOptionsFolder.value = buOptions.value.filter(
        (b) => b.label.toLowerCase().includes(needle)
      );
    }
  });
};

const createFolder = async () => {
  if (!newFolderName.value.trim()) {
    $q.notify({ type: "warning", message: "Nama Folder wajib diisi", position: "bottom" });
    return;
  }
  // if (!newFolderSecurity.value) {
  //   $q.notify({ type: "warning", message: "Akses Business Unit wajib dipilih", position: "bottom" });
  //   return;
  // }
  if (!selectedFolderId.value) {
    $q.notify({ type: "warning", message: "Pilih folder parent terlebih dahulu", position: "bottom" });
    return;
  }
  savingFolder.value = true;
  try {
    // Determine BU and Div based on tingkat and security
    let folderBU = "";
    let folderDiv = "";
    let folderSecurity = "non-restricted";

    if (newFolderTingkat.value === 1) {
      if (newFolderSecurity.value === "public") {
        folderBU = "all";
        folderSecurity = "non-restricted";
      } else {
        folderBU = newFolderBU.value || "";
        folderSecurity = "restricted";
      }
    } else if (newFolderTingkat.value === 2) {
      folderBU = parentBUName.value;
      if (newFolderSecurity.value === "public") {
        folderDiv = "all";
        folderSecurity = "non-restricted";
      } else {
        folderDiv = newFolderDiv.value || "";
        folderSecurity = "restricted";
      }
    } else {
      folderBU = parentBUName.value;
      folderDiv = parentDivName.value;
      folderSecurity = selectedFolderNode.value?.folder_security || "non-restricted";
    }

    // let folderBU = "";
    // let folderDiv = "";
    // let folderSecurity = newFolderSecurity.value;

    // if(newFolderSecurity.value === 'non-restricted') folderBU = 'all';
    // else if(newFolderSecurity.value === 'restricted') folderBU = newFolderBU.value;
    // if(newFolderDiv.value === 'non-restricted') folderBU = 'all';

    await axios.post(`${import.meta.env.VITE_API}document/folder`, {
      folder_name: newFolderName.value.trim(),
      folder_parent: selectedFolderId.value,
      folder_bu: folderBU,
      folder_div: folderDiv,
      folder_security: folderSecurity,
    });
    $q.notify({ type: "positive", message: "Folder berhasil dibuat", position: "bottom" });
    dialogCreateFolder.value = false;
    await loadFolderTree();
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal membuat folder", position: "bottom" });
  } finally {
    savingFolder.value = false;
  }
};

const openRenameFolderDialog = (node) => {
  if (!node) return;
  folderToRename.value = node;
  renameFolderName.value = node.folder_name;
  dialogRenameFolder.value = true;
};

const renameFolder = async () => {
  if (!renameFolderName.value.trim()) return;
  savingFolder.value = true;
  try {
    await axios.put(`${import.meta.env.VITE_API}document/folder/${folderToRename.value.folder_id}`, {
      folder_name: renameFolderName.value.trim(),
    });
    $q.notify({ type: "positive", message: "Folder berhasil diubah", position: "bottom" });
    dialogRenameFolder.value = false;
    await loadFolderTree();
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal mengubah folder", position: "bottom" });
  } finally {
    savingFolder.value = false;
  }
};

const confirmDeleteFolder = (node) => {
  if (!node) return;
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus folder <b>${node.folder_name}</b> beserta isinya?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}document/folder/${node.folder_id}`);
      $q.notify({ type: "positive", message: "Folder berhasil dihapus", position: "bottom" });
      if (selectedFolderId.value === node.folder_id) {
        selectedFolderId.value = null;
        selectedFolderNode.value = null;
        fileList.value = [];
      }
      await loadFolderTree();
    } catch (err) {
      $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menghapus folder", position: "bottom" });
    }
  });
};

// --- File Actions ---
const confirmDeleteFile = (file) => {
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus file <b>${file.name}</b>?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus", icon: "delete" },
    cancel: { push: true, color: "grey-7", label: "Batal", icon: "cancel" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}document/file/${file.id}`);
      $q.notify({ type: "positive", message: "File berhasil dihapus", position: "bottom" });
      await loadFiles(selectedFolderId.value);
    } catch (err) {
      $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menghapus file", position: "bottom" });
    }
  });
};

// --- Navigation ---
const openPermissionFolder = async (node) => {
  if (!node) return;
  permFolderName.value = node.folder_name;
  permFolderId.value = node.folder_id;
  loadingPermFolder.value = true;
  dialogPermFolder.value = true;
  if (employeeList.value.length === 0) await loadEmployeeList();
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/folder/${node.folder_id}`);
    permFolderList.value = res.data || [];
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat permission folder", position: "bottom" });
    permFolderList.value = [];
  } finally {
    loadingPermFolder.value = false;
  }
};
const goToUploadFile = () => { if (selectedFolderId.value) router.push(`/document/add-file/${selectedFolderId.value}`); };
const goToFileDetail = (file) => { openPropertiesDialog(file); };
const goToEditFile = async (file) => {
  editFileId.value = file.id;
  try {
    // Load employees and DIC list if not loaded yet
    if (employeeList.value.length === 0) await loadEmployeeList();
    if (dicList.value.length === 0) await loadDicList();

    const res = await axios.get(`${import.meta.env.VITE_API}document/file/${file.id}`);
    const data = res.data;
    editForm.value = {
      content_name: data.content_name || "",
      content_desc: data.content_desc || "",
      content_keywords: data.content_keywords || "",
      content_type: data.content_type || "non-renewable",
      content_duedate: data.content_duedate ? dayjs(data.content_duedate).format("YYYY-MM-DD") : "",
      content_owner: "",
      content_keeper: "",
      content_dic: data.content_dic || "",
      content_bu: data.content_bu || "",
      content_div: data.content_div || "",
      content_security: data.content_security || "non-restricted",
      folder_name: data.folder_name || "",
      current_owner_name: data.owner_name ? `${data.owner_name} (${data.content_owner})` : data.content_owner || "-",
      current_keeper_name: data.keeper_name ? `${data.keeper_name} (${data.content_keeper})` : data.content_keeper || "-",
    };
    dialogEditFile.value = true;
    renewForm.value = { name: "", duedate: "", file: null };
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal memuat data file", position: "bottom" });
  }
};

const loadEmployeeList = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/users`);
    employeeList.value = (res.data || []).map(e => ({
      ...e,
      employee_id: e.employee_id || e.account_nik,
      employee_name: e.employee_name || "",
      bu_name: e.bu_name || e.account_bu || "",
      div_nama: e.div_nama || e.account_div || "",
      display_label: `${e.employee_name || ""} ${e.employee_id || e.account_nik || ""} - ${e.div_nama || e.account_div || ""}`,
    }));
  } catch {
    employeeList.value = [];
  }
};

const filterEmployees = (val, update) => {
  update(() => {
    if (!val) {
      filteredEmployees.value = employeeList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredEmployees.value = employeeList.value.filter(e =>
        (e.employee_name || "").toLowerCase().includes(needle) ||
        (e.employee_id || e.account_nik || "").toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

const saveEditFile = async () => {
  if (!editForm.value.content_name.trim()) {
    $q.notify({ type: "warning", message: "Nama file wajib diisi", position: "bottom" });
    return;
  }
  savingFile.value = true;
  try {
    await axios.put(`${import.meta.env.VITE_API}document/file/${editFileId.value}`, editForm.value);
    $q.notify({ type: "positive", message: "File berhasil diperbarui", position: "bottom" });
    dialogEditFile.value = false;
    await loadFiles(selectedFolderId.value);
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menyimpan perubahan", position: "bottom" });
  } finally {
    savingFile.value = false;
  }
};

const submitRenewFile = async () => {
  if (!renewForm.value.file) { $q.notify({ type: "warning", message: "File baru wajib dipilih", position: "bottom" }); return; }
  if (!renewForm.value.duedate) { $q.notify({ type: "warning", message: "Due date baru wajib diisi", position: "bottom" }); return; }

  renewingFile.value = true;
  try {
    const formData = new FormData();
    formData.append("file", renewForm.value.file);
    formData.append("duedate", renewForm.value.duedate);
    if (renewForm.value.name) formData.append("name", renewForm.value.name);

    await axios.post(`${import.meta.env.VITE_API}document/file/${editFileId.value}/renew`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    $q.notify({ type: "positive", message: "File berhasil di-renew", position: "bottom" });
    dialogEditFile.value = false;
    await loadFiles(selectedFolderId.value);
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal renew file", position: "bottom" });
  } finally {
    renewingFile.value = false;
  }
};
const goToPermissionFile = (file) => { openPermissionFileDialog(file); };
const viewFile = (file) => {
  // Route through backend viewFile controller.
  // Auth token is sent automatically via httpOnly cookie (withCredentials),
  // the controller verifies permission and streams the file inline for preview.
  window.open(`${import.meta.env.VITE_API}document/file/${file.id}/view`, "_blank");
};

const downloadFile = (file) => {
  // Route through backend downloadFile controller.
  // Auth token is sent automatically via httpOnly cookie (withCredentials),
  // the controller verifies permission, streams from FTP and logs the activity.
  window.open(`${import.meta.env.VITE_API}document/file/${file.id}/download`, "_blank");
};

// --- Properties Dialog ---
const dialogProperties = ref(false);
const propertiesData = ref(null);
const propertiesLog = ref([]);
const loadingProperties = ref(false);

// --- Permission Folder Dialog ---
const dialogPermFolder = ref(false);
const permFolderName = ref("");
const permFolderId = ref(null);
const permFolderList = ref([]);
const loadingPermFolder = ref(false);
const newPermFolderType = ref("user");
const newPermFolderUser = ref(null);
const newPermFolderBU = ref(null);
const newPermFolderDiv = ref("");
const newPermFolderDownload = ref(true);
const newPermFolderUpload = ref(false);
const newPermFolderDelete = ref(false);
const savingPermFolder = ref(false);
const filteredPermFolderEmployees = ref([]);
const permFolderDivOptions = ref([]);

const loadPermFolderDivisions = async (bu) => {
  if (!bu || bu === 'all') {
    permFolderDivOptions.value = [{ label: 'Semua Divisi', value: 'all' }];
    return;
  }
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}general/division`, { params: { bu } });
    const data = res.data || [];
    const divs = data.map(d => ({ label: d.div_nama, value: d.div_id || d.div_nama }));
    // Add "All Division" at the bottom
    divs.push({ label: 'Semua Divisi', value: 'all' });
    permFolderDivOptions.value = divs;
  } catch (err) {
    console.log('loadPermFolderDivisions error:', err?.response?.data || err.message);
    permFolderDivOptions.value = [{ label: 'Semua Divisi', value: 'all' }];
  }
};

// Watch BU change to load divisions
watch(newPermFolderBU, (newBU) => {
  newPermFolderDiv.value = "";
  loadPermFolderDivisions(newBU);
});

// Watch type change — if switching to 'div' and BU already selected, load divisions
watch(() => newPermFolderType.value, (newType) => {
  if (newType === 'div' && newPermFolderBU.value) {
    loadPermFolderDivisions(newPermFolderBU.value);
  }
});

const filterPermFolderEmployees = (val, update) => {
  update(() => {
    if (!val) {
      filteredPermFolderEmployees.value = employeeList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredPermFolderEmployees.value = employeeList.value.filter(e =>
        (e.employee_name || "").toLowerCase().includes(needle) ||
        (e.employee_id || "").toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

const addPermFolderEntry = async () => {
  if (newPermFolderType.value === 'user' && !newPermFolderUser.value) { $q.notify({ type: "warning", message: "Pilih user", position: "bottom" }); return; }
  if (newPermFolderType.value === 'bu' && !newPermFolderBU.value) { $q.notify({ type: "warning", message: "Pilih BU", position: "bottom" }); return; }
  savingPermFolder.value = true;
  try {
    await axios.post(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}`, {
      nik: newPermFolderType.value === 'user' ? newPermFolderUser.value : null,
      bu: newPermFolderType.value === 'bu' ? newPermFolderBU.value : newPermFolderType.value === 'div' ? newPermFolderBU.value : null,
      div: newPermFolderType.value === 'div' ? newPermFolderDiv.value : null,
      view: newPermFolderDownload.value,
      download: newPermFolderDownload.value,
      upload: newPermFolderUpload.value,
      delete: newPermFolderDelete.value,
    });
    $q.notify({ type: "positive", message: "Permission berhasil ditambahkan", position: "bottom" });
    newPermFolderUser.value = null; newPermFolderBU.value = null; newPermFolderDiv.value = "";
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}`);
    permFolderList.value = res.data || [];
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menambahkan permission", position: "bottom" });
  } finally {
    savingPermFolder.value = false;
  }
};

const updatePermFolderFlag = async (row, flag, value) => {
  const scopeKey = row.aksesfolder_nik || row.aksesfolder_bu || "";
  try {
    await axios.put(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}/${scopeKey}`, {
      nik: row.aksesfolder_nik || null, bu: row.aksesfolder_bu || null, div: row.aksesfolder_div || null,
      view: flag === 'view' ? value : !!row.aksesfolder_view,
      upload: flag === 'upload' ? value : !!row.aksesfolder_upload,
      manage: flag === 'manage' ? value : !!row.aksesfolder_manage,
    });
    if (flag === 'view') row.aksesfolder_view = value ? 1 : 0;
    if (flag === 'upload') row.aksesfolder_upload = value ? 1 : 0;
    if (flag === 'manage') row.aksesfolder_manage = value ? 1 : 0;
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal update permission", position: "bottom" });
  }
};

const editPermFolderEntry = (row) => {
  const scopeKey = row.aksesfolder_nik || row.aksesfolder_bu || "";
  const scopeLabel = row.user_name || scopeKey;
  const folderBU = selectedFolderNode.value ? selectedFolderNode.value.folder_bu : '';
  
  $q.dialog({
    title: `Edit Permission — ${scopeLabel}`,
    message: `<div style="font-size:13px; margin-bottom:12px;">
      <div><b>Nama Folder :</b> ${permFolderName.value}</div>
      <div><b>Path Folder :</b> ${selectedFolderNode.value ? selectedFolderNode.value.folder_name : '/'}</div>
      <div><b>Mapping Bisnis Unit :</b> ${folderBU === 'all' ? 'Semua Bisnis Unit' : (folderBU || '-')}</div>
    </div>
    <div>Update permission flags :</div>`,
    html: true,
    options: {
      type: 'checkbox',
      model: [
        ...(row.aksesfolder_download ? ['download'] : []),
        ...(row.aksesfolder_upload ? ['upload'] : []),
        ...(row.aksesfolder_delete ? ['delete'] : []),
      ],
      items: [
        { label: 'View', value: 'download' },
        { label: 'Upload', value: 'upload' },
        { label: 'Manage', value: 'delete' },
      ]
    },
    ok: { push: true, color: 'blue-6', label: 'Simpan' },
    cancel: { push: true, color: 'red-7', label: 'Batal' },
    persistent: true,
  }).onOk(async (selected) => {
    try {
      await axios.put(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}/${scopeKey}`, {
        nik: row.aksesfolder_nik || null, bu: row.aksesfolder_bu || null, div: row.aksesfolder_div || null,
        view: selected.includes('download'),
        download: selected.includes('download'),
        upload: selected.includes('upload'),
        delete: selected.includes('delete'),
      });
      $q.notify({ type: "positive", message: "Permission berhasil diperbarui", position: "bottom" });
      const res = await axios.get(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}`);
      permFolderList.value = res.data || [];
    } catch (err) {
      $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal update permission", position: "bottom" });
    }
  });
};

const deletePermFolderEntry = async (row) => {
  const scopeKey = row.aksesfolder_nik || row.aksesfolder_bu || "";
  $q.dialog({
    title: "Konfirmasi", message: `Hapus permission untuk <b>${row.user_name || scopeKey}</b>?`, html: true,
    ok: { push: true, color: "red-7", label: "Hapus" }, cancel: { push: true, color: "grey-7", label: "Batal" }, persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}/${scopeKey}`);
      $q.notify({ type: "positive", message: "Permission dihapus", position: "bottom" });
      const res = await axios.get(`${import.meta.env.VITE_API}document/permission/folder/${permFolderId.value}`);
      permFolderList.value = res.data || [];
    } catch (err) {
      $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menghapus", position: "bottom" });
    }
  });
};

const openPropertiesDialog = async (file) => {
  loadingProperties.value = true;
  propertiesLog.value = [];
  dialogProperties.value = true;
  try {
    const [detailRes, logRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API}document/file/${file.id}`),
      axios.get(`${import.meta.env.VITE_API}document/file/${file.id}/log`),
    ]);
    propertiesData.value = detailRes.data;
    propertiesLog.value = logRes.data || [];
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat detail file", position: "bottom" });
    propertiesData.value = null;
  } finally {
    loadingProperties.value = false;
  }
};

// --- Permission File Dialog ---
const dialogPermissionFile = ref(false);
const permissionFileId = ref(null);
const permissionFileList = ref([]);
const loadingPermissionFile = ref(false);
const permissionFileName = ref("");

const openPermissionFileDialog = async (file) => {
  permissionFileId.value = file.id;
  permissionFileName.value = file.name;
  loadingPermissionFile.value = true;
  dialogPermissionFile.value = true;
  // Load employees if not loaded
  if (employeeList.value.length === 0) await loadEmployeeList();
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/file/${file.id}`);
    permissionFileList.value = res.data || [];
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal memuat permission file", position: "bottom" });
    permissionFileList.value = [];
  } finally {
    loadingPermissionFile.value = false;
  }
};

// Add permission state
const newPermUser = ref(null);
const newPermType = ref("user");
const newPermBU = ref(null);
const newPermDiv = ref("");
const permDivOptions = ref([]);
const loadingPermDiv = ref(false);

// Load divisions for the selected BU (backend: GET /general/division?bu=<bu_id>)
const loadPermDivisions = async (bu) => {
  console.log(bu);
  if (!bu) {
    permDivOptions.value = [];
    return;
  }
  loadingPermDiv.value = true;
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}general/division`, { params: { bu } });
    permDivOptions.value = (res.data || []).map(d => ({
      label: d.div_nama,
      value: d.div_id,
    }));
  } catch {
    permDivOptions.value = [];
  } finally {
    loadingPermDiv.value = false;
  }
};

// When BU changes: 'all' -> force div to '-', otherwise load divisions and reset selection
watch(newPermBU, (bu) => {
  if (bu === 'all') {
    permDivOptions.value = [];
    newPermDiv.value = "-";
    return;
  }
  newPermDiv.value = "";
  loadPermDivisions(bu);
});

const newPermView = ref(true);
const newPermDownload = ref(true);
const newPermDelete = ref(false);
const newPermUpload = ref(false);
const savingPerm = ref(false);
const filteredPermEmployees = ref([]);

const filterPermEmployees = (val, update) => {
  update(() => {
    if (!val) {
      filteredPermEmployees.value = employeeList.value.slice(0, 50);
    } else {
      const needle = val.toLowerCase();
      filteredPermEmployees.value = employeeList.value.filter(e =>
        (e.employee_name || "").toLowerCase().includes(needle) ||
        (e.employee_id || "").toLowerCase().includes(needle)
      ).slice(0, 50);
    }
  });
};

const addPermissionEntry = async () => {
  if (newPermType.value === 'user' && !newPermUser.value) {
    $q.notify({ type: "warning", message: "Pilih user terlebih dahulu", position: "bottom" });
    return;
  }
  if (newPermType.value === 'bu' && !newPermBU.value) {
    $q.notify({ type: "warning", message: "Pilih Bisnis Unit terlebih dahulu", position: "bottom" });
    return;
  }
  if (newPermType.value === 'div' && (!newPermBU.value || !newPermDiv.value)) {
    $q.notify({ type: "warning", message: "Pilih BU dan Divisi terlebih dahulu", position: "bottom" });
    return;
  }

  savingPerm.value = true;
  try {
    const payload = {
      nik: newPermType.value === 'user' ? newPermUser.value : null,
      bu: newPermType.value === 'bu' ? newPermBU.value : newPermType.value === 'div' ? newPermBU.value : null,
      div: newPermType.value === 'div' ? newPermDiv.value : null,
      view: newPermView.value,
      download: newPermDownload.value,
      delete: newPermDelete.value,
      upload: newPermUpload.value,
    };

    await axios.post(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}`, payload);
    $q.notify({ type: "positive", message: "Permission berhasil ditambahkan", position: "bottom" });
    newPermUser.value = null;
    newPermBU.value = null;
    newPermDiv.value = "";
    permDivOptions.value = [];
    // Reload permission list
    const res = await axios.get(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}`);
    permissionFileList.value = res.data || [];
    // Refresh the file table for the currently selected folder so access changes reflect
    if (selectedFolderId.value) await loadFiles(selectedFolderId.value);
  } catch (err) {
    $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menambahkan permission", position: "bottom" });
  } finally {
    savingPerm.value = false;
  }
};

const updatePermFlag = async (row, flag, value) => {
  const scopeKey = row.aksesfile_nik || row.aksesfile_bu || "";
  try {
    const payload = {
      nik: row.aksesfile_nik || null,
      bu: row.aksesfile_bu || null,
      div: row.aksesfile_div || null,
      view: flag === 'view' ? value : !!row.aksesfile_view,
      download: flag === 'download' ? value : !!row.aksesfile_download,
      delete: flag === 'delete' ? value : !!row.aksesfile_delete,
      upload: flag === 'upload' ? value : !!row.aksesfile_upload,
    };
    await axios.put(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}/${scopeKey}`, payload);
    // Update local state
    if (flag === 'view') row.aksesfile_view = value ? 1 : 0;
    if (flag === 'download') row.aksesfile_download = value ? 1 : 0;
    if (flag === 'delete') row.aksesfile_delete = value ? 1 : 0;
    if (flag === 'upload') row.aksesfile_upload = value ? 1 : 0;
    // Refresh the file table for the currently selected folder so access changes reflect
    if (selectedFolderId.value) await loadFiles(selectedFolderId.value);
  } catch (err) {
    $q.notify({ type: "negative", message: "Gagal update permission", position: "bottom" });
  }
};

const editPermFileEntry = (row) => {
  const scopeKey = row.aksesfile_nik || row.aksesfile_bu || "";
  const scopeLabel = row.user_name || scopeKey;
  const folderBU = selectedFolderNode.value ? selectedFolderNode.value.folder_bu : '';

  $q.dialog({
    title: `Edit Permission — ${scopeLabel}`,
    message: `<div style="font-size:13px; margin-bottom:12px;">
      <div><b>Nama File :</b> ${permissionFileName.value}</div>
      <div><b>Path Folder :</b> ${selectedFolderNode.value ? selectedFolderNode.value.folder_name : '/'}</div>
      <div><b>Mapping Bisnis Unit :</b> ${folderBU || '-'}</div>
    </div>
    <div>Update permission flags :</div>`,
    html: true,
    options: {
      type: 'checkbox',
      model: [
        ...(row.aksesfile_view ? ['view'] : []),
        ...(row.aksesfile_download ? ['download'] : []),
        ...(row.aksesfile_delete ? ['delete'] : []),
        ...(row.aksesfile_upload ? ['upload'] : []),
      ],
      items: [
        { label: 'View', value: 'view' },
        { label: 'Download', value: 'download' },
        { label: 'Delete', value: 'delete' },
        { label: 'Edit', value: 'upload' },
      ]
    },
    ok: { push: true, color: 'blue-6', label: 'Simpan' },
    cancel: { push: true, color: 'red-7', label: 'Batal' },
    persistent: true,
  }).onOk(async (selected) => {
    try {
      await axios.put(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}/${scopeKey}`, {
        nik: row.aksesfile_nik || null, bu: row.aksesfile_bu || null, div: row.aksesfile_div || null,
        view: selected.includes('view'),
        download: selected.includes('download'),
        delete: selected.includes('delete'),
        upload: selected.includes('upload'),
      });
      $q.notify({ type: "positive", message: "Permission berhasil diperbarui", position: "bottom" });
      const res = await axios.get(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}`);
      permissionFileList.value = res.data || [];
      // Refresh the file table for the currently selected folder so access changes reflect
      if (selectedFolderId.value) await loadFiles(selectedFolderId.value);
    } catch (err) {
      $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal update permission", position: "bottom" });
    }
  });
};

const deletePermissionEntry = async (row) => {
  const scopeKey = row.aksesfile_nik || row.aksesfile_bu || "";
  $q.dialog({
    title: "Konfirmasi Hapus",
    message: `Hapus permission untuk <b>${row.user_name || scopeKey}</b>?`,
    html: true,
    ok: { push: true, color: "red-7", label: "Ya, Hapus" },
    cancel: { push: true, color: "grey-7", label: "Batal" },
    persistent: true,
  }).onOk(async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}/${scopeKey}`);
      $q.notify({ type: "positive", message: "Permission berhasil dihapus", position: "bottom" });
      const res = await axios.get(`${import.meta.env.VITE_API}document/permission/file/${permissionFileId.value}`);
      permissionFileList.value = res.data || [];
      // Refresh the file table for the currently selected folder so access changes reflect
      if (selectedFolderId.value) await loadFiles(selectedFolderId.value);
    } catch (err) {
      $q.notify({ type: "negative", message: err?.response?.data?.message || "Gagal menghapus permission", position: "bottom" });
    }
  });
};

const loadFolderAccess = async (folderId = null) => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}document/folder/access`, {
      params: folderId ? { folder_id: folderId } : {},
    });
    folderAccess.value = {
      add_folder: res.data?.add_folder ? 1 : 0,
      rename_folder: res.data?.rename_folder ? 1 : 0,
      delete_folder: res.data?.delete_folder ? 1 : 0,
      permission_folder: res.data?.permission_folder ? 1 : 0,
      add_file: res.data?.add_file ? 1 : 0,
      permission_file: res.data?.permission_file ? 1 : 0,
    };
  } catch {
    folderAccess.value = { add_folder: 0, rename_folder: 0, delete_folder: 0, permission_folder: 0, add_file: 0, permission_file: 0 };
  }
};

const onFileRejected = (rejectedEntries) => {
    $q.notify({
        type: 'negative',
        message: 'File ditolak. Pastikan format upload file .doc/.docx dan ukuran file max 15MB'
    });
    addFileForm.value.file = null;
    renewForm.value.file = null;
}

// --- Lifecycle ---
onMounted(() => { loadFolderTree(); loadBuOptions(); loadFolderAccess(); });
</script>
