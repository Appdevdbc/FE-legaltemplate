<template>
    <q-layout view="lHh Lpr lFf">
    </q-layout>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios"
import { useRouter, useRoute } from "vue-router";
import { useQuasar, Loading, QSpinnerCube  } from "quasar";
import { ParseError, app_name, app_year, app_env, app_link_portal } from "./../utils.js";
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const $q = useQuasar();
const router = useRouter();
const tmpData = reactive({
    empid: "",
    pass: "",
    ip: "", 
    url: "",
    portal: null,
});

const initialValues = {
    terms: false,
    subscribed: false,
}

const login = async () => {
    try {
        Loading.show();

        // Cukup cek empid_encrypt dari cookie; empid plaintext didapat dari hasil dekripsi
        tmpData.empid_encrypt = Cookies.get('empid_encrypt');
        if(tmpData.empid_encrypt == null){
            alert("Invalid Login (1)");
            window.close();
            Loading.hide();
            return;
        }

        const keyValue = `${import.meta.env.VITE_K1}`;
        const ivKey = `${import.meta.env.VITE_K2}`;

        const key = CryptoJS.PBKDF2(keyValue, 'salt', { keySize: 256/32, iterations: 100 });
        const iv = CryptoJS.enc.Utf8.parse(ivKey);
        let decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Hex.parse(tmpData.empid_encrypt) }, key, { iv: iv, mode: CryptoJS.mode.CBC });
        tmpData.empid = decrypted.toString(CryptoJS.enc.Utf8);

        // Jika empid_encrypt tidak valid, hasil dekripsi kosong -> tolak
        if(!tmpData.empid){
            alert("Invalid Login (2)");
            window.localStorage.clear();
            Object.keys(Cookies.get()).forEach(cookieName => {
                Cookies.remove(cookieName);
            });
            window.close();
            router.push("/");
            Loading.hide();
            return;
        }

        tmpData.portal = 1;
        const res = await axios.post(`${import.meta.env.VITE_API}login`, tmpData, { withCredentials: true });

        // Simpan session blob terenkripsi + flag isLoggedIn
        window.localStorage.setItem("session", res.data.data.session);
        window.localStorage.setItem("isLoggedIn", "true");

        // Hapus cookie empid plaintext setelah login berhasil (cukup empid_encrypt yang tersisa).
        // Cookie di-set pada domain .dbc.co.id, jadi penghapusan harus menyebut domain & path yang sama.
        Cookies.remove('empid');
        Cookies.remove('empid', { path: '/', domain: '.dbc.co.id' });

        router.push("/");
        Loading.hide(); 
    } catch (error) {
        Loading.hide();
        $q.notify({
            type: "negative",
            message: ParseError(error),
        }); 
    }
}

if (Cookies.get('empid_encrypt')) {
    login();
} else {
    window.location.replace(app_link_portal());
}
window.localStorage.clear();
</script>

<style lang="scss">
.q-field__messages.col {
    margin-top: -3px;
}
</style>