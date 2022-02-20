<template>
  <section>
    <h3 class="primary--text"><v-icon info>person_outline</v-icon> {{$t('user.title') }}</h3>
    <v-card>
      <v-card-text>
        <crud-table
          :headers="headers"
          :url="url"
          :filters="filters"
          :graphql="graphql"
          :data-graphql="dataGraphql"
          :widthModal="840"
        >
          <template slot="buttons">
            <v-tooltip bottom v-if="$store.state.permissions['usuarios:create']">
              <v-btn
                color="primary"
                @click.native.stop="openModal()"
                slot="activator"
              ><v-icon>person_add</v-icon> {{$t('common.add') }}</v-btn>
              <span>{{$t('user.add')}}</span>
            </v-tooltip>
          </template>

          <template slot="form" slot-scope="props">
            <v-card-title class="headline">
              <v-icon>{{ form.id ? 'person' : 'person_add' }}</v-icon> {{ id ? $t('user.crud.editUser') : $t('user.crud.addUser') }}
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
              <v-alert color="info"
                value="true"
                v-if="form.usuario == username && form.id">
                Puede cambiar su contraseña yendo a:
                <router-link to="/account" class="white--text">
                  <strong><v-icon dark class="icon-small">person</v-icon> {{ $t('app.account') }}</strong>
                </router-link>.
              </v-alert>
              <v-card-text class="pt-0">
                <v-container grid-list-md class="pt-0">
                  <h4>Datos de usuario</h4>
                  <v-layout row wrap>
                    <v-flex xs6>
                      <v-text-field
                        label="Nombre de usuario"
                        prepend-icon="person"
                        v-model="usuario"
                        maxlength="50"
                        autocomplete="off"
                        :rules="$validate(['required'])"
                        required
                        autofocus
                        ></v-text-field>
                    </v-flex>

                    <v-flex xs6>
                      <v-text-field
                        v-if="!id"
                        label="Contraseña"
                        v-model="contrasena"
                        :prepend-icon="getIcon"
                        @click:prepend="changeIcon"
                        :type="hidePass ? 'password' : 'text'"
                        maxlength="50"
                        autocomplete="off"
                        :rules="$validate(['required'])"
                        required
                        ></v-text-field>
                    </v-flex>

                    <v-flex xs6>
                      <v-text-field
                        label="Correo electrónico"
                        v-model="email"
                        maxlength="100"
                        prepend-icon="email"
                        :rules="$validate(['email'])"
                        ></v-text-field>
                    </v-flex>

                    <v-flex xs6>
                      <v-text-field
                        label="Cargo"
                        v-model="cargo"
                        maxlength="100"
                        ></v-text-field>
                    </v-flex>

                    <v-flex xs7>
                      <v-autocomplete
                        :items="entidades"
                        v-model="id_entidad"
                        label="Entidad"
                        item-text="text"
                        item-value="value"
                        noDataText="No hay resultados"
                        :rules="$validate(['required'])"
                        required
                        ></v-autocomplete>
                    </v-flex>

                    <v-flex xs5 v-if="!(usuario == username && id)">
                      <v-autocomplete
                        :items="roles"
                        v-model="id_rol"
                        label="Rol"
                        item-text="text"
                        item-value="value"
                        :rules="$validate(['required'])"
                        required
                        ></v-autocomplete>
                    </v-flex>

                    <v-flex xs7 v-if="$util.isRol('FELCN_ADMIN', 'AASANA_ADMIN') && ['15', '16'].indexOf(id_rol) !== -1">
                      <v-autocomplete
                        :items="aeropuertos"
                        v-model="id_aeropuerto"
                        label="Aeropuerto Designado"
                        item-text="text"
                        item-value="value"
                        :rules="$validate(['required'])"
                        required
                        ></v-autocomplete>
                    </v-flex>

                    <v-flex xs7 v-if="$util.isRol('SUPERADMIN') && ['6', '7'].indexOf(id_rol) !== -1 && id_entidad == 6">
                      <v-autocomplete
                        :items="operadores"
                        v-model="id_operador"
                        label="Operador"
                        item-text="text"
                        item-value="value"
                        :rules="$validate(['required'])"
                        required
                        ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                  <h4>Datos personales</h4>
                  <persona-form store="usuario/" v-if="personaDatos" :db="true"></persona-form>

                </v-container>
                <log-datos :data="logDatos" v-if="logDatos"></log-datos>
              </v-card-text>
              <v-card-actions>
                <small class="error--text text-required">* Los campos son obligatorios</small>
                <v-spacer></v-spacer>
                <v-btn @click.native="$store.commit('closeModal');"><v-icon>cancel</v-icon> {{$t('common.cancel') }}</v-btn>
                <v-btn color="primary" type="submit"><v-icon>check</v-icon> {{$t('common.save') }}</v-btn>
              </v-card-actions>
            </v-form>
          </template>

          <template slot="items" slot-scope="items">
            <td class="nowrap">
              <v-tooltip bottom v-if="$store.state.permissions['usuarios:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="editItem(items.item.id, 'usuario', dataGraphqlAll)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <span>Editar registro</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['usuarios:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="generarToken('USUARIO', { usuario: items.item.usuario })">
                  <v-icon>vpn_key</v-icon>
                </v-btn>
                <span>Generar token para el usuario</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$store.state.permissions['usuarios:update']">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="regenerarPassword(items.item.id)">
                  <v-icon>lock_open </v-icon>
                </v-btn>
                <span>Regenerar contraseña</span>
              </v-tooltip>
              <v-tooltip
                bottom
                v-if="$store.state.permissions['usuarios:delete'] && username !== items.item.usuario">
                <v-btn
                  icon
                  slot="activator"
                  @click.native="deleteItem(items.item.id, 'usuario')">
                  <v-icon color="red">delete</v-icon>
                </v-btn>
                <span>Eliminar registro</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip bottom v-if="$store.state.permissions['usuarios:update']">
                <v-switch
                  v-model="items.item.active"
                  value="ACTIVE"
                  v-if="username !== items.item.usuario"
                  @change="changeActive(items.item, items.item.id, 'usuario', 'EditUsuario', null, 'Update')"
                  hide-details
                  slot="activator"
                  color="success"></v-switch>
                <span>Activar/desactivar registro</span>
              </v-tooltip>
              <v-icon
                v-if="!$store.state.permissions['usuarios:update'] && username !== items.item.usuario"
                :color="items.item.active === 'ACTIVE' ? 'success' : 'error'">
                {{ items.item.active === 'ACTIVE' ? 'check' : 'close' }}
              </v-icon>
              <v-tooltip bottom>
                <router-link
                  to="/account"
                  v-if="username === items.item.usuario"
                  slot="activator">
                  <v-icon>person</v-icon>
                </router-link>
                <span>Este usuario soy yo, clic aquí para ir a mi cuenta.</span>
              </v-tooltip>
            </td>
            <td>{{ items.item.usuario }}</td>
            <td>{{ items.item.persona_primer_apellido }} {{ items.item.persona_segundo_apellido }} {{ items.item.persona_nombres }}</td>
            <td>{{ items.item.email }}</td>
            <td>{{ items.item.entidad_nombre }}</td>
            <td>{{ (items.item.rol_nombre).replace(/_/gi, ' ') }}</td>
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
import Auth from '@/components/admin/auth/mixins/auth';
import validate from '@/common/mixins/validate';
import usuario from './mixins/usuario';
import operador from '@/components/itinerarios/operador/mixins/operador';
import PersonaForm from '@/components/admin/persona/PersonaForm';
import token from '@/components/admin/modulo/mixins/token';
import LogDatos from '@/components/admin/usuario/LogDatos';

import { createHelpers } from 'vuex-map-fields';

const { mapFields } = createHelpers({
  getterType: 'usuario/getField',
  mutationType: 'usuario/updateField'
});

export default {
  mixins: [ crud, validate, Auth, usuario, operador, token ],
  created () {
    this.user = this.$storage.getUser();
    this.username = this.user.usuario;
    this.entidades = [];
    this.getEntidades(0);
    this.roles = [];
    this.getRoles(1);
  },
  mounted () {
    if (this.$util.isRol('FELCN_ADMIN', 'AASANA_ADMIN')) {
      this.getAeropuertos();
    }
    if (this.$util.isRol('SUPERADMIN')) {
      this.getOperadores(null, 'operadores');
    }
  },
  data () {
    return {
      logDatos: null,
      operadores: [],
      personaDatos: false,
      graphql: true, // Definiendo el CRUD con Graphql
      url: 'usuarios',
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: this.$t('common.active'), sortable: false },
        { text: this.$t('user.crud.user'), value: 'usuario' },
        { text: this.$t('user.crud.fullname'), value: 'nombre_completo' },
        { text: this.$t('user.crud.email'), value: 'email' },
        { text: this.$t('user.crud.entity'), value: 'id_entidad' },
        { text: this.$t('user.crud.role'), value: 'id_rol' },
        { text: this.$t('user.crud.status'), value: 'estado' }
      ],
      dataGraphql: `
        id
        usuario
        email
        persona_nombres
        persona_primer_apellido
        persona_segundo_apellido
        persona_telefono
        estado
        id_entidad
        id_operador
        id_rol
        entidad_nombre
        rol_nombre
      `,
      dataGraphqlAll: `
        id
        usuario
        email
        cargo
        estado
        id_entidad
        id_rol
        id_persona
        id_operador
        id_aeropuerto
        persona_nombres
        persona_primer_apellido
        persona_segundo_apellido
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
        rol_nombre
        entidad_nombre
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      form: {
        usuario: '',
        contrasena: '',
        email: '',
        id_entidad: null,
        id_rol: null,
        id_aeropuerto: null,
        id_operador: null
      },
      filters: [
        {
          field: 'id_entidad',
          label: this.$t('user.crud.entity'),
          type: 'select',
          typeG: 'Int',
          items: []
        },
        {
          field: 'id_rol',
          label: this.$t('user.crud.role'),
          type: 'select',
          typeG: 'Int',
          items: []
        },
        {
          field: 'usuario',
          label: this.$t('user.crud.user'),
          type: 'text',
          typeG: 'String'
        },
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
          typeG: 'EstadoUsuario',
          items: [
            { value: '', text: 'TODOS' },
            { value: 'ACTIVO', text: 'ACTIVO' },
            { value: 'INACTIVO', text: 'INACTIVO' }
          ]
        }
      ],
      hidePass: true,
      username: null,
      valid: true,
      aeropuertos: []
    };
  },
  computed: {
    getIcon () {
      if (this.contrasena) {
        return this.contrasena.length === 0 ? 'lock' : this.hidePass ? 'visibility' : 'visibility_off';
      }
      return 'lock';
    },
    // Cargando datos del usuario del store
    ...mapFields([
      'form.id',
      'form.usuario',
      'form.contrasena',
      'form.email',
      'form.cargo',
      'form.id_entidad',
      'form.id_rol',
      'form.id_aeropuerto',
      'form.id_operador',
      'form.id_persona'
    ])
  },
  methods: {
    changeIcon () {
      if (this.contrasena && this.contrasena.length) {
        this.hidePass = !this.hidePass;
      }
    },
    openModal (data = {}) {
      this.$refs.form.reset();
      this.$store.commit('setDate', { 'form.fecha_nacimiento': null });
      this.$store.commit('usuario/cleanForm');
      this.logDatos = null;
      if (data.id) {
        this.$nextTick(() => {
          this.logDatos = {
            _user_created: data._user_created,
            _user_updated: data._user_updated,
            _created_at: data._created_at,
            _updated_at: data._updated_at
          };
          this.$store.commit('usuario/setForm', {
            id: data.id,
            usuario: data.usuario,
            email: data.email,
            cargo: data.cargo,
            estado: data.estado,
            id_entidad: data.id_entidad + '',
            id_rol: data.id_rol + '',
            id_persona: data.id_persona,
            id_operador: data.id_operador ? data.id_operador + '' : null,
            id_aeropuerto: data.id_aeropuerto ? data.id_aeropuerto + '' : null,
            tipo_documento: data.persona_tipo_documento,
            tipo_documento_otro: data.persona_tipo_documento_otro,
            nro_documento: data.persona_nro_documento,
            fecha_nacimiento: data.persona_fecha_nacimiento,
            nombres: data.persona_nombres,
            primer_apellido: data.persona_primer_apellido,
            segundo_apellido: data.persona_segundo_apellido,
            nombre_completo: data.persona_nombre_completo,
            telefono: data.persona_telefono,
            movil: data.persona_movil,
            nacionalidad: data.persona_nacionalidad,
            pais_nacimiento: data.persona_pais_nacimiento,
            genero: data.persona_genero,
            estado_persona: data.persona_estado,
            persona: {
              nombres: data.persona_nombres,
              paterno: data.persona_primer_apellido,
              materno: data.persona_segundo_apellido
            }
          });
          if (data.persona_fecha_nacimiento) {
            this.$store.commit('setDate', { 'form.fecha_nacimiento': this.$datetime.transform(data.persona_fecha_nacimiento) });
          }
          this.personaDatos = false;
          this.$nextTick(() => {
            this.personaDatos = true;
          });
        });
      } else {
        this.personaDatos = true;
        this.$store.commit('usuario/cleanForm');
      }
      this.$store.commit('openModal');
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = { ...this.$store.state.usuario.form };
        console.log('data', data);
        data.fecha_nacimiento = this.$datetime.format2(this.$store.state.date['form.fecha_nacimiento']);
        if (this.$filter.empty(data.id_operador)) {
          delete data.id_operador;
        }
        if (this.$filter.empty(data.id_aeropuerto)) {
          delete data.id_aeropuerto;
        }
        delete data.persona;
        if (data.id) {
          const id = data.id;
          delete data.id;
          delete data.contrasena;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $usuario: EditUsuario!) {
                usuarioEdit(id: $id, usuario: $usuario) {
                  id
                }
              }
            `,
            variables: {
              id,
              usuario: data
            }
          }).then(response => {
            if (response) {
              if (this.username === this.usuario) {
                this.$message.warning('Sus datos fueron actualizados, debe ingresar de nuevo al sistema.');
                this.logout();
              } else {
                this.$store.commit('closeModal');
                this.updateList();
                this.$message.success('Se actualizó el registro correctamente');
                this.$store.commit('usuario/cleanForm');
              }
            }
          });
        } else {
          delete data.id;
          delete data.id_persona;
          delete data.estado;
          delete data.estado_persona;
          this.$service.graphql({
            query: `
              mutation add($usuario: NewUsuario!) {
                usuarioAdd(usuario: $usuario) {
                  id
                }
              }
            `,
            variables: {
              usuario: data
            }
          }).then(response => {
            if (response) {
              this.$store.commit('closeModal');
              this.updateList();
              this.$message.success();
              this.$store.commit('usuario/cleanForm');
            }
          });
        }
      }
    },
    getAeropuertos () {
      this.$service.graphql({
        query: `
          query {
            aeropuertos(pais: "BOLIVIA", estado: ACTIVO) {
              count
              rows {
                id
                codigo_icao
                codigo_iata
                nombre
                ciudad
                pais
              }
            }
          }
        `
      }).then(response => {
        this.loading = false;
        if (response) {
          let items = response.aeropuertos.rows;
          let aeropuertos = [];
          items.map(item => {
            if (item.codigo_iata !== 'N/A') {
              aeropuertos.push({ value: item.id, text: item.codigo_iata + ' - ' + item.nombre });
            }
          });
          this.aeropuertos = aeropuertos;
        } else {
          this.aeropuertos = [];
        }
      });
    }
  },
  components: {
    CrudTable,
    PersonaForm,
    LogDatos
  }
};
</script>
