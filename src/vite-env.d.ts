/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'primevue/toasteventbus' {
  import type { EventBus } from 'primevue/utils'
  export default {} as ReturnType<typeof EventBus>
}
