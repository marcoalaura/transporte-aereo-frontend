<template>
  <v-card>
    <v-card-title class="headline m-0">
      <v-icon>flight</v-icon>PLAN DE VUELO NO REGULAR {{ planVuelo.cod_plan_vuelo }}
      <v-spacer></v-spacer>
      <v-chip label color="info" disabled>
        <span class="white--text">{{ adaptarEstado(planVuelo.estado) }}</span>
      </v-chip>
      <v-btn icon @click="$store.commit('closeModal', 7); mostrar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <template v-if="pendientesAprobacion.length > 0 && adaptarEstado(planVuelo.estado) !== 'APROBADO' && adaptarEstado(planVuelo.estado) !== 'APROBADO_FELCN' && adaptarEstado(planVuelo.estado) !== 'RECHAZADO'">
        <v-alert color="warning" value="true" outline class="lista-pendientes mb-3">
         Para la aprobación del plan de vuelos se require el visto bueno de:
         <ul>
          <li v-for="item in pendientesAprobacion" :key="item.id">
            <strong>felcn{{ item.icao }}</strong>: {{ item.nombre }}
          </li>
        </ul>
      </v-alert>
      </template>

      <div class="plan-detalles">
        <v-container grid-list-md class="p-0 black--text">
          <v-layout row wrap>
            <v-flex md12>
              <strong class="primary--text">AERONAVE:</strong>
            </v-flex>
            <v-flex md4>
              <span>AERONAVE: </span>
              <strong>{{ planVuelo.identificacionaeronave }}</strong>
            </v-flex>
            <v-flex md4>
              <span>TIPO AERONAVE: </span>
              <strong>{{ planVuelo.tipoaeronave }}</strong>
            </v-flex>
            <v-flex md4>
              <span>CATEGORÍA ESTELA: </span>
              <!-- <strong>{{ planVuelo.codestela.codestela }} {{ planVuelo.codestela.detalle }}</strong> -->

            </v-flex>
            <v-flex md12 class="item-detalle-titulo"></v-flex>
            <v-flex md12>
              <strong class="primary--text">AERÓDROMO:</strong>
            </v-flex>
            <v-flex md4>
              <span>ARÓDROMO SALIDA: </span>
              <strong>{{ planVuelo.codaerodromo.detalle }}</strong>
            </v-flex>
            <v-flex md4>
              <span>HORA: </span>
              <strong>{{ planVuelo.hora }}</strong>
            </v-flex>
            <v-flex md4>
              <span>ARÓDROMO DESTINO: </span>
              <strong>{{ planVuelo.aerodromodestino }}</strong>
            </v-flex>
            <v-flex md12 class="item-detalle-titulo"></v-flex>
            <v-flex md12>
              <strong class="primary--text">CRUCERO:</strong>
            </v-flex>
            <v-flex md4>
              <span>VELOCIDAD DE CRUCERO: </span>
              <strong>{{ planVuelo.velocidadcrucero }}</strong>
            </v-flex>
            <v-flex md4>
              <span>NIVEL DE CRUCERO: </span>
              <strong>{{ planVuelo.nivel }}</strong>
            </v-flex>
            <v-flex md4>
              <span>RUTA DE CRUCERO: </span>
              <strong>{{ planVuelo.ruta }}</strong>
            </v-flex>
            <v-flex md12 class="item-detalle-titulo"></v-flex>
            <v-flex md12>
              <strong class="primary--text">DATOS GENERALES:</strong>
            </v-flex>

            <v-flex md6>
              <span>VÁLIDO DESDE: </span>
              <strong>{{ planVuelo.fecharegistro }}</strong>
            </v-flex>
            <v-flex md6>
              <span>OBSERVACIONES: </span>
              <strong>{{ planVuelo.observaciones === '' ? 'Sin observaciones' : planVuelo.observaciones }}</strong>
            </v-flex>
            <v-flex md6>
              <span>VOLUMEN REFERENCIAL: </span>
              <strong>{{ planVuelo.volumenreferencial }}</strong>
            </v-flex>
            <v-flex md6>
              <span>ESTADO: </span>
              <strong>{{ adaptarEstado(planVuelo.estado) }}</strong>
            </v-flex>
            <v-flex md12 class="item-detalle-titulo"></v-flex>
            <v-flex md12>
              <div>
                <v-btn
                color="info"
                  class="m-0"
                  @click="mostrarOcultar()"
                >
                  <v-icon>{{ mostrar ? 'visibility_off' : 'visibility' }}</v-icon> {{ mostrar ? 'Ocultar' : 'Ver' }} detalles
                </v-btn>
              </div>
            </v-flex>
            <v-layout row wrap v-if="mostrar" class="plan-mas-detalles">
              <v-flex md4
                      v-for="prop in listaProps" :key="Object.keys(prop)[0]"
                      v-if="camposExcluidos.indexOf(Object.keys(prop)[0])===-1"
              >
                <span class="uppercase">{{ Object.keys(prop)[0] }}:</span>
                <strong>{{ prop[Object.keys(prop)[0]] }}</strong>
              </v-flex>

              <v-flex md6 class="text-xs-center item-detalle-titulo"
                      v-if="planVuelo.fecha_actualizacion"
              >
                <span class="uppercase">fecha de aprobación/rechazo:</span>
                <strong>{{ planVuelo.fecha_actualizacion }}</strong>
              </v-flex>
              <v-flex md6 class="text-xs-center item-detalle-titulo"
                      v-if="planVuelo.actualizadoPor"
              >
                <span>POR: </span>
                <strong>{{ planVuelo.actualizadoPor }}</strong>
              </v-flex>
            </v-layout>

          </v-layout>
        </v-container>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        v-if="puedeAprobar && adaptarEstado(planVuelo.estado) !== 'APROBADO'
              && adaptarEstado(planVuelo.estado) !== 'APROBADO_FELCN'
              && adaptarEstado(planVuelo.estado) !== 'RECHAZADO'"
        @click="registrarFpl(planVuelo, 'APROBADO_FELCN')"
        color="primary"
      >
        <v-icon>done_all</v-icon> Aprobar Plan de Vuelo
      </v-btn>
      <v-btn
        v-if="puedeAprobar && adaptarEstado(planVuelo.estado) !== 'APROBADO'
              && adaptarEstado(planVuelo.estado) !== 'APROBADO_FELCN'
              && adaptarEstado(planVuelo.estado) !== 'RECHAZADO'"
        @click="registrarFpl(planVuelo, 'RECHAZADO')"
        color="error lighten-2"
      >
        <v-icon>error</v-icon>Rechazar Plan de Vuelo
      </v-btn>
      <v-btn @click="$store.commit('closeModal', 7); mostrar = false">
        <v-icon>cancel</v-icon>Cerrar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: {
    planVuelo: {
      type: Object,
      default: null
    },
    listaProps: {
      type: Array
    },
    camposExcluidos: {
      type: Array
    },
    pendientesAprobacion: {
      type: Array
    },
    puedeAprobar: {
      type: Boolean
    }
  },
  data () {
    return {
      mostrar: false
    };
  },
  methods: {
    registrarFpl (item, estado) {
      // registra el FPL en la BD y le cambia el estado
      let url = 'plan/planVueloNoRegular/guardar';
      item.estado = estado;
      this.$service.post(`${url}`, { fpl: item }).then(response => {
        this.$store.commit('closeModal', 7);
      });
    },
    adaptarEstado (estado) {
      if (estado.toUpperCase() === 'ACEPTADO') {
        return 'APROBADO';
      } else if (estado.toUpperCase() === 'REGISTRADO') {
        return 'CREADO';
      } else if (estado.toUpperCase() === 'RECHAZADO') {
        return 'RECHAZADO';
      }
      return estado.toUpperCase();
    },
    mostrarOcultar () {
      this.mostrar = !this.mostrar;
      return this.mostrar;
    }
  }
};
</script>
<style lang="scss">
@import '../../../assets/scss/_variables.scss';
.item-detalle-titulo {
  border-bottom: 1px solid $primary;
  margin-bottom: 6px;
}
.lista-pendientes {
  line-height: 1.7rem;
  ul {
    list-style-type: none;
    li {
      margin: -5px;
    }
  }
}
.plan-detalles {
  font-size: 1rem;

  .container.grid-list-md .layout .flex {
    padding: 2px 4px;
  }
}
.plan-mas-detalles {
  margin: 10px 3px !important;

  .uppercase {
    font-size: .85rem;
    margin-right: 5px;
  }
}
</style>

