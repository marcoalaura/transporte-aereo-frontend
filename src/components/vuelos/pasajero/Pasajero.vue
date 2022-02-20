<template>
  <section>
    <h3 class="primary--text">
      <v-icon color="primary">flight</v-icon> Detalles del vuelo Nro.
      <span v-if="vuelo">{{ vuelo.itinerario_nro_vuelo }}</span>
    </h3>
    <v-card>
      <vuelo-detalle :id-vuelo="idVuelo"></vuelo-detalle>
      <v-card-text>
        <h3 class="primary--text"><v-icon color="primary">supervisor_account</v-icon> Lista de pasajeros</h3>
        <crud-table
          :headers="headers"
          :url="url"
          :filters="filters"
          :graphql="graphql"
          :data-graphql="dataGraphql"
          :widthModal="840"
          :show-filter="true"
        >
          <template slot="buttons">
            <v-tooltip bottom v-if="$store.state.permissions['pasajeros:create']">
              <v-btn
                color="primary"
                @click.native.stop="openModal()"
                slot="activator"
              ><v-icon>person_add</v-icon> {{$t('common.add') }}</v-btn>
              <span>Agregar nuevo pasajero</span>
            </v-tooltip>

            <v-tooltip bottom v-if="$store.state.permissions['pasajeros:create']">
              <v-btn color="primary"
                @click.native.stop="openModalImport()"
                slot="activator"
              ><v-icon>file_upload</v-icon> Importar</v-btn>
              <span>Importar pasajeros</span>
            </v-tooltip>

            <v-tooltip bottom>
              <v-btn slot="activator" @click="$router.push('/vuelos')"><v-icon>keyboard_arrow_left</v-icon> Volver</v-btn>
              <span>Volver al listado de vuelos</span>
            </v-tooltip>
          </template>

          <template slot="labels">
            <div class="text-xs-right" v-if="vuelo">
              <strong>ESTADO</strong>:
              <v-chip label :color="estados[vuelo.estado].bg" :text-color="estados[vuelo.estado].color">VUELO {{ vuelo.estado }}</v-chip>
            </div>
          </template>
	        <!-- el template aplica cambios al modal para agregar pasajeros/tripulante -->
          <template slot="form" slot-scope="props">
            <v-card-title class="headline">
              <v-icon>{{ form.id ? 'person' : 'person_add' }}</v-icon> {{ form.id ? 'Editar pasajero / tripulante' : 'Agregar pasajero / tripulante' }}
              <v-spacer></v-spacer>
              <v-btn icon @click.native="$store.commit('closeModal')">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-form
              @submit.prevent="save"
              v-model="valid"
              ref="form"
              lazy-validation>
              <v-card-text class="pt-0">
                <v-container grid-list-md class="pt-0">
                  <v-layout row wrap>
                    <v-flex xs5>
                      <v-radio-group
                      v-if="!form.id"
                        v-model="form.tipo"
                        required
                        :rules="$validate(['required'])"
                        class="required"
                        :disabled="!!form.id"
                        row>
                        <v-radio label="PASAJERO" value="PASAJERO"></v-radio>
                        <v-radio label="TRIPULANTE" value="TRIPULANTE" ></v-radio>
                      </v-radio-group>
                      <template v-else>
                        Tipo:
                        <v-chip
                          label
                          :color="form.tipo === 'PASAJERO' ? 'info' : 'success'"
                          class="white--text"
                        >
                          {{ form.tipo }}
                        </v-chip>
                      </template>
                    </v-flex>
                    <v-flex xs4 v-if="form.tipo === 'PASAJERO'">
                      <v-select
                        label="Tipo de viajero"
                        :items="tiposViajero"
                        v-model="form.tipo_viajero"
                        required
                        :rules="$validate(['required'])"
                        class="required"
                      ></v-select>
                    </v-flex>
                    <v-flex xs4 v-if="form.tipo === 'TRIPULANTE'">
                      <v-select
                        label="Tipo de tripulación"
                        :items="tiposTripulacion"
                        v-model="form.tipo_tripulacion"
                        required
                        :rules="$validate(['required'])"
                        class="required"
                      ></v-select>
                    </v-flex>
                    <v-flex xs3 v-if="form.tipo">
                      <v-autocomplete
                        label="Estado"
                        v-model="form.estado"
                        :items="form.tipo === 'TRIPULANTE' ? estadosPasajerosT : estadosPasajerosP"
                        :rules="$validate(['required'])"
                        class="required"
                        required
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <div v-if="form.tipo">
                    <div v-if="form.tipo === 'PASAJERO'">
                      <h4><small>DATOS DE VUELO</small></h4>
                      <v-layout row wrap>
                        <v-flex xs2>
                          <v-text-field
                            label="Nro. de asiento"
                            v-model="form.nro_asiento"
                            maxlength="10"
                            :rules="$validate(['required'])"
                            class="required"
                            required
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs5>
                          <v-text-field
                            label="Lugar de origen"
                            v-model="form.lugar_origen"
                            maxlength="150"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs5>
                          <v-text-field
                            label="Lugar de destino"
                            v-model="form.lugar_destino"
                            maxlength="150"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs4>
                          <v-text-field
                            label="Email"
                            v-model="form.email"
                            maxlength="100"
                            :rules="$validate(['email'])"
                            ></v-text-field>
                        </v-flex>
                        <v-flex xs4>
                          <select-date
                            label="Fecha de vencimiento documento"
                            model="form.fecha_vencimiento_doc"
                            :value="date1"
                            v-if="date1Show"
                            ></select-date>
                        </v-flex>
                        <v-flex xs4>
                          <v-text-field
                            label="Entidad emisora del documento"
                            v-model="form.entidad_emisora_doc"
                            maxlength="255"
                            ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <h4><small>DATOS PERSONALES</small></h4>
                      <persona-form store="pasajero/" v-if="personaDatos" :db="true"></persona-form>
                    </div>
                    <div v-if="form.tipo === 'TRIPULANTE'">
                      <h4>Datos del tripulante</h4>
                      <v-autocomplete
                        label="Buscar por Nro. licencia o nombre del piloto"
                        v-model="nroLicencia"
                        required
                        :rules="$validate(['required'])"
                        :cache-items="true"
                        :loading="loading"
                        :items="dgacPilotos"
                        item-value="value"
                        item-text="text"
                        class="uppercase required"
                        maxlength="20"
                        :search-input.sync="buscarPilotos"
                        >
                      </v-autocomplete>
                      <div v-if="tripulacion">
                        <v-layout row wrap>
                          <v-flex md2>
                            <v-text-field
                            label="Nro. licencia"
                            v-model="form.nro_licencia"
                            :rules="$validate(['required'])"
                            class="required"
                            required
                            :disabled="true"
                            maxlength="20"
                            ></v-text-field>
                          </v-flex>
                          <v-flex md6>
                            <v-text-field
                            label="Título"
                            v-model="form.titulo"
                            :rules="$validate(['required'])"
                            class="required"
                            required
                            :disabled="true"
                            maxlength="255"
                            ></v-text-field>
                          </v-flex>
                          <v-flex md4>
                            <select-date
                            label="Vigencia"
                            model="form.vigencia"
                            :disabled="true"
                            :value="date2"
                            v-if="date2Show"
                            :rules="$validate(['required'])"
                            class="required"
                            required
                            ></select-date>
                          </v-flex>
                          <v-flex md12 v-if="form.observacion">
                            <v-alert :value="true" color="warning" outline class="m-0">
                              <strong>Observación.-</strong> {{ form.observacion }}
                            </v-alert>
                          </v-flex>
                        </v-layout>
                        <h4>Datos personales</h4>
                        <persona-form store="pasajero/" v-if="personaDatos" :change="false" :db="true"></persona-form>
                      </div>
                    </div>
                  </div>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <small class="error--text text-required">* Los campos son obligatorios</small>
                <v-spacer></v-spacer>
                <v-btn @click.native="$store.commit('closeModal');"><v-icon>cancel</v-icon> {{$t('common.cancel') }}</v-btn>
                <v-btn color="primary" type="submit" :disabled="!valid"><v-icon>check</v-icon> {{$t('common.save') }}</v-btn>
              </v-card-actions>
            </v-form>
          </template>
	        <!-- Edicion -->
          <template slot="items" slot-scope="items">
            <td class="nowrap">
              <v-tooltip bottom v-if="$store.state.permissions['pasajeros:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="editItem(items.item.id, 'pasajero', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>
              <v-tooltip
                bottom
                v-if="$store.state.permissions['pasajeros:delete'] && username !== items.item.pasajero">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="deleteItem(items.item.id, 'pasajero')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar registro</span>
              </v-tooltip>
            </td>
            <td>
              <v-chip label color="info" small text-color="white" v-if="items.item.tipo == 'PASAJERO'">
                <small>
                  <strong>{{ items.item.tipo }}</strong> -
                  {{ items.item.tipo_viajero }}
                </small>
              </v-chip>
              <v-chip label color="warning" small text-color="white" v-if="items.item.tipo == 'TRIPULANTE'">
                <small>
                  <strong>{{ items.item.tipo }}</strong> -
                  {{ getTipoTripulacion(items.item.tipo_tripulacion) }}
                </small>
              </v-chip>
            </td>
            <td>{{ items.item.nro_asiento || '-' }}</td>
            <td>
              {{ items.item.persona_primer_apellido }} {{ items.item.persona_segundo_apellido }} {{ items.item.persona_nombres }} <br>
              <small>
                <em v-if="items.item.tipo === 'TRIPULANTE'"><strong>LICENCIA:</strong> {{ items.item.tripulacion_nro_licencia }}</em>
                <em v-else><strong>{{ items.item.persona_tipo_documento }}:</strong> {{ items.item.persona_nro_documento }}</em>
              </small>
            </td>
            <td>{{ items.item.email }}</td>
            <td class="obs">
              <v-chip
                label
                class="m-0"
                :color="estadosVerificacion[items.item.persona_estado_verificacion].bg"
                :text-color="estadosVerificacion[items.item.persona_estado_verificacion].color"
                small>
                <small>{{ estadosVerificacion[items.item.persona_estado_verificacion].text }}</small>
              </v-chip>
              <small v-if="items.item.persona_observacion"><br>- {{ items.item.persona_observacion }}</small>
              <small v-if="items.item.observacion"><br>- {{ items.item.observacion }}</small>
            </td>
            <td>
      	      <!-- chips para estados en lista de pasajeros -->
      	      <v-chip
          		  label
          		  :color="estadosPasajerosEstilos[items.item.estado].bg"
          		  :text-color="estadosPasajerosEstilos[items.item.estado].color"
              >
          		  {{ estadosPasajerosEstilos[items.item.estado].text }}
    	        </v-chip>
            </td>
          </template>
        </crud-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="$store.state.modal2" max-width="680">
      <importar :id-vuelo="idVuelo"></importar>
    </v-dialog>
  </section>
</template>

<script>
import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import Auth from '@/components/admin/auth/mixins/auth';
import validate from '@/common/mixins/validate';
import PersonaForm from '@/components/admin/persona/PersonaForm';
import VueloDetalle from '@/components/vuelos/vuelo/VueloDetalle';
import SelectDate from '@/common/util/SelectDate';
import layout from '@/common/layout/mixins/layout';
import Importar from './Importar';
import paises from '@/common/mixins/paises';

const estados = {
  PROGRAMADO: { color: 'white', bg: 'info' },
  REPROGRAMADO: { color: 'white', bg: 'warning' },
  CANCELADO: { color: 'white', bg: 'error' }
};

const tiposViajero = [
  { value: 'NACIONAL', text: 'NACIONAL' },
  { value: 'EXTRANJERO', text: 'EXTRANJERO' }
];

const tiposTripulacion = [
  { value: 'PILOTO', text: 'PILOTO' },
  { value: 'TRIPULANTE_DE_CABINA', text: 'TRIPULANTE DE CABINA' }
];

const estadosPasajeros = [
  { text: 'RESERVADO', value: 'RESERVADO' },
  { text: 'PAGADO', value: 'PAGADO' },
  { text: 'CHECKING', value: 'CHECKING' },
  { text: 'PRE EMBARQUE', value: 'PRE_EMBARQUE' },
  { text: 'A BORDO', value: 'A_BORDO' },
  { text: 'VUELO PERDIDO', value: 'VUELO_PERDIDO' },
  { text: 'CANCELADO', value: 'CANCELADO' },
  { text: 'ASIGNADO', value: 'ASIGNADO' }
];

const estadosPasajerosP = [
  { text: 'RESERVADO', value: 'RESERVADO' },
  { text: 'PAGADO', value: 'PAGADO' },
  { text: 'CHECKING', value: 'CHECKING' },
  { text: 'PRE EMBARQUE', value: 'PRE_EMBARQUE' },
  { text: 'A BORDO', value: 'A_BORDO' },
  { text: 'VUELO PERDIDO', value: 'VUELO_PERDIDO' },
  { text: 'CANCELADO', value: 'CANCELADO' }
];

const estadosPasajerosT = [
  { text: 'ASIGNADO', value: 'ASIGNADO' },
  { text: 'A BORDO', value: 'A_BORDO' }
];

const estadosPasajerosEstilos = {
  CHECKING: { text: 'CHECKING', color: 'white', bg: 'info' },
  PRE_EMBARQUE: { text: 'PRE EMBARQUE', color: 'white', bg: 'warning' },
  A_BORDO: { text: 'A BORDO', color: 'white', bg: 'success' },
  VUELO_PERDIDO: { text: 'VUELO PERDIDO', color: 'white', bg: 'error' },
  CANCELADO: { text: 'CANCELADO', color: 'white', bg: 'red' },
  PAGADO: { text: 'PAGADO', color: 'white', bg: 'info' },
  RESERVADO: { text: 'RESERVADO', color: 'black', bg: 'default' },
  ASIGNADO: { text: 'ASIGNADO', color: 'white', bg: 'warning' }
};

const estadosVerificacion = {
  VERIFICADO_SEGIP: { text: 'VERIFICADO EN SEGIP', color: 'white', bg: 'success' },
  OBSERVADO_SEGIP: { text: 'OBSERVADO EN SEGIP', color: 'white', bg: 'warning' },
  NO_EXISTE_SEGIP: { text: 'NO EXISTE EN SEGIP', color: 'white', bg: 'error' },
  POR_VERIFICAR: { text: 'POR VERIFICAR', color: 'black', bg: 'default' },
  VERIFICADO: { text: 'VERIFICADO', color: 'white', bg: 'success' }
};

export default {
  mixins: [ crud, validate, Auth, layout, paises ],
  created () {
    if (this.$route.params.id && this.$filter.isInteger(this.$route.params.id)) {
      this.idVuelo = parseInt(this.$route.params.id);
      setTimeout(() => (this.clickEvent('vuelos')), 500);
      this.filters[3].value = this.idVuelo;
    } else {
      this.$router.push('vuelos');
    }

    this.user = this.$storage.getUser();
    this.username = this.user.usuario;

    this.$bus.$on('setVuelo', vuelo => {
      this.vuelo = vuelo;
      this.$bus.$off('setVuelo');
    });
  },
  data () {
    return {
      estados,
      tiposViajero,
      tiposTripulacion,
      estadosPasajeros,
      estadosPasajerosP,
      estadosPasajerosT,
      estadosPasajerosEstilos,
      estadosVerificacion,
      buscarPilotos: null,
      nroLicencia: null,
      loading: false,
      dgacPilotos: [],
      date1: null,
      date1Show: true,
      date2: null,
      date2Show: true,
      personaDatos: false,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'pasajeros',
      tripulacion: null,
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: 'Tipo de pasajero', value: 'tipo' },
        { text: 'Nro. de asiento', value: 'nro_asiento' },
        { text: 'Datos del pasajero', value: 'nombre_completo' },
        { text: 'Email', value: 'email' },
        { text: 'Observación', value: 'observacion' },
        { text: 'Estado', value: 'estado' }
      ],
      dataGraphql: `
        id
        tipo_viajero
        tipo_tripulacion
        nro_asiento
        fecha_vencimiento_doc
        entidad_emisora_doc
        lugar_origen
        lugar_destino
        email
        observacion
        tipo
        estado
        id_persona
        id_tripulacion
        persona_nombres
        persona_primer_apellido
        persona_segundo_apellido
        persona_nombre_completo
        persona_tipo_documento
        persona_tipo_documento_otro
        persona_nro_documento
        persona_fecha_nacimiento
        persona_movil
        persona_nacionalidad
        persona_pais_nacimiento
        persona_genero
        persona_telefono
        persona_estado
        persona_observacion
        persona_estado_verificacion
        tripulacion_ciudad
        tripulacion_nro_licencia
        tripulacion_titulo
        tripulacion_vigencia
        tripulacion_estado
      `,
      form: {
        tipo: ''
      },
      filters: [
        {
          field: 'nombre_completo',
          label: this.$t('user.crud.fullname'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'email',
          label: this.$t('user.crud.email'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'estado',
          label: this.$t('user.crud.status'),
          type: 'select',
          typeG: 'EstadoPasajero',
          items: [{ value: '', text: 'TODOS' }].concat(estadosPasajeros)
        },
        {
          field: 'id_vuelo',
          type: 'hidden',
          typeG: 'Int'
        }
      ],
      hidePass: true,
      username: null,
      valid: true,
      vuelo: null
    };
  },
  methods: {
    getTipoTripulacion (tipo) {
      for (let i in tiposTripulacion) {
        if (tiposTripulacion[i].value === tipo) {
          return tiposTripulacion[i].text;
        }
      }
      return '';
    },
    openModal (data = {}) {
      this.$refs.form.reset();
      this.$store.commit('setDate', { 'form.fecha_vencimiento_doc': null });
      this.$store.commit('setDate', { 'form.fecha_nacimiento': null });
      if (data.id) {
        this.$nextTick(() => {
          console.log('data', JSON.parse(JSON.stringify(data)), data.id_tripulacion);
          this.form = {
            id: data.id,
            tipo: data.tipo,
            tipo_tripulacion: data.tipo_tripulacion,
            tipo_viajero: data.tipo_viajero,
            estado: data.estado,
            nro_asiento: data.nro_asiento,
            entidad_emisora_doc: data.entidad_emisora_doc,
            lugar_origen: data.lugar_origen,
            lugar_destino: data.lugar_destino,
            email: data.email,
            id_persona: data.id_persona
          };

          this.setPersona(data);

          if (data.fecha_vencimiento_doc) {
            this.date1Show = false;
            this.$nextTick(() => {
              this.date1 = this.$datetime.transform(data.fecha_vencimiento_doc);
              this.date1Show = true;
            });
          }

          if (data.id_tripulacion) {
            this.dgacPilotos = [{
              value: data.id_tripulacion,
              text: `${data.tripulacion_nro_licencia} - ${data.persona_nombres} ${data.persona_primer_apellido} ${data.persona_segundo_apellido}`
            }];
            this.nroLicencia = data.id_tripulacion;
            this.form.nro_licencia = data.tripulacion_nro_licencia;
            this.form.titulo = data.tripulacion_titulo;
            this.form.vigencia = data.tripulacion_vigencia;
            this.form.ciudad = data.tripulacion_ciudad;
            this.form.id_tripulacion = data.id_tripulacion;

            this.date2Show = false;
            this.$nextTick(() => {
              this.date2 = this.$datetime.transform(data.tripulacion_vigencia);
              this.date2Show = true;
            });
            setTimeout(() => {
              this.tripulacion = true;
            }, 500);
          }
        });
      } else {
        this.personaDatos = true;
        this.form = { id: null, tipo: '' };
        this.$store.commit('pasajero/cleanForm');
      }
      this.$store.commit('openModal');
    },
    openModalImport () {
      this.$store.commit('openModal', 2);
    },
    save () {
      if (this.$refs.form.validate()) {
        let form = {
          id: this.form.id,
          tipo: this.form.tipo,
          tipo_viajero: this.form.tipo_viajero,
          estado: this.form.estado,
          tipo_tripulacion: this.form.tipo_tripulacion,
          nro_asiento: this.form.nro_asiento,
          fecha_vencimiento_doc: this.$datetime.format2(this.$store.state.date['form.fecha_vencimiento_doc']),
          entidad_emisora_doc: this.form.entidad_emisora_doc,
          lugar_origen: this.form.lugar_origen,
          lugar_destino: this.form.lugar_destino,
          email: this.form.email,
          observacion: this.form.observacion,
          id_tripulacion: this.form.id_tripulacion,
          id_vuelo: this.idVuelo
        };
        let data = Object.assign({}, this.$store.state.pasajero.form, form);
        data.nombre_completo = data.nombres + ' ' + data.primer_apellido + ' ' + data.segundo_apellido;
        data.fecha_nacimiento = this.$datetime.format2(this.$store.state.date['form.fecha_nacimiento']);
        delete data.persona;
        if (this.$filter.empty(data.tipo_viajero)) {
          delete data.tipo_viajero;
        }
        if (this.$filter.empty(data.tipo_tripulacion)) {
          delete data.tipo_tripulacion;
        }
        if (data.id) {
          const id = data.id;
          delete data.id;
          delete data.contrasena;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $pasajero: EditPasajero!) {
                pasajeroEdit(id: $id, pasajero: $pasajero) {
                  id
                }
              }
            `,
            variables: {
              id,
              pasajero: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList();
              this.$message.success('Se actualizó el registro correctamente');
              this.$store.commit('pasajero/cleanForm');
            }
          });
        } else {
          delete data.id;
          console.log('save persona: ', JSON.stringify(data, null, 2));
          if (typeof data.id_persona === 'string' && data.id_persona.length === 0) {
            delete data.id_persona;
          }
          this.$service.graphql({
            query: `
              mutation add($pasajero: NewPasajero!) {
                pasajeroAdd(pasajero: $pasajero) {
                  id
                }
              }
            `,
            variables: {
              pasajero: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList();
              this.$message.success();
              this.$store.commit('pasajero/cleanForm');
            }
          });
        }
      }
    },
    cleanFormPasajero () {
      this.$store.commit('pasajero/setForm', {
        id: '',
        id_persona: '',
        tipo_documento: '',
        nro_documento: '',
        fecha_nacimiento: '',
        nombres: '',
        primer_apellido: '',
        segundo_apellido: '',
        nombre_completo: '',
        telefono: '',
        movil: '',
        nacionalidad: '',
        genero: '',
        persona: null
      });
      this.tripulacion = false;
      this.form.id_tripulacion = null;
      this.form.tipo_viajero = this.vuelo.itinerario_aeropuerto_salida_pais === 'BOLIVIA' ? 'NACIONAL' : 'EXTRANJERO';
    },
    setPersona (persona) {
      this.personaDatos = false;
      this.$nextTick(() => {
        this.personaDatos = true;
        this.$store.commit('pasajero/setForm', {
          id_persona: persona.id_persona,
          tipo_documento: persona.persona_tipo_documento,
          nro_documento: persona.persona_nro_documento,
          fecha_nacimiento: persona.persona_fecha_nacimiento,
          nombres: persona.persona_nombres,
          primer_apellido: persona.persona_primer_apellido,
          segundo_apellido: persona.persona_segundo_apellido,
          telefono: persona.persona_telefono,
          movil: persona.persona_movil,
          nacionalidad: this.buscarNacionalidad((persona.persona_nacionalidad + '').trim()),
          genero: persona.persona_genero,
          persona: {
            nombres: persona.persona_nombres,
            paterno: persona.persona_primer_apellido,
            materno: persona.persona_segundo_apellido,
            nombre_completo: persona.persona_nombres + ' ' + persona.persona_primer_apellido + ' ' + persona.persona_segundo_apellido
          }
        });
        if (persona.persona_fecha_nacimiento) {
          this.$store.commit('setDate', { 'form.fecha_nacimiento': this.$datetime.transform(persona.persona_fecha_nacimiento) });
        }
      });
    }
  },
  watch: {
    buscarPilotos (valor) {
      if (this.form.tipo !== 'TRIPULANTE') {
        return false;
      }

      if (this.$filter.empty(this.form.tipo_tripulacion)) {
        return this.$message.warning('Debe seleccionar primero el tipo de tripulación para la búsqueda');
      }

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
          variables: { search: valor, tipo: this.form.tipo_tripulacion }
        }).then(response => {
          this.loading = false;
          if (response) {
            let items = response.tripulaciones.rows;
            let tripulaciones = [];
            items.map(item => {
              tripulaciones.push({
                value: item.id,
                text: `${item.nro_licencia} - ${item.persona_nombres} ${item.persona_primer_apellido} ${item.persona_segundo_apellido}`
              });
            });
            this.dgacPilotos = tripulaciones;
          } else {
            this.dgacPilotos = [];
          }
        });
      }
    },
    'nroLicencia': function (newVal, oldVal) {
      // TODO: Comprobar aquí mediante el api o graphql que el tripulante es válido o no
      if (newVal && newVal !== oldVal) {
        this.$service.get('vuelo/tripulacion/verificarDatos/' + newVal + '/' + this.vuelo.id)
        .then(response => {
          if (response) {
            if (response.success || response.observacion) {
              this.form.observacion = response.observacion || '';
              this.$service.graphql({
                query: `
                  query get($id: Int!) {
                    tripulacion(id: $id) {
                      id
                      ciudad
                      nro_licencia
                      titulo
                      vigencia
                      estado
                      id_persona
                      persona_tipo_documento
                      persona_nro_documento
                      persona_fecha_nacimiento
                      persona_nombres
                      persona_primer_apellido
                      persona_segundo_apellido
                      persona_telefono
                      persona_movil
                      persona_nacionalidad
                      persona_genero
                    }
                  }
                `,
                variables: {
                  id: newVal
                }
              }).then(response => {
                this.tripulacion = true;
                const tripulacion = response.tripulacion;
                this.form.nro_licencia = tripulacion.nro_licencia;
                this.form.titulo = tripulacion.titulo;
                this.form.vigencia = tripulacion.vigencia;
                this.form.ciudad = tripulacion.ciudad;
                this.form.id_tripulacion = tripulacion.id;
                this.setPersona(tripulacion);
                this.date2Show = false;
                this.$nextTick(() => {
                  this.date2 = this.$datetime.transform(tripulacion.vigencia);
                  this.date2Show = true;
                });
                this.valid = true;
              });
            }
          } else {
            this.valid = false;
          }
        });
      }
    },
    'form.tipo': function (val) {
      if (val && !this.form.id) {
        this.cleanFormPasajero();
        this.form.tipo_tripulacion = '';
      }
    },
    'form.nroLicencia.id': function (val) {
      if (val && !this.form.id) {
        this.cleanFormPasajero();
        this.form.tipo_tripulacion = '';
      }
    },
    'form.tipo_tripulacion': function (val) {
      console.log('watch form.tipo_tripulacion:', val);
      if (val && !this.form.id) {
        this.cleanFormPasajero();
      }
    }
  },
  components: {
    CrudTable,
    PersonaForm,
    VueloDetalle,
    SelectDate,
    Importar
  }
};
</script>

<style lang="scss">
.obs {
  small {
    font-size: 90%;
    line-height: 1rem;
  }
}
</style>
