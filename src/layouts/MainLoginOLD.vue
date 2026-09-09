<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="fit row wrap justify-center items-center content-center login-container">
        <div class="login-card">
          <!-- Logo Section -->
          <div class="logo-section">
            <q-img class="logo-image" src="logo.png" width="180px" />
            <h1 class="app-title">
              <span class="title-gradient">Legal Template Folder</span>
            </h1>
            <p class="subtitle">Silakan masuk untuk melanjutkan</p>
          </div>

          <!-- Form Section -->
          <Form
            :initial-values="initialValues"
            :validation-schema="schema"
            @submit="onSubmit"
            class="login-form"
          >
            <div class="form-fields">
              <Field
                v-model="tmpData.nik"
                name="nik"
                v-slot="{ errorMessage, value, field }"
              >
                <div class="input-wrapper">
                  <q-input
                    class="custom-input"
                    label="NIK"
                    outlined
                    type="tel"
                    :model-value="value"
                    v-bind="field"
                    :error-message="errorMessage"
                    :error="!!errorMessage"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" class="input-icon" />
                    </template>
                  </q-input>
                </div>
              </Field>
              
              <Field
                v-model="tmpData.pass"
                name="password"
                v-slot="{ errorMessage, value, field }"
              >
                <div class="input-wrapper">
                  <q-input
                    class="custom-input"
                    :type="isPwd ? 'password' : 'text'"
                    :model-value="value"
                    label="Password"
                    outlined
                    v-bind="field"
                    :error-message="errorMessage"
                    :error="!!errorMessage"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" class="input-icon" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer toggle-password"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>
                </div>
              </Field>
            </div>

            <q-btn
              unelevated
              class="login-btn"
              label="Sign In"
              type="submit"
              no-caps
            >
              <q-icon name="arrow_forward" class="q-ml-sm" />
            </q-btn>
          </Form>
        </div>
      </q-page>
    </q-page-container>

    <div class="waves">
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'>
        <rect fill='#CD361B' width='2000' height='1500'/>
        <defs>
          <radialGradient id='a' gradientUnits='objectBoundingBox'>
            <stop  offset='0' stop-color='#27363B'/>
            <stop  offset='1' stop-color='#CD361B'/>
          </radialGradient>
          <linearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='750' x2='1550' y2='750'>
            <stop  offset='0' stop-color='#7a362b'/>
            <stop  offset='1' stop-color='#CD361B'/>
          </linearGradient><path id='s' fill='url(#b)' d='M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z'/>
          <g id='g'>
            <use href='#s' transform='scale(0.12) rotate(60)'/>
            <use href='#s' transform='scale(0.2) rotate(10)'/>
            <use href='#s' transform='scale(0.25) rotate(40)'/>
            <use href='#s' transform='scale(0.3) rotate(-20)'/>
            <use href='#s' transform='scale(0.4) rotate(-30)'/>
            <use href='#s' transform='scale(0.5) rotate(20)'/>
            <use href='#s' transform='scale(0.6) rotate(60)'/>
            <use href='#s' transform='scale(0.7) rotate(10)'/>
            <use href='#s' transform='scale(0.835) rotate(-40)'/>
            <use href='#s' transform='scale(0.9) rotate(40)'/>
            <use href='#s' transform='scale(1.05) rotate(25)'/>
            <use href='#s' transform='scale(1.2) rotate(8)'/>
            <use href='#s' transform='scale(1.333) rotate(-60)'/>
            <use href='#s' transform='scale(1.45) rotate(-30)'/>
            <use href='#s' transform='scale(1.6) rotate(10)'/>
          </g>
        </defs>
        <g  transform='rotate(0 0 0)'>
          <g  transform='rotate(0 0 0)'>
            <circle fill='url(#a)' r='3000'/>
            <g opacity='0.5'>
              <circle fill='url(#a)' r='2000'/>
              <circle fill='url(#a)' r='1800'/>
              <circle fill='url(#a)' r='1700'/>
              <circle fill='url(#a)' r='1651'/>
              <circle fill='url(#a)' r='1450'/>
              <circle fill='url(#a)' r='1250'/>
              <circle fill='url(#a)' r='1175'/>
              <circle fill='url(#a)' r='900'/>
              <circle fill='url(#a)' r='750'/>
              <circle fill='url(#a)' r='500'/>
              <circle fill='url(#a)' r='380'/>
              <circle fill='url(#a)' r='250'/>
            </g>
            <g  transform='rotate(0 0 0)'>
              <use href='#g' transform='rotate(10)'/>
              <use href='#g' transform='rotate(120)'/>
              <use href='#g' transform='rotate(240)'/>
            </g>
            <circle fill-opacity='0.1' fill='url(#a)' r='3000'/>
          </g>
        </g>
      </svg>
    </div>
  </q-layout>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Field, Form } from "vee-validate";
import * as yup from "yup";
import axios from "axios"
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useBrowserLocation } from '@vueuse/core'
import { ParseError } from "../utils.js";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const location = useBrowserLocation();
const isPwd = ref(true);
const tmpData = reactive({
  nik: "",
  pass: "",
  url:location.value.origin,
});
const schema = yup.object({
  nik: yup.string().required().label("NIK"),
  password: yup.string().required().label("Password"),
});
const initialValues = {
  terms: false,
  subscribed: false,
};
const onSubmit = async (values, actions) => {
  try {
    const environment =`${import.meta.env.VITE_ENV}`;
    window.localStorage.clear();
    /*if (environment != 'LOCAL'){
        window.location.replace(`${import.meta.env.VITE_APPDBC}`);
    }*/
    $q.loading.show();
    const res = await axios.post(`${import.meta.env.VITE_API}login`, tmpData);
    actions.resetForm();
    
    window.localStorage.setItem("data", JSON.stringify(res.data));
    window.localStorage.setItem("token", res.data.data.token);
    window.localStorage.setItem("empid", res.data.data.empid);
    window.localStorage.setItem("nama", res.data.data.nama);
    window.localStorage.setItem("nik", res.data.data.nik);
    window.localStorage.setItem("type", res.data.data.type);
    window.localStorage.setItem("role_name", res.data.data.role_name);
    window.localStorage.setItem("bu", res.data.data.bu);
    window.localStorage.setItem("div", res.data.data.div);
    window.localStorage.setItem("domain", res.data.data.bu || "800");
    window.localStorage.setItem("unit", res.data.data.bu || "DBC");
    window.localStorage.setItem("site", "");
    window.localStorage.setItem("role", res.data.data.type?.toString() || "");
    window.localStorage.setItem("super", "");
    window.localStorage.setItem("idle_time", res.data.data.idle);
    axios.defaults.headers.common["Authorization"] = 'Bearer ' + res.data.data.token;
    router.push("/"); 
    $q.loading.hide(); 
  } catch (error) {
    console.log(error);
    $q.loading.hide();
    
    let errorMessage = "Login gagal. Silakan coba lagi.";
    
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      errorMessage = "Koneksi ke server gagal. Pastikan backend sudah berjalan di " + import.meta.env.VITE_API;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = "Waktu permintaan habis. Silakan coba lagi.";
    } else if (error.response?.status === 401) {
      errorMessage = "NIK atau password salah.";
    } else if (error.response?.status === 406) {
      errorMessage = error.response?.data?.message || "Login gagal. Silakan coba lagi.";
    } else if (error.response?.status === 500) {
      errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    $q.notify({
      type: "negative",
      message: errorMessage,
      position: "bottom",
      timeout: 5000,
    });
    
  }
};

// socket.on("barcode_inbound_status", (msg) => {
//   console.log("message: " + msg.barcode);
// });



window.localStorage.clear();
</script>

<style lang="scss" scoped>
@import "../assets/styles/login.scss";
</style>

