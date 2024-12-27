import { createApp } from "vue";
import App from "./App.vue";
import {router} from '../src/router/router'
import { createPinia } from "pinia";
import './styles/index.css';
import './styles/dropdown.css';
import './styles/tooltip.css';
import './styles/switch.css';
import { Oruga } from "@oruga-ui/oruga-next";


const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(Oruga)
app.mount("#app");

