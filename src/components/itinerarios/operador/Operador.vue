<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">flight</v-icon> {{ $store.state.user.id_rol !== 2 ? $t('operador.title') : 'Operador aéreo' }}</h3>
    <v-card> 
      <v-card-text>
        <crud-table
          :headers="headers"
          :url="url"
          :filters="filters"
          :graphql="graphql"
          :width-modal="800"
          v-if="$store.state.user.id_rol !== 2"
        >
          <template slot="buttons">
            <v-tooltip bottom v-if="$store.state.permissions['operadores:create']">
              <v-btn color="primary"
                @click.native.stop="openModal()"
                slot="activator">
                <v-icon>add</v-icon> {{$t('common.add') }}
              </v-btn>
              <span>{{$t('operador.add')}}</span>
            </v-tooltip>
          </template>

          <template slot="form">
            <v-card-title class="headline">
              <v-flex xs9>
                <v-icon>flight</v-icon> {{ form.id ? $t('operador.edit') :  $t('operador.add') }}
              </v-flex>
              <v-flex xs2 text-md-right>
                <v-chip label color="success" text-color="white" v-if="form.estado == 'ACTIVO'">
                  {{ form.estado }}
                </v-chip>
                <v-chip label color="warning" text-color="white" v-if="form.estado == 'INACTIVO'">
                  {{ form.estado }}
                </v-chip>
              </v-flex>
              <v-flex xs1 text-md-right>
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
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs8>
                      <v-text-field
                        :label="$t('operador.crud.razon_social')"
                        v-model="form.razon_social"
                        maxlength="150"
                        required
                        :rules="$validate(['required'])"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs2>
                      <v-text-field
                        :label="$t('operador.crud.codigo_iata')"
                        v-model="form.codigo_iata"
                        maxlength="3"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs2>
                      <v-text-field
                        :label="$t('operador.crud.codigo_icao')"
                        v-model="form.codigo_icao"
                        maxlength="3"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs3>
                      <v-text-field
                        :label="$t('operador.crud.sigla')"
                        v-model="form.sigla"
                        maxlength="20"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        :label="$t('operador.crud.nit')"
                        v-model="form.nit"
                        @keydown.native="$filter.integer($event)"
                        maxlength="20"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs5>
                      <v-text-field
                        :label="$t('operador.crud.matricula_comercio')"
                        v-model="form.matricula_comercio"
                        maxlength="10"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        :label="$t('operador.crud.telefonos')"
                        v-model="form.telefonos"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-select
                        :label="$t('operador.crud.departamento')"
                        v-model="form.departamento"
                        :items="departamentos"
                        item-value="value"
                        item-text="text">
                      </v-select>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        :label="$t('operador.crud.provincia')"
                        v-model="form.provincia"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        :label="$t('operador.crud.municipio')"
                        v-model="form.municipio"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :label="$t('operador.crud.direccion')"
                        v-model="form.direccion"
                        maxlength="255"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <v-select
                        :label="$t('operador.crud.tipo')"
                        v-model="form.tipo"
                        required
                        :rules="$validate(['required'])"
                        :items="tipos"
                        item-value="value"
                        item-text="text">
                      </v-select>
                    </v-flex>
                    <v-flex xs4>
                      <v-text-field
                        :label="$t('operador.crud.licencia')"
                        v-model="form.licencia"
                        maxlength="50"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs4>
                      <select-date
                        label="Fecha de Vigencia"
                        model="form.fecha_vigencia"
                      ></select-date>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        :label="$t('operador.crud.descripcion')"
                        v-model="form.descripcion"
                        maxlength="500"
                      ></v-text-field>
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
                  <v-icon>check</v-icon> {{$t('common.save') }}
                </v-btn>
              </v-card-actions>
            </v-form>
          </template>

          <template slot="items" slot-scope="items">
            <td class="nowrap" v-if="$store.state.permissions['operadores:update']">
              <v-tooltip bottom v-if="$store.state.permissions['operadores:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="editItem(items.item.id, 'operador', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['usuarios:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="generarToken('OPERADOR', { id_operador: items.item.id })">
                  <v-icon>vpn_key</v-icon>
                </v-btn>
                <span>Generar token para el usuario</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['operadores:delete']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="deleteItem(items.item.id, 'operador')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar registro</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom v-if="$store.state.permissions['operadores:update']">
                <v-switch
                  v-model="items.item.active"
                  value="ACTIVE"
                  @change="changeActive(items.item, items.item.id, 'operador', 'EditOperador')"
                  hide-details
                  v-if="idOperador != items.item.id"
                  slot="activator"
                  color="success"></v-switch>
                <span>Activar/desactivar registro</span>
              </v-tooltip>
              <v-icon
                v-if="!$store.state.permissions['operadores:update'] && idOperador != items.item.id"
                :color="items.item.active === 'ACTIVE' ? 'success' : 'error'">
                {{ items.item.active === 'ACTIVE' ? 'check' : 'close' }}
              </v-icon>
              <v-tooltip bottom>
                <v-btn
                  icon
                  v-if="idOperador == items.item.id"
                  slot="activator">
                  <v-icon>flight</v-icon>
                </v-btn>
                <span>Esta es mi operador.</span>
              </v-tooltip>
            </td>
            <td>{{ items.item.nit }}</td>
            <td>{{ items.item.razon_social }}</td>
            <td>{{ items.item.sigla }}</td>
            <td>{{ items.item.codigo_iata }}</td>
            <td>{{ items.item.codigo_icao }}</td>
            <!-- <td>{{ items.item.matricula_comercio }}</td> -->
            <td>{{ items.item.licencia || 'Sin licencia' }}</td>
            <td>{{ $datetime.format(items.item.fecha_vigencia) }}</td>
            <td>{{ items.item.tipo }}</td>
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
        <v-form
          @submit.prevent="save"
          v-model="valid"
          ref="form"
          lazy-validation
          v-else
        >
          <v-card-text>
            <v-container grid-list-md>
              <h4>Datos generales</h4>
              <v-layout wrap>
                <v-flex xs8>
                  <v-text-field
                    :label="$t('operador.crud.razon_social')"
                    v-model="form.razon_social"
                    maxlength="150"
                    required
                    :rules="$validate(['required'])"
                  ></v-text-field>
                </v-flex>
                <v-flex xs1>
                  <v-text-field
                    :label="$t('operador.crud.codigo_iata')"
                    v-model="form.codigo_iata"
                    maxlength="3"
                  ></v-text-field>
                </v-flex>
                <v-flex xs1>
                  <v-text-field
                    :label="$t('operador.crud.codigo_icao')"
                    v-model="form.codigo_icao"
                    maxlength="3"
                  ></v-text-field>
                </v-flex>
                <v-flex xs3>
                  <v-text-field
                    :label="$t('operador.crud.sigla')"
                    v-model="form.sigla"
                    maxlength="20"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-text-field
                    :label="$t('operador.crud.nit')"
                    v-model="form.nit"
                    maxlength="20"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-text-field
                    :label="$t('operador.crud.matricula_comercio')"
                    v-model="form.matricula_comercio"
                    maxlength="10"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-text-field
                    :label="$t('operador.crud.telefonos')"
                    v-model="form.telefonos"
                    maxlength="100"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-select
                    :label="$t('operador.crud.departamento')"
                    v-model="form.departamento"
                    :items="departamentos"
                    item-value="value"
                    item-text="text"></v-select>
                </v-flex>
                <v-flex xs4>
                  <v-text-field
                    :label="$t('operador.crud.provincia')"
                    v-model="form.provincia"
                    maxlength="100"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-text-field
                    :label="$t('operador.crud.municipio')"
                    v-model="form.municipio"
                    maxlength="100"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    :label="$t('operador.crud.direccion')"
                    v-model="form.direccion"
                    maxlength="255"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <v-select
                    :label="$t('operador.crud.tipo')"
                    v-model="form.tipo"
                    required
                    :rules="$validate(['required'])"
                    :items="tipos"
                    item-value="value"
                    item-text="text">
                  </v-select>
                </v-flex>
                <v-flex xs4>
                  <v-text-field
                    :label="$t('operador.crud.licencia')"
                    v-model="form.licencia"
                    maxlength="50"
                  ></v-text-field>
                </v-flex>
                <v-flex xs4>
                  <select-date
                    label="Fecha de Vigencia"
                    model="form.fecha_vigencia"
                  ></select-date>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    :label="$t('operador.crud.descripcion')"
                    v-model="form.descripcion"
                    maxlength="500"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <small class="error--text text-required">* Los campos son obligatorios</small>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              type="submit"
              :disabled="!valid">
              <v-icon>check</v-icon> Guardar cambios
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </section>
</template>
<script>

import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import departamentos from '@/common/mixins/departamentos';
import SelectDate from '@/common/util/SelectDate';
import token from '@/components/admin/modulo/mixins/token';
import LogDatos from '@/components/admin/usuario/LogDatos';

export default {
  mixins: [ crud, validate, token ],
  created () {
    this.user = this.$storage.getUser();
    this.idOperador = this.user.id_operador;
  },
  mounted () {
    if (this.$util.isRol('OPERADOR_AVION_ADMIN')) {
      this.editItem(this.$store.state.user.id_operador, 'operador', this.dataGraphql, false);
    }
    if (this.$util.isRol('FELCN_ADMIN', 'FELCN')) {
      this.headers.splice(0, 1);
    }
  },
  data () {
    return {
      logDatos: null,
      successAlert: false,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'operadores',
      departamentos,
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: this.$t('common.active'), sortable: false },
        { text: this.$t('operador.crud.nit'), value: 'nit' },
        { text: this.$t('operador.crud.razon_social'), value: 'razon_social' },
        { text: this.$t('operador.crud.sigla'), value: 'sigla' },
        { text: this.$t('operador.crud.codigo_iata'), value: 'codigo_iata' },
        { text: this.$t('operador.crud.codigo_icao'), value: 'codigo_icao' },
        // { text: this.$t('operador.crud.matricula_comercio'), value: 'matricula_comercio' },
        { text: this.$t('operador.crud.licencia'), value: 'licencia' },
        { text: this.$t('operador.crud.fecha_vigencia'), value: 'fecha_vigencia' },
        { text: this.$t('operador.crud.tipo'), value: 'tipo' },
        { text: this.$t('common.status'), value: 'estado' }
      ],
      form: {
        nit: '',
        sigla: '',
        razon_social: '',
        matricula_comercio: '',
        codigo_iata: '',
        codigo_icao: '',
        departamento: '',
        provincia: '',
        municipio: '',
        direccion: '',
        telefonos: '',
        tipo: '',
        licencia: '',
        fecha_vigencia: '',
        descripcion: '',
        estado: ''
      },
      tipos: [
        { value: 'NACIONAL', text: 'NACIONAL' },
        { value: 'INTERNACIONAL', text: 'INTERNACIONAL' }
      ],
      menu: false,
      dataGraphql: `
        id
        nit
        sigla
        razon_social
        matricula_comercio
        codigo_iata
        codigo_icao
        departamento
        provincia
        municipio
        direccion
        telefonos
        tipo
        licencia
        fecha_vigencia
        descripcion
        estado
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      filters: [
        {
          field: 'nit',
          label: this.$t('operador.crud.nit'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'sigla',
          label: this.$t('operador.crud.sigla'),
          type: 'text',
          typeG: 'String'
        },
        // {
        //   field: 'codigo_iata',
        //   label: this.$t('operador.crud.codigo_iata'),
        //   type: 'text',
        //   typeG: 'String'
        // },
        // {
        //   field: 'codigo_icao',
        //   label: this.$t('operador.crud.codigo_icao'),
        //   type: 'text',
        //   typeG: 'String'
        // },
        {
          field: 'razon_social',
          label: this.$t('operador.crud.razon_social'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'matricula_comercio',
          label: this.$t('operador.crud.matricula_comercio'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'licencia',
          label: this.$t('operador.crud.licencia'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'tipo',
          label: this.$t('operador.crud.tipo'),
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
          label: this.$t('common.status'),
          type: 'select',
          typeG: 'EstadoOperador',
          items: [
            { value: '', text: 'TODOS' },
            { value: 'ACTIVO', text: 'ACTIVO' },
            { value: 'INACTIVO', text: 'INACTIVO' }
          ]
        }
      ],
      idOperador: null,
      valid: true
    };
  },
  methods: {
    openModal (data = {}, form = true) {
      this.valid = true;
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
          if (data.fecha_vigencia) {
            this.$datetime.setDate('form.fecha_vigencia', data.fecha_vigencia);
          }
        });
      } else {
        this.form = {
          nit: '',
          sigla: '',
          razon_social: '',
          matricula_comercio: '',
          codigo_iata: '',
          codigo_icao: '',
          departamento: '',
          provincia: '',
          municipio: '',
          direccion: '',
          telefonos: '',
          tipo: '',
          licencia: '',
          fecha_vigencia: '',
          descripcion: '',
          estado: ''
        };
      }
      if (form) {
        this.$store.commit('openModal');
      }
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.form);
        data.fecha_vigencia = this.$store.state.date['form.fecha_vigencia'];
        delete data._user_created;
        delete data._user_updated;
        delete data._created_at;
        delete data._updated_at;
        if (data.id) {
          delete data.id;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $operador: EditOperador!) {
                operadorEdit(id: $id, operador: $operador) {
                  id
                }
              }
            `,
            variables: {
              id: this.form.id,
              operador: data
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
              mutation add($operador: NewOperador!) {
                operadorAdd(operador: $operador) {
                  id
                }
              }
            `,
            variables: {
              operador: data
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
    },
    sincronizar () {
      // TODO: Implementar función de sincronización con el portál único
    },
    changeDate (date) {
      console.log('select', date);
      return this.$datetime.format(date);
    }
  },
  components: {
    CrudTable,
    SelectDate,
    LogDatos
  }
};
</script>
