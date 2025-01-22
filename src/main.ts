import { createApp } from "vue";
import App from "./App.vue";
import {router} from '../src/router/router'
import { createPinia } from "pinia";
import './styles/index.css';
import './styles/switch.css';
import './styles/auto_complete.css';
import './styles/progress_bar.css';
import './styles/select.css';
import './styles/button.css';
import './styles/toast.css';
import './styles/popup.css';
import './styles/recent_download_card.css';
import './styles/dialog.css';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';
import ToastService from 'primevue/toastservice';
import Tooltip from "primevue/tooltip";



const app = createApp(App)
const pinia = createPinia()

const themePreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#feeaf0',
            100: '#feeaf0',
            200: '#fdcbd6',
            300: '#ef95a1',
            400: '#e56a7c',
            500: '#f2425d',
            600: '#f92246',
            700: '#e91444',
            800: '#d7003d',
            900: '#ca0035',
            950: '#bc0029'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '{zinc.50}',
                    100: '{zinc.100}',
                    200: '{zinc.200}',
                    300: '{zinc.300}',
                    400: '{zinc.400}',
                    500: '{zinc.500}',
                    600: '{zinc.600}',
                    700: '{zinc.700}',
                    800: '{zinc.800}',
                    900: '{zinc.900}',
                    950: '{zinc.950}'
                }
            },
            dark: {
                surface: {
                    0: '#f9f9f9',
                    50: '#f9f9f9',
                    100: '#f4f4f4',
                    200: '#ececec',
                    300: '#dddddd',
                    400: '#b9b9b9',
                    500: '#9a9a9a',
                    600: '#717171',
                    700: '#5d5d5d',
                    800: '#3f3f3f',
                    900: '#1e1e1e',
                    950: '#1B1B1B'
                },
                formField: {
                    hoverBorderColor: '#5d5d5d', //700
                }
            }
        }
    }
});

app.use(router)
app.use(pinia)
app.use(PrimeVue, {
    theme: {
        preset: themePreset
    }
});
app.directive('tooltip',Tooltip);
app.use(ToastService);
app.mount("#app");

