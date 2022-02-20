<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">flight_land</v-icon> {{ $t('aeronave.title') }}</h3>
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
            <v-tooltip bottom v-if="$store.state.permissions['aeronaves:create']">
              <v-btn color="primary"
                @click.native.stop="openModal()"
                slot="activator"
              ><v-icon>add</v-icon> {{$t('common.add')}}</v-btn>
              <span>{{$t('aeronave.add')}}</span>
            </v-tooltip>
            <v-tooltip bottom v-if="$store.state.permissions['aeronaves:update'] && $util.isRol('SUPERADMIN')">
              <v-btn
                @click="sincronizar()"
                slot="activator"
                :disabled="sync"
                color="primary">
                <v-icon>sync</v-icon> Sincronizar
              </v-btn>
              <span>Sincronizar aeronaves de la DGAC</span>
            </v-tooltip>
          </template>

          <template slot="form">
            <v-card-title class="headline">
              <v-flex xs10>
                <v-icon>flight_land</v-icon> {{ form.id ? $t('aeronave.edit') :  $t('aeronave.add') }}
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
                <v-container grid-list-md class="pt-0" v-if="!form.id">
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-alert icon="info" color="info" :value="true" outline>
                        Busque la(s) matrícula(s) para agregar a la lista de aeronaves del operador.
                      </v-alert>
                    </v-flex>
                    <v-flex md12>
                      <v-select
                        :label="$t('aeronave.crud.id_operador')"
                        v-model="form.id_operador"
                        required
                        :rules="$validate(['required'])"
                        :items="operadores"
                        v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')"
                        item-value="value"
                        item-text="text">
                      </v-select>
                    </v-flex>
                    <v-flex md12>
                      <v-autocomplete
                        label="Buscar Matrícula(s)"
                        v-model="matriculas"
                        required
                        :rules="$validate(['required'])"
                        :cache-items="false"
                        :loading="loading"
                        :items="dgacAeronaves"
                        class="uppercase"
                        placeholder="Escriba el número de mátricula a buscar aquí"
                        :search-input.sync="buscarDgacAeronaves"
                        multiple
                        chips
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                </v-container>
                <v-container grid-list-md class="pt-0" v-else>
                  <v-layout row wrap>
                    <v-flex md3>
                      <v-text-field
                        label="Matrícula"
                        v-model="form.matricula"
                        required
                        :rules="$validate(['required'])"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        :label="$t('aeronave.crud.serie')"
                        v-model="form.serie"
                        :rules="$validate(['required'])"
                        required
                        :disabled="true"
                        maxlength="50"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md2>
                      <v-text-field
                        :label="$t('aeronave.crud.marca')"
                        v-model="form.marca"
                        :rules="$validate(['required'])"
                        required
                        :disabled="true"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md2>
                      <v-text-field
                        :label="$t('aeronave.crud.modelo')"
                        v-model="form.modelo"
                        :disabled="true"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md2>
                      <v-text-field
                        :label="$t('aeronave.crud.modelo_generico')"
                        v-model="form.modelo_generico"
                        :rules="$validate(['required'])"
                        required
                        :disabled="true"
                        maxlength="11"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-select
                        :label="$t('aeronave.crud.id_operador')"
                        v-model="form.id_operador"
                        required
                        :disabled="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')"
                        :rules="$validate(['required'])"
                        :items="operadores"
                        item-value="value"
                        item-text="text">
                      </v-select>
                    </v-flex>
                    <v-flex md4>
                      <select-date
                        :label="$t('aeronave.crud.fecha_inscripcion')"
                        model="form.fecha_inscripcion"
                        :disabled="true"
                        :value="date1"
                        v-if="date1Show"
                      ></select-date>
                    </v-flex>
                    <v-flex md4>
                      <select-date
                        :label="$t('aeronave.crud.fecha_actualizacion')"
                        model="form.fecha_actualizacion"
                        :disabled="true"
                        :value="date2"
                        v-if="date2Show"
                      ></select-date>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeronave.crud.propietario')"
                        v-model="form.propietario"
                        :rules="$validate(['required'])"
                        required
                        :disabled="true"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md2>
                      <v-text-field
                        label="Estado DGAC"
                        v-model="form.estado_dgac"
                        maxlength="150"
                        disabled
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-text-field
                        label="Tipo de aeronave"
                        v-model="form.tipo_aeronave"
                        maxlength="20"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md3>
                      <v-select
                        label="Categoría estela"
                        :items="categoriasEstela"
                        v-model="form.categoria_estela"
                        ></v-select>
                    </v-flex>
                    <!-- <v-flex md4>
                      <v-text-field
                        label="Volumen Referencial"
                        v-model="form.volumen_referencial"
                        :rules="$validate(['required'])"
                        :disabled="false"
                        maxlength="11"
                        required
                      ></v-text-field>
                    </v-flex> -->
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeronave.crud.capacidad_maxima_asientos')"
                        v-model="form.capacidad_maxima_asientos"
                        maxlength="11"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md4>
                      <v-text-field
                        :label="$t('aeronave.crud.capacidad_carga')"
                        v-model="form.capacidad_carga"
                        maxlength="11"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md2>
                      <v-switch
                        :label="$t('aeronave.crud.ads_b')"
                        v-model="form.ads_b"
                      ></v-switch>
                    </v-flex>
                    <v-flex md5>
                      <v-text-field
                        :label="$t('aeronave.crud.descripcion')"
                        v-model="form.descripcion"
                        counter="500"
                        maxlength="500"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md5>
                      <v-text-field
                        :label="$t('aeronave.crud.observaciones')"
                        v-model="form.observaciones"
                        counter="500"
                        maxlength="500"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
                <log-datos :data="logDatos" v-if="logDatos && form.id"></log-datos>
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
            <td class="nowrap" v-if="$store.state.permissions['aeronaves:update']">
              <v-tooltip bottom v-if="$store.state.permissions['aeronaves:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="editItem(items.item.id, 'aeronave', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['aeronaves:delete']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="deleteItem(items.item.id, 'aeronave')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar registro</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  v-if="!$store.state.permissions['aeronaves:update'] && items.item.estado === 'ACTIVO'"
                  color="success">
                  check
                </v-icon>
                <span>AERONAVE ACTIVA</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  v-if="!$store.state.permissions['aeronaves:update'] && items.item.estado === 'INACTIVO'"
                  color="warning">
                  warning
                </v-icon>
                <span>AERONAVE INACTIVA</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-icon
                  slot="activator"
                  v-if="!$store.state.permissions['aeronaves:update'] && items.item.estado === 'MANTENIMIENTO'"
                  color="info">
                  build
                </v-icon>
                <span>AERONAVE EN MANTENIMIENTO</span>
              </v-tooltip>
              <v-select
                v-if="$store.state.permissions['aeronaves:update']"
                :items="estados"
                v-model="items.item.estado"
                item-value="value"
                item-text="text"
                @input="cambiarEstado(items.item)"
                >
                <template slot="selection" slot-scope="data">
                  <strong v-if="data.item.value == 'ACTIVO'" class="success--text">{{ data.item.text }}</strong>
                  <strong v-if="data.item.value == 'INACTIVO'" class="warning--text">{{ data.item.text }}</strong>
                  <strong v-if="data.item.value == 'MANTENIMIENTO'" class="info--text">{{ data.item.text }}</strong>
                </template>
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <strong v-if="data.item.value == 'ACTIVO'" class="success--text">{{ data.item.text }}</strong>
                    <strong v-if="data.item.value == 'INACTIVO'" class="warning--text">{{ data.item.text }}</strong>
                    <strong v-if="data.item.value == 'MANTENIMIENTO'" class="info--text">{{ data.item.text }}</strong>
                  </v-list-tile-content>
                </template>
              </v-select>
              
            </td>
            <td><strong class="primary--text">{{ items.item.matricula }}</strong></td>
            <!-- <td>{{ items.item.modelo_generico }}</td> -->
            <td v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
              {{ items.item.operador_sigla }}
            </td>
            <td>{{ items.item.serie }}</td>
            <td>{{ items.item.marca }}</td>
            <td>{{ items.item.modelo }}</td>
            <td>{{ items.item.propietario }}</td>
            <td>{{ $datetime.format(items.item.fecha_inscripcion) }}</td>
            <td>{{ $datetime.format(items.item.fecha_actualizacion) }}</td>
            <td>{{ items.item.modelo_generico }}</td>
            <td>{{ items.item.tipo_aeronave }}</td>
            <td>{{ items.item.categoria_estela }}</td>
            <!-- <td>{{ items.item.volumen_referencial }}</td> -->
            <td class="text-xs-right">{{ items.item.capacidad_maxima_asientos }}</td>
            <td class="text-xs-right">{{ items.item.capacidad_carga }}</td>
            <td>
              <v-icon :class="items.item.ads_b ? 'success--text' : 'error--text'">{{ items.item.ads_b ? 'check_circle' : 'cancel' }}</v-icon>
            </td>
          </template>
        </crud-table>
      </v-card-text>
    </v-card>
  </section>
</template>
<script>

import aeronaves from '@/components/itinerarios/aeronave/mixins/aeronaves';
import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import operador from '@/components/itinerarios/operador/mixins/operador';
import SelectDate from '@/common/util/SelectDate';
import layout from '@/common/layout/mixins/layout';
import LogDatos from '@/components/admin/usuario/LogDatos';

const estados = [
  { value: 'ACTIVO', text: 'ACTIVO' },
  { value: 'INACTIVO', text: 'INACTIVO' },
  { value: 'MANTENIMIENTO', text: 'MANTENIMIENTO' }
];

const categoriasEstela = [
  { value: 'H', text: 'H' },
  { value: 'M', text: 'M' },
  { value: 'L', text: 'L' }
];

export default {
  mixins: [ crud, validate, operador, aeronaves, layout ],
  created () {
    this.headers = [
      { text: this.$t('common.actions'), sortable: false },
      { text: this.$t('aeronave.crud.estado'), value: 'estado' },
      { text: this.$t('aeronave.crud.matricula'), value: 'matricula' },
      { text: this.$t('aeronave.crud.serie'), value: 'serie' },
      { text: this.$t('aeronave.crud.marca'), value: 'marca' },
      { text: this.$t('aeronave.crud.modelo'), value: 'modelo' },
      { text: this.$t('aeronave.crud.propietario'), value: 'propietario' },
      { text: this.$t('aeronave.crud.fecha_inscripcion'), value: 'fecha_inscripcion' },
      { text: this.$t('aeronave.crud.fecha_actualizacion'), value: 'fecha_actualizacion' },
      { text: this.$t('aeronave.crud.modelo_generico'), value: 'modelo_generico' },
      { text: 'Tipo de aeronave', value: 'tipo_aeronave' },
      { text: 'Categoría estela', value: 'categoria_estela' },
      // { text: 'Volumen Referencial en Lts', value: 'volumen_referencial' },
      { text: this.$t('aeronave.crud.capacidad_maxima_asientos'), value: 'capacidad_maxima_asientos', align: 'right' },
      { text: this.$t('aeronave.crud.capacidad_carga'), value: 'capacidad_carga', align: 'right' },
      { text: this.$t('aeronave.crud.ads_b'), value: 'ads_b' }
    ];

    this.filters = [
      {
        field: 'matricula',
        label: this.$t('aeronave.crud.matricula'),
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'serie',
        label: this.$t('aeronave.crud.serie'),
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'marca',
        label: this.$t('aeronave.crud.marca'),
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'modelo',
        label: this.$t('aeronave.crud.modelo'),
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'modelo_generico',
        label: this.$t('aeronave.crud.modelo_generico'),
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'propietario',
        label: this.$t('aeronave.crud.propietario'),
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'tipo_aeronave',
        label: 'Tipo de aeronave',
        type: 'text',
        typeG: 'String'
      },
      {
        field: 'categoria_estela',
        label: 'Categoría estela',
        type: 'select',
        typeG: 'CategoriaEstela',
        items: [{ value: '', text: 'TODOS' }].concat(categoriasEstela)
      },
      {
        field: 'estado',
        label: this.$t('aeronave.crud.estado'),
        type: 'select',
        typeG: 'EstadoAeronave',
        items: [{ value: '', text: 'TODOS' }].concat(estados)
      }
    ];

    if (this.$util.isRol('FELCN_ADMIN', 'FELCN')) {
      this.headers.splice(0, 1);
    }

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
      categoriasEstela,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'aeronaves',
      headers: [],
      estados,
      loading: false,
      dgacAeronaves: [],
      buscarDgacAeronaves: null,
      order: ['id_operador', 'ASC'],
      operadores: [],
      date1: null,
      date1Show: true,
      date2: null,
      date2Show: true,
      tipo: 'GRUPAL',
      form: {
        modelo_generico: '',
        matricula: '',
        serie: '',
        marca: '',
        modelo: '',
        fecha_inscripcion: '',
        propietario: '',
        observaciones: '',
        fecha_actualizacion: '',
        capacidad_maxima_asientos: '',
        capacidad_carga: '',
        ads_b: false,
        estado_dgac: '',
        descripcion: '',
        // volumen_referencial: '',
        tipo_aeronave: '',
        categoria_estela: '',
        id_operador: '',
        estado: ''
      },
      dataGraphql: `
        id
        modelo_generico
        matricula
        serie
        marca
        modelo
        fecha_inscripcion
        propietario
        observaciones
        fecha_actualizacion
        capacidad_maxima_asientos
        capacidad_carga
        ads_b
        descripcion
        tipo_aeronave
        categoria_estela
        estado
        estado_dgac
        id_operador
        operador_sigla
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      filters: [],
      valid: true,
      sync: false,
      items: [],
      matriculas: [],
      search: null,
      select: [],
      aeronave: {}
    };
  },
  methods: {
    openModal (data = {}) {
      this.dgacAeronaves = [];
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
          if (this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
            this.operadores = [{ value: data.id_operador + '', text: data.operador_sigla }];
          }
          this.form = data;
          this.form.id_operador = data.id_operador + '';
          this.date1Show = false;
          this.$nextTick(() => {
            this.date1 = this.$datetime.transform(data.fecha_inscripcion);
            this.date1Show = true;
          });
          this.date2Show = false;
          this.$nextTick(() => {
            this.date2 = this.$datetime.transform(data.fecha_actualizacion);
            this.date2Show = true;
          });
          this.tipo = 'UNICO';
        });
      } else {
        this.form = {
          modelo_generico: '',
          matricula: '',
          serie: '',
          marca: '',
          modelo: '',
          fecha_inscripcion: '',
          propietario: '',
          observaciones: '',
          fecha_actualizacion: '',
          capacidad_maxima_asientos: '',
          capacidad_carga: '',
          descripcion: '',
          // volumen_referencial: '',
          tipo_aeronave: '',
          categoria_estela: '',
          id_operador: '',
          ads_b: false,
          estado: ''
        };
        this.tipo = 'GRUPAL';
      }
      this.$store.commit('openModal');
    },
    save () {
      if (this.tipo === 'GRUPAL') {
        if (this.$refs.form.validate()) {
          if (!this.matriculas || this.matriculas.length === 0) {
            return this.$message.warning('Debe buscar y seleccionar por lo menos una matrícula.');
          }
          console.log('Matriculas de aeronaves seleccionadas::', this.matriculas.length);
          this.$service.post('itinerario/aeronave/save-all', {
            matriculas: this.matriculas,
            idOperador: this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION') ? this.$store.state.user.id_operador : this.form.id_operador
          })
          .then(response => {
            if (response) {
              this.$message.success('Aeronaves guardadas');
              this.updateList();
              this.$store.commit('closeModal');
            }
          });
        }
      } else {
        if (this.$refs.form.validate()) {
          let data = { ...this.form };
          data.fecha_inscripcion = this.$datetime.format2(this.$store.state.date['form.fecha_inscripcion']);
          data.fecha_actualizacion = this.$datetime.format2(this.$store.state.date['form.fecha_actualizacion']);
          data.capacidad_maxima_asientos = data.capacidad_maxima_asientos || 0;
          data.capacidad_carga = data.capacidad_maxima_asientos || 0;
          delete data._user_created;
          delete data._user_updated;
          delete data._created_at;
          delete data._updated_at;
          if (data.id) {
            delete data.id;
            delete data.operador_sigla;
            this.$service.graphql({
              query: `
                mutation edit($id: Int!, $aeronave: EditAeronave!) {
                  aeronaveEdit(id: $id, aeronave: $aeronave) {
                    id
                  }
                }
              `,
              variables: {
                id: this.form.id,
                aeronave: data
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
                mutation add($aeronave: NewAeronave!) {
                  aeronaveAdd(aeronave: $aeronave) {
                    id
                  }
                }
              `,
              variables: {
                aeronave: data
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
    cambiarEstado (item) {
      console.log('item aeronave >>>', JSON.stringify(item));
      this.$service.graphql({
        query: `
          mutation edit($id: Int!, $aeronave: EditAeronave!) {
            aeronaveEdit(id: $id, aeronave: $aeronave) {
              id
            }
          }
        `,
        variables: {
          id: item.id,
          aeronave: { estado: item.estado }
        }
      }).then(response => {
        if (response) {
          this.updateList();
          this.$message.success('¡Estado actualizado!');
        }
      });
    },
    sincronizar () {
      this.sync = true;
      this.$loading.show('Sincronizando aeronaves con la DGAC espere por favor');
      this.$service.get('itinerario/aeronave/sincronizar')
        .then(response => {
          this.sync = false;
          if (response.nuevos) {
            const { total, nuevos } = response;
            let msg = `
              <p class="v-alert v-alert--outline success--text">
                <i aria-hidden="true" class="icon material-icons alert__icon">check_circle</i>
                <span>La sincronización se realizó correctamente.</span>
              </p>
              <table class="v-table">
                <tbody>
                  <tr><td><strong>${nuevos.length}</strong> matrícula${nuevos.length !== 1 ? 's' : ''} nueva${nuevos.length !== 1 ? 's' : ''}${nuevos.length > 1 ? ': ' : ''}<strong>${nuevos.join(', ')}</strong>.</td></tr>
                  <tr><td><strong>${total - nuevos.length}</strong> matrícula${total - nuevos.length !== 1 ? 's' : ''} actualizada${total - nuevos.length !== 1 ? 's' : ''}.</td></tr>
                  <tr><td><strong>${total}</strong> aeronave${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''} en total.</td></tr>
                </tbody>
              </table>
              <p class="v-alert v-alert--outline warning--text">
                <i aria-hidden="true" class="icon material-icons alert__icon">warning</i>
                <span><em><strong>Nota.- </strong>Estas aeronaves <strong>sincronizadas</strong> se usan de manera interna para la solicitud de itinerarios.</em></span>
              </p>`;
            this.$alert(msg);
          }
        });
    },
    getDgacAeronave (matricula) {
      if (this.$filter.empty(this.form.id)) {
        this.$service.graphql({
          query: `
            query get($matricula: String!) {
              searchDgacAeronave(matricula: $matricula) {
                id
                modeloGenerico
                nroMatricula
                nroSerie
                marca
                modelo
                fechaInscripcion
                propietario
                estado
                observaciones
                volumenReferencial
                fechaActualizacion
              }
            }
          `,
          variables: { matricula }
        }).then(response => {
          const aeronave = response.searchDgacAeronave;
          this.form.modelo_generico = aeronave.modeloGenerico;
          this.form.serie = aeronave.nroSerie;
          this.form.marca = aeronave.marca;
          this.form.modelo = aeronave.modelo;
          this.form.propietario = aeronave.propietario;
          this.form.observaciones = aeronave.observaciones;

          this.date1Show = false;
          this.$nextTick(() => {
            this.date1 = this.$datetime.convert(aeronave.fechaInscripcion);
            this.date1Show = true;
          });
          this.date2Show = false;
          this.$nextTick(() => {
            this.date2 = this.$datetime.transform(aeronave.fechaActualizacion);
            this.date2Show = true;
          });
        });
      }
    }
  },
  watch: {
    buscarDgacAeronaves (valor) {
      if (!this.$filter.empty(valor)) {
        this.loading = true;
        this.$service.graphql({
          query: `
            query buscar($matricula: String) {
              dgacAeronaves(nroMatricula: $matricula) {
                count
                rows {
                  id
                  nroMatricula
                }
              }
            }
          `,
          variables: { matricula: valor }
        }).then(response => {
          this.loading = false;
          if (response) {
            let items = response.dgacAeronaves.rows;
            let aeronaves = [];
            items.map(item => {
              aeronaves.push({ value: item.nroMatricula, text: item.nroMatricula });
            });
            this.dgacAeronaves = aeronaves;
          } else {
            this.dgacAeronaves = [];
          }
        });
      }
    },
    'form.matricula': function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.getDgacAeronave(newVal);
      }
    },
    '$store.state.action': function (val) {
      if (val === 'agregar') {
        this.openModal();
        this.setActive('aeronaves');
        this.$store.commit('setAction', null);
      }
    }
  },
  components: {
    CrudTable,
    SelectDate,
    LogDatos
  }
};
</script>
