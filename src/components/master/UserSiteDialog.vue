<template>
  <q-dialog v-model="show" transition-show="slide-up" transition-hide="slide-down">
    <q-card class="tw-w-full tw-max-w-3xl tw-rounded-2xl tw-shadow-2xl">
      <q-card-section :class="`bg-${domain()}`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="location_on" size="32px" class="tw-text-white"/>
            <div>
              <div class="text-h5 tw-text-white tw-font-bold">Akses Site User</div>
              <div class="tw-text-blue-100 tw-text-sm">{{ userData?.user_name }}</div>
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
        <div class="tw-mb-6">
          <q-select
            outlined
            v-model="selectedDomain"
            use-input
            emit-value
            map-options
            input-debounce="0"
            option-value="value"
            option-label="desc"
            :options="listDomainUser"
            @filter="filterDomainUserFunction"
            label="Pilih Domain"
            @popup-hide="getSiteByDomainCheck"
            class="tw-rounded-lg"
          >
            <template v-slot:prepend>
              <q-icon name="domain" color="blue-6"/>
            </template>
          </q-select>
        </div>
        <div v-if="listSite.length>0">
          <div class="tw-flex tw-gap-3 tw-mb-6">
            <q-btn unelevated color="blue-6" label="Check All" icon="check_box" @click="checkSite" class="tw-font-semibold tw-rounded-lg"/>
            <q-btn unelevated color="red-7" label="Uncheck All" icon="check_box_outline_blank" @click="uncheckSite" class="tw-font-semibold tw-rounded-lg"/>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div v-for="(option) in listSite" :key="option" 
              :class="[
                'tw-rounded-lg tw-border-2 tw-transition-all tw-duration-300',
                option.selected 
                  ? defaultSite==option.name 
                    ? 'tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-border-green-400 tw-shadow-lg tw-shadow-green-100' 
                    : 'tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-blue-400 tw-shadow-lg tw-shadow-blue-100'
                  : 'tw-bg-white tw-border-slate-200 hover:tw-border-slate-300 hover:tw-shadow-md'
              ]">
              <q-checkbox 
                v-model="option.selected" 
                :label="option.label"
                :color="defaultSite==option.name?'green-6':'blue-6'"
                :disable="defaultSite==option.name?true:false"
                dense
                class="tw-w-full tw-p-3 tw-font-semibold tw-text-sm">
              </q-checkbox>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator class="tw-bg-slate-200"/>
      <q-card-actions align="right" class="tw-p-6 tw-bg-slate-50">
        <q-btn label="Batal" color="red-7" push icon="close" class="tw-px-6 tw-font-semibold" v-close-popup />
        <q-btn label="Simpan" color="blue-6" push icon="save" class="tw-px-6 tw-font-semibold" @click="saveSiteDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import { domain, empid, spinnerBall } from "./../../utils";
import { useQuasar } from "quasar";
import { useNotify } from "./../../composables/useNotify";

const props = defineProps({
  modelValue: Boolean,
  userData: Object
});

const emit = defineEmits(['update:modelValue', 'saved']);

const $q = useQuasar();
const { success, error } = useNotify();
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const listSite = ref([]);
const listDomainUser = ref([]);
const selectedDomain = ref(null);
const defaultSite = ref(null);

const getDomainUser = async () => {
  if (!props.userData?.user_id) return;
  
  try {
    const res = await axios.get(`${import.meta.env.VITE_API}getAksesDomains`,{
      params:{
        empid: props.userData.user_id
      }
    });
    listDomainUser.value = res.data;
  } catch (err) {
    error('Failed to load domains');
  }
};

const getSiteByDomainCheck = async () => {
  try {
    spinnerBall();
    listSite.value=[];
    const res = await axios.get(`${import.meta.env.VITE_API}listSiteByDomain`, {
      params: {
        empid: props.userData.user_id,
        domain: selectedDomain.value,
        creator: empid(),
        param: true,
      },
    });
    listSite.value = res.data; 
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error('Failed to load sites');
  }
};

const checkSite = () => {
  listSite.value.forEach((el) => {
    el.selected = true;
  });
};

const uncheckSite = () => {
  listSite.value.forEach((el) => {
    if (el.name != defaultSite.value)
      el.selected = false;
  });
};

const filterDomainUserFunction = (val, update) => {
  if (val === '') {
    update(() => {
      getDomainUser();
    })
  }

  update(() => {
    const neddle = val.toLowerCase();
    listDomainUser.value = listDomainUser.value.filter(option => {
      return option.desc.toLowerCase().includes(neddle)
    }) 
  })
};

const saveSiteDialog = () => {
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
    await saveSite();
  });
};

const saveSite = async () => {
  try {
    let tmpdata = {};
    let tempArray = [];
    listSite.value.forEach((el) => {
      if (el.selected == true && defaultSite.value != el.name)
        tempArray.push(el.name);
    });
    tmpdata.empid = props.userData.user_id;
    tmpdata.domain = selectedDomain.value;
    tmpdata.creator = empid();
    tmpdata.origin = defaultSite.value;
    tmpdata.site = tempArray; 
    
    await axios.post(`${import.meta.env.VITE_API}saveSite`, tmpdata);
    
    show.value = false;
    success(`Set akses site untuk ${props.userData.user_name} berhasil dilakukan.`);
    emit('saved');
  } catch (err) {
    console.error(err);
    error('Failed to save site access');
  }
};

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedDomain.value = props.userData.user_domain;
    defaultSite.value = props.userData.user_site;
    getDomainUser();
    getSiteByDomainCheck();
  }
});
</script>
