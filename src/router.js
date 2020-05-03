import Vue from 'vue';
import Router from 'vue-router';
import axios from 'axios';
// import VueAxios from 'vue-axios';

import Expense from './components/Expense';

Vue.use(Router);
Vue.use(axios);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'expense',
      component: Expense
    }
  ]
});
