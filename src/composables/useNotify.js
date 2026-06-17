import { useQuasar } from 'quasar';

export const useNotify = () => {
  const $q = useQuasar();

  const showNotify = (type, message) => {
    const config = {
      positive: {
        color: 'white',
        textColor: 'green-8',
        icon: 'check_circle',
        iconColor: 'green',
        iconSize: '32px',
        classes: 'tw-rounded-2xl tw-shadow-[0_8px_30px_rgb(0,0,0,0.12)] tw-border-l-4 tw-border-green-500',
        html: true,
        message: `<div class="tw-flex tw-items-center tw-gap-4"><div class="tw-flex-1"><div class="tw-font-bold tw-text-base tw-text-green-800">${message}</div></div></div>`
      },
      negative: {
        color: 'white',
        textColor: 'red-8',
        icon: 'error',
        iconColor: 'red',
        iconSize: '32px',
        classes: 'tw-rounded-2xl tw-shadow-[0_8px_30px_rgb(0,0,0,0.12)] tw-border-l-4 tw-border-red-500',
        html: true,
        message: `<div class="tw-flex tw-items-center tw-gap-4"><div class="tw-flex-1"><div class="tw-font-bold tw-text-base tw-text-red-800">${message}</div></div></div>`
      }
    };

    $q.notify({
      ...config[type],
      position: 'bottom',
      timeout: 4000,
      progress: true,
      actions: [{ icon: 'close', color: 'grey-7', dense: true, round: true, flat: true }]
    });
  };

  return {
    showNotify,
    success: (message) => showNotify('positive', message),
    error: (message) => showNotify('negative', message)
  };
};
