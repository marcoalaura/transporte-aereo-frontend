<template>
  <v-card>
    <v-form
      lazy-validation
      v-model="valid"
      @submit="actualizarDato">
      <v-card-title class="title">
        Asignar Puerta
      </v-card-title>
      <v-card-text class="pt-0">
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-select
              label="Puertas del Aeropuerto "
              v-model="idPuerta"
              :items="puertasAeropuerto"
              required
              @input="actualizarDato"
              :rules="$validate(['required'])"
            ></v-select>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-form>
  </v-card>
</template>

<script>
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';

export default {
  mixins: [ validate, operador ],
  props: {
    'idVuelo': {
      type: Number
    },
    tipo: {
      type: String
    },
    puertasAeropuerto: {
      type: Array
    }
  },
  data () {
    return {
      idPuerta: null,
      valid: true
    };
  },
  methods: {
    actualizarDato () {
      if (this.tipo === 'llegada') {
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $vuelo: EditVuelo!) {
              vueloEdit(id: $id, vuelo: $vuelo) {
                id
              }
            }
          `,
          variables: {
            id: this.idVuelo,
            vuelo: { id_puerta_llegada: this.idPuerta }
          }
        }).then(response => {
          if (response) {
            this.$message.success('¡Puerta de llegada asignada!');
            this.$store.commit('closeModal', 8);
            this.$bus.$emit('updateList');
          }
        });
      }
      if (this.tipo === 'salida') {
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $vuelo: EditVuelo!) {
              vueloEdit(id: $id, vuelo: $vuelo) {
                id
              }
            }
          `,
          variables: {
            id: this.idVuelo,
            vuelo: { id_puerta_salida: this.idPuerta }
          }
        }).then(response => {
          if (response) {
            this.$message.success('¡Puerta de llegada salida!');
            this.$store.commit('closeModal', 8);
            this.$bus.$emit('updateList');
          }
        });
      }
    }
  }
};
</script>
