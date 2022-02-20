<template>
  <v-card>
    <v-card-title class="headline m-0">
      <v-icon>device_hub</v-icon> Conexiones de Itinerario
      <v-spacer></v-spacer>
      <v-tooltip bottom v-if="!formConexion">
        <v-btn
          slot="activator"
          color="success"
          @click="habilitarForm"><v-icon color="white">add</v-icon>Nueva Conexión</v-btn>
        <span>Asignar nueva conexión al itinerario</span>
      </v-tooltip>
      <v-btn icon
        @click="$store.commit('closeModal', 7)">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-alert :value="formConexion" color="secondary" class="m-0" outline>
      <v-form
        v-model="valid"
        @submit.prevent="asignarConexion"
        lazy-validation>
        <v-container grid-list-md class="p-0">
          <v-layout row wrap>
            <v-flex md12>
              <v-card color="grey lighten-5">
                <v-card-text class="pt-0">
                  <v-flex md12 d-flex>
                    <v-select
                      v-model="idItinerarioB"
                      :items="itinerariosPermitidos"
                      label="Itinerarios con conexiones disponibles"
                      :hint="(idItinerarioB) ? '' : 'Seleccione el destino con el cual desea realizar la conexión'"
                      persistent-hint
                    >
                      <template slot="selection" slot-scope="data">
                        <strong>{{ data.item.aeropuerto_llegada_codigo_iata }} - {{ data.item.aeropuerto_llegada_ciudad }} - {{ data.item.aeropuerto_llegada_pais }}</strong>
                      </template>
                      <template slot="item" slot-scope="data">
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Destino: <strong>{{ data.item.aeropuerto_llegada_codigo_iata }} - {{ data.item.aeropuerto_llegada_ciudad }} - {{ data.item.aeropuerto_llegada_pais }}</strong>
                          </v-list-tile-title>
                          <v-list-tile-sub-title>
                            Vuelo <strong>{{ data.item.nro_vuelo }}</strong>:: Despegue <strong>{{ data.item.hora_despegue }}</strong>  Aterrizaje <strong>{{ data.item.hora_aterrizaje }}</strong>
                          </v-list-tile-sub-title>
                        </v-list-tile-content>
                      </template>
                    </v-select>
                  </v-flex>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click.native="cancelarForm">
                    <v-icon>cancel</v-icon> Cancelar
                  </v-btn>
                  <v-btn
                    color="primary"
                    type="submit">
                    <v-icon>done</v-icon> Asignar Conexión
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-form>
    </v-alert>
    <v-card-text v-if="!formConexion">
      <v-data-table
        :headers="headers"
        :items="itinerariosDestino"
        :rowsPerPageText="$t('common.rowsPage')"
        noResultsText="No se encontraron registros que coincidan"
        noDataText="No hay resultados"
        :rowsPerPageItems="rowsPerPageItems"
        class="elevation-1">
        <template slot="items" slot-scope="items">
          <td>
            <v-tooltip bottom>
              <v-btn
                icon
                slot="activator"
                :disabled="false"
                @click.native="eliminarConexion(items.item)">
                <v-icon color="error">delete</v-icon>
              </v-btn>
              <span>Eliminar conexión</span>
            </v-tooltip>
          </td>
          <td>{{ items.item.nro_vuelo }}</td>
          <td>{{ items.item.hora_despegue }}</td>
          <td>{{ items.item.hora_aterrizaje }}</td>
          <td><v-icon>flight_takeoff</v-icon> {{ items.item.aeropuerto_salida }}</td>
          <td><v-icon>flight_land</v-icon>{{ items.item.aeropuerto_llegada }}</td>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions v-if="!formConexion">
      <v-spacer></v-spacer>
      <v-btn
        @click.native="close()">
        <v-icon>cancel</v-icon> Cerrar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';

export default {
  mixins: [ validate, operador ],
  props: {
    idItinerarioA: {
      type: Number
    },
    itinerariosDestino: {
      type: Array
    },
    itinerariosPermitidos: {
      type: Array
    }
  },
  data () {
    return {
      valid: true,
      idItinerarioB: '',
      formConexion: false,
      headers: [
        { text: 'Acciones', value: '', sortable: false },
        { text: 'N° Vuelo', value: 'nro_vuelo', sortable: false },
        { text: 'Hora Despegue', value: 'hora_despegue', sortable: false },
        { text: 'Hora Aterrizaje', value: 'hora_aterrizaje', sortable: false },
        { text: 'Aeropuerto Salida', value: 'aeropuerto_salida_iata', sortable: false },
        { text: 'Aeropuerto Llegada', value: 'aeropuerto_llegada_iata', sortable: false }
      ],
      rowsPerPageItems: [5, 10, 25]
    };
  },
  created () {
    console.log('Componente ConexionsAssign creado', this.idItinerarioA);
  },
  mounted () {
    console.log('Componente ConexionesAssiign montado', this.idItinerarioA);
  },
  methods: {
    close () {
      this.$store.commit('closeModal', 7);
      this.formConexion = false;
    },
    habilitarForm () {
      this.formConexion = !this.formConexion;
    },
    cancelarForm () {
      this.formConexion = false;
      this.idItinerarioB = '';
    },
    eliminarConexion (data) {
      this.$confirm(`¿Quiere eliminar la conexión ${data.id_conexion}?`, () => {
        this.$service.graphql({
          query: `
          mutation deleteConexion($id: Int!) {
            conexionDelete(id: $id) {
              deleted
            }
          }`,
          variables: { id: data.id_conexion }
        }).then(response => {
          if (response) {
            this.$message.success('¡Conexión eliminada correctamente!');
            this.$bus.$emit('actualizarItinerario');
          } else {
            this.$message.error('Error al borrar la conexión');
          }
        });
      });
    },
    asignarConexion () {
      if (this.idItinerarioB) {
        console.log(`Conexión creada de `, this.idItinerarioA, ' a ', parseInt(this.idItinerarioB));
        let newConexion = {};
        newConexion.id_itinerario_a = this.idItinerarioA;
        newConexion.id_itinerario_b = parseInt(this.idItinerarioB);
        this.$service.graphql({
          query: `
            mutation add($conexion: NewConexion!) {
              conexionAdd(conexion: $conexion) {
                id
                id_itinerario_a
                id_itinerario_b
              }
            }
          `,
          variables: {
            conexion: newConexion
          }
        }).then(response => {
          this.$message.success('Conexión asignada correctamente');
          this.$bus.$emit('actualizarItinerario');
          this.$nextTick(() => {
            this.formConexion = false;
            this.idItinerarioB = '';
          });
        });
      } else {
        this.$message.warning('¡Debe seleccionar una conexión!');
      }
    }
  }
};
</script>
