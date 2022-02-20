<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">person_pin</v-icon> {{$t('tripulacion.title')}}</h3>
    <v-card>
      <v-card-text>
        <crud-table
          :headers="headers"
          :url="url"
          :order="order"
          :filters="filters"
          :graphql="graphql"
          :data-graphql="dataGraphql"
          :width-modal="800"
        >
          <template slot="buttons">
            <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:create'] && $util.isRol('DGAC_ADMIN')">
              <v-btn color="primary"
                @click="openModal()"
                slot="activator"
              ><v-icon>add</v-icon> Agregar</v-btn>
              <span>Agregar nuevo tripulante Internacional</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:update'] && $util.isRol('DGAC_ADMIN', 'OPERADOR_AVION', 'OPERADOR_AVION_ADMIN')">
              <v-btn color="primary"
              @click="openModalAssign()"
              slot="activator"
              ><v-icon>add</v-icon> {{$t('tripulacion.assign') }}</v-btn>
              <span>{{$t('tripulacion.assign')}}</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:update'] && $util.isRol('SUPERADMIN')">
              <v-btn
                @click="sincronizar()"
                slot="activator"
                :disabled="sync"
                color="primary">
                <v-icon>sync</v-icon> Sincronizar pilotos
              </v-btn>
              <span>Sincronizar pilotos con la DGAC</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:update'] && $util.isRol('SUPERADMIN')">
              <v-btn
                @click="sincronizarTripulacion()"
                slot="activator"
                :disabled="sync"
                color="primary">
                <v-icon>sync</v-icon> Sincronizar tripulación de cabina
              </v-btn>
              <span>Sincronizar tripulación de cabina con la DGAC</span>
            </v-tooltip>
          </template>

          <template slot="form">
            <v-card-title class="headline">
              <v-icon>person_pin</v-icon> {{ form.id ? 'Editar tripulante' : 'Agregar tripulante Internacional' }}
              <v-spacer></v-spacer>
              <v-chip
                label
                v-if="form.id"
                :color="tiposTripulacion[form.tipo].bg"
                :text-color="tiposTripulacion[form.tipo].color">
                {{ tiposTripulacion[form.tipo].text }}
              </v-chip>
              <v-btn icon @click="$store.commit('closeModal')">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-form
              @submit.prevent="save"
              v-model="valid"
              ref="form"
              lazy-validation
              >
              <v-card-text class="pt-0">
                <v-container grid-list-md class="pt-0">
                  <v-layout row wrap v-if="!form.id">
                    <v-flex md4>
                      <v-select
                        label="Tipo de tripulante"
                        v-model="form.tipo_tripulacion"
                        :rules="$validate(['required'])"
                        required
                        class="required"
                        :items="tiposFiltro"
                      ></v-select>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex md2>
                      <v-text-field
                        label="Nro. licencia"
                        v-model="form.nro_licencia"
                        :rules="$validate(['required'])"
                        required
                        class="required"
                        :disabled="form.sincronizado"
                        maxlength="20"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md6>
                      <v-text-field
                        v-if="form.sincronizado"
                        label="Título"
                        v-model="form.titulo"
                        :rules="$validate(['required'])"
                        required
                        class="required"
                        :disabled="form.sincronizado"
                        maxlength="255"
                      ></v-text-field>
                      <v-select
                        v-else
                        label="Título"
                        v-model="form.titulo"
                        :rules="$validate(['required'])"
                        required
                        class="required"
                        :disabled="!form.tipo_tripulacion && form.sincronizado"
                        :items="form.tipo_tripulacion === 'PILOTO' ? titulosPiloto : titulosTripulante"
                      ></v-select>
                    </v-flex>
                    <v-flex md4>
                      <select-date
                        label="Vigencia"
                        model="form.vigencia"
                        :disabled="form.sincronizado"
                        :value="date1"
                        v-if="date1Show"
                        :rules="$validate(['required'])"
                        required
                        class="required"
                      ></select-date>
                    </v-flex>
                  </v-layout>
                  <persona-form store="tripulacion/" :change="internacional" :db="true" v-if="personaDatos"></persona-form>
                </v-container>
                <log-datos :data="logDatos" v-if="logDatos"></log-datos>
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
                  :disabled="!valid">
                  <v-icon dark>check</v-icon> {{$t('common.save') }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </template>

          <template slot="items" slot-scope="items">
            <td class="nowrap" v-if="$store.state.permissions['tripulaciones:update']">
              <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click="editItem(items.item.id, 'tripulacion', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:update']">
                <v-btn
                  v-if="items.item.operador_sigla !== null"
                  icon
                  slot="activator"
                  @click="unassign(items.item.id, items.item.operador_sigla)">
                  <v-icon color="red">assignment_return</v-icon>
                </v-btn>
                <span>Quitar Asignación</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom v-if="$store.state.permissions['tripulaciones:update']">
                <v-switch
                  v-model="items.item.active"
                  value="ACTIVE"
                  @change="changeActive(items.item, items.item.id, 'tripulacion', 'EditTripulacion', null, 'Update')"
                  hide-details
                  slot="activator"
                  color="success"></v-switch>
                <span>Activar/desactivar registro</span>
              </v-tooltip>
              <v-icon
                v-if="!$store.state.permissions['tripulaciones:update']"
                :color="items.item.active === 'ACTIVE' ? 'success' : 'error'">
                {{ items.item.active === 'ACTIVE' ? 'check' : 'close' }}
              </v-icon>
            </td>
            <td>
              <v-chip
                label
                small
                :color="tiposTripulacion[items.item.tipo].bg"
                :text-color="tiposTripulacion[items.item.tipo].color">
                {{ tiposTripulacion[items.item.tipo].text }}
              </v-chip>
            </td>
            <td v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
              {{ items.item.operador_sigla || 'Sin operador' }}
            </td>
            <td>{{ items.item.nro_licencia }}</td>
            <td>
              {{ items.item.persona_nombres }}
              {{ items.item.persona_primer_apellido }}
              {{ items.item.persona_segundo_apellido }} <br>
              <small>
                <em>
                  <strong>{{ items.item.persona_tipo_documento }}:</strong>
                  {{ items.item.persona_nro_documento }}
                </em>
              </small>
            </td>
            <td>{{ items.item.titulo }}</td>
            <td>{{ $datetime.format(items.item.vigencia) }}</td>
            <td>
              <v-chip
                label
                :color="estadosVerificacion[items.item.persona_estado_verificacion].bg"
                :text-color="estadosVerificacion[items.item.persona_estado_verificacion].color"
                small>
                <small>{{ estadosVerificacion[items.item.persona_estado_verificacion].text }}</small>
              </v-chip>
              {{ items.item.persona_observacion }}
            </td>
            <td>
              <v-chip label color="success" text-color="white" v-if="items.item.estado == 'ACTIVO'">
                {{ items.item.estado }}
              </v-chip>
              <v-chip label color="warning" text-color="white" v-if="items.item.estado == 'INACTIVO'">
                {{ items.item.estado }}
              </v-chip>
            </td>
          </template>
        </crud-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="$store.state.modal5" max-width="680" persistent>
      <tripulacion-asignar></tripulacion-asignar>
    </v-dialog>
  </section>
</template>
<script>

import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';
import SelectDate from '@/common/util/SelectDate';
import PersonaForm from '@/components/admin/persona/PersonaForm';
import TripulacionAsignar from './TripulacionAsignar';
import paises from '@/common/mixins/paises';
import LogDatos from '@/components/admin/usuario/LogDatos';

const tiposTripulacion = {
  PILOTO: {
    text: 'PILOTO',
    color: 'white',
    bg: 'info'
  },
  TRIPULANTE_DE_CABINA: {
    text: 'TRIPULANTE DE CABINA',
    color: 'white',
    bg: 'success'
  }
};

const tiposFiltro = [
  {
    value: 'PILOTO',
    text: 'PILOTO'
  },
  {
    value: 'TRIPULANTE_DE_CABINA',
    text: 'TRIPULANTE DE CABINA'
  }
];

const titulosPiloto = [
  'PILOTO COMERCIAL AVIÓN',
  'PILOTO TRANSPORTE LÍNEA AÉREA AVIÓN'
];

const titulosTripulante = [
  'TRIPULANTE DE CABINA'
];

const estadosVerificacion = {
  VERIFICADO_SEGIP: { text: 'VERIFICADO EN SEGIP', color: 'white', bg: 'success' },
  OBSERVADO_SEGIP: { text: 'OBSERVADO EN SEGIP', color: 'white', bg: 'warning' },
  NO_EXISTE_SEGIP: { text: 'NO EXISTE EN SEGIP', color: 'white', bg: 'error' },
  POR_VERIFICAR: { text: 'POR VERIFICAR', color: 'black', bg: 'default' },
  VERIFICADO: { text: 'VERIFICADO', color: 'white', bg: 'success' }
};

export default {
  mixins: [ crud, validate, operador, paises ],
  mounted () {
    this.headers = [
      { text: this.$t('common.actions'), sortable: false },
      { text: this.$t('common.active'), sortable: false },
      { text: 'Tipo de tripulación', value: 'tipo' },
      { text: 'Nro. de licencia', value: 'nro_licencia' },
      { text: 'Nombre completo', value: 'nombre_completo' },
      { text: 'Título', value: 'titulo' },
      { text: 'Vigencia', value: 'vigencia' },
      { text: 'Observación', value: 'observacion' },
      { text: 'Estado', value: 'estado' }
    ];

    this.filters = [
      {
        field: 'tipo',
        label: 'Tipo de tripulación',
        type: 'select',
        typeG: 'TipoTripulacion',
        items: [{ value: '', text: 'TODOS' }].concat(tiposFiltro)
      },
      {
        field: 'nro_licencia',
        label: 'Nro. de licencia',
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'estado',
        label: 'Estado',
        type: 'select',
        typeG: 'EstadoTripulacion',
        items: [
          { value: '', text: 'TODOS' },
          { value: 'ACTIVO', text: 'ACTIVO' },
          { value: 'INACTIVO', text: 'INACTIVO' }
        ]
      }
    ];

    if (!this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
      this.headers.splice(3, 0, { text: this.$t('solicitud.crud.id_operador'), value: 'id_operador' });
      this.filters.unshift({
        field: 'id_operador',
        label: this.$t('solicitud.crud.id_operador'),
        type: 'select',
        typeG: 'Int',
        items: []
      });
      this.getOperadores(0, 'operadores', true);
    }
    if (this.$util.isRol('FELCN_ADMIN', 'FELCN')) {
      this.headers.splice(0, 1);
    }
  },
  data () {
    return {
      logDatos: null,
      tiposFiltro,
      titulosPiloto,
      titulosTripulante,
      personaDatos: false,
      estadosVerificacion,
      tiposTripulacion,
      internacional: false,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'tripulaciones',
      headers: [],
      order: ['id', 'ASC'],
      date1: null,
      date1Show: true,
      date2: null,
      date2Show: true,
      form: {
        nro_licencia: '',
        titulo: '',
        vigencia: '',
        estado: '',
        estado_verificacion: '',
        observacion: ''
      },
      dataGraphql: `
        id
        nro_licencia
        titulo
        vigencia
        tipo
        estado
        sincronizado
        observacion
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
        persona_observacion
        persona_estado_verificacion
        operador_sigla
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      filters: [],
      valid: true,
      sync: false
    };
  },
  methods: {
    setPersona (persona) {
      this.personaDatos = false;
      this.$nextTick(() => {
        this.personaDatos = true;
        this.$store.commit('tripulacion/setForm', {
          id: persona.id,
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
            materno: persona.persona_segundo_apellido
          }
        });
        if (persona.persona_fecha_nacimiento) {
          this.$store.commit('setDate', { 'form.fecha_nacimiento': this.$datetime.transform(persona.persona_fecha_nacimiento) });
        }
      });
    },
    openModal (data = {}) {
      this.$refs.form.reset();
      this.$store.commit('setDate', { 'form.fecha_nacimiento': null });
      this.$store.commit('tripulacion/cleanForm');
      this.personaDatos = true;
      this.logDatos = null;
      if (data.id) {
        this.internacional = false;
        this.$nextTick(() => {
          this.logDatos = {
            _user_created: data._user_created,
            _user_updated: data._user_updated,
            _created_at: data._created_at,
            _updated_at: data._updated_at
          };
          this.form = data;
          this.setPersona(data);
          setTimeout(() => {
            this.date1Show = false;
            this.$nextTick(() => {
              this.date1 = this.$datetime.transform(data.vigencia);
              this.date1Show = true;
            });
          }, 500);
        });
      } else {
        this.internacional = true;
        this.form = {};
      }
      this.$store.commit('openModal');
    },
    openModalAssign () {
      this.$store.commit('openModal', 5);
    },
    unassign (idTripulacion, siglaOperador) {
      this.$confirm(`¿Quiere desvincularlo(a) de ${siglaOperador}?`, () => {
        let id = parseInt(idTripulacion);
        this.$service.graphql({
          query: `
            mutation unassign($id: Int!) {
              tripulacionUnassign(id: $id) {
                id
              }
            }
          `,
          variables: { id }
        }).then(response => {
          console.log(`Eliminar operador a ${id}`);
          this.updateList();
          this.$message.success('Se actualizó el registro correctamente');
        });
      });
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.$store.state.tripulacion.form);
        data.fecha_nacimiento = this.$datetime.format2(this.$store.state.date['form.fecha_nacimiento']);
        if (data.id) {
          console.log('Dato a actualizar::', data);
          let id = data.id;
          delete data.persona_tipo_documento;
          delete data.tipo_documento_otro;
          delete data.id;
          delete data.persona;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $tripulacion: EditTripulacion!) {
                tripulacionEdit(id: $id, tripulacion: $tripulacion) {
                  id
                }
              }
            `,
            variables: {
              id,
              tripulacion: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList();
              this.$message.success('Se actualizó el registro correctamente');
            }
          });
        } else {
          let tripulante = {
            nro_licencia: this.form.nro_licencia,
            titulo: this.form.titulo,
            vigencia: this.$datetime.format2(this.$store.state.date['form.vigencia']),
            nombres: data.nombres,
            primer_apellido: data.primer_apellido,
            segundo_apellido: data.segundo_apellido,
            nombre_completo: data.nombres + ' ' + data.primer_apellido + ' ' + data.segundo_apellido,
            tipo_documento: data.tipo_documento,
            tipo_documento_otro: data.tipo_documento_otro,
            nro_documento: data.nro_documento,
            fecha_nacimiento: data.fecha_nacimiento,
            movil: data.movil,
            nacionalidad: data.nacionalidad,
            pais_nacimiento: data.nacionalidad,
            genero: data.genero,
            telefono: data.telefono || 0,
            tipo: this.form.tipo_tripulacion,
            sincronizado: false
          };

          delete data.id;
          this.$service.graphql({
            query: `
              mutation addtr($tripulante: NewTripulacion!) {
                tripulacionAdd(tripulacion: $tripulante) {
                  id
                }
              }
            `,
            variables: {
              tripulante: tripulante
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.$message.success('Agregado con éxito');
              this.updateList();
            }
          });
        }
      };
    },
    sincronizar () {
      this.sync = true;
      this.$loading.show('Sincronizando pilotos con la DGAC. Espere por favor');
      this.$service.get('vuelo/tripulacion/sincronizar-pilotos')
      .then(response => {
        this.sync = false;
        if (response.nuevos) {
          const { total, nuevos } = response;
          let msg = `
            <p class="alert alert--outline success--text">
              <i aria-hidden="true" class="icon material-icons alert__icon">check_circle</i>
              <span>La sincronización se realizó correctamente.</span>
            </p>
            <table class="v-table">
              <tbody>
                <tr><td><strong>${nuevos.length}</strong> nueva(s) licencia(s) de piloto${nuevos.length !== 1 ? 's' : ''} agregado${nuevos.length !== 1 ? 's' : ''}${nuevos.length > 1 ? ': ' : ''}<strong>${nuevos.join(', ')}</strong>.</td></tr>
                <tr><td><strong>${total - nuevos.length}</strong> tripulante${total - nuevos.length !== 1 ? 's' : ''} actualizado${total - nuevos.length !== 1 ? 's' : ''}.</td></tr>
                <tr><td><strong>${total}</strong> piloto${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''} en total.</td></tr>
              </tbody>
            </table>`;
          this.$alert(msg);
          this.updateList();
        }
      });
    },
    sincronizarTripulacion () {
      this.sync = true;
      this.$loading.show('Sincronizando tripulación de cabina con la DGAC. Espere por favor');
      this.$service.get('vuelo/tripulacion/sincronizar-tripulantes')
      .then(response => {
        this.sync = false;
        if (response.nuevos) {
          const { total, nuevos } = response;
          let msg = `
            <p class="alert alert--outline success--text">
              <i aria-hidden="true" class="icon material-icons alert__icon">check_circle</i>
              <span>La sincronización se realizó correctamente.</span>
            </p>
            <table class="v-table">
              <tbody>
                <tr><td><strong>${nuevos.length}</strong> nueva(s) licencia(s) de tripulante${nuevos.length !== 1 ? 's' : ''} de cabina agregado${nuevos.length !== 1 ? 's' : ''}${nuevos.length > 1 ? ': ' : ''}<strong>${nuevos.join(', ')}</strong>.</td></tr>
                <tr><td><strong>${total - nuevos.length}</strong> tripulante${total - nuevos.length !== 1 ? 's' : ''} de cabina actualizado${total - nuevos.length !== 1 ? 's' : ''}.</td></tr>
                <tr><td><strong>${total}</strong> tripulante${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''} en total.</td></tr>
              </tbody>
            </table>`;
          this.$alert(msg);
          this.updateList();
        }
      });
    }
  },
  components: {
    CrudTable,
    SelectDate,
    PersonaForm,
    TripulacionAsignar,
    LogDatos
  }
};
</script>
