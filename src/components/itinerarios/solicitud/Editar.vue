<template>
  <v-card class="modal-solicitud">
    <v-card-title class="headline">
      <v-icon>lock</v-icon> Editar solicitud N° {{ solicitud.id }} - {{ solicitud.operador_sigla }}
      <v-spacer></v-spacer>
      <v-btn icon @click.native="$store.commit('closeModal', 3)">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-form
      @submit.prevent="guardar"
      v-model="valid"
      ref="form2"
      lazy-validation>
      <v-card-text>
        <v-container class="pt-0">
          <v-layout row wrap>
            <v-flex md12>
              <v-alert outline color="info" icon="info" :value="true">
                Cambie el rango de fechas de programación de su solicitud de itinerarios.
              </v-alert>
            </v-flex>
            <v-flex md6 class="text-xs-left date">
              <label>{{ $t('solicitud.crud.fecha_inicio') }}</label>
              <v-date-picker
                v-model="form.fecha_inicio"
                locale="es"
                event-color="warning"
                :first-day-of-week="1"
                :events="rango"
                color="primary"></v-date-picker>
            </v-flex>
            <v-flex md6 class="text-xs-right date">
              <label>{{ $t('solicitud.crud.fecha_fin') }}</label>
              <v-date-picker
                v-model="form.fecha_fin"
                locale="es"
                event-color="warning"
                :first-day-of-week="1"
                        :events="rango"
                        :min="form.fecha_inicio"
                        :max="fecha_fin_maxima">
              </v-date-picker>
            </v-flex>
            <v-flex md6>
            </v-flex>
            <!-- <v-flex md6>
                 <div class="mt-3 ml-3">
                 <v-checkbox
                 label="Sin fecha final"
                 v-model="sinFecha"
                 ></v-checkbox>
                 </div>
                 </v-flex> -->
            <!-- <v-select
              :label="$t('solicitud.crud.id_operador')"
              v-model="form.id_operador"
              required
              :rules="$validate(['required'])"
              :items="operadores"
              item-value="value"
              item-text="text">
            </v-select> -->
          </v-layout>
        </v-container>
        <log-datos :data="logDatos" v-if="logDatos"></log-datos>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click.native="$store.commit('closeModal', 3)"><v-icon>cancel</v-icon> {{ $t('common.cancel') }}</v-btn>
        <v-btn color="primary" type="submit"><v-icon dark>check</v-icon> Guardar cambios</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import validate from '@/common/mixins/validate';
import LogDatos from '@/components/admin/usuario/LogDatos';

export default {
  mixins: [ validate ],
  props: {
    solicitud: {
      type: Object,
      default: null
    },
    logDatos: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      form: {
        id_operador: null,
        fecha_inicio: null,
        fecha_fin: null
      },
      fecha_fin_maxima: null,
      operadores: [],
      valid: true
    };
  },
  mounted () {
    if (this.solicitud) {
      this.operadores = this.solicitud.operadores;
      this.form.id_operador = this.solicitud.id_operador;
      this.form.fecha_inicio = this.solicitud.fecha_inicio;
      this.form.fecha_fin = this.solicitud.fecha_fin;
      this.form.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(this.solicitud.fecha_inicio, 365)), 'YYYY-MM-dd');
      if (this.solicitud.fecha_fin) {
        this.form.fecha_fin = this.solicitud.fecha_fin;
      } else {
        this.sinFecha = true;
      }
    }
  },
  methods: {
    guardar () {
      if (this.$refs.form2.validate()) {
        if (this.$filter.empty(this.form.fecha_inicio)) {
          this.$alert('Debe seleccionar la fecha de inicio');
        } else {
          if (this.$filter.empty(this.form.fecha_fin)) {
            this.$alert('Debe seleccionar la fecha de fin');
          } else {
            this.$service.graphql({
              query: `
                mutation edit($id: Int!, $solicitud: EditSolicitud!) {
                  solicitudEdit(id: $id, solicitud: $solicitud) {
                    id
                  }
                }
              `,
              variables: {
                id: this.solicitud.id,
                solicitud: {
                  fecha_inicio: this.form.fecha_inicio,
                  fecha_fin: this.form.fecha_fin
                }
              }
            }).then(response => {
              if (response) {
                this.$message.success('Solicitud actualizada');
                this.$store.commit('closeModal', 3);
                this.$bus.$emit('loadLista');
              }
            });
          }
        }
      }
    }
  },
  computed: {
    rango () {
      let fechas = [];

      if (this.form.fecha_inicio && this.form.fecha_fin) {
        const ini = this.$datetime.transform(this.form.fecha_inicio);
        const fin = this.$datetime.transform(this.form.fecha_fin);
        this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(ini, 365)), 'YYYY-MM-dd');
        // controlando rango de fechas
        if (this.$datetime.daysBetweenTwoDates(ini, fin) > 365) {
          this.form.fecha_fin = this.fecha_fin_maxima;
          this.$message.warning('No se permite itinerarios de más de 365 días.');
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
  watch: {
    'form.fecha_inicio': function (fechaInicio) {
      const ini = this.$datetime.transform(fechaInicio);
      const fin = this.$datetime.transform(this.form.fecha_fin);
      this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(ini, 365)), 'YYYY-MM-dd');
      if (this.$datetime.daysBetweenTwoDates(ini, fin) > 365) {
        this.form.fecha_fin = this.fecha_fin_maxima;
      }
    }
  },
  components: {
    LogDatos
  }
};
</script>
