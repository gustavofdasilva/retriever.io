import { createApp } from "vue";
import App from "./App.vue";
import {router} from '../src/router/router'
import { createPinia } from "pinia";
import './styles/index.css';
import './styles/dropdown.css';
import './styles/tooltip.css';
import './styles/switch.css';
import './styles/auto_complete.css'
import { Oruga } from "@oruga-ui/oruga-next";
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';


const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(Oruga)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ToastService);
app.mount("#app");

