<template>
  <section>
  <v-card>
    <v-card-text>
    <v-icon color="primary">list_alt</v-icon>
    <label class="primary--text title">Buscar pasajero</label>
      <v-layout>
        <v-flex xs12 sm12 offset-sm0>
          <v-card>
            <p/>
            <v-card-actions>
                <v-select
                  :items="tipoParametroBusqueda"
                  v-model="tipoBusqueda"
                  label="Parámetro de búsqueda"
                ></v-select>
                <v-divider
                  class="mx-3"
                  inset
                  vertical
                ></v-divider>
                <v-text-field
                  label="Ingrese datos"
                  v-model="parametroBusqueda"
                  :rules="$validate(['required'])"
                  class="required"
                  required
                ></v-text-field>
                <v-divider
                  class="mx-3"
                  inset
                  vertical
                ></v-divider>

                <v-menu
                  :close-on-content-click="false"
                  v-model="menu2"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="fechaInicio"
                    label="Fecha inicio"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker v-model="fechaInicio" @input="menu2 = false"></v-date-picker>
                </v-menu>
                <v-divider
                  class="mx-3"
                  inset
                  vertical
                ></v-divider>
                <v-menu
                  :close-on-content-click="false"
                  v-model="menu3"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="fechaFin"
                    label="Fecha fin"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker v-model="fechaFin" @input="menu3 = false"></v-date-picker>
                </v-menu>
            </v-card-actions>
            <div class="text-xs-center">
              <v-btn 
                :disabled="parametroBusqueda === null"
                class="text-xs-right"
                v-on:click="buscarPasajero(parametroBusqueda, fechaInicio, fechaFin)"
                color="info"
              >
              <v-icon>search</v-icon> BUSCAR 
              </v-btn>
            </div>  
          </v-card>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>

  <v-card>
    <v-card-text>
      <p class="text-md-center" v-if="!this.arrPasajeros.length">
        No hay resultados para mostrar...
      </p>
      <v-data-table
        v-if="this.arrPasajeros.length"
        :headers="headers"
        :items="this.arrPasajeros"
        class="elevation-1"
      >
        <template slot="headerCell" slot-scope="props">
          <v-tooltip bottom>
            <span slot="activator">
              {{ props.header.text }}
            </span>
          </v-tooltip>
        </template>
        <template slot="items" slot-scope="props">
          <td class="text-uppercase">{{props.item.persona_nombres}}</td>
          <td class="text-uppercase">{{props.item.persona_primer_apellido}}</td>
          <td class="text-uppercase">{{props.item.persona_segundo_apellido}}</td>
          <td>{{props.item.persona_fecha_nacimiento}}</td>
          <td>{{props.item.persona_nro_documento}}</td>
          <td>{{props.item.persona_tipo_documento}}</td>
          <td>{{props.item.persona_nacionalidad}}</td>
          <td>{{props.item.vuelo_itinerario_nro_vuelo}}</td>
          <td>{{props.item.vuelo_operador_sigla}}</td>
          <td>{{props.item.vuelo_estado}}</td>
          <td>{{props.item.vuelo_fecha_despegue}} {{props.item.vuelo_hora_etd}}</td>
          <td>{{props.item.vuelo_fecha_aterrizaje}} {{props.item.vuelo_hora_eta}}</td>
          <td>{{props.item.vuelo_itinerario_aeropuerto_salida_ciudad}}</td>
          <td>{{props.item.vuelo_itinerario_aeropuerto_llegada_ciudad}}</td>
          <td>{{props.item.nro_asiento}}</td>
          <td>{{props.item.vuelo_itinerario_aeronave_matricula}}</td>
        </template>
      </v-data-table>
    </v-card-text>
    </v-card>
  </section>  
</template>

<script>
import Auth from '@/components/admin/auth/mixins/auth';
import validate from '@/common/mixins/validate';
import layout from '@/common/layout/mixins/layout';

const tipoParametroBusqueda = [
  { value: 'NRO_DOCUMENTO', text: 'NRO. DE DOCUMENTO' },
  { value: 'NOMBRES_APELLIDOS', text: 'NOMBRES Y APELLIDOS' }
];

export default {
  mixins: [validate, Auth, layout],
  created () {
  },
  data () {
    return {
      fechaInicio: null,
      fechaFin: null,
      tipoParametroBusqueda,
      tipoBusqueda: null,
      parametroBusqueda: null,
      arrPasajeros: [],
      pasajero: {},
      date: new Date().toISOString().substr(0, 10),
      modal: false,
      menu2: false,
      menu3: false,
      graphql: true,
      url: 'pasajerosConsulta',
      buscarPersonas: null,
      personaId: null,
      arrPersonas: [],
      loading: false,
      valid: false,
      headers: [
        {text: 'Nombres', value: 'nombres'},
        {text: 'Primer apellido', value: 'primer_apellido'},
        {text: 'Segundo apellido', value: 'segundo_apellido'},
        {text: 'Fecha nacimiento', value: 'fecha_nacimiento'},
        {text: 'Nro. Documento', value: 'nro_documento'},
        {text: 'Tipo Documento', value: 'tipo_documento'},
        {text: 'Nacionalidad', value: 'nacionalidad'},
        {text: 'Vuelo', value: 'vuelo'},
        {text: 'Operador', value: 'operador'},
        {text: 'Estado', value: 'estado'},
        {text: 'Fecha salida', value: 'fecha_salida'},
        {text: 'Fecha llegada', value: 'fecha_llegada'},
        {text: 'Origen', value: 'origen'},
        {text: 'Destino', value: 'destino'},
        {text: 'Asiento', value: 'asiento'},
        {text: 'Aeronave', value: 'aeronave'}
      ]
    };
  },
  mounted () {
    this.tipoBusqueda = this.tipoParametroBusqueda[0].value;
  },
  methods: {
    buscarPasajero (parametroBusqueda, fechaInicio, fechaFin) {
      if (this.tipoBusqueda === 'NRO_DOCUMENTO') {
        this.$service.graphql({
          query: `
            query consultar($nro_documento: String, $fecha_inicio: String, $fecha_fin: String) {
              pasajeros(nro_documento: $nro_documento, fecha_inicio: $fecha_inicio, fecha_fin: $fecha_fin) {
                count
                rows {
                  tipo_viajero
                  nro_asiento
                  estado
                  persona_nombres
                  persona_primer_apellido
                  persona_segundo_apellido
                  persona_tipo_documento
                  persona_nro_documento
                  persona_fecha_nacimiento
                  persona_nacionalidad
                  vuelo_fecha_despegue
                  vuelo_fecha_aterrizaje
                  vuelo_hora_etd
                  vuelo_hora_eta
                  vuelo_estado
                  vuelo_operador_sigla
                  vuelo_itinerario_nro_vuelo
                  vuelo_itinerario_aeropuerto_salida_ciudad
                  vuelo_itinerario_aeropuerto_llegada_ciudad
                  vuelo_itinerario_aeronave_matricula
                }
              }
            }
          `,
          variables: {
            nro_documento: this.parametroBusqueda,
            fecha_inicio: this.fechaInicio,
            fecha_fin: this.fechaFin
          }
        }).then(response => {
          if (response) {
            this.arrPasajeros = response.pasajeros.rows;
          }
        });
      } else if (this.tipoBusqueda === 'NOMBRES_APELLIDOS') {
        this.$service.graphql({
          query: `
            query consultar($nombre_completo: String, $fecha_inicio: String, $fecha_fin: String) {
              pasajeros(nombre_completo: $nombre_completo, fecha_inicio: $fecha_inicio, fecha_fin: $fecha_fin) {
                count
                rows {
                  tipo_viajero
                  nro_asiento
                  estado
                  persona_nombres
                  persona_primer_apellido
                  persona_segundo_apellido
                  persona_tipo_documento
                  persona_nro_documento
                  persona_fecha_nacimiento
                  persona_nacionalidad
                  vuelo_fecha_despegue
                  vuelo_fecha_aterrizaje
                  vuelo_hora_etd
                  vuelo_hora_eta
                  vuelo_estado
                  vuelo_operador_sigla
                  vuelo_itinerario_nro_vuelo
                  vuelo_itinerario_aeropuerto_salida_ciudad
                  vuelo_itinerario_aeropuerto_llegada_ciudad
                  vuelo_itinerario_aeronave_matricula
                }
              }
            }
          `,
          variables: {
            nombre_completo: this.parametroBusqueda,
            fecha_inicio: this.fechaInicio,
            fecha_fin: this.fechaFin
          }
        }).then(response => {
          if (response) {
            this.arrPasajeros = response.pasajeros.rows;
          }
        });
      } else {
        console.log('**** No hay parámetro de búsqueda');
      }
    }
  }
};
</script>