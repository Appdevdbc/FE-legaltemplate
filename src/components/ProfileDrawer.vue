<template>
  <q-drawer v-model="isOpen" side="right" :width="400" overlay behavior="mobile" class="tw-bg-white">
    <div class="tw-h-full tw-flex tw-flex-col">
      <div class="tw-p-6 tw-text-white tw-relative tw-overflow-hidden" :style="headerStyle">
        <div class="tw-absolute tw-top-2 tw-left-2 tw-z-10">
          <q-btn 
            round 
            flat 
            icon="photo_camera" 
            size="sm" 
            class="tw-bg-black/60 tw-text-white tw-backdrop-blur-[10px] tw-border tw-border-white/20 hover:tw-bg-black/80 hover:tw-scale-110"
            @click="$refs.bgInput.click()"
          />
        </div>
        <input 
          ref="bgInput" 
          type="file" 
          accept="image/*" 
          class="hidden-input" 
          @change="$emit('background-upload', $event)"
        />
        <div class="tw-absolute tw-top-2 tw-right-2 tw-z-10">
          <q-btn flat round dense icon="close" @click="isOpen = false" class="tw-text-white tw-bg-black/30 tw-backdrop-blur-sm hover:tw-bg-black/50 tw-drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]" />
        </div>
        <div class="tw-mb-4 tw-mt-10 tw-relative tw-z-10">
          <h3 class="tw-text-xl tw-font-bold tw-drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] tw-drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">Profile</h3>
        </div>
        <div class="tw-text-center tw-relative tw-z-10">
          <q-avatar size="100px" class="tw-mb-4 tw-cursor-pointer tw-border-4 tw-border-white tw-shadow-2xl" @click="$refs.avatarInput.click()">
            <img v-if="avatarImage" :src="avatarImage" class="avatar-img" />
            <div v-else class="tw-text-3xl tw-font-bold">{{ userName.substring(0,1) }}</div>
            <div class="avatar-overlay">
              <q-icon name="photo_camera" size="md" />
            </div>
          </q-avatar>
          <input 
            ref="avatarInput" 
            type="file" 
            accept="image/*" 
            class="hidden-input" 
            @change="$emit('avatar-upload', $event)"
          />
          <div class="tw-text-2xl tw-font-bold tw-drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] tw-drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">{{ userName }}</div>
          <div class="tw-mt-1 tw-drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] tw-drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">{{ unit }}</div>
        </div>
      </div>
      <div class="tw-flex-1 tw-overflow-auto tw-p-6 tw-bg-white">
        <div class="tw-space-y-4">
          <div class="tw-text-sm tw-text-gray-500 tw-uppercase tw-font-semibold tw-mb-4">Account Information</div>
          <div v-if="loading" class="tw-space-y-3">
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg tw-animate-pulse">
              <div class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-mr-3"></div>
              <div class="tw-flex-1">
                <div class="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-16 tw-mb-2"></div>
                <div class="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-32"></div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg tw-animate-pulse">
              <div class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-mr-3"></div>
              <div class="tw-flex-1">
                <div class="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-16 tw-mb-2"></div>
                <div class="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-40"></div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg tw-animate-pulse">
              <div class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-mr-3"></div>
              <div class="tw-flex-1">
                <div class="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-16 tw-mb-2"></div>
                <div class="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-36"></div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg tw-animate-pulse">
              <div class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-mr-3"></div>
              <div class="tw-flex-1">
                <div class="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-16 tw-mb-2"></div>
                <div class="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-48"></div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg tw-animate-pulse">
              <div class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-mr-3"></div>
              <div class="tw-flex-1">
                <div class="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-16 tw-mb-2"></div>
                <div class="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-44"></div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg tw-animate-pulse">
              <div class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-mr-3"></div>
              <div class="tw-flex-1">
                <div class="tw-h-3 tw-bg-gray-300 tw-rounded tw-w-16 tw-mb-2"></div>
                <div class="tw-h-4 tw-bg-gray-300 tw-rounded tw-w-52"></div>
              </div>
            </div>
          </div>
          <div v-else-if="userProfile" class="tw-space-y-3">
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg">
              <q-icon name="badge" class="tw-mr-3 tw-text-gray-600" size="sm" />
              <div>
                <div class="tw-text-xs tw-text-gray-500">NIK</div>
                <div class="tw-font-semibold">{{ userProfile.nik }}</div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg">
              <q-icon name="person" class="tw-mr-3 tw-text-gray-600" size="sm" />
              <div>
                <div class="tw-text-xs tw-text-gray-500">Name</div>
                <div class="tw-font-semibold">{{ userProfile.name }}</div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg">
              <q-icon name="work" class="tw-mr-3 tw-text-gray-600" size="sm" />
              <div>
                <div class="tw-text-xs tw-text-gray-500">Position</div>
                <div class="tw-font-semibold">{{ userProfile.jabatan || '-' }}</div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg">
              <q-icon name="corporate_fare" class="tw-mr-3 tw-text-gray-600" size="sm" />
              <div>
                <div class="tw-text-xs tw-text-gray-500">Directorate</div>
                <div class="tw-font-semibold">{{ userProfile.dir_name || '-' }}</div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg">
              <q-icon name="account_tree" class="tw-mr-3 tw-text-gray-600" size="sm" />
              <div>
                <div class="tw-text-xs tw-text-gray-500">Division</div>
                <div class="tw-font-semibold">{{ userProfile.div_name || '-' }}</div>
              </div>
            </div>
            <div class="tw-flex tw-items-center tw-p-3 tw-bg-gray-50 tw-rounded-lg">
              <q-icon name="business_center" class="tw-mr-3 tw-text-gray-600" size="sm" />
              <div>
                <div class="tw-text-xs tw-text-gray-500">Department</div>
                <div class="tw-font-semibold">{{ userProfile.dept_name || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tw-p-6 tw-border-t tw-bg-white tw-space-y-3">
        <!-- <q-btn 
          unelevated 
          label="Notifications" 
          icon="notifications" 
          color="blue-6" 
          @click="notifDialog = true" 
          class="tw-w-full tw-font-semibold" 
        /> -->
        <q-btn 
          unelevated 
          label="Logout" 
          icon="logout" 
          color="red-6" 
          @click="$emit('logout')" 
          class="tw-w-full tw-font-semibold" 
        />
      </div>
    </div>
  </q-drawer>

  <NotificationDialog v-model="notifDialog" :domain="domain" />
</template>

<script setup>
import { computed, ref } from 'vue';
import NotificationDialog from './NotificationDialog.vue';

const notifDialog = ref(false);

const props = defineProps({
  modelValue: Boolean,
  domain: String,
  userName: String,
  unit: String,
  avatarImage: String,
  backgroundImage: String,
  userProfile: Object,
  loading: Boolean
});

const emit = defineEmits(['update:modelValue', 'avatar-upload', 'background-upload', 'background-remove', 'logout']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const headerStyle = computed(() => {
  const domainColors = {
    '100': 'linear-gradient(135deg, #003399 0%, #00b2e3 100%)',
    '110': 'linear-gradient(135deg, #003399 0%, #00b2e3 100%)',
    '200': 'linear-gradient(135deg, #003b7b 0%, #231f20 100%)',
    '210': 'linear-gradient(135deg, #003b7b 0%, #231f20 100%)',
    '800': 'linear-gradient(135deg, #ee4034 0%, #BABCBE 100%)',
    '130': 'linear-gradient(135deg, #ee4034 0%, #BABCBE 100%)',
    '700': 'linear-gradient(135deg, #ee4034 0%, #BABCBE 100%)',
    '120': 'linear-gradient(135deg, #ef4123 0%, #4d5e6c 100%)',
    '300': 'linear-gradient(135deg, #A8479A 0%, #5BAF42 100%)',
    '320': 'linear-gradient(135deg, #A8479A 0%, #5BAF42 100%)'
  };
  
  if (props.backgroundImage) {
    return {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${props.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return {
    background: domainColors[props.domain] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
});
</script>

<style scoped>
.hidden-input {
  display: none;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
}

.q-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
