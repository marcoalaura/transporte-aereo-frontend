<template>
  <section>
    <div class="login-container login-ciudadania">
      <!-- <div class="logo-app"></div> -->
      <div class="title-app">
        <h1>Sistema Único de Viajes</h1>
        <h2>Ministerio de Obras Públicas Servicios y Vivienda</h2>
      </div>
      <v-card class="login-form">
        <v-layout>
          <v-flex xs12>
            <v-card-title primary-title>
              <h4>Inicio de sesión con:</h4>
            </v-card-title>
            <v-card-actions>
              <v-btn
                color="success"
                block
                large
                type="button"
                @click="authenticate"
              >CIUDADANÍA DIGITAL</v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-card>
      <ul class="logos-app">
        <li class="oopp"><a href="#"><img src="../../../assets/images/logos/oopp.png" alt="OOPP"></a></li>
        <li class="dgac"><a href="#"><img src="../../../assets/images/logos/dgac.png" alt="DGAC"></a></li>
        <li class="sabsa"><a href="#"><img src="../../../assets/images/logos/sabsa.png" alt="SABSA"></a></li>
        <li class="aasana"><a href="#"><img src="../../../assets/images/logos/aasana.png" alt="AASANA"></a></li>
        <li class="boa"><a href="#"><img src="../../../assets/images/logos/boa.png" alt="BOA"></a></li>
        <li class="att"><a href="#"><img src="../../../assets/images/logos/att.png" alt="ATT"></a></li>
      </ul>
    </div>
    <div class="login-lang">
      <app-lang></app-lang>
    </div>
  </section>
</template>

<script>
import Auth from './mixins/auth';
import AppLang from '@/common/layout/AppLang';

export default {
  mixins: [ Auth ],
  methods: {
    authenticate () {
      this.getCode();
    }
  },
  components: { AppLang }
};
</script>

<style lang="scss">
@import './login.scss';
</style>
