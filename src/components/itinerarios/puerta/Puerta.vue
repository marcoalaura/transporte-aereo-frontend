<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">airplanemode_active</v-icon> Puertas del Aeropuerto</h3>
    <v-card>
       <v-card-text>
          <crud-table
            :headers="headers"
            :url="url"
            :filters="filters"
            :graphql="graphql"
            :width-modal="420"
          >
            <template slot="buttons">
              <v-tooltip bottom v-if="$store.state.permissions['puertas:create']">
                <v-btn color="primary" dark
                  @click.native.stop="openModal()"
                  slot="activator"
                ><v-icon dark>add</v-icon> {{$t('common.add')}}</v-btn>
                <span>Agregar nueva puerta</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn slot="activator" @click="$router.push('/aeropuertos')"><v-icon>keyboard_arrow_left</v-icon> Volver</v-btn>
                <span>Volver a aeropuertos</span>
              </v-tooltip>
            </template>
            <template slot="labels">
              <div class="detalle-title text-xs-right">
                <h3><small>AEROPUERTO:</small> <strong class="info--text">{{ aeropuerto.nombre }}</strong></h3>
                <p>CIUDAD:<strong>{{ aeropuerto.ciudad }}</strong></p>
                <p>PAÍS:<strong>{{ aeropuerto.pais }}</strong></p>
              </div>
            </template>
            <template slot="form">
              <v-card-title class="headline">
                <v-icon>airplanemode_active</v-icon> {{ form.id ? 'Editar puerta para vuelo' :  'Agregar puerta para vuelo' }}
                <v-spacer></v-spacer>
                <v-btn icon @click.native="$store.commit('closeModal')">
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
                    <v-layout row wrap>
                      <v-flex md12>
                        <v-text-field
                          label="Número de puerta"
                          v-model="form.nro_puerta"
                          maxlength="5"
                          :rules="$validate(['required'])"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex md12>
                        <v-select
                          label="Tipo de vuelo"
                          :items="vuelos"
                          v-model="form.tipo_vuelo"
                          :rules="$validate(['required'])"
                          required
                          ></v-select>
                      </v-flex>
                    </v-layout>
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
                <v-tooltip bottom v-if="$store.state.permissions['puertas:update']">
                  <v-btn
                    icon
                    slot="activator"
                    @click.native="editItem(items.item.id, 'puerta', dataGraphql)">
                    <v-icon>edit</v-icon>
                  </v-btn>
                  <span>Editar registro</span>
                </v-tooltip>
                <v-tooltip bottom v-if="$store.state.permissions['puertas:delete']">
                  <v-btn
                    icon
                    slot="activator"
                    @click.native="deleteItem(items.item.id, 'puerta')">
                    <v-icon color="red">delete</v-icon>
                  </v-btn>
                  <span>Eliminar registro</span>
                </v-tooltip>
              </td>
              <td>
                <v-tooltip bottom v-if="$store.state.permissions['puertas:update']">
                  <v-switch
                    v-model="items.item.active"
                    value="ACTIVE"
                    @change="changeActive(items.item, items.item.id, 'puerta', 'EditPuerta')"
                    hide-details
                    v-if="idPuerta != items.item.id"
                    slot="activator"
                    color="success"></v-switch>
                  <span>Activar/desactivar registro</span>
                </v-tooltip>
                <v-icon
                  v-if="!$store.state.permissions['puertas:update'] && idPuerta != items.item.id"
                  :color="items.item.active === 'ACTIVE' ? 'success' : 'error'">
                  {{ items.item.active === 'ACTIVE' ? 'check' : 'close' }}
                </v-icon>
                <v-tooltip bottom>
                  <v-btn
                    icon
                    v-if="idPuerta == items.item.id"
                    slot="activator">
                    <v-icon>business</v-icon>
                  </v-btn>
                  <span>Puerta.</span>
                </v-tooltip>
              </td>
              <td class="text-uppercase">{{ items.item.nro_puerta }}</td>
              <td>{{ items.item.tipo_vuelo }}</td>
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

const vuelos = [
  { value: 'NACIONAL', text: 'NACIONAL' },
  { value: 'INTERNACIONAL', text: 'INTERNACIONAL' }
];

export default {
  mixins: [ crud, validate ],
  data () {
    return {
      puertas: [],
      vuelos,
      graphql: true,
      url: 'puertas',
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: 'Estado', value: 'estado', sortable: false },
        { text: 'Nro. de puerta', value: 'nro_puerta' },
        { text: 'Tipo de vuelo', value: 'tipo_vuelo' }
      ],
      filters: [],
      form: {
        nro_puerta: '',
        tipo_vuelo: 'NACIONAL'
      },
      dataGraphql: `
        id
        nro_puerta
        estado
        tipo_vuelo
      `,
      valid: true,
      aeropuerto: {}
    };
  },
  created () {
    this.user = this.$storage.getUser();
    this.idPuerta = this.user.id_puerta;
    if (this.$route.params.id && this.$filter.isInteger(this.$route.params.id)) {
      this.idAeropuerto = parseInt(this.$route.params.id);
      this.getAeropuerto(this.idAeropuerto);
      this.filters = [
        {
          field: 'id_aeropuerto',
          type: 'hidden',
          typeG: 'Int',
          value: this.idAeropuerto
        }
      ];
    }
  },
  methods: {
    getAeropuerto (id) {
      this.$service.graphql({
        query: `
          query {
            aeropuerto(id: ${id}) {
              id
              codigo_icao
              codigo_iata
              nombre
              ciudad
              pais
            }
          }
        `
      }).then(response => {
        this.aeropuerto = response.aeropuerto;
      });
    },
    openModal (data = {}) {
      this.$refs.form.reset();
      if (data.id) {
        this.$nextTick(() => {
          this.form = data;
        });
      } else {
        this.form = {
          nro_puerta: '',
          tipo_vuelo: 'NACIONAL'
        };
      }
      this.$store.commit('openModal');
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.form);
        data.id_aeropuerto = this.idAeropuerto;
        if (data.id) {
          delete data.id;
          this.$service.graphql({
            query: `
              mutation edit($id: Int!, $puerta: EditPuerta!) {
                puertaEdit(id: $id, puerta: $puerta) {
                  id
                }
              }
            `,
            variables: {
              id: this.form.id,
              puerta: data
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
          // data.estado = 'ACTIVO';
          this.$service.graphql({
            query: `
              mutation add($puerta: NewPuerta!) {
                puertaAdd(puerta: $puerta) {
                  id
                }
              }
            `,
            variables: {
              puerta: data
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
  components: {
    CrudTable
  }
};
</script>
<style lang="scss">
  .detalle-title {
    margin-bottom: 10px;

    h3 {
      margin: 0;
      font-size: 1.3rem;
    }

    p {
      margin: 0;
    }
    .sub {
      font-size: .85rem;
      line-height: 1.2rem;
    }
  }
</style>

