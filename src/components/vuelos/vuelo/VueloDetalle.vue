<template>
  <section>
    <v-alert v-if="item && showObs" :value="true" color="error" outline icon="warning" class="alert-error">
      <strong>OBSERVACIONES:</strong>
      <p v-if="item.itinerario_aeropuerto_salida_estado !== 'ACTIVO'">- El aeropuerto <strong>{{ item.itinerario_aeropuerto_salida_codigo_iata }}</strong> está INACTIVO</p>
      <p v-if="item.itinerario_aeropuerto_llegada_estado !== 'ACTIVO'">- El aeropuerto <strong>{{ item.itinerario_aeropuerto_llegada_codigo_iata }}</strong> está INACTIVO</p>
      <p v-if="item.itinerario_aeronave_estado !== 'ACTIVO'">
        <template v-if="item.itinerario_aeronave_estado === 'INACTIVO'">- La Aeronave <strong>{{ item.itinerario_aeronave_matricula }}</strong> está INACTIVA</template>
        <template v-else>- La Aeronave <strong>{{ item.itinerario_aeronave_matricula }}</strong> se encuentra en MANTENIMIENTO</template>
      </p>
    </v-alert>
    <v-container v-if="item" class="vuelo-detalle" :class="estados[item.estado].bg">
      <v-layout row wrap>
        <v-flex xs4>
          <div class="vuelo-lugar vuelo-left">
            <div>{{ item.itinerario_aeropuerto_salida_codigo_iata }} - {{ item.hora_etd }}</div>
            <v-tooltip bottom>
              <v-chip
                color="yellow darken-4"
                class="m-l-0"
                label
                slot="activator"
                small
                text-color="white"
                v-if="item.itinerario_aeropuerto_salida_estado !== 'ACTIVO'">
                <small>{{ item.itinerario_aeropuerto_salida_estado }}</small>
              </v-chip>
              <span>El aeropuerto está INACTIVO</span>
            </v-tooltip>
          </div>
          <div class="vuelo-icon-left">
            <v-icon class="vuelo-icon">flight_takeoff</v-icon>
          </div>
          <div>
            {{ item.itinerario_aeropuerto_salida_nombre }} <br>
            {{ item.itinerario_aeropuerto_salida_ciudad }} -
            {{ item.itinerario_aeropuerto_salida_pais }}
          </div>
        </v-flex>
        <v-flex xs4 class="text-xs-center">
          <div class="vuelo-lugar vuelo-center">
            <div>{{ item.itinerario_aeronave_matricula }}</div>
            <v-tooltip bottom>
              <v-chip
                :color="item.itinerario_aeronave_estado === 'INACTIVO'? 'yellow darken-4' : 'blue darken-3'"
                class="m-l-0"
                label
                small
                slot="activator"
                text-color="white"
                v-if="item.itinerario_aeronave_estado !== 'ACTIVO'">
                <small>{{ item.itinerario_aeronave_estado }}</small>
              </v-chip>
              <span>{{ item.itinerario_aeronave_estado === 'INACTIVO'? 'La Aeronave está INACTIVA' : 'La Aeronave se encuentra en MANTENIMIENTO' }}</span>
            </v-tooltip>
          </div>
          <div class="vuelo-icon-center">
            <v-icon class="vuelo-icon">flight</v-icon>
          </div>
          <div>
            <v-icon>date_range</v-icon>
            {{ $datetime.format(item.fecha_despegue) }}
            {{ item.fecha_despegue != item.fecha_aterrizaje ? ' al ' + $datetime.format(item.fecha_aterrizaje) : '' }} <br>
            <v-icon>access_time</v-icon>
            {{ $datetime.timeLiteral($datetime.diffTime(item.hora_etd, item.hora_eta) * 60) }}
          </div>
        </v-flex>
        <v-flex xs4 class="text-xs-right">
          <div class="vuelo-lugar vuelo-right">
            <div>{{ item.itinerario_aeropuerto_llegada_codigo_iata }} - {{ item.hora_eta }}</div>
            <v-tooltip bottom>
              <v-chip
                color="yellow darken-4"
                class="m-l-0"
                label
                slot="activator"
                small
                text-color="white"
                v-if="item.itinerario_aeropuerto_llegada_estado !== 'ACTIVO'">
                <small>{{ item.itinerario_aeropuerto_llegada_estado }}</small>
              </v-chip>
              <span>El aeropuerto está INACTIVO</span>
            </v-tooltip>
          </div>
          <div class="vuelo-icon-right">
            <v-icon class="vuelo-icon">flight_land</v-icon>
          </div>
          <div>
            {{ item.itinerario_aeropuerto_llegada_nombre }} <br>
            {{ item.itinerario_aeropuerto_llegada_ciudad }} -
            {{ item.itinerario_aeropuerto_llegada_pais }}
          </div>
        </v-flex>
      </v-layout>
    </v-container>
    <!-- Informacion de log con estilos -->
    <!-- <log-datos :data="logDatos" v-if="logDatos" :class="estados[item.estado].log"></log-datos> -->
    <!-- Informacion de log sin estilos -->
    <log-datos :data="logDatos" v-if="logDatos"></log-datos>
  </section>
</template>

<script>
import LogDatos from '@/components/admin/usuario/LogDatos';

const estados = {
  PROGRAMADO: { color: 'white', bg: 'info', log: 'info white--text' },
  REPROGRAMADO: { color: 'white', bg: 'warning', log: 'warning white--text' },
  CANCELADO: { color: 'white', bg: 'error', log: 'error white--text' }
};

export default {
  props: {
    idVuelo: {
      type: Number,
      default: -1
    },
    vuelo: {
      type: Object,
      default: null
    }
  },
  mounted () {
    if (this.vuelo && this.vuelo.id) {
      console.log('agregando vuelo', this.vuelo.estado);
      this.item = this.vuelo;
    } else {
      if (this.idVuelo > 0) {
        this.getVuelo(this.idVuelo);
      }
    }
  },
  data () {
    return {
      logDatos: null,
      item: null,
      estados,
      dataGraphqlVuelo: `
        id
        fecha_despegue
        hora_etd
        hora_despegue
        fecha_aterrizaje
        hora_eta
        hora_aterrizaje
        estado
        itinerario_nro_vuelo
        itinerario_dia_1
        itinerario_dia_2
        itinerario_dia_3
        itinerario_dia_4
        itinerario_dia_5
        itinerario_dia_6
        itinerario_dia_7
        itinerario_hora_despegue
        itinerario_hora_aterrizaje
        itinerario_aeronave_matricula
        itinerario_aeronave_estado
        itinerario_id_aeropuerto_salida
        itinerario_aeropuerto_salida_nombre
        itinerario_aeropuerto_salida_ciudad
        itinerario_aeropuerto_salida_pais
        itinerario_aeropuerto_salida_codigo_iata
        itinerario_aeropuerto_salida_estado
        itinerario_id_aeropuerto_llegada
        itinerario_aeropuerto_llegada_nombre
        itinerario_aeropuerto_llegada_ciudad
        itinerario_aeropuerto_llegada_pais
        itinerario_aeropuerto_llegada_codigo_iata
        itinerario_aeropuerto_llegada_estado
        _user_created
        _user_updated
        _created_at
        _updated_at
      `
    };
  },
  computed: {
    showObs () {
      return this.item && (this.item.itinerario_aeropuerto_salida_estado !== 'ACTIVO' || this.item.itinerario_aeropuerto_llegada_estado !== 'ACTIVO' || this.item.itinerario_aeronave_estado !== 'ACTIVO');
    }
  },
  methods: {
    init () {

    },
    getVuelo (id) {
      this.$service.graphql({
        query: `
          query($id: Int!) {
            vuelo(id: $id) {
              ${this.dataGraphqlVuelo}
            }
          }
        `,
        variables: {
          id
        }
      }).then((response) => {
        if (response.vuelo) {
          this.item = response.vuelo;
          this.logDatos = {
            _user_created: response.vuelo._user_created,
            _user_updated: response.vuelo._user_updated,
            _created_at: response.vuelo._created_at,
            _updated_at: response.vuelo._updated_at
          };
          this.$bus.$emit('setVuelo', this.item);
        }
      });
    }
  },
  components: {
    LogDatos
  }
};
</script>

<style lang="scss">
.alert-error, .vuelo-detalle .alert-error {
  margin: 0;
  padding: 8px 14px;

  p {
    margin-bottom: 0px;
  }

  .v-icon {
    color: inherit !important;
  }
}
.vuelo-detalle {
  color: white;
  margin: 0;
  width: 100%;
  max-width: 100%;

  .xs4 {
    padding-left: 0 !important;
    padding-right: 0 !important;

    &:first-child {
      padding-left: 15px !important;
    }
    &:last-child {
      padding-right: 15px !important;
    }
  }

  .v-icon {
    font-size: 1.4rem;
    color: white !important;
  }

  .vuelo-icon {
    font-size: 3.2rem;
    margin: 5px 0 10px;
  }

  .vuelo-icon-left {
    padding-left: 30px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      height: 0;
      left: 110px;
      right: 0;
      top: 28px;
      border-top: 3px solid white;
    }

    &::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      left: 90px;
      top: 20px;
      border: 3px solid white;
      border-radius: 50%;
    }
  }

  .vuelo-icon-right {
    padding-right: 30px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 110px;
      left: 0;
      top: 28px;
      height: 0;
      border-top: 3px solid white;
    }

    &::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      right: 90px;
      top: 20px;
      border: 3px solid white;
      border-radius: 50%;
    }
  }
  .vuelo-icon-center {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 28px;
      height: 0;
      border-top: 3px solid white;
      left: 0;
      width: calc(50% - 30px);
    }
    &::after {
      content: '';
      position: absolute;
      top: 28px;
      height: 0;
      border-top: 3px solid white;
      right: 0;
      width: calc(50% - 30px);
    }
  }

  .vuelo-lugar {
    font-size: 1.8rem;
    position: relative;

    .v-tooltip {
      position: absolute;
      top: -28px;
    }

    &.vuelo-left .v-tooltip {
      left: 0;
    }

    &.vuelo-right .v-tooltip {
      right: 0;
    }

    &.vuelo-center .v-tooltip {
      left: 0;
      right: 0;
    }
  }
}
</style>
