import { createApp } from 'vue';
import { Quasar } from 'quasar';
import { createApolloProvider } from '@vue/apollo-composable';
import apolloClient from './boot/apollo';
import App from './App.vue';
import router from './router';

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

const myApp = createApp(App);
myApp.use(Quasar, {
  config: {},
  plugins: {},
});
myApp.use(router);
myApp.use(apolloProvider);
myApp.mount('#q-app');
