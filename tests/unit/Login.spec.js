import { createLocalVue, mount } from '@vue/test-utils';
import Login from '@/components/admin/auth/Login.vue';
import VueRouter from 'vue-router';

import Message from '@/common/plugins/message/message';
import Storage from '@/common/plugins/storage';
import VueI18n from 'vue-i18n';
import messages from '@/common/lang/';

describe('Test Login.vue', () => {

  const localVue = createLocalVue();

  let i18n;
  let wrapper;
  beforeEach(() => {
    localVue.use(Message);
    localVue.use(Storage);
    localVue.use(VueI18n);
    localVue.use(VueRouter);
    i18n = new VueI18n({
      locale: 'es',
      messages
    });

    wrapper = mount(Login, {
      localVue,
      i18n,
      mocks: {
        $apiUrl: 'http://localhost:3000/api/'
      }
    });
  });

  it('Debe renderizar el componente mostrando su titulo', () => {
    const msg = 'Transporte Aéreo';
    const titleApp = wrapper.find('.title-app');
    expect(titleApp.text()).toMatch(msg);
  });

  it ('Debe renderizar el componente con dos formularios', () => {
    const formSin = wrapper.findComponent({ ref: 'formSin' });
    expect( formSin.exists() ).toBe(true);

    const form = wrapper.findComponent({ ref: 'form' });
    expect( form.exists() ).toBe(true);
  });

  it ('Verificando que al hacer submit existan el usuario y la contraseña ', async () => {
    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.find('.error--text').exists()).toBe(true);
  });
})