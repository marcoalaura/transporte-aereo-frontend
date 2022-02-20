<template>
  <v-card class="modal-solicitud">
    <v-card-title class="headline">
      <v-icon>add</v-icon> Agregar nueva solicitud
      <v-spacer></v-spacer>
      <v-btn icon
        @click="close">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-form
      @submit.prevent="crear"
      v-model="valid"
      ref="form"
      lazy-validation
      >
      <v-container grid-list-md class="pt-0">
        <v-layout row wrap>
          <v-flex>
            <v-alert outline color="info" icon="info" :value="true">
              Seleccione el rango de fechas de programación de su solicitud de itinerarios y complete los campos de la solicitud.
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
              :min="$datetime.now(false, 'SIN_FORMATO')"
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
      	      :max="fecha_fin_maxima"></v-date-picker>
          </v-flex>

          <v-flex md6 class="pl-4">
            <v-select
              :label="$t('solicitud.crud.id_operador')"
              v-model="form.id_operador"
              required
              :rules="$validate(['required'])"
              v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')"
              :items="operadores"
              item-value="value"
              item-text="text">
            </v-select>
            <!-- <v-text-field
              :label="$t('solicitud.crud.codigo')"
              v-model="form.codigo"
              :placeholder="`DGAC/ITI/XXX/${new Date().getFullYear()}`"
              maxlength="50"
            ></v-text-field>
            <v-textarea
              :label="$t('solicitud.crud.observacion')"
              v-model="form.observacion"
              maxlength="500"
            ></v-textarea> -->
          </v-flex>
          <!-- <v-flex md6 class="pl-4">
               <div class="mt-3">
               <v-checkbox
               label="Sin fecha final"
               v-model="sinFecha"
               ></v-checkbox>
               </div>
               </v-flex> -->
        </v-layout>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click.native="close">
          <v-icon>cancel</v-icon> {{$t('common.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          type="submit">
          <v-icon dark>keyboard_arrow_right</v-icon> Crear solicitud
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import validate from '@/common/mixins/validate';
import solicitud from './mixins/solicitud';
import operador from '@/components/itinerarios/operador/mixins/operador';

export default {
  mixins: [ validate, solicitud, operador ],
  data () {
    return {
      form: {},
      valid: true,
      operadores: [],
      fecha_fin_maxima: null
    };
  },
  mounted () {
    this.getOperadores(null, 'operadores', true);
    this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(this.$datetime.now(true), 365)), 'YYYY-MM-dd');
  },
  methods: {
    close () {
      this.form.fecha_inicio = null;
      this.form.fecha_fin = null;
      this.$store.commit('closeModal', 4);
    },
    crear () {
      if (this.$refs.form.validate()) {
        if (this.$filter.empty(this.form.fecha_inicio)) {
          this.$alert('Debe seleccionar la fecha de inicio');
        } else {
          if (this.$filter.empty(this.form.fecha_fin)) {
            this.$alert('Debe seleccionar la fecha de fin');
          } else {
            if (this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
              this.form.id_operador = this.$store.state.user.id_operador;
            }
            this.$service.graphql({
              query: `
                mutation add($solicitud: NewSolicitud) {
                  solicitudAdd (solicitud: $solicitud) {
                    id
                  }
                }
              `,
              variables: {
                solicitud: this.form
              }
            }).then(response => {
              if (response.solicitudAdd && response.solicitudAdd.id) {
                this.$message.success('¡La solicitud se creo correctamente!');
                this.$store.commit('closeModal', 4);
                this.$store.commit('setAction', { action: 'agregar', sleep: 1000 });
                this.$router.push(`/itinerario/${response.solicitudAdd.id}`);
              }
            });
          }
        }
      }
    }
  },
  watch: {
    'form.fecha_inicio': function (fechaInicio) {
      if (fechaInicio) {
        const ini = this.$datetime.transform(fechaInicio);
        if (ini) {
          this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(ini, 365)), 'YYYY-MM-dd');
        }
        const fin = this.$datetime.transform(this.form.fecha_fin);
        console.log('fechas', ini, fin);
        if (ini && fin && this.$datetime.daysBetweenTwoDates(ini, fin) > 365) {
          this.form.fecha_fin = this.fecha_fin_maxima;
        }
      }
    }
  }
};
</script>
