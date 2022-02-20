<template>
  <v-card>
    <v-card-title class="headline m-0">
      <div v-if="planVuelo.id">
        <v-icon>edit</v-icon> Editar Plan de Vuelo {{ planVuelo.id }}
      </div>
      <div v-else>
        <v-icon>add</v-icon> Nueva Solicitud Plan de Vuelo
      </div>
      <v-spacer></v-spacer>
      <v-chip color="success" label text-color="white" :disabled="true" v-if="planVuelo.id">
        {{ planVuelo.estado }}
      </v-chip>
      <v-btn icon
        @click="$store.commit('closeModal', 6)">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-form
      v-model="valid"
      ref="form"
      @submit="addPlanVuelo"
      lazy-validation>
      <v-alert :value="true" color="info" class="m-0">
        <v-container grid-list-md class="p-0">
          <v-layout row wrap>
            <v-flex md12>
              DESTINATARIOS:
              <v-chip small color="warning lighten-2" text-color="white">
                <strong>AASANA</strong>
              </v-chip>
              <v-chip small color="warning lighten-2" text-color="white">
                <strong>DIVISION DE TRÁFICO AÉREO</strong>
              </v-chip>
            </v-flex>
            <v-flex md6>
              OPERADOR:  <strong class="white--text">{{ planVuelo.operador_sigla }}</strong>
            </v-flex>
            {{ planVuelo.fecha_desde }}
            <v-flex md6>
              FECHA SOLICITUD: <strong class="white--text">{{ $datetime.dateLiteral(planVuelo.fecha_desde) }}</strong>
            </v-flex>
            <v-flex md7 v-if="!planVuelo.id">
              AEROPUERTOS DE SALIDA
              <v-chip
                v-for="value in planVuelo.aeropuertos"
                :key="value.id"
                color="warning"
                label
                small
                text-color="white">
                <strong> {{value.codigo_iata}}</strong>
              </v-chip>
            </v-flex>
            <v-flex md5>
              NÚMERO DE SERIE: <strong class="white--text">{{ planVuelo.nro_serie }}</strong>
            </v-flex>
          </v-layout>
        </v-container>
      </v-alert>
      <v-card-text>
        <v-container grid-list-md>
          <v-layout row wrap>
            <input type="hidden" v-model="planVuelo.aeropuertos">
            <v-flex v-if="!planVuelo.id">
              <v-alert outline color="info" icon="info" :value="true">
                <strong>Seleccione la fecha de vigencia límite del plan de vuelo</strong>
              </v-alert>
            </v-flex>
            <v-flex md6 class="text-xs-left date">
              <label>{{ $t('solicitud.crud.fecha_desde') }}</label>
              <v-date-picker
                :allowed-dates="() => false"
                v-model="planVuelo.fecha_desde"
                locale="es"
                event-color="warning"
                :first-day-of-week="1"
                :events="rango"
                :min="rangoFechasPermitidas.desde"
                :max="rangoFechasPermitidas.hasta"
                color="primary"></v-date-picker>
            </v-flex>
            <v-flex md6 class="text-xs-right date">
              <label>{{ $t('solicitud.crud.fecha_hasta') }}</label>
              <v-date-picker
                v-model="planVuelo.fecha_hasta"
                locale="es"
                event-color="warning"
                :first-day-of-week="1"
                :events="rango"
                :min="rangoFechasPermitidas.desde"
                :max="rangoFechasPermitidas.hasta"
                color="primary"></v-date-picker>
            </v-flex>
            <v-flex md12>
              <v-textarea
                label="Información Suplementaria"
                v-model="planVuelo.inf_suplementaria"
                required
                :rules="$validate(['required'])"
                class="required"
              ></v-textarea>
              <input type="hidden" v-model="planVuelo.id_solicitud_itinerario">
            </v-flex>
          </v-layout>
        </v-container>
        <log-datos :data="logDatos" v-if="logDatos"></log-datos>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click.native="close()">
          <v-icon>cancel</v-icon> Cancelar
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :disabled="!valid">
          <v-icon dark>keyboard_arrow_right</v-icon> {{planVuelo.id ? 'Editar Plan de Vuelo' : 'Crear plan de vuelo' }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
<script>
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';
import LogDatos from '@/components/admin/usuario/LogDatos';

const destinatarios = [
  'AASANA', 'DIVISIÓN DE TRÁFICO AÉREO'
];

export default {
  mixins: [ validate, operador ],
  props: {
    planVuelo: {
      type: Object
    },
    rangoFechasPermitidas: {
      type: Object
    },
    logDatos: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      idSolicitud: 0,
      loading: false,
      valid: true,
      destinatarios,
      codigoAeropuertos: [],
      aeropuertos: [],
      fecha_desde_minima: '',
      fecha_hasta_maxima: ''
    };
  },
  methods: {
    close () {
      this.$store.commit('closeModal', 6);
    },
    addPlanVuelo () {
      if (!this.$refs.form.validate()) {
        return false;
      }
      console.log('*******PV', JSON.stringify(this.planVuelo));
      let planSolicitud = {
        nro_serie: this.planVuelo.nro_serie,
        fecha_desde: this.planVuelo.fecha_desde,
        fecha_hasta: this.planVuelo.fecha_hasta,
        inf_suplementaria: this.planVuelo.inf_suplementaria,
        estado: this.planVuelo.estado,
        id_operador: this.planVuelo.id_operador,
        id_solicitud_itinerario: this.solicitudId
      };
      if (this.planVuelo.id) {
        console.log('ID EXISTENTE', this.planVuelo.id);
        // console.log(this.planVuelo);
        // console.log('QUE', this.planVuelo.inf_suplementaria);
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $planSolicitud: EditPlanSolicitud) {
              planSolicitudEdit(id: $id, planSolicitud: $planSolicitud) {
                id
              }
            }
          `,
          variables: {
            id: parseInt(this.planVuelo.id),
            planSolicitud: planSolicitud
          }
        }).then(response => {
          this.$message.success('Plan de Solicitud modficado');
          this.$store.commit('closeModal', 6);
          // this.updateList();
          this.$bus.$emit('actualizarTabla');
        });
      } else {
        planSolicitud.estado = 'CREADO';
        planSolicitud.id_solicitud_itinerario = this.planVuelo.id_solicitud_itinerario;

        this.$service.graphql({
          query: `
            mutation add($planSolicitud: NewPlanSolicitud) {
              planSolicitudAdd(planSolicitud: $planSolicitud) {
                id
                nro_serie
                fecha_desde
                fecha_hasta
                inf_suplementaria
                estado
                id_operador
                id_solicitud_itinerario
              }
            }
          `,
          variables: {
            planSolicitud: planSolicitud
          }
        }).then(response => {
          console.log('Plan de vuelo creado con éxito');
          console.log('CODIGOS_AEROPUERTOS', this.codigos);
          console.log('RESPONSE', response);
          console.log('AEROPUERTOS', this.planVuelo.aeropuertos);
          let airports = this.planVuelo.aeropuertos;
          for (let i in airports) {
            let aeropuertoSalida = {
              id_solicitud: response.planSolicitudAdd.id,
              id_aeropuerto: airports[i].id
            };
            this.$service.graphql({
              query: `
                mutation add($aeropuertoSalida: NewAeropuertoSalida!) {
                  aeropuertoSalidaAdd(aeropuertoSalida: $aeropuertoSalida) {
                    id_solicitud
                    id_aeropuerto
                  }
                }
              `,
              variables: {
                aeropuertoSalida: aeropuertoSalida
              }
            }).then(response => {
              this.$message.success('Aeropuertos de salida creados');
            });
          };
          this.$message.success('Plan de Vuelo creado');
          this.$store.commit('closeModal', 6);
          this.$router.push(`/planVuelo/${response.planSolicitudAdd.id}`);
          // setear los valores del formulario de nuevo
          this.planVuelo.inf_suplementaria = '';
          this.planVuelo.fecha_desde = '';
          this.planVuelo.fecha_hasta = '';
        });
      }
    }
  },
  computed: {
    rango () {
      let fechas = [];
      if (!this.planVuelo.fecha_desde) {
        // en caso de limpiar fecha inicio solamente
        this.fecha_hasta_maxima = this.$datetime.format(new Date(this.$datetime.addDays(new Date(), 365)), 'YYYY-MM-dd');
        this.fecha_desde_minima = this.$datetime.format(new Date(this.$datetime.addDays(new Date(), 1)), 'YYYY-MM-dd');
        console.log(new Date());
        console.log(this.fecha_desde_minima);
        this.planVuelo.fecha_desde = this.rangoFechasPermitidas.desde;
        // this.planVuelo.fecha_hasta = this.rangoFechasPermitidas.hasta;
      }
      if (this.planVuelo.fecha_desde && this.planVuelo.fecha_hasta) {
        const ini = new Date(this.planVuelo.fecha_desde);
        const fin = new Date(this.planVuelo.fecha_hasta);
        this.fecha_hasta_maxima = this.$datetime.format(new Date(this.$datetime.addDays(ini, 365)), 'YYYY-MM-dd');
        // controlando rango de fechas
        if (this.$datetime.daysBetweenTwoDates(ini, fin) > 365) {
          // this.planVuelo.fecha_hasta = this.fecha_hasta_maxima;
          this.$message.warning('No se permite planes de vuelo de más de 365 días.');
        }
        let max = this.$datetime.daysBetweenTwoDates(ini, fin);
        for (var i = 0; i <= max; i++) {
          const d = new Date(this.$datetime.addDays(ini, i));
          fechas.push(d.toISOString().substr(0, 10));
        }

        return fechas;
      }
      return null;
    }
  },
  components: {
    LogDatos
  }
};
</script>
<style lang="scss">
  .date {
    position: relative;

    label {
      position: absolute;
      z-index: 1;
      right: 24px;
      top: 13px;
      color: white;
      font-size: 1.2rem;
    }
  }

  .sin-fecha {
    padding-top: 30px !important;
    padding-left: 25px !important;
  }

  .vue-dropzone {
    text-align: center;
  }
</style>

