import Vue from 'vue'
import Vuetify from 'vuetify'
import Message from '@/common/plugins/message/message';
import Storage from '@/common/plugins/storage';
import I18n from 'vue-i18n';
import messages from '@/common/lang/';

Vue.use(Vuetify);
Vue.use(Message);
Vue.use(Storage);
Vue.use(I18n);
const i18n = new I18n({
  locale: 'es',
  messages
});
