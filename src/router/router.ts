import { createMemoryHistory, createRouter } from 'vue-router'

import Home from '../views/Home.vue'
import MultipleSimple from '../views/MultipleSimple.vue'
import MultipleDetailed from '../views/MultipleDetailed.vue'
import SingleDetailed from '../views/SingleDetailed.vue'
import Downloads from '../views/Downloads.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/multiple', component: MultipleSimple },
  { path: '/multipleDetailed', component: MultipleDetailed },
  { path: '/singleDetailed', component: SingleDetailed },
  { path: '/downloads', component: Downloads },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})