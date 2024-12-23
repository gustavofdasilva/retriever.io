import { createApp } from "vue";
import App from "./App.vue";
import {router} from '../src/router/router'
import { createPinia } from "pinia";
import './styles/index.css';
import './styles/dropdown.css'
import { Oruga } from "@oruga-ui/oruga-next";


const app = createApp(App)
const pinia = createPinia()
const customIconConfig = {
    customIconPacks: {
        fas: {
            sizes: {
                default: null,
                small: null,
                medium: "fa-lg",
                large: "fa-xl"
            }
        }
    }
}

app.use(router)
app.use(pinia)
app.use(Oruga)
app.mount("#app");

