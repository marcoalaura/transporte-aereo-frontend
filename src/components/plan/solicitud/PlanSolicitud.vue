<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">local_airport</v-icon> Plan de vuelos</h3>
    <v-card>
      <v-tabs
        v-model="active"
        class="tab-listado"
        color="info"
        dark
        slider-color="warning"
      >
        <!-- tabs -->
        <v-tab
          key="planes"
          href="#planes"
          id="planes"
          ripple>
          <v-icon>local_airport</v-icon> Solicitudes de Plan de Vuelo
        </v-tab>
        <v-tab
          v-if="!$util.isRol('FELCN_ADMIN', 'FELCN', 'AASANA_ADMIN', 'AASANA')"
          key="solicitudes"
          id="solicitudes"
          href="#solicitudes"
          ripple>
          <v-icon>playlist_add_check</v-icon> Solicitudes de itinerario
        </v-tab>
        <v-tab-item key="planes" id="planes">
          <v-card-text>
            <crud-table
              :headers="headers"
              :url="url"
              :filters="filters"
              :order="order"
              :graphql="graphql"
              :showFilter="true"
              :data-graphql="dataGraphql"
              :width-modal="680"
            >
              <template slot="buttons">
                <v-tooltip bottom
                  v-if="$store.state.permissions['solicitudes:create'] && $util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
                  <v-btn color="primary"
                  @click.native.stop="openAdd()"
                  slot="activator"
                  ><v-icon>add</v-icon> Nuevo plan de vuelo</v-btn>
                  <span>Crear nuevo plan de vuelo</span>
                </v-tooltip>
              </template>
              <template slot="items" slot-scope="items">
                <td class="text-xs-center">{{ items.item.id }}</td>
                <td class="nowrap">
                  <v-tooltip bottom v-if="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
                    <v-btn
                      slot="activator"
                      small
                      @click.native="$router.push(`planVuelo/${items.item.id}`)">
                      <v-icon>local_airport</v-icon> Ver detalle
                    </v-btn>
                    <span>Ver Detalle de Plan de Vuelo</span>
                  </v-tooltip>
                  <!-- Boton ver detalle de plan de vuelo para FELCN -->
                  <v-tooltip bottom v-if="$util.isRol('FELCN_ADMIN', 'FELCN') && items.item.estado !== 'CREADO'">
                    <v-btn
                      slot="activator"
                      small
                      @click.native="$router.push(`planVuelo/${items.item.id}`)">
                      <v-icon>local_airport</v-icon> Ver detalle
                    </v-btn>
                    <span>Ver Detalle de Plan de Vuelo</span>
                  </v-tooltip>
                  <!-- Boton ver detalle de plan de vuelo para AASANA -->
                  <v-tooltip bottom v-if="$util.isRol('AASANA_ADMIN', 'AASANA', 'SABSA_ADMIN', 'SABSA') && (items.item.estado !== 'CREADO')">
                    <v-btn
                      slot="activator"
                      small
                      @click.native="$router.push(`planVuelo/${items.item.id}`)">
                      <v-icon>local_airport</v-icon> Ver detalle
                    </v-btn>
                    <span>Ver Detalle de Plan de Vuelo</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update'] && !$util.isRol('AASANA_ADMIN', 'AASANA') && (items.item.estado === 'CREADO' || items.item.estado === 'RECHAZADO')">
                    <v-btn
                      slot="activator"
                      class="black--text"
                      small
                      @click.native="openModalPlanVuelo(items.item)">
                      <v-icon>edit</v-icon> Editar
                    </v-btn>
                    <span><strong>Editar Plan de Vuelo</strong></span>
                  </v-tooltip>
                </td>
                <td v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">{{ items.item.operador_sigla }}</td>
                <td>{{ $datetime.format(items.item.fecha_desde ) }}</td>
                <td>{{ $datetime.format(items.item.fecha_hasta ) }}</td>
                <td>{{ items.item.nro_serie }}</td>
                <td>{{ items.item.inf_suplementaria }}</td>
                <td>
                  <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update']">
                    <v-btn
                      slot="activator"
                      small
                      @click.native="$router.push(`itinerario/${items.item.id_solicitud_itinerario}`)">
                      <v-icon>playlist_add_check</v-icon> Ver itinerario {{ items.item.id_solicitud_itinerario }}
                    </v-btn>
                    <span>Ver solicitud de itinerarios</span>
                  </v-tooltip>
                </td>
                <td>
                  <v-chip label :color="estados[items.item.estado].bg" :text-color="estados[items.item.estado].color">
                    {{ estados[items.item.estado].text }}
                  </v-chip>
                </td>
              </template>
            </crud-table>
          </v-card-text>
        </v-tab-item>
        <v-tab-item key="solicitudes" id="solicitudes" v-if="!$util.isRol('FELCN_ADMIN', 'AASANA_ADMIN', 'FELCN', 'AASANA')">
          <v-card-text>
            <crud-table
              v-model="itemsObtenidos"
              :headers="headersSolicitudes"
              :url="urlSolicitudes"
              :filters="filtersSolicitudes"
              :order="orderSolicitudes"
              :graphql="graphqlSolicitudes"
              :data-graphql="dataGraphqlSolicitudes"
              :showFilter="true"
              :width-modal="680">
              <template slot="items" slot-scope="items">
                <!--<td>{{ items.item.operador_sigla }} - {{ items.item.id_operador }}</td>-->
                <td class="text-xs-center">{{ items.item.id }}</td>
                <td class="nowrap" v-if="$store.state.permissions['solicitudes:update']">
                  <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update']">
                    <v-btn
                      slot="activator"
                      small
                      @click.native="$router.push(`itinerario/${items.item.id}`)">
                      <v-icon>playlist_add_check</v-icon> Ver solicitud
                    </v-btn>
                    <span>Ver solicitud de itinerarios</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="(items.item.estado === 'APROBADO' || items.item.estado === 'PLAN_VUELO_APROBADO') && $util.isRol('OPERADOR_AVION', 'OPERADOR_AVION_ADMIN')">
                    <v-btn
                      slot="activator"
                      small
                      color="success"
                      v-if="habilitados[items.item.id]"
                      @click.native="openModalPlanVuelo(items.item)">
                      <v-icon>local_airport</v-icon> Crear plan de vuelos
                    </v-btn>
                    <!-- <v-btn
                      slot="activator"
                      small
                      v-else-if="habilitados[items.item.id].limite"
                      outline
                      color="info">
                      <v-icon>info</v-icon>Plan de vuelo completo
                    </v-btn> -->
                    <v-chip
                      slot="activator"
                      small
                      label
                      v-else
                      outline
                      color="info">
                      <v-icon>info</v-icon>
                      {{ completados[items.item.id] ? 'Planes de vuelo completado' : 'Fuera de rango de fecha para crear Plan de vuelo' }}
                    </v-chip>
                    <span>{{ habilitados[items.item.id] ? 'Crear Plan de Vuelos para esta Solicitud de Itinerario' : 'No se puede Crear Plan de Vuelos' }}</span>
                  </v-tooltip>
                </td>
                <td v-if="!$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">{{ items.item.operador_sigla }}</td>
                <td>{{ $datetime.format(items.item.fecha_inicio ) }}</td>
                <td>{{ $datetime.format(items.item.fecha_fin ) }}</td>
                <td>{{ items.item.operador_tipo }}</td>
                <td>
                  <v-chip
                    label
                    :color="estados[items.item.estado].bg"
                    :text-color="estados[items.item.estado].color">
                    {{ estados[items.item.estado].text }}
                  </v-chip>
                </td>
              </template>
            </crud-table>
          </v-card-text>
        </v-tab-item>
      </v-tabs>
    </v-card>
    <!-- Modal para creacion y edición de plan de vuelo -->
    <v-dialog v-model="$store.state.modal6" max-width="650" persistent>
      <plan-solicitud-modal
        :planVuelo="planSolicitud"
        :rangoFechasPermitidas="rangoFechasPermitidas"
        :logDatos="logDatos"
      ></plan-solicitud-modal>
    </v-dialog>
  </section>
</template>

<script>
import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import operador from '@/components/itinerarios/operador/mixins/operador';
import solicitud from '@/components/itinerarios/solicitud/mixins/solicitud';
import PlanSolicitudModal from '@/components/plan/solicitud/PlanSolicitudModal';

const estados = {
  CREADO: { text: 'CREADO', color: 'black', bg: 'gray' },
  SOLICITADO: { text: 'SOLICITADO', color: 'white', bg: 'info' },
  APROBADO: { text: 'APROBADO', color: 'white', bg: 'success' },
  OBSERVADO: { text: 'OBSERVADO', color: 'white', bg: 'orange' },
  RECHAZADO: { text: 'RECHAZADO', color: 'white', bg: 'error' },
  REPROGRAMADO: { text: 'REPROGRAMADO', color: 'white', bg: 'error' },
  PLAN_VUELO_CREADO: { text: 'PLAN DE VUELO CREADO', color: 'white', bg: 'primary' },
  PLAN_VUELO_APROBADO: { text: 'PLAN DE VUELO APROBADO', color: 'white', bg: 'success' },
  APROBADO_FELCN: { text: 'APROBADO FELCN', color: 'white', bg: 'success' },
  APROBADO_AASANA: { text: 'APROBADO AASANA', color: 'white', bg: 'success' }
};

export default {
  mixins: [ crud, operador, solicitud ],
  created () {
    this.operador = this.$store.state.user.id_operador;
    this.$store.commit('closeModal', 6);
    this.headersSolicitudes = [
      { text: 'N° Solicitud', value: 'id' },
      { text: this.$t('common.actions'), sortable: false },
      { text: this.$t('solicitud.crud.fecha_inicio'), value: 'fecha_inicio' },
      { text: this.$t('solicitud.crud.fecha_fin'), value: 'fecha_fin' },
      { text: this.$t('solicitud.crud.tipo'), value: 'tipo' },
      { text: this.$t('solicitud.crud.estado'), value: 'estado' }
    ];
    this.filtersSolicitudes = [
      {
        field: 'plan',
        type: 'hidden',
        typeG: 'Boolean',
        value: true
      },
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
        label: 'Estado de Solicitud',
        type: 'select',
        typeG: 'EstadoSolicitud',
        items: [
          { value: '', text: 'TODOS' },
          { value: 'APROBADO', text: 'APROBADO' },
          { value: 'PLAN_VUELO_CREADO', text: 'PLAN DE VUELO CREADO' },
          { value: 'PLAN_VUELO_APROBADO', text: 'PLAN DE VUELO APROBADO' }
        ]
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

    this.headers = [
      { text: 'N° Solicitud', value: 'id' },
      { text: 'Acciones', sortable: false },
      { text: 'Vigente desde', value: 'desde_fecha', sortable: false },
      { text: 'Vigente hasta', value: 'hasta_fecha', sortable: false },
      { text: 'Nro. de serie', value: 'nro_serie', sortable: false },
      { text: 'Inf. suplementaria', value: 'inf_suplementaria', sortable: false },
      { text: 'Solicitud de itinerario', value: 'id_solicitud_itinerario', sortable: false },
      { text: 'Estado', value: 'estado', sortable: false }
    ];
    this.filters = [
      {
        field: 'estado',
        label: 'Estado de Plan de vuelo',
        type: 'select',
        typeG: 'EstadoPlanSolicitud',
        items: [
          { value: '', text: 'TODOS' },
          { value: 'SOLICITADO', text: 'SOLICITADO' },
          { value: 'APROBADO_AASANA', text: 'APROBADO_AASANA' },
          { value: 'APROBADO_FELCN', text: 'APROBADO_FELCN' },
          { value: 'CREADO', text: 'CREADO' },
          { value: 'RECHAZADO', text: 'RECHAZADO' }
        ]
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
    if (this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
      this.filters.unshift({
        field: 'id_operador',
        type: 'hidden',
        value: this.operador,
        typeG: Number
      });
    }

    if (!this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
      this.headers.splice(2, 0, { text: 'Operadores', value: 'id_operador' });
      this.filters.unshift({
        field: 'id_operador',
        label: this.$t('solicitud.crud.id_operador'),
        type: 'select',
        typeG: 'Int',
        items: []
      });
      this.getOperadores(0, 'operadores', true);
    }

    /* if (!this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
       this.headersSolicitudes.splice(3, 0, { text: this.$t('solicitud.crud.id_operador'), value: 'id_operador' });
       /* this.filtersSolicitudes.unshift({
       field: 'id_operador',
       label: this.$t('solicitud.crud.id_operador'),
       type: 'select',
       typeG: 'Int',
       items: []
       });
       this.getOperadores(0, 'operadores', true);
       } */
  },
  data () {
    return {
      logDatos: null,
      operador: '',
      itemsObtenidos: '',
      graphqlSolicitudes: true,
      graphql: true,
      estados,
      urlSolicitudes: 'solicitudesAll',
      url: 'planSolicitudes',
      headersSolicitudes: [],
      headers: [],
      operadores: [],
      solicitud: null,
      orderSolicitudes: ['id', 'DESC'],
      order: ['id', 'DESC'],
      active: 'planes',
      dataGraphql: `
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
        solicitud_itinerario_codigo
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      dataGraphqlSolicitudes: `
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
      `,
      filtersSolicitudes: [],
      filters: [],
      planVuelo: {},
      planSolicitud: {},
      habilitados: [],
      completados: [],
      rangoFechasPermitidas: {}
    };
  },
  mounted () {
    this.$service.get('plan/planVuelo/planSolicitud/habilitacionNuevosRPL').then(response => {
      let valuesHabilitados = [];
      let valuesCompletados = [];
      for (let i in response) {
        let obj = {};
        obj.id = response[i].id;
        obj.can = response[i].can;
        obj.limite = response[i].limite;
        valuesHabilitados[obj.id] = obj.can;
        valuesCompletados[obj.id] = obj.limite;
      }
      this.habilitados = valuesHabilitados;
      this.completados = valuesCompletados;
      console.log('Habilitados exist', JSON.stringify(this.habilitados));
      console.log('Completados ', JSON.stringify(this.completados));
      this.$bus.$on('actualizarTabla', () => {
        this.updateList();
      });
    });
  },
  methods: {
    openAdd () {
      this.active = 'solicitudes';
      this.$message.info('Seleccione el itinerario que desea convertir en un Plan de vuelo');
    },
    openModalPlanVuelo (data = {}) {
      this.$service.get(`plan/planSolicitud/rangoFechasPermitidas/${data.id}`).then(response => {
        let newResponse = {};
        if (response.desde !== data.fecha_inicio) {
          newResponse.desde = this.$datetime.format(new Date(this.$datetime.addDays(new Date(response.desde), 1)), 'YYYY-MM-dd');
        } else {
          newResponse.desde = response.desde;
        }
        newResponse.hasta = response.hasta;
        Object.assign(this.rangoFechasPermitidas, newResponse);
        console.log('rango permitido', this.rangoFechasPermitidas);
        this.logDatos = null;
        if (data.nro_serie) {
          console.log('editando', data.id);
          this.logDatos = {
            _user_created: data._user_created,
            _user_updated: data._user_updated,
            _created_at: data._created_at,
            _updated_at: data._updated_at
          };
          this.planSolicitud = data;
        } else {
          console.log('creando', data.id);
          this.$service.graphql({
            query: `
            query lista ($idSolicitud: Int!) {
              planVuelosRepetitivosFormGeneral (id_solicitud: $idSolicitud) {
                num_serie
                aeropuertos_salida {
                  id
                  codigo_iata
                }
              }
            }
            `,
            variables: {
              idSolicitud: parseInt(data.id)
            }
          }).then(response1 => {
            let planSolicitudCreate = {};
            let respuesta = response1.planVuelosRepetitivosFormGeneral;
            planSolicitudCreate.nro_serie = respuesta.num_serie;
            planSolicitudCreate.aeropuertos = respuesta.aeropuertos_salida;
            // planSolicitudCreate.fecha_desde = data.fecha_inicio;
            // planSolicitudCreate.fecha_hasta = data.fecha_fin;
            planSolicitudCreate.id_operador = data.id_operador;
            planSolicitudCreate.operador_sigla = data.operador_sigla;
            planSolicitudCreate.id_solicitud_itinerario = data.id;
            this.planSolicitud = Object.assign({}, planSolicitudCreate);
          });
        }
      });
      this.$store.commit('openModal', 6);
    }
  },
  components: {
    CrudTable,
    PlanSolicitudModal
  }
};
</script>
