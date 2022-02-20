<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">assignment</v-icon> {{ $t('solicitud.title') }}</h3>
    <v-card>
      <v-card-text>
        <crud-table
          :headers="headers"
          :url="url"
          :filters="filters"
          :order="order"
          :graphql="graphql"
          :data-graphql="dataGraphql"
          :showFilter="true"
          :width-modal="640"
        >
          <template slot="buttons">
            <v-tooltip bottom
              v-if="$store.state.permissions['solicitudes:create'] && $util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
              <v-btn color="primary"
              @click.native.stop="openAdd()"
              slot="activator"
              ><v-icon>add</v-icon> {{$t('common.add') }}</v-btn>
              <span>{{$t('solicitud.add')}}</span>
            </v-tooltip>
            <v-tooltip bottom
              v-if="$store.state.permissions['solicitudes:create'] && $util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
              <v-btn color="primary"
              @click.native.stop="openModal()"
              slot="activator"
              ><v-icon>file_upload</v-icon> Importar</v-btn>
              <span>{{$t('solicitud.add')}}</span>
            </v-tooltip>
          </template>

          <template slot="form">
            <v-card-title class="headline">
              <v-icon>assignment</v-icon> {{ form.id ? $t('solicitud.edit') :  $t('solicitud.add') }} - Importación
              <v-spacer></v-spacer>
              <v-btn icon @click.native="close()">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>

            <v-stepper v-model="e1" class="modal-solicitud">
              <v-stepper-header>
                <v-stepper-step step="1" :complete="e1 > 1">Datos generales</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="2" :complete="e1 > 2">Subiendo archivo</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="3">Finalizado</v-stepper-step>
              </v-stepper-header>
              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-form
                    @submit.prevent="next"
                    v-model="valid"
                    ref="form"
                    lazy-validation
                    >
                    <v-container grid-list-md>
                      <v-layout row wrap>
                        <v-flex>
                          <v-alert outline color="info" icon="info" :value="true">
                            Seleccione el rango de fechas de programación de su solicitud de itinerarios y complete los campos de la solicitud.
                          </v-alert>
                        </v-flex>
                        <v-flex>
                          <v-layout row wrap>
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
                          </v-layout>
                        </v-flex>
                        <!-- <v-flex md4 class="pl-4">
                          <v-select
                            :label="$t('solicitud.crud.id_operador')"
                            v-model="form.id_operador"
                            required
                            :rules="$validate(['required'])"
                            :items="operadores"
                            item-value="value"
                            item-text="text">
                          </v-select>
                          <v-text-field
                            :label="$t('solicitud.crud.codigo')"
                            v-model="form.codigo"
                            :placeholder="`DGAC/ITI/XXX/${new Date().getFullYear()}`"
                            maxlength="50"
                          ></v-text-field>
                          <v-textarea
                            :label="$t('solicitud.crud.observacion')"
                            v-model="form.observacion"
                            maxlength="500"
                          ></v-textarea>
                        </v-flex> -->
                      </v-layout>
                    </v-container>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        @click.native="close()">
                        <v-icon>cancel</v-icon> {{$t('common.cancel') }}
                      </v-btn>
                      <v-btn
                        color="primary"
                        type="submit">
                        <v-icon dark>keyboard_arrow_right</v-icon> Siguiente
                      </v-btn>
                    </v-card-actions>
                  </v-form>
                </v-stepper-content>
                <v-stepper-content step="2" class="pt-1">
                  <v-card-text>
                    <v-expansion-panel
                      v-model="panel">
                      <v-expansion-panel-content>
                        <div slot="header"><span class="primary--text">PLANTILLA</span></div>
                        <v-alert outline color="info" :value="true">
                          Descargue la plantilla para la importación de sus itinerarios.
                          <div class="text-xs-center">
                            <v-btn
                              color="success"
                              class="mb-0"
                              :href="urlPlantilla">
                              <v-icon dark>file_download</v-icon> Descargar plantilla
                            </v-btn>
                          </div>
                        </v-alert>
                      </v-expansion-panel-content>
                      <v-expansion-panel-content>
                        <div slot="header"><span class="primary--text">INSTRUCCIONES</span></div>
                        <v-alert outline color="info" :value="true">
                           Llene los campos de acuerdo a la siguiente descripción:
                          <table>
                            <thead>
                              <tr>
                                <th>Campo</th>
                                <th>Descripción</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><strong>EQV</strong></td>
                                <td>Matrícula de vuelo</td>
                              </tr>
                              <tr>
                                <td><strong>VLO</strong></td>
                                <td>Número de vuelo</td>
                              </tr>
                              <tr>
                                <td><strong>ORI</strong></td>
                                <td>Código IATA de origen del vuelo</td>
                              </tr>
                              <tr>
                                <td><strong>DES</strong></td>
                                <td>Código IATA de destino del vuelo</td>
                              </tr>
                              <tr>
                                <td><strong>ETD</strong></td>
                                <td>Hora de despegue</td>
                              </tr>
                              <tr>
                                <td><strong>ETA</strong></td>
                                <td>Hora de aterrizaje, para especificar la hora más un día debe hacerlo así <em><strong>06:00+1</strong></em></td>
                              </tr>
                              <tr>
                                <td><strong>DIA</strong></td>
                                <td>Diás de operación, puede llenar uno o más días separado por guiones, donde cada día representa un número: Lunes(1), martes(2), miércoles(3), jueves(4), viernes(5), sábado(6) y domingo(7). <em>Ejemplo: <strong>1-2-3</strong> o sólo un día así <strong>5</strong></em></td>
                              </tr>
                              <tr>
                                <td><strong>OBS</strong></td>
                                <td>Puede ingresar observaciones del vuelo en particular</td>
                              </tr>
                            </tbody>
                          </table>
                        </v-alert>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-alert outline color="info" icon="info" :value="true">
                      Una vez haya llenado su archivo CSV proceda a subir el archivo.
                    </v-alert>
                    <v-alert outline color="warning" icon="warning" :value="true">
                      <strong>Nota.-</strong> El archivo CSV tiene que estar guardado con codificación <strong>UTF-8</strong> separado por <strong>comas</strong>.
                    </v-alert>
                    <file-upload
                      :url="urlFile"
                      types=".csv"
                      name="csvFile"
                      :form="form"
                      :on-success="onSuccess"
                      label="Arrastre su archivo CSV aquí <br>o haga clic aquí para subir su archivo"></file-upload>
                  </v-card-text>
                  <v-card-actions>
                    <small class="error--text text-required">* Los campos son obligatorios</small>
                    <v-spacer></v-spacer>
                    <v-btn
                      @click.native="close()">
                      <v-icon>cancel</v-icon> {{$t('common.cancel') }}
                    </v-btn>
                    <v-btn
                      @click.native="e1 = 1">
                      <v-icon>keyboard_arrow_left</v-icon> Atrás
                    </v-btn>
                  </v-card-actions>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <v-card-text v-if="errors">
                    <v-alert outline color="error" icon="error" :value="true">
                      Se encontraron los siguientes errores en la importación.
                    </v-alert>
                    <table class="v-table">
                      <thead>
                        <tr>
                          <th>Nro. de registro</th>
                          <th>Campo - Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, key) in errors" :key="key">
                          <td class="text-xs-right">{{ key }}</td>
                          <td>
                            <ul class="no-style">
                              <li v-for="(error, campo) in item" :key="campo">
                                <strong class="primary--text">{{ campo.toUpperCase() }}</strong>: <span v-html="error"></span>
                              </li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      @click.native="close()">
                      <v-icon>cancel</v-icon> {{$t('common.cancel') }}
                    </v-btn>
                    <v-btn
                      @click.native="e1 = 2">
                      <v-icon>keyboard_arrow_left</v-icon> Atrás
                    </v-btn>
                  </v-card-actions>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </template>

          <template slot="items" slot-scope="items">
            <td class="text-xs-right">{{ items.item.id }}</td>
            <td class="nowrap">
              <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update']">
                <v-btn
                  slot="activator"
                  small
                  @click.native="$router.push(`itinerario/${items.item.id}`)">
                  <v-icon>playlist_add_check</v-icon> Ver solicitud
                </v-btn>
                <span>Ver solicitud de itinerarios</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update'] && $util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
                <v-btn
                  icon
                  :disabled="!puedeEditarSolicitudEntera(items.item.id, items.item.estado)"
                  slot="activator"
                  @click.native="editItem(items.item.id, 'solicitud', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar solicitud</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['solicitudes:delete']">
                <v-btn
                  icon
                  slot="activator"
                  :disabled="!puedeEditarSolicitudEntera(items.item.id, items.item.estado)"
                  @click.native="deleteItem(items.item.id, 'solicitud')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar solicitud</span>
              </v-tooltip>
            </td>
            <td>
              <v-chip
                label
                :color="estados[items.item.estado].bg"
                :text-color="estados[items.item.estado].color">
                {{ estados[items.item.estado].text }}
              </v-chip>
            </td>
            <td v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">{{ items.item.operador_sigla }}</td>
            <td>{{ $datetime.format(items.item.fecha_inicio ) }}</td>
            <td>{{ $datetime.format(items.item.fecha_fin ) }}</td>
            <td>{{ items.item.operador_tipo }}</td>
            <!-- <td>{{ items.item.codigo }}</td> -->
            <td>
              <v-tooltip bottom>
                <span slot="activator">{{ $filter.characters(items.item.observacion, 50) }}</span>
                <span>{{ items.item.observacion }}</span>
              </v-tooltip>
            </td>
          </template>
        </crud-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="$store.state.modal3" max-width="650">
      <editar :solicitud="solicitudForm" :logDatos="logDatos" v-if="solicitudForm"></editar>
    </v-dialog>
    <v-dialog v-model="$store.state.modal4" max-width="630">
      <nuevo></nuevo>
    </v-dialog>
  </section>
</template>

<script>
import CrudTable from '@/common/util/crud-table/CrudTable';
import crud from '@/common/util/crud-table/mixins/crud-table';
import operador from '@/components/itinerarios/operador/mixins/operador';
import validate from '@/common/mixins/validate';
import FileUpload from '@/common/util/FileUpload';
import Editar from './Editar';
import Nuevo from './Nuevo';
import solicitud from './mixins/solicitud';

const estados = {
  CREADO: { text: 'CREADO', color: 'black', bg: 'gray' },
  SOLICITADO: { text: 'SOLICITADO', color: 'white', bg: 'info' },
  APROBADO: { text: 'APROBADO', color: 'white', bg: 'success' },
  OBSERVADO: { text: 'OBSERVADO', color: 'white', bg: 'orange' },
  REPROGRAMADO: { text: 'REPROGRAMADO', color: 'white', bg: 'info' },
  PLAN_VUELO_CREADO: { text: 'PLAN DE VUELO CREADO', color: 'white', bg: 'primary lighten-3' },
  PLAN_VUELO_APROBADO: { text: 'PLAN DE VUELO APROBADO', color: 'white', bg: 'success' }
};

const estadosAerolinea = [
  { value: 'CREADO', text: 'CREADO' },
  { value: 'SOLICITADO', text: 'SOLICITADO' },
  { value: 'APROBADO', text: 'APROBADO' },
  { value: 'RECHAZADO', text: 'RECHAZADO' },
  { value: 'OBSERVADO', text: 'OBSERVADO' },
  { value: 'PLAN_VUELO_CREADO', text: 'PLAN DE VUELO CREADO' },
  { value: 'PLAN_VUELO_APROBADO', text: 'PLAN VUELO APROBADO' }
];

const estadosDgac = [
  { value: 'SOLICITADO', text: 'SOLICITADO' },
  { value: 'APROBADO', text: 'APROBADO' },
  { value: 'OBSERVADO', text: 'OBSERVADO' },
  { value: 'PLAN_VUELO_CREADO', text: 'PLAN DE VUELO CREADO' },
  { value: 'PLAN_VUELO_APROBADO', text: 'PLAN VUELO APROBADO' }
];

export default {
  mixins: [ crud, operador, validate, solicitud ],
  created () {
    this.$store.commit('closeModal', 2);
    this.$store.commit('closeModal', 3);
    this.$store.commit('closeModal', 4);
  },
  mounted () {
    this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(this.$datetime.now(true), 365)), 'YYYY-MM-dd');
    this.$bus.$on('loadLista', () => {
      this.updateList();
    });
    this.headers = [
      { text: 'N° Solicitud', value: 'id' },
      { text: this.$t('common.actions'), sortable: false },
      { text: this.$t('solicitud.crud.estado'), value: 'estado' },
      { text: this.$t('solicitud.crud.fecha_inicio'), value: 'fecha_inicio' },
      { text: this.$t('solicitud.crud.fecha_fin'), value: 'fecha_fin' },
      { text: this.$t('solicitud.crud.tipo'), value: 'tipo' },
      { text: this.$t('solicitud.crud.observacion'), value: 'observacion' }
    ];
    this.filters = [
      {
        field: 'tipo',
        label: this.$t('solicitud.crud.tipo'),
        type: 'select',
        typeG: 'TipoOperador',
        items: [
          { value: '', text: 'TODOS' },
          { value: 'NACIONAL', text: 'NACIONAL' },
          { value: 'INTERNACIONAL', text: 'INTERNACIONAL' }
        ]
      },
      {
        field: 'estado',
        label: this.$t('solicitud.crud.estado'),
        type: 'select',
        typeG: 'EstadoSolicitud',
        items: [{ value: '', text: 'TODOS' }].concat(this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION') ? estadosAerolinea : estadosDgac)
      },
      {
        field: 'desde_fecha',
        label: 'Vigentes desde',
        type: 'date',
        typeG: 'String'
      },
      {
        field: 'hasta_fecha',
        label: 'Vigentes hasta',
        type: 'date',
        typeG: 'String'
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
  },
  data () {
    return {
      logDatos: null,
      panel: [true],
      graphql: true,
      estados,
      fechaInicio: '',
      url: 'solicitudes',
      headers: [],
      operadores: [],
      solicitud: null,
      solicitudForm: null,
      order: ['fecha_inicio', 'DESC'],
      valid: true,
      e1: 0,
      urlPlantilla: this.$authUrl.split('auth')[0] + 'plantilla-itinerarios.csv',
      urlFile: this.$apiUrl + 'itinerario/solicitud/crear_solicitud',
      form: {
        codigo: '',
        fecha_inicio: '',
        fecha_fin: '',
        observacion: '',
        estado: '',
        id_operador: ''
      },
      fecha_fin_maxima: null,
      dataGraphql: `
        id
        codigo
        fecha_inicio
        fecha_fin
        observacion
        estado
        id_operador
        operador_nit
        operador_tipo
        operador_sigla
        operador_razon_social
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      filters: [],
      errors: null
    };
  },
  methods: {
    close () {
      this.form.fecha_inicio = null;
      this.form.fecha_fin = null;
      this.$store.commit('closeModal');
    },
    openModal (data = {}) {
      this.$refs.form.reset();
      this.e1 = 1;
      this.errors = null;
      this.logDatos = null;
      if (data.id) {
        this.solicitudForm = null;
        this.$nextTick(() => {
          this.logDatos = {
            _user_created: data._user_created,
            _user_updated: data._user_updated,
            _created_at: data._created_at,
            _updated_at: data._updated_at
          };
          data.id_operador = data.id_operador + '';
          data.operadores = this.operadores;
          this.solicitudForm = data;
          this.$store.commit('openModal', 3);
        });
      } else {
        this.form = {
          codigo: '',
          fecha_inicio: '',
          fecha_fin: '',
          observacion: '',
          estado: '',
          id_operador: ''
        };
        this.$store.commit('openModal');
      }
    },
    openAdd () {
      this.$store.commit('openModal', 4);
    },
    next () {
      if (this.$refs.form.validate()) {
        if (this.$filter.empty(this.form.fecha_inicio)) {
          this.$alert('Debe seleccionar la fecha de inicio');
        } else {
          if (this.$filter.empty(this.form.fecha_fin)) {
            this.$alert('Debe seleccionar la fecha de fin');
          } else {
            this.form.id_operador = this.$store.state.user.id_operador;
            this.e1 = 2;
          }
        }
      }
    },
    onSuccess (file, response) {
      // Método que se ejecuta después de realizar la importación del csv
      if (response.errors) {
        this.errors = response.errors;
        this.e1 = 3;
      } else {
        if (response.id_solicitud) {
          this.$message.success('¡La importación se realizó correctamente!');
          this.$store.commit('closeModal');
          this.$router.push(`/itinerario/${response.id_solicitud}`);
        }
      }
    },
    puedeEditarSolicitudEntera (id, estado) {
      // Método para comprobar si se puede borrar una solicitud entera,
      // comprueba si entre las solicitudes hay algún itinerario aprobado
      if (estado === 'APROBADO' || estado === 'SOLICITADO' || estado === 'PLAN_VUELO_CREADO' || estado === 'PLAN_VUELO_APROBADO') {
        return false;
      } else if (estado === 'CREADO') {
        return true;
      }
      // buscando itinerarios de solicitud aprobados
      this.$service.graphql({
        query: `
         query itinerariosDeSolicitud($id_solicitud: Int!) {
           itinerarios (id_solicitud: $id_solicitud) {
             count
             rows {
               estado
             }
           }
         }
        `,
        variables: { id_solicitud: id }
      }).then(response => {
        if (response) {
          response.itinerarios.rows.forEach(itinerario => {
            if (itinerario.estado === 'APROBADO' || itinerario.estado === 'PLAN_VUELO_CREADO' || itinerario.estado === 'PLAN_VUELO_APROBADO') {
              return false;
            }
          });
          return true;
        } else {
          return false;
        }
      });
    }
  },
  watch: {
    'form.fecha_inicio': function (fechaInicio) {
      if (fechaInicio) {
        const ini = this.$datetime.transform(fechaInicio);
        const fin = this.$datetime.transform(this.form.fecha_fin);
        if (ini) {
          this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(ini, 365)), 'YYYY-MM-dd');
        }
        if (ini && fin && this.$datetime.daysBetweenTwoDates(ini, fin) > 365) {
          this.form.fecha_fin = this.fecha_fin_maxima;
        }
      }
    }
  },
  components: {
    CrudTable,
    FileUpload,
    Editar,
    Nuevo
  }
};
</script>

<style lang="scss">
$font-size: 0.9rem;
$line-height: 1.2;
$lines-to-show: 5;

.modal-solicitud {
  .date {
    position: relative;

    label {
      position: absolute;
      z-index: 1;
      right: 24px;
      top: 13px;
      color: white;
      font-size: 1.2rem;
    }
  }

  .sin-fecha {
    padding-top: 30px !important;
    padding-left: 25px !important;
  }

  .vue-dropzone {
    text-align: center;
  }
}

.dz-error-message {
  span {
    display: block;
    display: -webkit-box;
    max-width: 400px;
    height: $font-size*$line-height*$lines-to-show;
    margin: 0 auto;
    font-size: $font-size;
    line-height: $line-height;
    overflow: hidden;
    -ms-text-overflow: ellipsis;
  }
}
</style>
