<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">settings</v-icon> {{ $t('parametro.preferencias') }}</h3>
    <v-tabs
      v-model="active"
      class="tab-preferencias"
      color="info"
      dark
      slider-color="warning"
    >
      <v-tab
        key="parametros"
        href="#parametros"
        v-if="$store.state.permissions['parametros:read']"
        ripple>
        <v-icon>settings_applications</v-icon> {{ $t('parametro.title') }}
      </v-tab>
      <v-tab
        key="serviciosIop"
        href="#serviciosIop"
        v-if="$store.state.permissions['serviciosIop:read']"
        ripple>
        <v-icon>cloud_circle</v-icon> {{ $t('servicioIop.title') }}
      </v-tab>
      <v-tab
        key="serviciosMopsv"
        href="#serviciosMopsv"
        v-if="$store.state.permissions['serviciosMopsv:read']"
        ripple>
        <v-icon>cloud_circle</v-icon> Servicios MOPSV
      </v-tab>
      <v-tab
        key="roles"
        href="#roles"
        v-if="$store.state.permissions['roles:read']"
        ripple>
        <v-icon>person_outline</v-icon> {{ $t('rol.title') }}
      </v-tab>
      <v-tab-item
        key="parametros"
        id="parametros">
        <v-card flat>
          <parametro v-if="$store.state.permissions['parametros:read'] && active == 'parametros'"></parametro>
        </v-card>
      </v-tab-item>
      <v-tab-item
        key="serviciosIop"
        id="serviciosIop">
        <v-card flat>
          <servicio-iop v-if="$store.state.permissions['serviciosIop:read'] && active == 'serviciosIop'"></servicio-iop>
        </v-card>
      </v-tab-item>
      <v-tab-item
        key="serviciosMopsv"
        id="serviciosMopsv">
        <v-card flat>
          <servicio-mopsv v-if="$store.state.permissions['serviciosMopsv:read'] && active == 'serviciosMopsv'"></servicio-mopsv>
        </v-card>
      </v-tab-item>
      <v-tab-item
        key="roles"
        id="roles">
        <v-card flat>
          <rol v-if="$store.state.permissions['roles:read'] && active == 'roles'"></rol>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </section>
</template>

<script>
import Rol from './Rol';
import Parametro from './Parametro';
import ServicioIop from './ServicioIop';
import ServicioMopsv from './ServicioMopsv';

export default {
  data () {
    return {
      active: 'parametros'
    };
  },
  components: {
    Rol,
    Parametro,
    ServicioIop,
    ServicioMopsv
  },
  watch: {
    active: function (val) {
      console.log(val);
    }
  }
};
</script>

<style lang="scss">
  .tab-preferencias {
    .tabs__wrapper {
      margin: 0 !important;
    }
  }
</style>
