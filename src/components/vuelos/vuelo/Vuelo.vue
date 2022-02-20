<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">flight_takeoff</v-icon> Vuelos</h3>
      <v-card flat>
        <v-card-text>
          <div class="grid grid-column">
            <div>
              <v-select
                label="Operador aéreo"
                :items="operadores"
                item-value="value"
                item-text="text"
                v-model="operador"
                v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION', 'AASANA_TORRE_CONTROL')"
              ></v-select>
              <template v-if="operador">
                <v-alert :value="true" color="info" outline icon="info">
                  Seleccione una fecha del calendario
                </v-alert>
                <v-date-picker v-model="fecha" locale="es" no-title :first-day-of-week="1"></v-date-picker>
              </template>
            </div>
            <div v-if="operador">
              <div class="fecha-container">
                <div
                  class="fecha-item"
                  v-for="(item, index) in dias"
                  :key="index"
                  :class="{ 'active': index == 3}">
                  {{ item.diaSemana }}
                  <span class="fecha-dia">{{ item.mes }} <strong>{{ item.dia }}</strong></span>
                </div>
              </div>
              <crud-table
                :headers="headers"
                :url="url"
                :filters="filters"
                :showFilter="true"
                :graphql="graphql"
                :data-graphql="dataGraphql"
                :width-modal="680"
                :success-list="successList"
              >
                <template slot="form">
                  <v-card-title class="headline m-0">
                    <v-icon>flight_takeoff</v-icon> {{ isCancel ? 'Cancelar Vuelo' : 'Reprogramar vuelo' }}
                    <v-spacer></v-spacer>
                    <v-chip label color="info" text-color="white" v-if="form.estado == 'PROGRAMADO'">
                      {{ form.estado }}
                    </v-chip>
                    <v-chip label color="warning" text-color="white" v-if="form.estado == 'REPROGRAMADO'">
                      {{ form.estado }}
                    </v-chip>
                    <v-chip label color="error" text-color="white" v-if="form.estado == 'CANCELADO'">
                      {{ form.estado }}
                    </v-chip>
                    <v-btn icon @click.native="$store.commit('closeModal')">
                      <v-icon>close</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-form
                    @submit="update"
                    v-model="valid"
                    ref="form"
                    lazy-validation
                    class="vuelo-detalle"
                    >
                    <vuelo-detalle :vuelo="form" v-if="mostrarDetalle"></vuelo-detalle>
                    <v-card-text>
                      <v-container grid-list-md>
                        <v-layout row wrap>
                          <v-flex md7 v-if="!isCancel">
                            <v-menu
                              ref="menu1"
                              :close-on-content-click="false"
                              v-model="menu1"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              max-width="290px"
                              min-width="290px"
                            >
                              <v-text-field
                                slot="activator"
                                v-model="dateFormatted"
                                label="Fecha de despegue"
                                prepend-icon="event"
                                :rules="$validate(['required'])"
                                required
                                disabled
                                @blur="form.fecha_despegue = $datetime.parse($datetime.convert(dateFormatted))"
                              ></v-text-field>
                              <v-date-picker
                                v-model="form.fecha_despegue"
                                locale="es"
                                no-title
                                :readonly="true"
                                @input="menu1 = false">
                              </v-date-picker>
                            </v-menu>
                          </v-flex>
                          <v-flex md5 v-if="!isCancel">
                            <v-text-field
                              label="Hora de despegue"
                              v-model="form.hora_etd"
                              maxlength="5"
                              :rules="$validate(['required', 'time'])"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex md7 v-if="!isCancel">
                            <v-menu
                              ref="menu2"
                              :close-on-content-click="false"
                              v-model="menu2"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              max-width="290px"
                              min-width="290px"
                            >
                              <v-text-field
                                slot="activator"
                                v-model="dateFormatted2"
                                label="Fecha de aterrizaje"
                                prepend-icon="event"
                                :rules="$validate(['required'])"
                                required
                                disabled
                                @blur="form.fecha_aterrizaje = $datetime.parse($datetime.convert(dateFormatted2))"
                              ></v-text-field>
                              <v-date-picker
                                v-model="form.fecha_aterrizaje"
                                locale="es"
                                no-title
                                :readonly="true"
                                :min="form.fecha_despegue"
                                @input="menu2 = false">
                              </v-date-picker>
                            </v-menu>
                          </v-flex>
                          <v-flex md5 v-if="!isCancel">
                            <v-text-field
                              label="Hora de aterrizaje"
                              v-model="form.hora_eta"
                              maxlength="7"
                              :rules="$validate(['required', 'time-plus'])"
                              required
                            ></v-text-field>
                          </v-flex>
                          <v-flex md5>
                            <v-select
                              :label="isCancel ? 'Motivo cancelación' : 'Motivo reprogramación del vuelo'"
                              :items="motivos"
                              :rules="$validate(['required'])"
                              v-model="form.motivo"
                              required
                            ></v-select>
                          </v-flex>
                          <v-flex md7>
                            <v-textarea
                              :label="isCancel ? 'Descripción de la cancelación' : 'Descripción de la reprogramación del vuelo'"
                              v-model="form.descripcion"
                              :rules="$validate(['required'])"
                              required
                              maxlength="500"
                              counter
                            ></v-textarea>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <small class="error--text text-required">* Los campos son obligatorios</small>
                      <v-spacer></v-spacer>
                      <v-btn
                        @click="$store.commit('closeModal');">
                        <v-icon>cancel</v-icon> {{$t('common.cancel') }}
                      </v-btn>
                      <v-btn
                        color="primary"
                        type="submit"
                        :disabled="isCancel ? !valid : !valid || !cambiosEdicionVuelo()">
                        <v-icon>check</v-icon> {{$t('common.save') }}
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </template>

                <template slot="items" slot-scope="items">
                  <td class="nowrap">
                    <v-tooltip bottom v-if="$store.state.permissions['vuelos:update'] && !$util.isRol('AASANA_TORRE_CONTROL')">
                      <v-btn
                        icon
                        slot="activator"
                        @click.native="verPasajeros(items.item.id)">
                        <v-icon :color="items.item.nro_pasajeros ? 'info' : 'default'">
                          {{ items.item.nro_pasajeros ? 'group_add' : 'person_add' }}
                        </v-icon>
                      </v-btn>
                      <span>Ver pasajeros</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="$store.state.permissions['vuelos:update'] && !$util.isRol('AASANA_TORRE_CONTROL')">
                      <v-btn
                        icon
                        slot="activator"
                        :disabled="items.item.estado == 'CANCELADO'"
                        @click.native="editItem(items.item.id, 'vuelo', dataGraphql, isCancel = false)"                      >
                        <v-icon>edit</v-icon>
                      </v-btn>
                      <span>Reprogramar vuelo</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="$store.state.permissions['vuelos:update'] && !$util.isRol('AASANA_TORRE_CONTROL')">
                      <v-btn
                        icon
                        slot="activator"
                        :disabled="items.item.estado == 'CANCELADO'"
                        @click.native="editItem(items.item.id, 'vuelo', dataGraphql, isCancel = true)">
                        <v-icon color="error">cancel</v-icon>
                      </v-btn>
                      <span>Cancelar vuelo</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="$store.state.permissions['vuelos:update'] && $util.isRol('AASANA_TORRE_CONTROL')">
                      <v-btn
                        slot="activator"
                        small
                        :disabled="items.item.estado == 'CANCELADO' || items.item.hora_despegue != null"
                        @click.native="registrarDespegue(items.item.id)"
                        v-if="$store.state.user.id_aeropuerto === items.item.itinerario_id_aeropuerto_salida">
                        <v-icon color="success">flight_takeoff</v-icon> Despegue
                      </v-btn>
                      <span>Registrar despegue</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="$store.state.permissions['vuelos:update'] && $util.isRol('AASANA_TORRE_CONTROL')">
                      <v-btn
                        slot="activator"
                        small
                        :disabled="items.item.estado == 'CANCELADO' || items.item.hora_aterrizaje != null"
                        @click.native="registrarAterrizaje(items.item.id)"
                        v-if="$store.state.user.id_aeropuerto === items.item.itinerario_id_aeropuerto_llegada">
                        <v-icon color="warning">flight_land</v-icon> Aterrizaje
                      </v-btn>
                      <span>Registrar aterrizaje</span>
                    </v-tooltip>
                  </td>
                  <td>
                    <v-chip label small color="info" text-color="white" v-if="items.item.estado == 'PROGRAMADO'">
                      {{ items.item.estado }}
                    </v-chip>
                    <v-chip label small color="warning" text-color="white" v-if="items.item.estado == 'REPROGRAMADO'">
                      {{ items.item.estado }}
                    </v-chip>
                    <v-chip label small color="error" text-color="white" v-if="items.item.estado == 'CANCELADO'">
                      {{ items.item.estado }}
                    </v-chip>
                  </td>
                  <td>{{ items.item.itinerario_nro_vuelo }}</td>
                  <td><v-icon>flight_takeoff</v-icon>{{ items.item.itinerario_aeropuerto_salida_codigo_iata }}</td>
                  <td><v-icon>flight_land</v-icon>{{ items.item.itinerario_aeropuerto_llegada_codigo_iata }}</td>
                  <td>{{ items.item.operador_sigla }}</td>
                  <td>{{ items.item.itinerario_aeronave_matricula }}</td>
                  <td>{{ $datetime.format(items.item.fecha_despegue) }}</td>
                  <td class="text-xs-center">{{ items.item.hora_etd }}</td>
                  <td>
                    <span v-if="($util.isRol('OPERADOR_AVION', 'OPERADOR_AVION_ADMIN'))">
                      {{ items.item.puerta_salida_nro_puerta || 'Sin asignar' }}
                    </span>
                    <v-btn
                      v-if="$util.isRol('AASANA_ADMIN', 'AASANA', 'SABSA_ADMIN', 'SABSA')"
                      small
                      flat
                      @click="asignarPuerta('salida', items.item.id, items.item.itinerario_id_aeropuerto_salida, items.item.id_puerta_salida)"
                      slot="activator">
                      <v-icon v-if="items.item.id_puerta_salida === null">add</v-icon>{{ (items.item.id_puerta_salida === null) ? 'Agregar' : items.item.puerta_salida_nro_puerta }}
                    </v-btn>
                  </td>
                  <td class="success white--text text-xs-center" v-if="$util.isRol('AASANA_TORRE_CONTROL')">{{ items.item.hora_despegue }}</td>
                  <td>{{ $datetime.format(items.item.fecha_aterrizaje) }}</td>
                  <td class="text-xs-center">{{ items.item.hora_eta }}</td>
                  <td>
                    <span v-if="($util.isRol('OPERADOR_AVION', 'OPERADOR_AVION_ADMIN'))">
                      {{ items.item.puerta_llegada_nro_puerta || 'Sin asignar' }}
                    </span>
                    <v-btn
                      v-if="$util.isRol('AASANA_ADMIN', 'AASANA', 'SABSA_ADMIN', 'SABSA')"
                      small
                      flat
                      @click="asignarPuerta('llegada', items.item.id, items.item.itinerario_id_aeropuerto_llegada, items.item.id_puerta_llegada)"
                      slot="activator">
                      <v-icon v-if="items.item.id_puerta_llegada === null">add</v-icon>{{ (items.item.id_puerta_llegada === null) ? 'Agregar' : items.item.puerta_llegada_nro_puerta }}
                    </v-btn>
                  </td>
                  <td class="warning white--text text-xs-center" v-if="$util.isRol('AASANA_TORRE_CONTROL')">{{ items.item.hora_aterrizaje }}</td>
                  <td class="text-xs-right">{{ items.item.nro_pasajeros }}</td>
                </template>
              </crud-table>
            </div>
            <div v-else>
              <v-alert :value="true" color="info" outline icon="info">
                Seleccione un operador
              </v-alert>
            </div>
          </div>
        </v-card-text>
      </v-card>
    <v-dialog v-model="$store.state.modal8" max-width="300">
      <vuelo-puerta :tipo="tipo" :idVuelo="idVuelo" :idPuerta="idPuerta" :puertasAeropuerto="puertasAeropuertosUnique"></vuelo-puerta>
    </v-dialog>
  </section>
</template>
<script>

import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';
import VueloDetalle from '@/components/vuelos/vuelo/VueloDetalle';
import VueloPuerta from '@/components/vuelos/vuelo/VueloPuerta';

export default {
  mixins: [ crud, validate, operador ],
  mounted () {
    this.$store.commit('closeModal');
    let torre = this.$util.isRol('AASANA_TORRE_CONTROL');

    if (this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION', 'AASANA_TORRE_CONTROL')) {
      this.operador = torre ? '0' : this.$store.state.user.id_operador;
    } else {
      this.getOperadores(null, 'operadores');
    }
    this.$bus.$on('updateList', () => {
      this.updateList();
    });
    this.headers = [
      { text: 'Acciones', sortable: false },
      { text: 'Estado', value: 'estado' },
      { text: 'Nro. vuelo', value: 'nro_vuelo' },
      { text: 'Origen', value: 'origen' },
      { text: 'Destino', value: 'destino' },
      { text: 'Matrícula de vuelo', value: 'matricula' },
      { text: 'Fecha de despegue', value: 'fecha_despegue' },
      { text: torre ? 'Hora estimada de despegue' : 'Hora de despegue', value: 'hora_etd' },
      { text: 'Puerta de salida', sortable: false },
      { text: 'Fecha de aterrizaje', value: 'fecha_aterrizaje' },
      { text: torre ? 'Hora estimada de aterrizaje' : 'Hora de aterrizaje', value: 'hora_eta' },
      { text: 'Puerta de llegada', sortable: false },
      { text: 'Nro. Pasajeros', value: 'nro_pasajeros' }
    ];

    if (torre) {
      /* this.headers.splice(4, 0, { text: 'Operador', sortable: false }); */
      this.headers.splice(5, 0, { text: 'Operador', sortable: false });
      this.headers.splice(10, 0, { text: 'Hora real de despegue', value: 'hora_despegue' });
      this.headers.splice(14, 0, { text: 'Hora real de aterrizaje', value: 'hora_aterrizaje' });
    }
  },
  data () {
    return {
      active: 'vuelos',
      dropdown_edit: [
        { text: '100%' },
        { text: '75%' },
        { text: '50%' },
        { text: '25%' },
        { text: '0%' }
      ],
      puertasAeropuertosUnique: [],
      puertasAeropuertos: [],
      puertaId: 0,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'vuelos',
      operador: null,
      operadores: [],
      loading: false,
      mostrarDetalle: false,
      headers: [],
      form: {
        fecha_despegue: '',
        hora_etd: '',
        fecha_aterrizaje: '',
        hora_eta: '',
        estado: '',
        motivo: '',
        descripcion: ''
      },
      motivos: [
        { value: 'Problemas meteorológicos', text: 'Problemas meteorológicos' },
        { value: 'Conmociones sociales', text: 'Conmociones sociales' },
        { value: 'Actos de terrorismo o sabotaje', text: 'Actos de terrorismo o sabotaje' },
        { value: 'Accidentes en infraestructuras que interfieran las operaciones', text: 'Accidentes en infraestructuras que interfieran las operaciones' },
        { value: 'Restricciones', text: 'Restricciones' },
        { value: 'Contingencias técnicas', text: 'Contingencias técnicas' },
        { value: 'Otros', text: 'Otros' }
      ],
      dataGraphql: `
        id
        fecha_despegue
        hora_etd
        hora_despegue
        fecha_aterrizaje
        hora_eta
        hora_aterrizaje
        estado
        nro_pasajeros
        id_itinerario
        id_puerta_salida
        puerta_salida_nro_puerta
        id_puerta_llegada
        puerta_llegada_nro_puerta
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
        operador_sigla
      `,
      filters: [
        {
          field: 'id_operador',
          type: 'hidden',
          typeG: 'Int'
        },
        {
          field: 'fecha_despegue',
          type: 'hidden',
          typeG: 'String'
        },
        {
          field: 'estado',
          label: this.$t('user.crud.status'),
          type: 'select',
          typeG: 'EstadoVuelo',
          items: [
            { value: '', text: 'TODOS' },
            { value: 'PROGRAMADO', text: 'PROGRAMADO' },
            { value: 'REPROGRAMADO', text: 'REPROGRAMADO' },
            { value: 'CANCELADO', text: 'CANCELADO' }
          ]
        }
      ],
      vueloAnterior: {},
      valid: true,
      dias: [],
      fecha: this.$datetime.now(false, 'SIN_FORMATO'),
      dateFormatted: null,
      dateFormatted2: null,
      menu1: false,
      menu2: false,
      tipo: '',
      idVuelo: null,
      idPuerta: null,
      isCancel: false
    };
  },
  methods: {
    getDias (fecha) {
      let dias = [];
      let inicio = this.$datetime.subtractDays(fecha, 3);
      for (let i = 0; i < 7; i++) {
        let date = new Date(inicio);
        dias.push({
          diaSemana: this.$datetime.dayslong[date.getUTCDay()],
          dia: date.getUTCDate(),
          mes: this.$datetime.monthsShort[date.getUTCMonth()],
          fecha: date
        });
        inicio = this.$datetime.addDays(inicio, 1);
      }

      this.dias = dias;
    },
    successList () {
      this.loading = false;
    },
    seleccionarDia (fecha) {
      if (fecha) {
        this.loading = true;
        this.$loading.show('Cargando vuelos');
        this.filters[1].value = this.fecha;
        this.getDias(fecha);
        this.updateList();
      }
    },
    verPasajeros (id) {
      console.log('pasajeros', id);
      this.$router.push(`/vuelo/${id}`);
    },
    registrarDespegue (idVuelo) {
      this.$confirm('¿Está seguro de registrar la <strong>HORA DE DESPEGUE</strong> de la aeronave?', () => {
        this.$service.put('vuelo/aasana/despegue/' + idVuelo)
        .then(response => {
          if (response) {
            this.updateList();
            this.$message.success('Se ha registrado la hora de despegue correctamente.');
          }
        });
      });
    },
    registrarAterrizaje (idVuelo) {
      this.$confirm('¿Está seguro de registrar la <strong>HORA DE ATERRIZAJE</strong> de la aeronave?', () => {
        this.$service.put('vuelo/aasana/aterrizaje/' + idVuelo)
        .then(response => {
          if (response) {
            this.updateList();
            this.$message.success('Se ha registrado la hora de despegue correctamente.');
          }
        });
      });
    },
    reprogramacionPermitida (id) {
    },
    openModal (data = {}) {
      this.mostrarDetalle = false;
      this.$refs.form.reset();
      this.$nextTick(() => {
        this.form = data;
        this.vueloAnterior = Object.assign({}, data);
        this.$nextTick(() => {
          this.mostrarDetalle = true;
        });
        this.dateFormatted = this.$datetime.format(new Date(data.fecha_despegue));
        this.dateFormatted2 = this.$datetime.format(new Date(data.fecha_aterrizaje));
        this.$store.commit('openModal');
      });
    },
    cambiosEdicionVuelo () {
      if (this.form.hora_etd !== this.vueloAnterior.hora_etd ||
          this.form.hora_eta !== this.vueloAnterior.hora_eta) {
        return true;
      }
      return false;
    },
    update () {
      if (this.$refs.form.validate()) {
        if (this.$datetime.diff(this.$datetime.transform(this.form.fecha_aterrizaje), this.$datetime.transform(this.form.fecha_despegue)) < 0) {
          return this.$alert('La fecha de despegue tiene que ser menor a la fecha de aterrizaje');
        }
        if (this.$datetime.diffTime(this.form.hora_etd, this.form.hora_eta) <= 0) {
          return this.$message.warning(`La hora de despegue <strong><em>${this.form.hora_etd}</em></strong> tiene que ser menor a la hora de aterrizaje <strong><em>${this.form.hora_eta}</em></strong>`);
        }
        let message;
        let data = {
          fecha_despegue: this.$datetime.transform(this.form.fecha_despegue),
          fecha_aterrizaje: this.$datetime.transform(this.form.fecha_aterrizaje),
          hora_etd: this.form.hora_etd,
          hora_eta: this.form.hora_eta,
          motivo: this.form.motivo,
          descripcion: this.form.descripcion
        };
        if (this.isCancel) {
          data.estado = 'CANCELADO';
          message = '¡El vuelo ha sido cancelado!';
        } else {
          data.estado = 'REPROGRAMADO';
          message = '¡El vuelo ha sido reprogramado!';
        }
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $vuelo: EditVuelo!) {
              vueloEdit(id: $id, vuelo: $vuelo) {
               id
              }
            }
          `,
          variables: {
            id: this.form.id,
            vuelo: data
          }
        }).then(response => {
          if (response) {
            this.$store.commit('closeModal');
            this.updateList();
            this.$message.success(message);
          }
        });
      }
    },
    asignarPuerta (tipo, idVuelo, idAeropuertoSalida, idPuertaSalida) {
      this.tipo = tipo;
      this.idVuelo = parseInt(idVuelo);
      this.idPuerta = idPuertaSalida;
      this.$service.graphql({
        query: `
          query listaPuertas($id: Int!) {
            puertas (id_aeropuerto: $id) {
              count
              rows {
                id
                nro_puerta
                estado
                id_aeropuerto
              }
            }
          }
        `,
        variables: {
          id: idAeropuertoSalida
        }
      }).then(response => {
        let items = response.puertas.rows;
        let puertas = [];
        items.map(item => {
          if (item.estado === 'ACTIVO') {
            puertas.push({ value: item.id, text: item.nro_puerta });
          }
        });
        this.puertasAeropuertosUnique = puertas;
        this.$store.commit('openModal', 8);
      });
    }
  },
  watch: {
    'operador': function (val) {
      if (val) {
        this.filters[0].value = parseInt(val);
        this.seleccionarDia(this.$datetime.now(true));
      }
    },
    'fecha': function (newVal, oldVal) {
      console.log('fechas:', newVal, oldVal);
      if (newVal && !this.loading) {
        this.seleccionarDia(this.$datetime.transform(newVal));
      }
    },
    'form.fecha_despegue': function (val) {
      this.dateFormatted = this.$datetime.format(this.$datetime.transform(this.form.fecha_despegue));
    },
    'form.fecha_aterrizaje': function (val) {
      this.dateFormatted2 = this.$datetime.format(this.$datetime.transform(this.form.fecha_aterrizaje));
    }
  },
  components: {
    CrudTable,
    VueloDetalle,
    VueloPuerta
  }
};
</script>

<style lang="scss">
@import '../../../assets/scss/_variables.scss';

.grid {
  display: grid;
  grid-column-gap: 15px;

  &.grid-column {
    grid-template-columns: 290px 1fr;
  }

  // Hack para que overflow-x: auto funcione con GridCSS
  & > * {
    min-width: 0;
  }
}

.vuelo-detalle {
  p {
    margin-bottom: 7px;
    font-size: 1.1rem;

    span {
      font-size: .9rem;
      margin-left: 6px;
    }
  }
}

.fecha-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .fecha-item {
    background-color: $primary;
    width: 14%;
    margin: auto;
    color: #f2f2f2;
    padding: 15px 5px;
    text-align: center;
    font-size: .9rem;

    .fecha-dia {
      color: white;
      display: block;
      font-size: 1.4rem;

      strong {
        margin-left: 3px;
        font-size: 2rem;
        color: $warning;
      }
    }

    &:hover {
      background-color: darken($primary, 7%);
      // cursor: pointer;
    }

    &.active {
      background-color: $warning;

      .fecha-dia {
        strong {
          color: $primary;
        }
      }

      &:hover {
        cursor: default;
      }
    }
  }

}
</style>
