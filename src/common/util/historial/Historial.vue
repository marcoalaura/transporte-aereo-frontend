<template>
  <v-card>
    <v-card-title class="headline">
      <v-icon>timeline</v-icon> Historial de {{ tipo }}
      <v-spacer></v-spacer>
      <v-btn icon
        @click="close()">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="pt-0">
      <div class="historial-container">
        <v-alert
          v-if="historial.length === 0"
          :value="true"
          outline
          color="warning"
          icon="warning"
        >No tiene historial de Aprobaciones</v-alert>
        <template v-for="(item, index) in historial">
          <v-layout :key="item.id" v-if="item.accion" class="historial">
            <v-flex md6 v-if="(index % 2) === 0">
              <v-card class="black--text grey lighten-4">
                <v-card-text>
                  <h4 :class="estados[item.accion].colorText"><strong>{{ estados[item.accion].text }}</strong></h4>
                  <div><strong>En fecha: </strong>{{ mostrarSoloFecha(item.fecha) }} <strong> Hora: </strong> {{ mostrarSoloHora(item.fecha) }}</div>
                  <div><strong>Entidad: </strong>{{ item.entidad_sigla }}</div>
                  <div><strong>Usuario: </strong>{{ item.nombre_usuario }}</div>
                  <div><strong class="grey--text"><small>{{ (item.detalle + '').replace(/_/gi, ' ') }}</small></strong></div>
                </v-card-text>
                <v-avatar :color="estados[item.accion].avatarColor">
                  <v-icon dark>{{ estados[item.accion].icon }}</v-icon>
                </v-avatar>
              </v-card>
            </v-flex>
            <v-flex v-else md6 offset-md6>
              <v-card class="black--text grey lighten-4">
                <v-card-text>
                  <h4 :class="estados[item.accion].colorText"><strong>{{ estados[item.accion].text }}</strong></h4>
                  <div><strong>En fecha: </strong>{{ mostrarSoloFecha(item.fecha) }} <strong> Hora: </strong> {{ mostrarSoloHora(item.fecha) }}</div>
                  <div><strong>Entidad: </strong>{{ item.entidad_sigla }}</div>
                  <div><strong>Usuario: </strong>{{ item.nombre_usuario }}</div>
                  <div><strong class="grey--text"><small>{{ (item.detalle + '').replace(/_/gi, ' ') }}</small></strong></div>
                </v-card-text>
                <v-avatar :color="estados[item.accion].avatarColor">
                  <v-icon dark>{{ estados[item.accion].icon }}</v-icon>
                </v-avatar>
              </v-card>
            </v-flex>
          </v-layout>
        </template>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        @click.native="close()">
        <v-icon>cancel</v-icon> Cerrar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
const estados = {
  'APROBADO': { text: 'APROBADO', colorText: 'success--text', icon: 'done_all', avatarColor: 'success' },
  'RECHAZADO': { text: 'RECHAZADO', colorText: 'error--text', icon: 'cancel', avatarColor: 'error' },
  'SOLICITADO': { text: 'SOLICITADO', colorText: 'info--text', icon: 'send', avatarColor: 'info' },
  'PLAN_VUELO_CREADO': { text: 'PLAN VUELO CREADO', colorText: 'primary--text', icon: 'save', avatarColor: 'primary' },
  'PLAN_VUELO_APROBADO': { text: 'PLAN VUELO APROBADO', colorText: 'success--text', icon: 'done_all', avatarColor: 'success' },
  'OBSERVADO': { text: 'OBSERVADO', colorText: 'warning--text', icon: 'warning', avatarColor: 'warning' },
  'VISTO_BUENO_SABSA': { text: 'VISTO BUENO SABSA', colorText: 'success--text', icon: 'check', avatarColor: 'success' },
  'VISTO_BUENO_AASANA': { text: 'VISTO BUENO AASANA', colorText: 'success--text', icon: 'check', avatarColor: 'success' },
  'VISTO_BUENO_DGAC': { text: 'VISTO BUENO DGAC', colorText: 'success--text', icon: 'check', avatarColor: 'success' }
};

export default {
  props: {
    tipo: {
      type: String
    },
    historial: {
      type: Array
    }
  },
  data () {
    return {
      estados
    };
  },
  methods: {
    close () {
      this.$store.commit('closeModal', 8);
    },
    toggle () {
      console.log('Thing');
    },
    mostrarSoloFecha (date) {
      return this.$datetime.format(date, 'dd/MM/YYYY', false);
    },
    mostrarSoloHora (date) {
      return this.$datetime.format(date, 'HH:mm');
    }
  }
};
</script>
<style lang="scss">
  @import '../../../assets/scss/_variables.scss';
  .historial-container {
    margin: 0;

    .historial {
      & > .flex {
        padding-right: 19px;
        position: relative;

        &::after {
          position: absolute;
          content: '';
          border-right: 3px solid #ccc;
          top: 0;
          bottom: 0;
          right: -2px;
        }

        .v-card__text {
          padding-top: 12px;
          padding-bottom: 12px;
          line-height: 1.3rem;
          font-size: 1.1rem;

          h4 {
            font-size: 1.1rem;
            margin: 0 0 5px 0;
          }
        }

        .v-avatar {
          position: absolute;
          top: 50%;
          margin-top: -24px;
          right: -43px;
          border-radius: 50% !important;
          z-index: 1;
          border: 3px solid #ddd !important;
        }

        &.offset-md6 {
          padding-left: 20px;
          padding-right: 0;

          &::after {
            left: -1px;
            right: auto;
          }

          .v-avatar {
            right: auto;
            left: -44px;
          }
        }
      }
    }
  }
</style>



