<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">flight_takeoff</v-icon> {{ $t('aeropuerto.title') }}</h3>
    <v-card>
      <v-card-text>
        <crud-table
          :headers = "headers"
          :url = "url"
          :filters = "filters"
          :showFilter = "true"
          :graphql = "graphql"
          :width-modal = "800"
        >
          <template slot="buttons">
            <v-tooltip bottom v-if="$store.state.permissions['aeropuertos:create']">
             <v-btn color="primary" dark
               @click.native.stop="openModal()"
               slot="activator"
             ><v-icon dark>add</v-icon> {{$t('common.add') }}</v-btn>
             <span>{{$t('aeropuerto.add')}}</span>
           </v-tooltip>
          </template>

          <template slot="buttons">
            <v-tooltip bottom>
             <v-btn color="info" dark
               @click="mostrarMapa()"
               slot="activator"
             ><v-icon>map</v-icon> Ver mapa de Bolivia</v-btn>
             <span>Aeropuertos en territorio boliviano</span>
           </v-tooltip>
          </template>

          <template slot="form">
            <v-card-title class="headline">
              <v-flex xs10>
                <v-icon>flight_takeoff</v-icon> {{ form.id ? $t('aeropuerto.edit') :  $t('aeropuerto.add') }}
              </v-flex>
              <v-flex xs2 text-md-right>
                <v-btn icon @click.native="$store.commit('closeModal')">
                  <v-icon>close</v-icon>
                </v-btn>
              </v-flex>
            </v-card-title>
            <v-form
              @submit.prevent="save"
              v-model="valid"
              ref="form"
              lazy-validation
              >
              <v-card-text class="pt-0">
                <v-container grid-list-md class="pt-0">
                  <v-layout row wrap>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.codigo_icao')"
                        v-model="form.codigo_icao"
                        maxlength="5"
                        :rules="$validate(['required'])"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.codigo_iata')"
                        v-model="form.codigo_iata"
                        maxlength="5"
                        :rules="$validate(['required'])"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex md6>
                      <v-text-field
                        :label="$t('aeropuerto.crud.nombre')"
                        v-model="form.nombre"
                        maxlength="100"
                        :rules="$validate(['required'])"
                        required
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-autocomplete
                        :label="$t('aeropuerto.crud.pais')"
                        v-model="form.pais"
                        :items="paises"
                      ></v-autocomplete>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.ciudad')"
                        v-model="form.ciudad"
                        maxlength="50"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-autocomplete
                        :disabled="form.pais !== 'BOLIVIA'"
                        :label="$t('aeropuerto.crud.departamento')"
                        v-model="form.departamento"
                        :items="departamentos"></v-autocomplete>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :disabled="form.pais !== 'BOLIVIA'"
                        :label="$t('aeropuerto.crud.municipio')"
                        v-model="form.municipio"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lat_grados')"
                        v-model="form.lat_grados"
                        maxlength="20"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lat_minutos')"
                        v-model="form.lat_minutos"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lat_segundos')"
                        v-model="form.lat_segundos"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lat_decimal')"
                        v-model="form.lat_decimal"
                        maxlength="11"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lat_dir')"
                        v-model="form.lat_dir"
                        maxlength="1"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lon_grados')"
                        v-model="form.lon_grados"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lon_minutos')"
                        v-model="form.lon_minutos"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lon_segundos')"
                        v-model="form.lon_segundos"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lon_dir')"
                        v-model="form.lon_dir"
                        maxlength="1"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lon_decimal')"
                        v-model="form.lon_decimal"
                        maxlength="11"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeropuerto.crud.altitud')"
                        v-model="form.altitud"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <!--<v-flex md3>
                    </v-flex>-->
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeropuerto.crud.clave_referencia')"
                        v-model="form.clave_referencia"
                        maxlength="2"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeropuerto.crud.categoria_ssei')"
                        v-model="form.categoria_ssei"
                        maxlength="2"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeropuerto.crud.lapso_entre_despegues')"
                        v-model="form.lapso_entre_despegues"
                        maxlength="11"
                        @keydown.native="$filter.numeric($event)"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap v-if="$store.state.modal">
                    <v-flex md12>
                      <label>{{ $t('aeropuerto.crud.certificado_aerodromo') }}</label>
                      <v-radio-group
                        v-model="form.certificado_aerodromo"
                        row
                        :rules="$validate(['required'])"
                        required
                      >
                        <v-radio
                          label="NACIONAL"
                          value="NACIONAL"
                        ></v-radio>
                        <v-radio
                          label="INTERNACIONAL"
                          value="INTERNACIONAL"
                        ></v-radio>
                      </v-radio-group>
                    </v-flex>
                  </v-layout>

                </v-container>
                <log-datos :data="logDatos" v-if="logDatos"></log-datos>
              </v-card-text>
              <v-card-actions>
                <small class="error--text text-required">* Los campos son obligatorios</small>
                <v-spacer></v-spacer>
                <v-btn
                  @click.native="$store.commit('closeModal');">
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
            <td class="nowrap" v-if="$store.state.permissions['aeropuertos:update']">
              <v-tooltip bottom v-if="$store.state.permissions['aeropuertos:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="editItem(items.item.id, 'aeropuerto', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>

              <v-tooltip bottom v-if="$store.state.permissions['aeropuertos:delete']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="deleteItem(items.item.id, 'aeropuerto')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar registro</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$util.isRol('AASANA_ADMIN', 'AASANA', 'SABSA_ADMIN', 'SABSA')">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="$router.push(`puertas/${items.item.id}`)"
                  >
                  <v-icon>meeting_room</v-icon>
                </v-btn>
                <span>Puertas para vuelos</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom v-if="$store.state.permissions['aeropuertos:update']">
                <v-switch
                  v-model="items.item.active"
                  value="ACTIVE"
                  @change="changeActive(items.item, items.item.id, 'aeropuerto', 'EditAeropuerto')"
                  hide-details
                  slot="activator"
                  color="success"></v-switch>
                <span>Activar/desactivar registro</span>
              </v-tooltip>
              <v-icon
                v-if="!$store.state.permissions['aeropuertos:update']"
                :color="items.item.active === 'ACTIVE' ? 'success' : 'error'">
                {{ items.item.active === 'ACTIVE' ? 'check' : 'close' }}
              </v-icon>
            </td>
            <td>{{ items.item.codigo_icao }}</td>
            <td>{{ items.item.codigo_iata }}</td>
            <td>{{ items.item.nombre }}</td>
            <td>{{ items.item.pais }}</td>
            <td>{{ items.item.ciudad }}</td>
            <td>{{ items.item.municipio }}</td>
            <td>{{ items.item.departamento }}</td>
            <td>{{ items.item.lat_grados }}</td>
            <td>{{ items.item.lat_minutos }}</td>
            <td>{{ items.item.lat_segundos }}</td>
            <td>{{ items.item.lat_dir }}</td>
            <td>{{ items.item.lon_grados }}</td>
            <td>{{ items.item.lon_minutos }}</td>
            <td>{{ items.item.lon_segundos }}</td>
            <td>{{ items.item.lon_dir }}</td>
            <td>{{ items.item.altitud }}</td>
            <td>{{ items.item.lat_decimal }}</td>
            <td>{{ items.item.lon_decimal }}</td>
            <td>{{ items.item.certificado_aerodromo }}</td>
            <td>{{ items.item.clave_referencia }}</td>
            <td>{{ items.item.categoria_ssei }}</td>
            <td>{{ items.item.lapso_entre_despegues }}</td>
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
    <v-dialog v-model="$store.state.modal2" max-width="800">
       <v-card>
        <v-card-title class="headline m-0">
          <v-icon>map</v-icon> Aeropuertos de Bolivia
          <v-spacer></v-spacer>
          <v-btn icon @click="$store.commit('closeModal', 2)">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <div class="map-container">
          <mapa v-if="verMapa"></mapa>
        </div>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import Mapa from './Mapa.vue';
import paises from './paises';
import LogDatos from '@/components/admin/usuario/LogDatos';

const departamentos = [
  { value: 'BENI', text: 'BENI' },
  { value: 'CHUQUISACA', text: 'CHUQUISACA' },
  { value: 'COCHABAMBA', text: 'COCHABAMBA' },
  { value: 'LA', text: 'LA PAZ' },
  { value: 'ORURO', text: 'ORURO' },
  { value: 'PANDO', text: 'PANDO' },
  { value: 'POTOSI', text: 'POTOSI' },
  { value: 'SANTA', text: 'SANTA CRUZ' },
  { value: 'TARIJA', text: 'TARIJA' }
];

export default {
  mixins: [ crud, validate ],
  created () {
    this.user = this.$storage.getUser();
  },
  data () {
    return {
      logDatos: null,
      verMapa: false,
      paises,
      departamentos,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'aeropuertos',
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: this.$t('common.active'), sortable: false },
        { text: this.$t('aeropuerto.crud.codigo_icao'), value: 'codigo_icao' },
        { text: this.$t('aeropuerto.crud.codigo_iata'), value: 'codigo_iata' },
        { text: this.$t('aeropuerto.crud.nombre'), value: 'nombre' },
        { text: this.$t('aeropuerto.crud.pais'), value: 'pais' },
        { text: this.$t('aeropuerto.crud.ciudad'), value: 'ciudad' },
        { text: this.$t('aeropuerto.crud.municipio'), value: 'municipio' },
        { text: this.$t('aeropuerto.crud.departamento'), value: 'departamento' },
        { text: this.$t('aeropuerto.crud.lat_grados'), value: 'lat_grados' },
        { text: this.$t('aeropuerto.crud.lat_minutos'), value: 'lat_minutos' },
        { text: this.$t('aeropuerto.crud.lat_segundos'), value: 'lat_segundos' },
        { text: this.$t('aeropuerto.crud.lat_dir'), value: 'lat_dir' },
        { text: this.$t('aeropuerto.crud.lat_decimal'), value: 'lat_decimal' },
        { text: this.$t('aeropuerto.crud.lon_grados'), value: 'lon_grados' },
        { text: this.$t('aeropuerto.crud.lon_minutos'), value: 'lon_minutos' },
        { text: this.$t('aeropuerto.crud.lon_segundos'), value: 'lon_segundos' },
        { text: this.$t('aeropuerto.crud.lon_dir'), value: 'lon_dir' },
        { text: this.$t('aeropuerto.crud.lon_decimal'), value: 'lon_decimal' },
        { text: this.$t('aeropuerto.crud.altitud'), value: 'altitud' },
        { text: this.$t('aeropuerto.crud.certificado_aerodromo'), value: 'certificado_aerodromo' },
        { text: this.$t('aeropuerto.crud.clave_referencia'), value: 'clave_referencia' },
        { text: this.$t('aeropuerto.crud.categoria_ssei'), value: 'categoria_ssei' },
        { text: this.$t('aeropuerto.crud.lapso_entre_despegues'), value: 'lapso_entre_despegues' },
        { text: this.$t('aeropuerto.crud.estado'), value: 'estado' }
      ],
      form: {
        codigo_icao: '',
        codigo_iata: '',
        nombre: '',
        ciudad: '',
        pais: '',
        lat_grados: '',
        lat_minutos: '',
        lat_segundos: '',
        lat_dir: '',
        lon_grados: '',
        lon_minutos: '',
        lon_segundos: '',
        lon_dir: '',
        altitud: '',
        lat_decimal: '',
        lon_decimal: '',
        municipio: '',
        departamento: '',
        certificado_aerodromo: 'NACIONAL',
        clave_referencia: '',
        categoria_ssei: '',
        lapso_entre_despegues: '',
        estado: ''
      },
      dataGraphql: `
        id
        codigo_icao
        codigo_iata
        nombre
        ciudad
        pais
        lat_grados
        lat_minutos
        lat_segundos
        lat_dir
        lon_grados
        lon_minutos
        lon_segundos
        lon_dir
        altitud
        lat_decimal
        lon_decimal
        municipio
        departamento
        certificado_aerodromo
        clave_referencia
        categoria_ssei
        lapso_entre_despegues
        estado
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      filters: [
        {
          field: 'codigo_icao',
          label: this.$t('aeropuerto.crud.codigo_icao'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'codigo_iata',
          label: this.$t('aeropuerto.crud.codigo_iata'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'nombre',
          label: this.$t('aeropuerto.crud.nombre'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'ciudad',
          label: this.$t('aeropuerto.crud.ciudad'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'pais',
          label: this.$t('aeropuerto.crud.pais'),
          type: 'select',
          typeG: 'String',
          items: ['TODOS'].concat(paises)
        },
        {
          field: 'departamento',
          label: this.$t('aeropuerto.crud.departamento'),
          type: 'select',
          typeG: 'String',
          items: [{ value: '', text: 'TODOS' }].concat(departamentos),
          show: ['pais', 'BOLIVIA']
        },
        {
          field: 'municipio',
          label: this.$t('aeropuerto.crud.municipio'),
          type: 'text',
          typeG: 'String',
          show: ['pais', 'BOLIVIA']
        },
        {
          field: 'certificado_aerodromo',
          label: this.$t('aeropuerto.crud.certificado_aerodromo'),
          type: 'select',
          typeG: 'CertificadoAerodromoAeropuerto',
          items: [
            { value: '', text: 'TODOS' },
            { value: 'NACIONAL', text: 'NACIONAL' },
            { value: 'INTERNACIONAL', text: 'INTERNACIONAL' }
          ]
        },
        {
          field: 'clave_referencia',
          label: this.$t('aeropuerto.crud.clave_referencia'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'categoria_ssei',
          label: this.$t('aeropuerto.crud.categoria_ssei'),
          type: 'text',
          typeG: 'Int'
        },
        {
          field: 'estado',
          label: this.$t('user.crud.status'),
          type: 'select',
          typeG: 'EstadoAeropuerto',
          items: [
            { value: '', text: 'TODOS' },
            { value: 'ACTIVO', text: 'ACTIVO' },
            { value: 'INACTIVO', text: 'INACTIVO' }
          ]
        }
      ],
      valid: true
    };
  },
  mounted () {
    if (this.$util.isRol('FELCN_ADMIN', 'FELCN')) {
      this.headers.splice(0, 1);
    }
  },
  methods: {
    getAeropuertos (filter) {
      this.$service.graphql({
        query: `
          query getRoles {
            roles {
              count
              rows {
                id
                nombre
                descripcion
              }
            }
          }
        `,
        variables: {}
      }).then(response => {
        if (response) {
          let items = response.roles.rows;
          let roles = [];
          items.map(rol => {
            roles.push({ value: rol.id, text: rol.nombre + ' - ' + rol.descripcion });
          });
          this.aeropuertos = roles;
          if ((filter || filter === 0) && this.filters[filter] && this.filters[filter].items) {
            this.filters[filter].items = this.roles;
          }
        }
      });
    },
    mostrarMapa () {
      this.verMapa = false;
      this.$store.commit('openModal', 2);
      setTimeout(() => {
        this.verMapa = true;
      }, 500);
    },
    openModal (data = {}) {
      this.$refs.form.reset();
      this.logDatos = null;
      if (data.id) {
        this.$nextTick(() => {
          this.logDatos = {
            _user_created: data._user_created,
            _user_updated: data._user_updated,
            _created_at: data._created_at,
            _updated_at: data._updated_at
          };
          this.form = data;
        });
      } else {
        this.form = {
          codigo_icao: '',
          codigo_iata: '',
          nombre: '',
          ciudad: '',
          pais: '',
          lat_grados: '',
          lat_minutos: '',
          lat_segundos: '',
          lat_dir: '',
          lon_grados: '',
          lon_minutos: '',
          lon_segundos: '',
          lon_dir: '',
          altitud: '',
          lat_decimal: '',
          lon_decimal: '',
          municipio: '',
          departamento: '',
          certificado_aerodromo: 'NACIONAL',
          clave_referencia: '',
          categoria_ssei: '',
          lapso_entre_despegues: '',
          estado: ''
        };
      }
      this.$store.commit('openModal');
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.form);
        delete data._user_created;
        delete data._user_updated;
        delete data._created_at;
        delete data._updated_at;
        if (data.lat_grados === '') data.lat_grados = null;
        if (data.lat_minutos === '') data.lat_minutos = null;
        if (data.lat_segundos === '') data.lat_segundos = null;
        if (data.lon_grados === '') data.lon_grados = null;
        if (data.lon_minutos === '') data.lon_minutos = null;
        if (data.lon_segundos === '') data.lon_segundos = null;
        if (data.altitud === '') data.altitud = null;
        if (data.lat_decimal === '') data.lat_decimal = null;
        if (data.lon_decimal === '') data.lon_decimal = null;
        if (data.categoria_ssei === '') data.categoria_ssei = null;
        if (data.lapso_entre_despegues === '') data.lapso_entre_despegues = null;
        if (data.id) {
          delete data.id;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $aeropuerto: EditAeropuerto!) {
                aeropuertoEdit(id: $id, aeropuerto: $aeropuerto) {
                  id
                }
              }
            `,
            variables: {
              id: this.form.id,
              aeropuerto: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList();
              this.$message.success('Se actualizó el registro correctamente');
            }
          });
        } else {
          delete data.estado;
          this.$service.graphql({
            query: `
              mutation add($aeropuerto: NewAeropuerto!) {
                aeropuertoAdd(aeropuerto: $aeropuerto) {
                  id
                }
              }
            `,
            variables: {
              aeropuerto: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList();
              this.$message.success();
            }
          });
        }
      }
    }
  },
  watch: {
    'form.pais': function (val) {
      if (val && val !== 'BOLIVIA') {
        this.form.departamento = '';
        this.form.municipio = '';
      }
    }
  },
  components: {
    CrudTable,
    Mapa,
    LogDatos
  }
};
</script>

<style lang="scss">
@import './mapa.scss';
</style>
