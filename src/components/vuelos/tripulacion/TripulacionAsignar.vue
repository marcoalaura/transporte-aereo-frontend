<template>
  <v-card>
    <v-card-title class="headline">
      <v-icon>add</v-icon> {{$t('tripulacion.assign')}}
      <v-spacer></v-spacer>
      <v-btn icon @click.native="close()">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-form
      v-model="valid"
      ref="form"
      lazy-validation
      >
      <v-card-text class="pt-0">
        <v-container grid-list-md class="pt-0">
          <v-layout row wrap>
            <v-flex md12>
              <v-flex md12>
                <v-alert icon="info" color="info" :value="true" outline>
                  Seleccione el tipo de Tripulación que desea asignar <br>
                  Seleccione el Número de Identifcación del tripulante por asignar
                </v-alert>
              </v-flex>
              <v-flex md12 v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
                <v-autocomplete
                  label="Operador"
                  v-model="operador"
                  :items="operadores"
                  required
                  :rules="$validate(['required'])"
                  ></v-autocomplete>
              </v-flex>
              <v-flex md12>
                <v-autocomplete
                  label="Tipo de Tripulación"
                  v-model="tipo"
                  :items="tiposTripulacion"
                  required
                  :rules="$validate(['required'])"
                  ></v-autocomplete>
              </v-flex>
              <v-flex md12>
                <v-autocomplete
                  label="Buscar Nro(s) de Identificación"
                  v-model="tripulaciones"
                  required
                  :rules="$validate(['required'])"
                  :cache-items="false"
                  :loading="loading"
                  :items="dgacPilotos"
                  class="uppercase"
                  :search-input.sync="buscarTripulaciones"
                  multiple
                  chips
                >
                </v-autocomplete>
              </v-flex>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click.native="close()">
          <v-icon>cancel</v-icon> {{$t('common.cancel')}}
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!valid || loading2"
          :loading="loading2"
          @click.native="asignarTripulacion"
          type="submit">
          <v-icon dark>keyboard_arrow_right</v-icon> {{$t('tripulacion.assign')}}
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>
<script>
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';
import crud from '@/common/util/crud-table/mixins/crud-table';

const tiposTripulacion = [
  { value: 'PILOTO', text: 'PILOTO' },
  { value: 'TRIPULANTE_DE_CABINA', text: 'TRIPULANTE DE CABINA' }
];

export default {
  mixins: [ validate, operador, crud ],
  mounted () {
    if (this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
      this.operador = this.$store.state.user.id_operador;
    } else {
      this.getOperadores(null, 'operadores');
    }
  },
  data () {
    return {
      loading: false,
      loading2: false,
      valid: true,
      tipo: '',
      operador: '',
      operadores: [],
      tiposTripulacion,
      tripulaciones: [],
      dgacPilotos: [],
      buscarTripulaciones: null
    };
  },
  methods: {
    close () {
      this.$store.commit('closeModal', 5);
      this.tripulaciones = [];
      if (this.$util.isRol('DGAC_ADMIN')) {
        this.operador = '';
      }
      this.tipo = '';
      this.dgacPilotos = [];
    },
    asignarTripulacion () {
      if (this.$refs.form.validate()) {
        if (this.tripulaciones.length === 0) {
          return this.$message.warning('Debe seleccionar por lo menos una tripulación');
        }
        this.loading2 = true;
        this.$loading.show(`Asignando y verificando ${this.tipo}`);
        this.$service.post('vuelo/tripulacion/save-all', { tripulaciones: this.tripulaciones })
          .then(response => {
            this.loading2 = false;
            if (response) {
              this.close();
              this.updateList();
              this.$message.success('Tripulaciones Asignadas');
            }
          });
      }
    }
  },
  watch: {
    buscarTripulaciones (valor) {
      console.log('Tipo de Tripulacion a Asignar:: ', typeof this.tipo, this.tipo);
      if (!this.$filter.empty(valor)) {
        this.loading = true;
        this.$service.graphql({
          query: `
            query search($search: String, $tipo: TipoTripulacion) {
              tripulaciones(search: $search, tipo: $tipo, limit: 20) {
                count
                rows {
                  id
                  persona_nombres
                  persona_primer_apellido
                  persona_segundo_apellido
                  nro_licencia
                }
              }
            }
          `,
          variables: { search: valor, tipo: this.tipo }
        }).then(response => {
          this.loading = false;
          if (response) {
            let items = response.tripulaciones.rows;
            let tripulaciones = [];
            items.map(item => {
              tripulaciones.push({ value: item.id, text: `${item.nro_licencia} - ${item.persona_nombres} ${item.persona_primer_apellido} ${item.persona_segundo_apellido}` });
            });
            this.dgacPilotos = tripulaciones;
          } else {
            this.dgacPilotos = [];
          }
        });
      }
    },
    tipo (val) {
      this.tripulaciones = [];
      this.dgacPilotos = [];
    }
  }
};
</script>
