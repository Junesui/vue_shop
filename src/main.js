import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

/* 请求拦截器 */
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

/* 挂载*/
Vue.prototype.$http = axios

/*导入字体图标*/
import './assets/fonts/iconfont.css'
/*引入全局css*/
import './assets/css/global.css'

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
