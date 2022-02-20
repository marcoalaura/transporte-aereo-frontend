<template>
  <section>

    <v-card>
      <v-card-text>
        <crud-table
          :headers="headers"
          :url="url"
          :filters="filters"
          :graphql="graphql"
          id-refresh="btn-refresh-iop"
        >
          <template slot="buttons">
            <v-tooltip bottom v-if="$store.state.permissions['serviciosIop:create']">
             <v-btn color="primary" dark
               @click.native.stop="openModal()"
               slot="activator"
             ><v-icon dark>add</v-icon> {{$t('common.add') }}</v-btn>
             <span>{{$t('servicioIop.add')}}</span>
           </v-tooltip>
          </template>

          <template slot="form">
            <v-card-title class="headline">
              <v-flex xs10>
                <v-icon>business</v-icon> {{ form.id ? $t('servicioIop.crud.editServicio') :  $t('servicioIop.crud.addServicio') }}
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
                    <v-flex md4>
                      <v-text-field
                        :label="$t('servicioIop.crud.codigo')"
                        :rules="$validate(['required'])"
                        required
                        v-model="form.codigo"
                        maxlength="20"
                      ></v-text-field>
                    </v-flex>

                    <v-flex md8>
                      <v-text-field
                        :label="$t('servicioIop.crud.metodo')"
                        :rules="$validate(['required'])"
                        required
                        v-model="form.metodo"
                        maxlength="100"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-text-field
                    :label="$t('servicioIop.crud.descripcion')"
                    v-model="form.descripcion"
                    maxlength="500"
                  ></v-text-field>

                  <v-text-field
                    :label="$t('servicioIop.crud.entidad')"
                    v-model="form.entidad"
                    maxlength="255"
                  ></v-text-field>

                  <v-text-field
                    :label="$t('servicioIop.crud.url')"
                    :rules="$validate(['required'])"
                    required
                    v-model="form.url"
                    maxlength="1000"
                  ></v-text-field>

                  <v-textarea
                    :label="$t('servicioIop.crud.token')"
                    :rules="$validate(['required'])"
                    required
                    v-model="form.token"
                    maxlength="3000"
                  ></v-textarea>

                  Tipo de Servicio
                  <v-radio-group
                    v-model="form.tipo"
                    row
                    :rules="$validate(['required'])"
                    required
                  >
                    <v-radio
                      label="CONVENIO"
                      value="CONVENIO"
                    ></v-radio>
                    <v-radio
                      label="PUBLICO"
                      value="PUBLICO"
                    ></v-radio>
                  </v-radio-group>

                </v-container>
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
            <td class="nowrap">
              <v-tooltip bottom v-if="$store.state.permissions['serviciosIop:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="editItem(items.item.id, 'servicioIop', dataGraphql)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['serviciosIop:delete']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="deleteItem(items.item.id, 'servicioIop')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar registro</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom v-if="$store.state.permissions['serviciosIop:update']">
                <v-switch
                  v-model="items.item.active"
                  value="ACTIVE"
                  @change="changeActive(items.item, items.item.id, 'servicioIop', 'EditServicioIop')"
                  hide-details
                  slot="activator"
                  color="success"></v-switch>
                <span>Activar/desactivar registro</span>
              </v-tooltip>
            </td>
            <td>{{ items.item.codigo }}</td>
            <td>{{ items.item.entidad }}</td>
            <td>{{ items.item.metodo }}</td>
            <td>{{ items.item.descripcion }}</td>
            <td>
              <v-tooltip bottom>
                <span slot="activator">{{ $filter.characters(items.item.url, 50) }}</span>
                <span>{{ items.item.url }}</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom>
                <span slot="activator">{{ $filter.characters(items.item.token, 50) }}</span>
                <span>{{ items.item.token }}</span>
              </v-tooltip>
            </td>
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
      </v-card-text>
    </v-card>
  </section>
</template>
<script>

import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';

export default {
  mixins: [ crud, validate ],
  created () {
    this.user = this.$storage.getUser();
  },
  data () {
    return {
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'serviciosIop',
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: this.$t('common.active'), sortable: false },
        { text: this.$t('servicioIop.crud.codigo'), value: 'codigo' },
        { text: this.$t('servicioIop.crud.entidad'), value: 'entidad' },
        { text: this.$t('servicioIop.crud.metodo'), value: 'metodo' },
        { text: this.$t('servicioIop.crud.descripcion'), value: 'descripcion' },
        { text: this.$t('servicioIop.crud.url'), value: 'url' },
        { text: this.$t('servicioIop.crud.token'), value: 'token' },
        { text: this.$t('servicioIop.crud.tipo'), value: 'tipo' },
        { text: this.$t('servicioIop.crud.estado'), value: 'estado' }
      ],
      form: {
        codigo: '',
        metodo: '',
        descripcion: '',
        entidad: '',
        url: '',
        token: '',
        tipo: 'CONVENIO'
      },
      dataGraphql: `
        id
        codigo
        metodo
        descripcion
        entidad
        url
        token
        tipo
        estado
      `,
      filters: [
        {
          field: 'codigo',
          label: this.$t('servicioIop.crud.codigo'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'metodo',
          label: this.$t('servicioIop.crud.metodo'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'entidad',
          label: this.$t('servicioIop.crud.entidad'),
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'tipo',
          label: this.$t('servicioIop.crud.tipo'),
          type: 'select',
          typeG: 'TipoServicioIop',
          items: [
            { value: '', text: 'TODOS' },
            { value: 'CONVENIO', text: 'CONVENIO' },
            { value: 'PUBLICO', text: 'PUBLICO' }
          ]
        },
        {
          field: 'estado',
          label: this.$t('user.crud.status'),
          type: 'select',
          typeG: 'EstadoServicioIop',
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
  methods: {
    openModal (data = {}) {
      this.$refs.form.reset();
      if (data.id) {
        this.$nextTick(() => {
          this.form = data;
        });
      } else {
        this.form = {
          codigo: '',
          metodo: '',
          descripcion: '',
          entidad: '',
          url: '',
          token: '',
          tipo: 'CONVENIO'
        };
      }
      this.$store.commit('openModal');
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.form);
        if (data.id) {
          delete data.id;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $servicio: EditServicioIop!) {
                servicioIopEdit(id: $id, servicioIop: $servicio) {
                  id
                }
              }
            `,
            variables: {
              id: this.form.id,
              servicio: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList('btn-refresh-iop');
              this.$message.success('Se actualizó el registro correctamente');
            }
          });
        } else {
          this.$service.graphql({
            query: `
              mutation add($servicio: NewServicioIop!) {
                servicioIopAdd(servicioIop: $servicio) {
                  id
                }
              }
            `,
            variables: {
              servicio: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList('btn-refresh-iop');
              this.$message.success();
            }
          });
        }
      }
    }
  },
  components: {
    CrudTable
  }
};
</script>
