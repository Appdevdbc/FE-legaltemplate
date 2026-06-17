<template>
  <q-dialog v-model="show" transition-show="slide-up" transition-hide="slide-down">
    <q-card class="tw-w-full tw-max-w-3xl tw-rounded-2xl tw-shadow-2xl">
      <q-card-section :class="`bg-${domain()}`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="domain" size="32px" class="tw-text-white"/>
            <div>
              <div class="text-h5 tw-text-white tw-font-bold">Akses Domain User</div>
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
        <div v-if="listDomainCheck.length>0">
          <div class="tw-flex tw-gap-3 tw-mb-6">
            <q-btn unelevated color="blue-6" label="Check All" icon="check_box" @click="checkDomain" class="tw-font-semibold tw-rounded-lg"/>
            <q-btn unelevated color="red-7" label="Uncheck All" icon="check_box_outline_blank" @click="uncheckDomain" class="tw-font-semibold tw-rounded-lg"/>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div v-for="(option) in listDomainCheck" :key="option" 
              :class="[
                'tw-rounded-lg tw-border-2 tw-transition-all tw-duration-300',
                option.selected 
                  ? defaultDomain==option.name 
                    ? 'tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-border-green-400 tw-shadow-lg tw-shadow-green-100' 
                    : 'tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-blue-400 tw-shadow-lg tw-shadow-blue-100'
                  : 'tw-bg-white tw-border-slate-200 hover:tw-border-slate-300 hover:tw-shadow-md'
              ]">
              <q-checkbox 
                v-model="option.selected" 
                :label="option.label"
                :color="defaultDomain==option.name?'green-6':'blue-6'"
                :disable="defaultDomain==option.name?true:false"
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
        <q-btn label="Simpan" color="blue-6" push icon="save" class="tw-px-6 tw-font-semibold" @click="saveDomainDialog" />
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

const listDomainCheck = ref([]);
const defaultDomain = ref(null);

const getDomainCheck = async () => {
  if (!props.userData?.user_id) return;
  
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}getDomains`,{
      params: {
        empid: props.userData.user_id,
        creator: empid(),
        param: true,
      },
    });
    listDomainCheck.value = res.data;
    defaultDomain.value = props.userData.user_domain;
    $q.loading.hide();
  } catch (err) {
    $q.loading.hide();
    error('Failed to load domains');
  }
};

const checkDomain = () => {
  listDomainCheck.value.forEach((el) => {
    el.selected = true;
  });
};

const uncheckDomain = () => {
  listDomainCheck.value.forEach((el) => {
    if (el.name != defaultDomain.value)
      el.selected = false;
  });
};

const saveDomainDialog = () => {
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
    await saveDomain();
  });
};

const saveDomain = async () => {
  try {
    let tmpdata = {};
    let tempArray = [];
    listDomainCheck.value.forEach((el) => {
      if (el.selected == true && defaultDomain.value != el.name)
        tempArray.push(el.name);
    });
    tmpdata.empid = props.userData.user_id;
    tmpdata.creator = empid();
    tmpdata.origin = defaultDomain.value;
    tmpdata.domain = tempArray; 
    
    await axios.post(`${import.meta.env.VITE_API}saveAksesDomain`, tmpdata);
    
    show.value = false;
    success(`Set akses domain untuk ${props.userData.user_name} berhasil dilakukan.`);
    emit('saved');
  } catch (err) {
    console.log(err)
    error('Failed to save domain access');
  }
};

watch(() => props.modelValue, (val) => {
  if (val) {
    getDomainCheck();
  }
});
</script>
