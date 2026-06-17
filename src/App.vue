<template>
  <router-view />
</template>
<script setup>
import axios from "axios";
import { useQuasar } from "quasar";
import { ParseError } from "./utils";
const $q = useQuasar();

axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  $q.loading.hide();
  
  // Skip interceptor notification if flag is set
  if (error.config && error.config.skipErrorInterceptor) {
    return Promise.reject(error);
  }
  
  if (error.response && error.response.status == 422) {
    for (const key in error.response.data.errors) {
      let values = Object.values(error.response.data.errors[key])[0]
      $q.notify({
        type: 'negative',
        message: `${values}`
      })
    }
  } else {
    $q.notify({
      type: 'negative',
      message: ParseError(error),
      caption: 'Gagal',
      position: 'bottom',
      timeout: 10000,
      classes: 'error-toast',
      html: true
    });
  }
  return Promise.reject(error);
});
</script>
 