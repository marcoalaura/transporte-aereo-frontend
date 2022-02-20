<template>
  <section>
    <h3 class="primary--text" v-if="planSolicitud"><v-icon>chrome_reader_mode</v-icon> Plan de Vuelo  Nro. {{ planSolicitud.id }}</h3>
    <!-- mensajes pendientes de aprobacion -->
    <v-card v-if="planSolicitud">
      <v-alert value="true" icon="info" color="info" v-if="pendientesAprobacion.length" outline>
        Para la aprobación del plan de vuelos se require el visto bueno de:
        <ol>
          <li v-for="item in pendientesAprobacion" :key="item.id">
            <strong>{{ item.nombre }}</strong>: {{ item.aeropuerto }}
          </li>
        </ol>
      </v-alert>
      <v-card-text>
        <!-- Eliminar false && cuando se resuelva el caso de planes individuales aprobados -->
        <crud-table
          :headers="headers"
          :url="url"
          :filters="filters"
          :order="order"
          :checkbox="false && !$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
          :graphql="graphql"
          :data-graphql="dataGraphql"
          :showFilter="false"
          :width-modal="480">
          <template slot="buttons">
            <v-tooltip bottom v-if="$util.isRol('FELCN_ADMIN', 'FELCN') && puedeAprobar && (planSolicitud.estado === 'SOLICITADO' || planSolicitud.estado === 'APROBADO_FELCN')">
              <v-btn
                slot="activator"
                @click="aprobar"
                color="primary">
                <v-icon>done_all</v-icon> Aprobar Plan De Vuelo</v-btn>
              <span>Validar Plan de Vuelo</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$util.isRol('FELCN_ADMIN', 'FELCN') && puedeAprobar && (planSolicitud.estado === 'SOLICITADO'  || planSolicitud.estado === 'APROBADO_FELCN')">
              <v-btn
                slot="activator"
                @click="rechazar"
                color="error lighten-2">
                <v-icon>error</v-icon>Rechazar Plan De Vuelo</v-btn>
              <span>Rechazar Plan de Vuelo</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$util.isRol('AASANA_ADMIN', 'AASANA') && planSolicitud.estado === 'APROBADO_FELCN' && pendientesAprobacion.length === 1 && pendientesAprobacion[0].nombre === 'AASANA'">
              <v-btn
                slot="activator"
                @click="aprobar"
                color="primary">
                <v-icon>done_all</v-icon> Aprobar Plan De Vuelo</v-btn>
              <span>Validar Plan de Vuelo</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$util.isRol('AASANA_ADMIN', 'AASANA') && planSolicitud.estado === 'APROBADO_FELCN' && pendientesAprobacion[0].nombre === 'AASANA'">
              <v-btn
                slot="activator"
                @click="rechazar"
                color="error lighten-2">
                <v-icon>error</v-icon>Rechazar Plan De Vuelo</v-btn>
              <span>Rechazar Plan de Vuelo</span>
            </v-tooltip>
            <v-tooltip bottom v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')">
              <v-btn
                slot="activator"
                @click="solicitar"
                color="primary">
                <v-icon>done_all</v-icon> Solicitar todo</v-btn>
              <span>Solicitar Plan de Vuelo</span>
            </v-tooltip>
            <!-- Revisar el caso de solicitar planes de vuelo seleccionados
                  que pasa con los que que no se incluyen ?????
            -->
            <!-- <v-tooltip bottom v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')">
                  <v-btn
                  slot="activator"
                  color="success"
                  @click="solicitarSeleccionado">
                  <v-icon>check</v-icon> Solicitar
                  </v-btn>
                  <span v-if="$store.state.selected && $store.state.selected.length === 0">Debe seleccionar al menos un plan de vuelo para solicitarlo</span>
                  <span v-else>Solicitar Planes de Vuelo seleccionados</span>
                  </v-tooltip> -->
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                @click="historial(planSolicitud)">
                <v-icon>timeline</v-icon>Ver Historial
              </v-btn>
              <span>Ver historial de Plan de Vuelo</span>
            </v-tooltip>
            <v-tooltip bottom>
              <v-btn slot="activator" @click="$router.push('/planSolicitudes')"><v-icon>keyboard_arrow_left</v-icon> Volver</v-btn>
              <span>Volver a la lista de solicitudes</span>
            </v-tooltip>
          </template>
          <template slot="labels">
            <div class="plan-vuelo-detalle">
              <h3><strong class="info--text">{{ planSolicitud.operador_razon_social }}</strong></h3>
              <p>VIGENTE A PARTIR DEL <strong>{{ ($datetime.dateLiteral(planSolicitud.fecha_desde)).toUpperCase() }}</strong>
                AL <strong>{{ ($datetime.dateLiteral(planSolicitud.fecha_hasta)).toUpperCase() }}</strong> </p>
              <p>
                <strong>ESTADO:</strong> <v-chip small label :color="estados[planSolicitud.estado].bg" :text-color="estados[planSolicitud.estado].color">{{ planSolicitud.estado }}</v-chip>
                <strong>NRO SERIE: </strong> {{ planSolicitud.nro_serie }}
              </p>
              <p v-if="planSolicitud.inf_suplementaria"><strong>INF. SUPLEMENTARIA: </strong> {{ planSolicitud.inf_suplementaria }}</p>
              <v-chip
                v-if="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
                label
                outline
                color="info">
                <v-icon>info</v-icon> La información se guardará automáticamente
              </v-chip>
            </div>
          </template>
          <template slot="form">
            <v-card-title class="headline m-0">
              <v-icon>add</v-icon>Agregar {{ formAeronave.label }}
              <v-spacer></v-spacer>
              <v-btn icon @click="$store.commit('closeModal')">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-form
              ref="formAeronave"
              lazy-validation
              v-model="valid"
              @submit="actualizarDato"
            >
              <v-card-text class="pt-0">
                <v-alert :value="true" color="info" class="m-0">
                  AERONAVE: <strong> {{formAeronave.aeronave}}</strong>
                </v-alert>
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-select
                      v-if="formAeronave.field === 'categoria_estela'"
                      :label="formAeronave.label"
                      v-model="formAeronave.value"
                      :items="categoriasEstela"
                      required
                      maxlength="formAeronave.maxlength"
                      :rules="$validate(['required'])"
                    ></v-select>
                    <v-text-field
                      v-else
                      :label="formAeronave.label"
                      v-model="formAeronave.value"
                      required
                      maxlength="formAeronave.maxlength"
                      :rules="$validate(['required'])"
                    ></v-text-field>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="$store.commit('closeModal')">
                  <v-icon>cancel</v-icon> {{$t('common.cancel') }}
                </v-btn>
                <v-btn
                  color="primary"
                  type="submit">
                  <v-icon dark>check</v-icon> Guardar
                </v-btn>
              </v-card-actions>
            </v-form>
          </template>
          <template slot="logs">
            <log-datos :data="logDatos" v-if="logDatos" class="log"></log-datos>
          </template>
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ $datetime.format(props.item.fecha_desde) }}</td>
            <td class="text-xs-center">{{ $datetime.format(props.item.fecha_hasta) }}</td>
            <td class="dia-semana">
              <v-chip v-if="props.item.dia_1" color="primary" small text-color="white">Lun (1)</v-chip>
              <v-chip v-if="props.item.dia_2" color="primary" small text-color="white">Mar (2)</v-chip>
              <v-chip v-if="props.item.dia_3" color="primary" small text-color="white">Mié (3)</v-chip>
              <v-chip v-if="props.item.dia_4" color="primary" small text-color="white">Jue (4)</v-chip>
              <v-chip v-if="props.item.dia_5" color="primary" small text-color="white">Vie (5)</v-chip>
              <v-chip v-if="props.item.dia_6" color="primary" small text-color="white">Sáb (6)</v-chip>
              <v-chip v-if="props.item.dia_7" color="primary" small text-color="white">Dom (7)</v-chip>
            </td>
            <td class="text-xs-center">{{ props.item.aeronave_matricula }}</td>
            <td class="text-xs-center">
              <v-tooltip bottom v-if="!props.item.aeronave_tipo_aeronave && !$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')">
                <v-btn
                  small
                  @click="agregarDato(props.item.id_aeronave, props.item.aeronave_matricula, 'tipo_aeronave')"
                  slot="activator">
                  <v-icon>add</v-icon> Agregar
                </v-btn>
                <span>Agregar el Tipo de Aeronave</span>
              </v-tooltip>
              <span v-else>{{ props.item.aeronave_tipo_aeronave }}</span>
            </td>
            <td class="text-xs-center">
              <v-tooltip bottom v-if="!props.item.aeronave_categoria_estela && !$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')">
                <v-btn
                  small
                  @click="agregarDato(props.item.id_aeronave, props.item.aeronave_matricula, 'categoria_estela')"
                  slot="activator">
                  <v-icon>add</v-icon> Agregar
                </v-btn>
                <span>Agregar el Categoria Estela</span>
              </v-tooltip>
              <span v-else>{{ props.item.aeronave_categoria_estela }}</span>
            </td>
            <td class="text-xs-center">{{ props.item.aeropuerto_salida_codigo_icao }}</td>
            <td class="text-xs-center">{{ parseInt(props.item.hora_salida.substr(0, 2)) + 4 }}{{ props.item.hora_salida.substr(3, 2) }}</td>
            <td class="text-xs-center">
              <v-text-field
                v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
                placeholder="Velocidad Crucero"
                maxlength="20"
                v-model="props.item.velocidad_crucero"
                @input="updateData(props.item.id, props.item.velocidad_crucero, 'velocidad_crucero')"
                required
                :rules="$validate(['required'])"
                class="required"
              ></v-text-field>
              <span v-else>{{ props.item.velocidad_crucero }}</span>
            </td>
            <td class="text-xs-center">
              <v-text-field
                v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
                placeholder="Nivel Crucero"
                maxlength="10"
                v-model="props.item.nivel_crucero"
                @input="updateData(props.item.id, props.item.nivel_crucero, 'nivel_crucero')"
                required
                :rules="$validate(['required'])"
                class="required"
              ></v-text-field>
              <span v-else>{{ props.item.nivel_crucero }}</span>
            </td>
            <td class="text-xs-center">
              <v-text-field
                v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
                placeholder="Ruta Crucero"
                maxlength="255"
                v-model="props.item.ruta"
                @input="updateData(props.item.id, props.item.ruta, 'ruta')"
                required
                :rules="$validate(['required'])"
                class="required"
              ></v-text-field>
              <span v-else>{{ props.item.ruta }}</span>
            </td>
            <td class="text-xs-center">{{ props.item.aeropuerto_destino_codigo_icao }}</td>
            <td class="text-xs-center">{{ props.item.duracion_total }}</td>
            <td class="text-xs-center">
              <v-text-field
                v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
                placeholder="Observación"
                maxlength="500"
                counter
                v-model="props.item.observacion"
                @input="updateData(props.item.id, props.item.observacion, 'observacion')"
                required
                :rules="$validate(['required'])"
                class="required"
              ></v-text-field>
              <span v-else>{{ props.item.observacion }}</span>
            </td>
            <td class="text-xs-center">
              <!-- <v-tooltip bottom v-if="!props.item.aeronave_volumen_referencial && !$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')">
                <v-btn
                  small
                  @click="agregarDato(props.item.id_aeronave, props.item.aeronave_matricula, 'volumen_referencial')"
                  slot="activator">
                  <v-icon>add</v-icon> Agregar
                </v-btn>
                <span>Agregar el Volumen Referencial</span>
              </v-tooltip>
              <span v-else>{{ props.item.aeronave_volumen_referencial }}</span> -->
              <v-text-field
                v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA') && (planSolicitud.estado === 'CREADO' || planSolicitud.estado === 'RECHAZADO')"
                placeholder="Volumen Referencial"
                maxlength="20"
                v-model="props.item.volumen_referencial"
                @input="updateData(props.item.id, props.item.volumen_referencial, 'volumen_referencial')"
                required
                :rules="$validate(['required'])"
                class="required"
              ></v-text-field>
              <span v-else>{{ props.item.volumen_referencial }}</span>
            </td>
            <td>
              <v-chip
                label
                :color="estados[props.item.estado].bg"
                :text-color="estados[props.item.estado].color">
                {{ estados[props.item.estado].text }}
              </v-chip>
            </td>
            <!-- <td>
              <log-datos :data="{ _user_created: props.item._user_created, _user_updated: props.item._user_updated, _created_at: props.item._created_at, _updated_at: props.item._updated_at }"></log-datos>
            </td> -->
          </template>
        </crud-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="$store.state.modal6" max-width="700" persistent>
      <editar-plan-vuelo :planVuelo="planVuelo"></editar-plan-vuelo>
    </v-dialog>
    <v-dialog v-model="$store.state.modal8" max-width="600" persistent scrollable>
      <historial tipo="Plan de Vuelo" :historial="historialPlanVuelo"></historial>
    </v-dialog>
  </section>
</template>

<script>
import aeropuertos from '@/components/itinerarios/aeropuerto/mixins/aeropuertos';
import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import EditarPlanVuelo from '@/components/plan/vuelo/EditarPlanVuelo';
import Historial from '@/common/util/historial/Historial';
import debounce from '@/common/util/debounce';
import LogDatos from '@/components/admin/usuario/LogDatos';

const estados = {
  CREADO: { text: 'CREADO', color: 'black', bg: 'default' },
  SOLICITADO: { text: 'SOLICITADO', color: 'white', bg: 'info' },
  OBSERVADO: { text: 'OBSERVADO', color: 'white', bg: 'orange' },
  RECHAZADO: { text: 'RECHAZADO', color: 'white', bg: 'error' },
  APROBADO_FELCN: { text: 'APROBADO POR FELCN', color: 'white', bg: 'success lighten-1' },
  APROBADO_AASANA: { text: 'APROBADO POR AASANA', color: 'white', bg: 'success lighten-3' },
  APROBADO: { text: 'APROBADO', color: 'white', bg: 'success' }
};

const categoriasEstela = [
  { value: 'H', text: 'H' },
  { value: 'M', text: 'M' },
  { value: 'L', text: 'L' }
];

export default {
  mixins: [ crud, validate, aeropuertos ],
  components: {
    CrudTable,
    EditarPlanVuelo,
    Historial,
    LogDatos
  },
  directives: { debounce },
  mounted () {
    if (this.$route.params.id && this.$filter.isInteger(this.$route.params.id)) {
      this.idPlanSolicitud = parseInt(this.$route.params.id);
      this.filters = [
        {
          field: 'id_solicitud',
          type: 'hidden',
          value: this.idPlanSolicitud,
          typeG: Number
        }
      ];
      this.getPlanSolicitud(this.idPlanSolicitud);
      this.getHistorial(this.idPlanSolicitud);
      this.getPendientesAprobacion(this.idPlanSolicitud);
    } else {
      this.$router.push('planSolicitudes');
    }
  },
  data () {
    return {
      delay: 1000,
      estados,
      categoriasEstela,
      valid: true,
      graphql: true,
      url: 'planVuelos',
      filters: [],
      order: ['id', 'DESC'],
      formAeronave: {
        id: null,
        field: '',
        label: '',
        value: '',
        aeronave: '',
        maxlength: 0
      },
      dataGraphql: `
        id
        fecha_desde
        fecha_hasta
        dia_1
        dia_2
        dia_3
        dia_4
        dia_5
        dia_6
        dia_7
        hora_salida
        velocidad_crucero
        volumen_referencial
        ruta
        nivel_crucero
        duracion_total
        observacion
        estado
        id_solicitud
        solicitud_estado
        id_aeronave
        aeronave_matricula
        aeronave_tipo_aeronave
        aeronave_categoria_estela
        id_aeropuerto_salida
        aeropuerto_salida_codigo_icao
        id_aeropuerto_destino
        aeropuerto_destino_codigo_icao
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      showListado: false,
      planSolicitud: null,
      active: 'listado',
      planVuelo: {},
      aeronaves: [],
      planVuelos: [],
      search: '',
      selected: [],
      headers: [
        // { text: 'Acciones', sortable: false },
        // { text: 'N°. Solicitud ITE', value: 'plan_de_vuelo.id' },
        { text: 'Válido Desde', value: 'fecha_desde', sortable: false },
        { text: 'Válido Hasta', value: 'fecha_hasta', sortable: false },
        { text: 'Días de Operación ', value: 'dia_1', sortable: false },
        { text: 'Aeronave', value: 'matricula' },
        { text: 'Tipo Aeronave', value: 'aeronave_tipo', sortable: false },
        { text: 'Categoria Estela', value: 'categoria_estela' },
        { text: 'Aeropuerto de Salida', value: 'aeropuerto_salida_codigo_iata', sortable: false },
        { text: 'Hora', value: 'hora_salida', sortable: false },
        { text: 'Velocidad de Crucero', value: 'velocidad_de_crucero', sortable: false },
        { text: 'Nivel de Crucero', value: 'nivel', sortable: false },
        { text: 'Ruta de Crucero', value: 'ruta', sortable: false },
        { text: 'Aeropuerto de Destino', value: 'aeropuerto_destino_codigo_iata', sortable: false },
        { text: 'Duración Total en mins', value: 'duracion_total', sortable: false },
        { text: 'Observaciones', value: 'observacion', sortable: false },
        { text: 'Volumen Referencial', value: 'volumen_referencial' },
        { text: 'Estado', value: 'estado', sortable: false }
      ],
      event: null,
      planSolicitudData: {},
      historialPlanVuelo: [],
      pendientesAprobacion: [],
      puedeAprobar: false
    };
  },
  methods: {
    agregarDato (id, aeronave, field) {
      this.$refs.formAeronave.reset();
      const detalle = {
        tipo_aeronave: { label: 'Tipo de aeronave', maxlength: 150 },
        categoria_estela: { label: 'Categoría estela', maxlength: 1 },
        volumen_referencial: { label: 'Volumen Referencial en Lts', maxlength: 10 }
      };
      this.formAeronave = {
        id,
        field,
        aeronave,
        value: '',
        label: detalle[field].label,
        maxlength: detalle[field].maxlength
      };
      this.$store.commit('openModal');
    },
    actualizarDato () {
      if (this.$refs.formAeronave.validate()) {
        let data = {};
        data[this.formAeronave.field] = this.formAeronave.value;
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $aeronave: EditAeronave!) {
              aeronaveEdit(id: $id, aeronave: $aeronave) {
                id
              }
            }
          `,
          variables: {
            id: this.formAeronave.id,
            aeronave: data
          }
        }).then(response => {
          if (response) {
            this.$store.commit('closeModal');
            this.updateList();
            this.$message.success(`¡${this.formAeronave.label} de la aeronave actualizada!`);
          }
        });
      }
    },
    updateData: debounce(function (id, value, field) {
      console.log('update', id, value, field);
      let data = {};
      data[field] = value;
      this.$service.graphql({
        query: `
          mutation edit($id: Int!, $planVuelo: EditPlanVuelo) {
            planVueloEdit(id: $id, planVuelo: $planVuelo) {
              id
            }
          }
        `,
        variables: {
          id: parseInt(id),
          planVuelo: data
        }
      }).then(response => {
        if (response) {
          console.log(`Campo ${field} actualizado`);
        }
      });
    }, 1000),
    getPlanSolicitud (idPlanSolicitud) {
      this.$service.graphql({
        query: `
          query {
            planSolicitud(id: ${idPlanSolicitud}) {
              id
              fecha_desde
              fecha_hasta
              nro_serie
              inf_suplementaria
              estado
              id_operador
              operador_sigla
              operador_razon_social
              operador_tipo
              operador_nit
              id_solicitud_itinerario
              solicitud_itinerario_codigo
              solicitud_itinerario_estado
              _user_created
              _user_updated
              _created_at
              _updated_at
            }
          }
        `
      }).then(response => {
        if (response && response.planSolicitud) {
          this.planSolicitud = response.planSolicitud;
          this.logDatos = {
            _user_created: response.planSolicitud._user_created,
            _user_updated: response.planSolicitud._user_updated,
            _created_at: response.planSolicitud._created_at,
            _updated_at: response.planSolicitud._updated_at
          };
          this.$service.graphql({
            query: `
              query lista ($id: Int) {
                aeronaves(id_operador: $id) {
                  count
                  rows {
                    id
                    matricula
                    estado
                  }
                }
              }
            `,
            variables: {
              id: response.planSolicitud.id_operador
            }
          }).then(responseAeronaves => {
            let items = responseAeronaves.aeronaves.rows;
            let aeronaves = [{ value: '', text: 'TODOS' }];
            items.map(item => {
              aeronaves.push({ value: item.matricula, text: item.matricula });
            });
            this.aeronaves = aeronaves;
            this.filters.push(
              {
                field: 'matricula',
                label: 'Matricula de Aeronave',
                type: 'select',
                typeG: 'String',
                items: this.aeronaves
              }
            );
          });
          this.showListado = true;
        } else {
          this.$store.commit('setState403', true);
          this.$router.push('/404');
        }
      });
    },
    eliminarPlanVuelo (idPlanVuelo) {
      this.$confirm('¿Quiere eliminar el registro?', () => {
        this.$service.graphql({
          query: `
          mutation borrarPlanVuelo($id: Int!) {
            planVueloDelete(id: $id) {
              deleted
            }
          }`,
          variables: { id: idPlanVuelo }
        }).then(response => {
          if (response && response['planVueloDelete'] && response['planVueloDelete'].deleted) {
            // this.updateList();
            this.$message.success('¡Registro eliminado correctamente!');
          } else {
            this.$message.error('Error al borrar el registro');
          }
        });
      });
    },
    editarPlanVuelo (data = {}) {
      this.planVuelo = data;
      this.$store.commit('openModal', 6);
    },
    cambiarEstadoPlanSolicitud (estado, message = '', redirect = true) {
      if (this.planSolicitud) {
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $planSolicitud: EditPlanSolicitud) {
              planSolicitudEdit(id: $id, planSolicitud: $planSolicitud) {
                id
              }
            }
          `,
          variables: {
            id: parseInt(this.planSolicitud.id),
            planSolicitud: { estado }
          }
        }).then(response => {
          if (response) {
            this.$message.success(message);
            if (redirect) {
              this.$router.push('/planSolicitudes');
            }
          }
        });
      }
    },
    aprobar () {
      let message = '¿Desea aprobar el Plan de Vuelo?';
      this.$confirm(message, () => {
        this.$service.post(`plan/planVuelo/aprobar/${parseInt(this.planSolicitud.id)}`).then(response => {
          if (response) {
            this.$message.success('Planes de vuelo aprobados');
            this.$router.push('/planSolicitudes');
          }
        });
      });
    },
    rechazar () {
      let message = '¿Desea rechazar el Plan de Vuelo?';
      this.$confirm(message, () => {
        this.$service.post(`plan/planVuelo/rechazar/${parseInt(this.planSolicitud.id)}`)
            .then(response => {
              if (response) {
                this.$message.info('Planes de vuelo rechazados');
                this.$router.push('/planSolicitudes');
              }
            });
      });
    },
    solicitar () {
      let message = '¿Desea solicitar todo el Plan de Vuelo?';
      this.$confirm(message, () => {
        // this.cambiarEstadoPlanSolicitud('SOLICITADO', 'Plan de Solicitud solicitado');
        this.$service.post(`plan/planVuelo/solicitar/${parseInt(this.planSolicitud.id)}`).then(response => {
          if (response) {
            this.$message.success('Planes de vuelo solicitados');
            this.$router.push('/planSolicitudes');
          }
        });
      });
    },
    solicitarSeleccionado () {
      let planesVuelo = this.$store.state.selected;
      if (planesVuelo.length === 0) {
        return this.$message.warning('Debe seleccionar al menos un plan de vuelo para solicitar');
      } else {
        let message = '¿Desea solicitar los Planes de Vuelo seleccionados?';
        this.$confirm(message, () => {
          this.cambiarEstadoPlanSolicitud('SOLICITADO', 'Plan de Solicitud solicitado');
          planesVuelo.map(val => {
            console.log(JSON.stringify(val));
            this.cambiarEstadoPlanVuelo(val.id, 'SOLICITADO');
          });
        });
      }
    },
    getHistorial (idPlanSolicitud) {
      this.$service.graphql({
        query: `
          query {
            registrosHistorialRPL(id_solicitud: ${idPlanSolicitud}) {
              count
              rows {
                id
                fecha
                accion
                detalle
                id_solicitud
                solicitud_nro_serie
                solicitud_estado
                id_entidad
                entidad_nombre
                entidad_sigla
                nombre_usuario
              }
            }
          }
        `
      }).then(response => {
        console.log('<Historial de plan de vuelo>', response, '</Historial de plan de vuelo>');
        this.historialPlanVuelo = response.registrosHistorialRPL.rows;
      });
    },
    historial (data = {}) {
      this.$store.commit('openModal', 8);
      this.planSolicitudData = data;
    },
    getPendientesAprobacion (idPlanSolicitud) {
      this.$service.get(`plan/planSolicitud/pendientesAprobacion/${idPlanSolicitud}`).then(response => {
        console.log(response);
        if (response) {
          Object.assign(this.pendientesAprobacion, response.pendientes);
          this.puedeAprobar = response.puede_aprobar;
        }
      });
    }
  }
};
</script>

<style lang="scss">
.dia-semana {
  min-width: 240px;

  .v-chip {
    margin: 2px 0px;
  }
}
.plan-vuelo-detalle {
  text-align: right;

  h3 {
    font-size: 1.2rem;
    font-weight: 400;
    margin-bottom: 2px;
  }

  p {
    font-size: 1rem;
    margin-bottom: 0;
    line-height: 1.2rem;
  }
}
.alert-autosave {
  display: inline-block;
  padding: 4px 8px;
}
.lista-pendientes {
  text-align: left;
  padding: 4px;
  ul {
    list-style-type: none;
    li {
      margin: -10px;
    }
  }
}
</style>
