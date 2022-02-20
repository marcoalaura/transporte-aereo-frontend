<template>
  <section>
    <h3 class="primary--text"
        v-if="solicitud && solicitud.codigo">
      <v-icon>chrome_reader_mode</v-icon> Solicitud aprobada: {{ solicitud.codigo }}
    </h3>
    <h3 class="primary--text"
        v-else>
      <v-icon>chrome_reader_mode</v-icon>Solicitud de Itinerarios Nro. {{ solicitud ? solicitud.id : '' }} - {{ solicitud ? solicitud.operador_tipo : '' }}
    </h3>
    <v-card v-if="solicitud">
      <v-card-text class="pb-0">
        <v-layout>
          <v-flex md6>
            <div class="btn-container">
              <v-tooltip bottom>
                <v-btn slot="activator" color="primary"
                  @click="agregar()"
                  v-if="solicitud.estado === 'CREADO'"><v-icon>add</v-icon> Agregar</v-btn>
                <span>Agregar itinerario(s)</span>
              </v-tooltip>
              <v-tooltip bottom v-if="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
                <v-btn
                  slot="activator"
                  color="success"
                  @click="solicitar"
                  v-if="solicitud.estado === 'CREADO' || solicitud.estado === 'OBSERVADO'">
                  <v-icon>check</v-icon> Solicitar
                </v-btn>
                <span>Solicitar itinerario</span>
              </v-tooltip>
              <v-tooltip bottom v-if="(solicitud.estado === 'APROBADO' || solicitud.estado === 'PLAN_VUELO_APROBADO') && $util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')">
                <v-btn
                  slot="activator"
                  color="success"
                  :disabled="!habilitadoNuevoPlanVuelo"
                  @click="openModalPlanVuelo()">
                  <v-icon>local_airport</v-icon> Crear plan de vuelo
                </v-btn>
                <span>Crear Plan de Vuelo Repetitivos</span>
              </v-tooltip>
              <!-- boton aprobar para DGAC -->
              <v-tooltip
                v-if="solicitud.estado == 'SOLICITADO' && $util.isRol('DGAC_ADMIN', 'DGAC') && pendientesAprobacion.indexOf('DGAC') !== -1 && pendientesAprobacion.length === 1"
                bottom >
                <v-btn
                  slot="activator" color="primary" @click="aprobar"
                  :disabled="solicitud.estado === 'OBSERVADO'">
                  <v-icon>check</v-icon> Aprobar todo</v-btn>
                <span>Aprobar toda la solicitud</span>
              </v-tooltip>
              <!-- boton aprobar para SABSA -->
              <v-tooltip
                v-if="solicitud.estado == 'SOLICITADO' && $util.isRol('SABSA_ADMIN', 'SABSA') && pendientesAprobacion.indexOf('SABSA') !== -1"
                bottom >
                <v-btn
                  slot="activator" color="primary" @click="aprobar"
                  :disabled="solicitud.estado === 'OBSERVADO'">
                  <v-icon>check</v-icon> Aprobar todo</v-btn>
                <span>Aprobar toda la solicitud</span>
              </v-tooltip>
              <!-- boton aprobar para AASANA -->
              <v-tooltip
                v-if="solicitud.estado == 'SOLICITADO' && $util.isRol('AASANA_ADMIN', 'AASANA') && pendientesAprobacion.indexOf('AASANA') !== -1"
                bottom >
                <v-btn
                  slot="activator" color="primary" @click="aprobar"
                  :disabled="solicitud.estado === 'OBSERVADO'">
                  <v-icon>check</v-icon> Aprobar todo</v-btn>
                <span>Aprobar toda la solicitud</span>
              </v-tooltip>
              <!-- <v-tooltip
                   v-if="(solicitud.estado !== 'APROBADO' && $util.isRol('DGAC_ADMIN', 'DGAC')) || solicitud.estado === 'CREADO'"
                   bottom>
                   <v-btn slot="activator" @click="validar(idSolicitud)" :disabled="empty"><v-icon>done_all</v-icon> Validar</v-btn>
                   <span>Validar conflictos de itinerarios</span>
                   </v-tooltip> -->
              <!-- <v-btn slot="activator" @click=""><v-icon>info_outline</v-icon> Observar</v-btn> -->
              <v-tooltip bottom>
                <v-btn slot="activator" @click="historial"><v-icon>timeline</v-icon> Historial</v-btn>
                <span>Ver Historial de Itinerario</span>
              </v-tooltip>
              <v-tooltip bottom>
                <v-btn slot="activator" @click="$router.push('/solicitudes')"><v-icon>keyboard_arrow_left</v-icon> Volver</v-btn>
                <span>Volver a la lista de solicitudes</span>
              </v-tooltip>
              <v-tooltip bottom v-if="(solicitud.estado === 'PLAN_VUELO_CREADO' || solicitud.estado === 'PLAN_VUELO_APROBADO') && !$util.isRol('DGAC_ADMIN', 'DGAC')">
                <v-btn slot="activator" @click="$router.push(`/planVuelo/${planVuelo.id}`)"><v-icon>flight</v-icon>&nbsp; Ver plan de vuelo</v-btn>
                <span>Ver detalles de Plan de Vuelo</span>
              </v-tooltip>
            </div>
            <div v-if="!empty">
              <v-chip outline label color="warning" :value="true" class="vuelo-observados" v-if="errors">
                <span class="vuelo-estado"></span> Tiene <strong>{{ errors }} Conflicto{{ errors > 1 ? 's' : '' }}</strong> de Vuelos con el mismo horario, revise el CALENDARIO.
              </v-chip>
              <v-chip v-else outline label color="success" :value="true" class="vuelo-observados sin-conflictos">
                <span class="vuelo-estado"></span> No tiene ningún conflicto con otros itinerarios aprobados.
              </v-chip>
              <v-chip outline label color="info" class="vuelo-observados" :value="true" v-if="pendientesAprobacion.length > 0 && (solicitud.estado === 'SOLICITADO' || solicitud.estado === 'OBSERVADO')">
                Esta solicitud de itinerario requiere aprobación de:
                <strong>{{ pendientesAprobacion[1] }} {{ pendientesAprobacion[2] }} y {{ pendientesAprobacion[0] }}</strong>
              </v-chip>
            </div>
          </v-flex>
          <v-flex md6>
            <div class="detalle-title text-xs-right">
              <h3 class="info--text">{{ solicitud.operador_razon_social }}</h3>
              <!-- <p>N° {{ solicitud.codigo || 'DGAC/ITI/XXX/2018' }}</p> -->
              <p>ITINERARIO VIGENTE A PARTIR DEL {{ ($datetime.dateLiteral(solicitud.fecha_inicio)).toUpperCase() }} <br> {{ solicitud.fecha_fin ? 'AL ' + $datetime.dateLiteral(solicitud.fecha_fin).toUpperCase() : '' }}</p>
              <p class="sub">(Expresado en horas locales)</p>
              <p>
                <strong>ESTADO:</strong>
                <v-chip
                  label
                  :color="estados[solicitud.estado].bg"
                  :text-color="estados[solicitud.estado].color">
                  {{ estados[solicitud.estado].text }}
                </v-chip>
              </p>
            </div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <log-datos :data="logDatos2" v-if="logDatos2"></log-datos>
      <!-- pestanyas -->
      <v-tabs
        v-model="active"
        class="tab-listado"
        color="info"
        dark
        slider-color="warning"
      >
        <!-- tabs -->
        <v-tab
          key="listado"
          id="listado"
          href="#listado"
          ripple>
          <v-icon>playlist_add_check</v-icon> Ver listado
        </v-tab>
        <v-tab
          key="calendario"
          href="#calendario"
          id="calendario"
          ripple>
          <v-icon>date_range</v-icon> Ver calendario
        </v-tab>
        <v-tab
          key="rutaVuelos"
          href="#rutaVuelos"
          id="rutaVuelos"
          ripple>
          <v-icon>near_me</v-icon> Ver rutas de vuelo
        </v-tab>
        <!-- tab listado -->
        <v-tab-item key="listado" id="listado">
          <v-card-text>
            <crud-table
              :headers="headers"
              :url="urlItinerarios"
              :filters="filters"
              :showFilter="true"
              :graphql="true"
              :checkbox="$util.isRol('DGAC_ADMIN', 'SABSA_ADMIN', 'AASANA_ADMIN', 'DGAC', 'SABSA', 'AASANA') && (solicitud.estado === 'SOLICITADO' || solicitud.estado === 'OBSERVADO')"
              :checkboxHide="checkboxHide"
              :order="order"
              v-if="showListado"
              :dataGraphql="dataGraphqlItinerarios"
            >
              <template slot="buttons">
                <v-tooltip
                  v-if="solicitud.estado == 'SOLICITADO' && $util.isRol('DGAC_ADMIN', 'DGAC') && pendientesAprobacion.indexOf('DGAC') !== -1 && pendientesAprobacion.length === 1"
                  bottom>
                  <v-btn slot="activator" color="success" @click="aprobarSeleccionado"><v-icon>check</v-icon> Aprobar</v-btn>
                  <span>Aprobar elementos seleccionados</span>
                </v-tooltip>
                <v-tooltip
                  v-if="solicitud.estado == 'SOLICITADO' && $util.isRol('SABSA_ADMIN', 'SABSA') && pendientesAprobacion.indexOf('SABSA') !== -1"
                  bottom>
                  <v-btn slot="activator" color="success" @click="aprobarSeleccionado"><v-icon>check</v-icon> Aprobar</v-btn>
                  <span>Aprobar elementos seleccionados</span>
                </v-tooltip>
                <v-tooltip
                  v-if="solicitud.estado == 'SOLICITADO' && $util.isRol('AASANA_ADMIN', 'AASANA') && pendientesAprobacion.indexOf('AASANA') !== -1"
                  bottom>
                  <v-btn slot="activator" color="success" @click="aprobarSeleccionado"><v-icon>check</v-icon> Aprobar</v-btn>
                  <span>Aprobar elementos seleccionados</span>
                </v-tooltip>
                <v-tooltip
                  bottom>
                  <v-btn slot="activator" @click="descargarCsv"><v-icon>cloud_download</v-icon> Descargar CSV</v-btn>
                  <span>Aprobar elementos seleccionados</span>
                </v-tooltip>
              </template>
              <template slot="items" slot-scope="items">
                <td v-if="solicitud.estado === 'SOLICITADO' || solicitud.estado === 'OBSERVADO' ||
                        ((solicitud.estado === 'OBSERVADO' ||
                          solicitud.estado === 'APROBADO' ||
                          solicitud.estado === 'CREADO') && $util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION'))" class="nowrap">
                  <!-- Observación -->
                  <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update'] && solicitud.estado !== 'APROBADO'">
                    <v-btn
                      small
                      slot="activator"
                      v-if="(solicitud.estado === 'SOLICITADO' || solicitud.estado === 'OBSERVADO') && $util.isRol('SABSA_ADMIN', 'SABSA') && pendientesAprobacion.indexOf('SABSA') !== -1 && items.item.estado !== 'OBSERVADO'"
                      @click="openModalObs(items.item.id);">
                      <small><v-icon>message</v-icon> OBSERVAR </small>
                    </v-btn>
                    <v-btn
                      small
                      slot="activator"
                      v-if="(solicitud.estado === 'SOLICITADO' || solicitud.estado === 'OBSERVADO') && $util.isRol('DGAC_ADMIN', 'DGAC') && pendientesAprobacion.indexOf('DGAC') !== -1 && items.item.estado !== 'OBSERVADO'"
                      @click="openModalObs(items.item.id);">
                      <small>
                        <v-icon>message</v-icon> OBSERVAR</small>
                    </v-btn>
                    <v-btn
                      small
                      slot="activator"
                      v-if="(solicitud.estado === 'SOLICITADO' || solicitud.estado === 'OBSERVADO') && $util.isRol('AASANA_ADMIN', 'AASANA') && pendientesAprobacion.indexOf('AASANA') !== -1 && items.item.estado !== 'OBSERVADO'"
                      @click="openModalObs(items.item.id);">
                      <small><v-icon>message</v-icon> OBSERVAR</small>
                    </v-btn>
                    <span>{{ items.item.estado === 'OBSERVADO' ? 'Itinerario observado' : 'Agregar Observación' }}</span>
                  </v-tooltip>
                  <!-- Editar -->
                  <v-tooltip bottom v-if="$store.state.permissions['solicitudes:update']">
                    <v-btn
                      icon
                      slot="activator"
                      v-if="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION') && (solicitud.estado === 'CREADO' || (solicitud.estado === 'OBSERVADO' && items.item.estado !== 'APROBADO'))"
                      @click="editar(items.item.id, items.item.items)">
                      <v-icon>edit</v-icon>
                    </v-btn>
                    <span>Editar registro</span>
                  </v-tooltip>
                  <v-tooltip bottom v-if="$store.state.permissions['solicitudes:delete']">
                    <v-btn
                      icon
                      slot="activator"
                      v-if="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION') && (solicitud.estado === 'CREADO' || (solicitud.estado === 'OBSERVADO' && items.item.estado !== 'APROBADO'))"
                      @click="eliminarItinerario(items.item.id);">
                      <v-icon color="red">delete</v-icon>
                    </v-btn>
                    <span>Eliminar registro</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <v-btn
                      icon
                      slot="activator"
                      v-if="$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION') && items.item.estado === 'APROBADO'"
                      :disabled="false"
                      @click="verConexion(items.item)">
                      <v-icon color="primary">device_hub</v-icon>
                    </v-btn>
                    <span>Ver Conexiones del Itinerario {{ items.item.id }} </span>
                  </v-tooltip>
                </td>
                <td>
                  <div>{{ items.item.aeronave_matricula }}</div>
                  <v-tooltip bottom>
                    <v-chip
                      :color="items.item.aeronave_estado === 'INACTIVO'? 'warning' : 'info'"
                      class="m-l-0"
                      label
                      small
                      slot="activator"
                      text-color="white"
                      v-if="items.item.aeronave_estado !== 'ACTIVO'">
                      <small>{{ items.item.aeronave_estado }}</small>
                    </v-chip>
                    <span>{{ items.item.aeronave_estado === 'INACTIVO'? 'La Aeronave está INACTIVA' : 'La Aeronave se encuentra en MANTENIMIENTO' }}</span>
                  </v-tooltip>
                </td>
                <td>{{ items.item.nro_vuelo }}</td>
                <td>
                  <div><v-icon>flight_takeoff</v-icon> {{ items.item.aeropuerto_salida_codigo_iata }}</div>
                  <v-tooltip bottom>
                    <v-chip
                      color="warning"
                      class="m-l-0"
                      label
                      slot="activator"
                      small
                      text-color="white"
                      v-if="items.item.aeropuerto_salida_estado !== 'ACTIVO'">
                      <small>{{ items.item.aeropuerto_salida_estado }}</small>
                    </v-chip>
                    <span>El aeropuerto está INACTIVO</span>
                  </v-tooltip>
                </td>
                <td>
                  <div><v-icon>flight_land</v-icon> {{ items.item.aeropuerto_llegada_codigo_iata }}</div>
                  <v-tooltip bottom>
                    <v-chip
                      color="warning"
                      class="m-l-0"
                      label
                      slot="activator"
                      small
                      text-color="white"
                      v-if="items.item.aeropuerto_llegada_estado !== 'ACTIVO'">
                      <small>{{ items.item.aeropuerto_llegada_estado }}</small>
                    </v-chip>
                    <span>El aeropuerto está INACTIVO</span>
                  </v-tooltip>
                </td>
                <td>{{ $datetime.time(items.item.hora_despegue) }}</td>
                <td>{{ $datetime.time(items.item.hora_aterrizaje) }}</td>
                <td class="dia-semana">
                  <v-chip v-if="items.item.dia_1" color="primary" small text-color="white">Lun (1)</v-chip>
                  <v-chip v-if="items.item.dia_2" color="primary" small text-color="white">Mar (2)</v-chip>
                  <v-chip v-if="items.item.dia_3" color="primary" small text-color="white">Mié (3)</v-chip>
                  <v-chip v-if="items.item.dia_4" color="primary" small text-color="white">Jue (4)</v-chip>
                  <v-chip v-if="items.item.dia_5" color="primary" small text-color="white">Vie (5)</v-chip>
                  <v-chip v-if="items.item.dia_6" color="primary" small text-color="white">Sáb (6)</v-chip>
                  <v-chip v-if="items.item.dia_7" color="primary" small text-color="white">Dom (7)</v-chip>
                </td>
                <td>
                  <v-chip
                    label
                    small
                    :color="estados[items.item.estado].bg"
                    :text-color="estados[items.item.estado].color">
                    <small>{{ estados[items.item.estado].text }}</small>
                  </v-chip>
                  <div v-if="items.item.estado === 'OBSERVADO'" class="text-observado"><strong>Detalle:</strong> {{ items.item.observacion }}</div>
                  <!-- <v-btn
                    v-if="items.item.estado === 'OBSERVADO'"
                    slot="activador"
                    small
                    @click="mostrarModalObs(items.item.observacion);">
                    <small><v-icon color="info">info</v-icon> Ver razón</small>
                  </v-btn> -->
                </td>
              </template>
            </crud-table>
          </v-card-text>
        </v-tab-item>
        <!-- tab calendario -->
        <v-tab-item key="calendario" id="calendario">
          <v-card-text class="table-responsive">
            <v-btn
              @click="crearPDF()">
              <v-icon>print</v-icon> IMPRIMIR CALENDARIO
            </v-btn><p/>
            <v-alert v-if="empty" outline color="warning" :value="true" icon="warning">
              No tiene ningún itinerario registrado.
            </v-alert>
            <div id="tabla" v-else>
              <table class="table-ite" :class="{ 'no-edit': solicitud.estado !== 'CREADO' }">
                <thead>
                  <tr>
                    <th class="width-equipo"></th>
                    <th colspan="5" class="width-day">LUNES</th>
                    <th colspan="5" class="width-day">MARTES</th>
                    <th colspan="5" class="width-day">MIÉRCOLES</th>
                    <th colspan="5" class="width-day">JUEVES</th>
                    <th colspan="5" class="width-day">VIERNES</th>
                    <th colspan="5" class="width-day">SÁBADO</th>
                    <th colspan="5" class="width-day">DOMINGO</th>
                  </tr>
                  <tr class="no-border">
                    <th class="text-xs-center">MATRICULA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                    <th class="no-border-right">VLO</th><th class="no-border">ORI</th><th class="no-border">DES</th><th class="no-border">ETD</th><th class="no-border-left">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(vuelos, matricula) in itinerarios" class="vuelo-itinerarios" :key="matricula">
                    <td class="text-xs-center"><strong>{{ matricula }}</strong></td>
                    <td v-for="dia in ['1', '2', '3', '4', '5', '6', '7']" colspan="5" class="dia" :key="dia">
                      <table v-if="vuelos[dia]">
                        <tbody>
                          <tr v-for="vuelo in vuelos[dia]" :key="vuelo.id" :class="{ 'vuelo-choque': vuelo.items }" class="edit-itinerario" @click="editar(vuelo.id, vuelo.items)">
                            <td :class="estados[vuelo.estado].obs">
                              {{ vuelo.nro_vuelo }}
                              <div class="relative" v-if="vuelo.items && dia != 7 && !isPrint">
                                <div class="detalle">
                                  <h4>Vuelos programados en este horario <span v-if="solicitud.estado === 'CREADO'">(Haga clic para editar este itinerario)</span></h4>
                                  <ul>
                                    <li v-for="item in vuelo.items" :key="item.id">
                                      <strong>- {{ item['solicitud.operador.sigla']}}:</strong>
                                      {{ item['aeronave.matricula']}} -
                                      {{ item.nro_vuelo }} -
                                      {{ item['aeropuerto_salida.codigo_iata'] }} -
                                      {{ item['aeropuerto_llegada.codigo_iata'] }} -
                                      {{ item.hora_despegue }} -
                                      {{ item.hora_aterrizaje }} -
                                      Día: {{ item.dia_semana }}
                                      <em>
                                        desde el {{ $datetime.format(item['solicitud.fecha_inicio']) }}
                                        {{ item['solicitud.fecha_fin'] ? ' al ' + $datetime.format(item['solicitud.fecha_fin']) : '' }}
                                      </em>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </td>
                            <td :class="estados[vuelo.estado].obs">{{ vuelo['aeropuerto_salida.codigo_iata'] }}</td>
                            <td :class="estados[vuelo.estado].obs">{{ vuelo['aeropuerto_llegada.codigo_iata'] }}</td>
                            <td :class="estados[vuelo.estado].obs">{{ vuelo.hora_despegue }}</td>
                            <td :class="estados[vuelo.estado].obs">
                              {{ vuelo.hora_aterrizaje }}
                              <div class="relative" v-if="vuelo.items && dia == 7 && !isPrint">
                                <div class="detalle dia-7">
                                  <h4>Vuelos programados en este horario <span>(Haga clic para editar este itinerario)</span></h4>
                                  <ul>
                                    <li v-for="item in vuelo.items" :key="item.id">
                                      <strong>- {{ item['solicitud.operador.sigla']}}:</strong>
                                      {{ item['aeronave.matricula']}} -
                                      {{ item.nro_vuelo }} -
                                      {{ item['aeropuerto_salida.codigo_iata'] }} -
                                      {{ item['aeropuerto_llegada.codigo_iata'] }} -
                                      {{ item.hora_despegue }} -
                                      {{ item.hora_aterrizaje }} -
                                      Día: {{ item.dia_semana }}
                                      <em>
                                        desde el {{ $datetime.format(item['solicitud.fecha_inicio']) }}
                                        {{ item['solicitud.fecha_fin'] ? ' al ' + $datetime.format(item['solicitud.fecha_fin']) : '' }}
                                      </em>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </v-card-text>
        </v-tab-item>
        <!-- tab rutaVuelo -->
        <v-tab-item key="rutaVuelos" id="rutaVuelos">
          <v-card-text v-if="empty">
            <v-alert outline color="warning" :value="true" icon="warning">
              No tiene ninguna ruta de vuelo programada.
            </v-alert>
          </v-card-text>
          <div class="map-container map-rutas" v-else>
            <mapa-rutas :id-solicitud="idSolicitud" v-if="mostrarMapa"></mapa-rutas>
          </div>
        </v-tab-item>
        <!-- /tab rutaVuelo -->
      </v-tabs>
    </v-card>
    <!-- edicion de itinerario es un modal -->
    <v-dialog v-model="$store.state.modal2" max-width="1200">
      <v-card>
        <v-card-title>
          <v-icon>edit</v-icon> Editar itinerario
          <v-spacer></v-spacer>
          <v-btn icon @click="$store.commit('closeModal', 2)">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-form
            ref="form"
            @submit.prevent="guardar"
            lazy-validation>
          <v-card-text class="pt-0">
            <!-- <v-alert outline color="info" icon="info" :value="true">
                 Edite los datos del itinerario
                 </v-alert> -->
            <itinerario-item :itinerario="itinerario" :aeronaves="aeronaves" v-if="itinerario"></itinerario-item>
            <v-container class="p-t-0">
              <v-alert outline color="warning" :value="true" v-if="observaciones">
                <h4>Vuelos programados en este horario</h4>
                <ul class="no-style">
                  <li v-for="item in observaciones" :key="item.id">
                    <strong>- {{ item['solicitud.operador.sigla']}}:</strong>
                    {{ item['aeronave.matricula']}} -
                    {{ item.nro_vuelo }} -
                    {{ item['aeropuerto_salida.codigo_iata'] }} -
                    {{ item['aeropuerto_llegada.codigo_iata'] }} -
                    <strong>{{ item.hora_despegue }}</strong> -
                    <strong>{{ item.hora_aterrizaje }}</strong>
                    <em>
                      desde el {{ $datetime.format(item['solicitud.fecha_inicio']) }}
                      {{ item['solicitud.fecha_fin'] ? ' al ' + $datetime.format(item['solicitud.fecha_fin']) : '' }}
                    </em>
                  </li>
                </ul>
              </v-alert>
            </v-container>
          </v-card-text>
          <log-datos :data="logDatos" v-if="logDatos"></log-datos>
          <v-card-actions>
            <v-icon color="info">info</v-icon>
            <div class="subheading info--text">
              <strong>VLO:</strong> Vuelo
            </div>
            <div class="subheading info--text">
              <strong>ORI:</strong> Origen
            </div>
            <div class="subheading info--text">
              <strong>DES:</strong> Destino
            </div>
            <div class="subheading info--text">
              <strong>ETD:</strong> Hora de despegue
            </div>
            <div class="subheading info--text">
              <strong>ETA:</strong> Hora de aterrizaje
            </div>
            <v-spacer></v-spacer>
            <v-btn @click="$store.commit('closeModal', 2)"><v-icon>cancel</v-icon> {{ $t('common.cancel') }}</v-btn>
            <v-btn :disabled="!cambiosEdicionItinerario()" color="primary" type="submit"><v-icon dark>check</v-icon> Actualizar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-dialog v-model="$store.state.modal3" max-width="1200" persistent>
      <itinerario-agregar :aeronaves="aeronaves" :id-solicitud="idSolicitud" v-if="add"></itinerario-agregar>
    </v-dialog>
    <!-- Modal para creacion/edicion de plan de vuelos -->
    <v-dialog v-model="$store.state.modal6" max-width="650" persistent>
      <plan-solicitud-modal :planVuelo="planVuelo"
                            :rangoFechasPermitidas="rangoFechasPermitidas"
      ></plan-solicitud-modal>
    </v-dialog>
    <!-- modal para agregar observaciones -->
    <v-dialog v-model="$store.state.modal4" max-width="560">
      <v-card class="crud-dialog">
        <v-card-title class="headline">
          <v-icon>message</v-icon> Agregar Observación
          <v-spacer></v-spacer>
          <v-btn icon @click="$store.commit('closeModal', 4);">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-form
          @submit.prevent="guardarObsItinerario"
          v-model="obsValid"
          lazy-validation
        >
          <v-card-text>
            <v-container grid-list-md class="pt-0">
              <v-layout row wrap>
		            <v-flex xs12>
                  <v-alert
                    :value="true"
                    color="warning"
                    outline>
                    Una vez agregada, el operador deberá corregir la observación y <strong>solicitar su aprobación de nuevo </strong> lo que causará que el flujo entero se repita.
                  </v-alert>
                  <v-alert
                    v-if="itinerario && itinerario.observacion"
                    :value="true"
                    color="info"
                    outline>
                    <strong>Observación anterior:</strong> {{ itinerario.observacion }}
                  </v-alert>
                </v-flex>
                <v-textarea
                  required
                  v-model="obsText"
                  :label="itinerario && itinerario.observacion ? 'Nueva observación' : 'Observación'"
                  class="required"
                  :rules="$validate(['required'])"
                >
                </v-textarea>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <small class="error--text text-required">* Los campos son obligatorios</small>
            <v-spacer></v-spacer>
            <v-btn
              @click="$store.commit('closeModal', 4);">
              <v-icon>cancel</v-icon> {{$t('common.cancel') }}
            </v-btn>
            <v-btn
              type="submit"
              :disabled="!obsValid"
              color="primary"
            >Agregar Observación</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <!-- modal para mostrar observaciones -->
    <!-- <v-dialog v-model="$store.state.modal5" max-width="560">
      <v-card>
        <v-card-title class="headline">
          <v-icon>message</v-icon> Observación
          <v-spacer></v-spacer>
          <v-btn icon @click="$store.commit('closeModal', 5);">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pt-0">
          <v-alert
            :value="true"
            color="info"
            outline>
            {{ obsText }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog> -->
    <!-- Modal de historial de itinerario -->
    <v-dialog v-model="$store.state.modal8" max-width="600" persistent scrollable>
      <historial tipo="Itinerario" :historial="historialItinerario"></historial>
    </v-dialog>
    <!-- Modal para ver, editar y eliminar conexiones del itinerario -->
    <v-dialog v-model="$store.state.modal7" max-width="750" persistent>
      <conexion :idItinerarioA="idItinerarioA" :itinerariosPermitidos="itinerariosPermitidos" :itinerariosDestino="itinerariosDestino"></conexion>
    </v-dialog>
  </section>
</template>

<script>
import aeronaves from '@/components/itinerarios/aeronave/mixins/aeronaves';
import aeropuertos from '@/components/itinerarios/aeropuerto/mixins/aeropuertos';
import CrudTable from '@/common/util/crud-table/CrudTable.vue';
import Historial from '@/common/util/historial/Historial.vue';
import MapaRutas from './Mapa.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';
import validate from '@/common/mixins/validate';
import ItinerarioItem from './ItinerarioItem';
import ItinerarioAgregar from './ItinerarioAgregar';
import layout from '@/common/layout/mixins/layout';
import PlanSolicitudModal from '@/components/plan/solicitud/PlanSolicitudModal';
import Conexion from '@/components/itinerarios/conexion/Conexion.vue';
import auth from '@/components/admin/auth/mixins/auth';
import LogDatos from '@/components/admin/usuario/LogDatos';

const estados = {
  CREADO: { text: 'CREADO', color: 'black', bg: 'gray' },
  SOLICITADO: { text: 'SOLICITADO', color: 'white', bg: 'info', obs: 'blue lighten-4' },
  APROBADO: { text: 'APROBADO', color: 'white', bg: 'success', obs: 'green lighten-4' },
  OBSERVADO: { text: 'OBSERVADO', color: 'white', bg: 'orange', obs: 'yellow lighten-3' },
  REPROGRAMADO: { text: 'REPROGRAMADO', color: 'white', bg: 'info' },
  PROGRAMADO: { text: 'PROGRAMADO', color: 'white', bg: 'success', obs: 'blue lighten-5' },
  PLAN_VUELO_CREADO: { text: 'PLAN DE VUELO CREADO', color: 'white', bg: 'primary lighten-3' },
  PLAN_VUELO_APROBADO: { text: 'PLAN DE VUELO APROBADO', color: 'white', bg: 'success' }
};

const css = `
@media print {
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }

  .interlineado {
    line-height: 15px;
  }

  .table-ite {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #aaa;
    margin-bottom: 250px;
  }

  .no-border {
    border: none;
  }

  .no-border-left {
    border-left: none;
  }

  .no-border-right {
    border-right: none;
  }

  .width-day {
    width: 13.5%;
  }

  .width-equipo {
    width: 5.5%;
  }

  th, td {
    border-collapse: collapse;
    border: 1px solid #aaa;
    font-size: 10px;
  }

  .dia {
    vertical-align: top;
  }

  .dia table {
    width: 100%;
    border-collapse: collapse;
  }

  .dia table td {
    text-align: center;
    border: none;
    padding: 5px;
    width: 20%;
    font-size: 9px;
  }
}
`;

export default {
  mixins: [ aeronaves, aeropuertos, validate, layout, crud, auth ],
  components: {
    CrudTable,
    ItinerarioItem,
    ItinerarioAgregar,
    MapaRutas,
    PlanSolicitudModal,
    Historial,
    Conexion,
    LogDatos
  },
  data () {
    return {
      checkboxHide: ['estado', 'APROBADO'],
      isPrint: false,
      logDatos: null,
      logDatos2: null,
      mostrarMapa: false,
      showListado: false,
      errors: 0,
      active: 'listado',
      itinerarios: [],
      itinerario: null,
      solicitud: null,
      observaciones: null,
      aeronaves: [],
      add: false,
      estados,
      dataGraphql: `
        id
        codigo
        fecha_inicio
        fecha_fin
        observacion
        estado
        id_operador
        operador_nit
        operador_codigo_iata
        operador_codigo_icao
        operador_tipo
        operador_sigla
        operador_razon_social,
        _user_created
        _user_updated
        _created_at
        _updated_at
      `,
      idSolicitud: 0,
      empty: true,
      // para consulta de itinerarios segun id_solicitud
      urlItinerarios: 'itinerarios',
      headers: [],
      filters: [
        {
          field: 'id_solicitud',
          type: 'hidden',
          typeG: 'Int'
        },
        {
          field: 'nro_vuelo',
          label: 'N°. Vuelo',
          type: 'text',
          typeG: 'String'
        },
        {
          field: 'hora_despegue',
          label: 'Hora Despegue',
          type: 'text',
          typeG: 'String',
          items: []
        },
        {
          field: 'hora_aterrizaje',
          label: 'Hora Aterrizaje',
          type: 'text',
          typeG: 'String',
          items: []
        }
      ],
      order: ['hora_despegue', 'ASC'],
      dataGraphqlItinerarios: `
        id
        aeronave_matricula
        aeronave_estado
        id_solicitud
        nro_vuelo
        aeropuerto_salida_codigo_iata
        aeropuerto_salida_estado
        aeropuerto_llegada_codigo_iata
        aeropuerto_llegada_estado
        hora_despegue
        hora_aterrizaje
        dia_1
        dia_2
        dia_3
        dia_4
        dia_5
        dia_6
        dia_7
        estado
        observacion
      `,
      diaSemana: ['(1) Lunes', '(2) Martes', '(3) Miércoles', '(4) Jueves', '(5) Viernes', '(6) Sábado', '(7) Domingo'],
      obsValid: true,
      obsText: '',
      obsId: null,
      obsRules: [
        v => (v && v.length >= 10) || 'Se require mas de 10 caracteres'
      ],
      itinerarioAnt: null,
      planVuelo: {},
      historialItinerario: [],
      pendientesAprobacion: [],
      habilitadoNuevoPlanVuelo: '',
      rangoFechasPermitidas: {},
      idItinerarioA: 0,
      itinerariosDestino: [],
      itinerariosPermitidos: []
    };
  },
  mounted () {
    this.$store.commit('closeModal', 2);
    this.$store.commit('closeModal', 3);
    this.$store.commit('closeModal', 4);
    this.$store.commit('closeModal', 6);
    this.$store.commit('closeModal', 7);
    this.$store.commit('closeModal', 8);
    this.isPrint = false;
    if (this.$route.params.id && this.$filter.isInteger(this.$route.params.id)) {
      this.idSolicitud = parseInt(this.$route.params.id);
      this.getSolicitud(this.idSolicitud);
      this.getHistorial(this.idSolicitud);
      this.$service.get('plan/planVuelo/planSolicitud/habilitacionNuevosRPL').then(response => {
        for (let i in response) {
          if (parseInt(response[i].id) === this.idSolicitud) {
            this.habilitadoNuevoPlanVuelo = response[i].can;
            break;
          }
        }
      });
      setTimeout(() => {
        this.clickEvent('solicitudes');
      }, 500);
    } else {
      this.$router.push('solicitudes');
    }
    this.$bus.$on('actualizarItinerario', () => {
      this.getListItinerarioConexiones(this.idItinerarioA);
    });
  },
  methods: {
    crearPDF () {
      this.isPrint = true;
      this.$nextTick(function () {
        let tableContent = document.getElementById('tabla');
        let fechaHoraActualPanel = this.$datetime.now(false, 'datetime');
        let title = `ITINERARIO ${this.solicitud.id}`;
        let html = `
          <div class="interlineado">
            <strong>${this.solicitud.operador_razon_social}</strong><br/>
            ITINERARIO VIGENTE A PARTIR DEL <strong>${(this.$datetime.dateLiteral(this.solicitud.fecha_inicio)).toUpperCase()}</strong> AL  <strong>${(this.$datetime.dateLiteral(this.solicitud.fecha_fin)).toUpperCase()}</strong> (Expresado en horas locales)<br/>
            <strong>ESTADO:</strong> ${estados[this.solicitud.estado].text}<br/>
            <strong>FECHA DE IMPRESIÓN:</strong> ${fechaHoraActualPanel}<br />
            <strong>IMPRESO POR: ${this.$store.state.user.usuario}</strong><p/>
          </div>
        `;
        html += tableContent.innerHTML;
        this.$util.print(title, html, css);
        this.isPrint = false;
      });
    },
    agregar () {
      this.add = false;
      this.$nextTick(() => {
        this.add = true;
        this.$store.commit('openModal', 3);
      });
    },
    descargarCsv () {
      this.$loading.show('Obteniendo datos para generar CSV');
      this.$service.graphql({
        query: `
          query lista($id_solicitud: Int) {
            itinerarios(id_solicitud: $id_solicitud, order: "id") {
              count
              rows {
                aeronave_matricula
                nro_vuelo
                aeropuerto_salida_codigo_iata
                aeropuerto_llegada_codigo_iata
                hora_despegue
                hora_aterrizaje
                dia_1
                dia_2
                dia_3
                dia_4
                dia_5
                dia_6
                dia_7
                observacion
              }
            }
          }
        `,
        variables: {
          id_solicitud: this.idSolicitud
        }
      }).then(response => {
        if (response) {
          this.$loading.show('Generando CSV');
          const rows = response.itinerarios.rows;
          let csvContent = 'data:text/csv;charset=utf-8,';
          csvContent += ['EQV', 'VLO', 'ORI', 'DES', 'ETD', 'ETA', 'DIA', 'OBS'].join(',') + '\r\n';
          rows.forEach(item => {
            let row = [];
            let dias = [];
            for (let key in item) {
              if (key.indexOf('dia_') === -1) {
                row.push(item[key]);
              } else {
                if (item[key]) {
                  dias.push(key.replace('dia_', ''));
                }
              }
            }
            row.splice(6, 0, dias.join('-'));
            row = row.join(',');
            csvContent += row + '\r\n';
          });
          let encodedUri = encodeURI(csvContent);
          let link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'itinerario.csv');
          link.innerHTML = 'Click Here to download';
          document.body.appendChild(link); // Required for FF
          setTimeout(this.$loading.hide, 1000);
          link.click();
        }
      });
    },
    cambiarEstado (estado, message = '', redirect = true) {
      if (this.solicitud) {
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $solicitud: EditSolicitud!) {
              solicitudEdit(id: $id, solicitud: $solicitud) {
                ${this.dataGraphql}
              }
            }
          `,
          variables: {
            id: this.solicitud.id,
            solicitud: { estado }
          }
        }).then(response => {
          if (response) {
            this.$message.success(message);
            if (redirect) {
              this.$router.push('/solicitudes');
            } else {
              this.updateSolicitud(this.solicitud.id);
            }
          }
        });
      }
    },
    updateSolicitud (idSolicitud) {
      this.$service.graphql({
        query: `
          query item($id: Int!) {
            solicitud(id: $id) {
              ${this.dataGraphql}
            }
          }
        `,
        variables: { id: idSolicitud }
      }).then(response => {
        if (response && response.solicitud) {
          let solicitud = response.solicitud;
          this.solicitud = solicitud;
          this.logDatos2 = null;
          this.$nextTick(() => {
            this.logDatos2 = {
              _user_created: solicitud._user_created,
              _user_updated: solicitud._user_updated,
              _created_at: solicitud._created_at,
              _updated_at: solicitud._updated_at
            };
          });
        } else {
          this.$store.commit('setState403', true);
          this.$router.push('/404');
        }
      });
    },
    solicitar () {
      if (this.empty) {
        this.$message.warning('Debe llenar por lo menos un itinerario');
        return this.agregar();
      }
      let message;
      if (this.errors === 0) {
        message = '¿Desea enviar su solicitud de itinerario?';
      } else {
        message = `Tiene <strong>${this.errors}</strong> conflicto(s) con otros itinerarios aprobados. ¿Desea enviar su solicitud con estos conflictos?`;
      }
      this.$confirm(message, () => {
        this.cambiarEstado('SOLICITADO', 'Itinerario solicitado');
      });
    },
    aprobar () {
      if (this.empty) {
        return this.$message.warning('No puede aprobar un itinerario vacío.');
      }
      this.$confirm('¿Realmente quiere aprobar el itinerario?', () => {
        this.$loading.show('Aprobando y creando los vuelos del itinerario');
        this.$service.post(`itinerario/solicitud/aprobar/${this.solicitud.id}`).then(response => {
          if (response) {
            this.$message.success('¡Solicitud aprobada!');
            this.$router.push('/solicitudes');
          }
        });
      });
    },
    aprobarSeleccionado () {
      let itinerarios = this.$store.state.selected;
      if (itinerarios.length === 0) {
        return this.$message.warning('Debe seleccionar por lo menos un itinerario para aprobarlo.');
      }

      this.$confirm('¿Realmente quiere aprobar estos itinerarios seleccionados?', () => {
        // aprobarItinerarios(id_solicitud: Int!, id_usuario: Int!, ids_itinerarios: [Int]!): [Int]
        let idsItinerarios = [];
        itinerarios.map(i => {
          idsItinerarios.push(i.id);
        });
        this.$service.graphql({
          query: `
            mutation aprobarListaItinerarios($id_solicitud: Int!, $ids_itinerarios: [Int]!) {
              aprobarItinerarios(id_solicitud: $id_solicitud, ids_itinerarios: $ids_itinerarios) {
                count
                rows
              }
            }
          `,
          variables: {
            id_solicitud: this.solicitud.id,
            ids_itinerarios: idsItinerarios
          }
        }).then(response => {
          if (response) {
            this.$message.success('Itinerarios seleccionados aprobados');
            this.updateSolicitud(this.solicitud.id);
            this.updateList();
          }
        });
      });
    },
    editar (id, obs) {
      if (this.$util.isRol('AASANA_ADMIN', 'DGAC_ADMIN', 'SABSA_ADMIN', 'AASANA', 'DGAC', 'SABSA')) {
        // console.log('Rol permitido para observar el itinerario', id);
        if (this.solicitud.estado === 'APROBADO' || this.solicitud.estado === 'PLAN_VUELO_CREADO' || this.solicitud.estado === 'PLAN_VUELO_APROBADO') {
          return false;
        }
        this.openModalObs(id);
      }
      if (!this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION')) {
        return false;
      }
      if (this.solicitud.estado !== 'CREADO' && this.solicitud.estado !== 'OBSERVADO') {
        return false;
      }
      this.$service.graphql({
        query: `
          query item($id: Int!) {
            itinerario(id: $id) {
              id
              nro_vuelo
              hora_despegue
              hora_aterrizaje
              dia_1
              dia_2
              dia_3
              dia_4
              dia_5
              dia_6
              dia_7
              solicitud_fecha_inicio
              solicitud_fecha_fin
              aeronave_matricula
              id_aeropuerto_salida
              id_aeropuerto_llegada
              id_aeronave
              aeropuerto_salida_codigo_iata
              aeropuerto_llegada_codigo_iata
              estado
              _user_created
              _user_updated
              _created_at
              _updated_at
            }
          }
        `,
        variables: { id }
      }).then(response => {
        if (response) {
          this.itinerario = null;
          this.$nextTick(() => {
            let itinerario = response.itinerario;
            itinerario.id_aeronave = itinerario.id_aeronave + '';
            this.logDatos = {
              _user_created: itinerario._user_created,
              _user_updated: itinerario._user_updated,
              _created_at: itinerario._created_at,
              _updated_at: itinerario._updated_at
            };
            let dias = [];
            for (let i = 1; i <= 7; i++) {
              if (itinerario[`dia_${i}`]) {
                dias.push(i + '');
              }
            }
            itinerario.dias_semana = dias;
            this.itinerario = itinerario;
            /* NOTA: por alguna razon hacer
             * this.itinerarioAnt = itinerario
             * hace que this.itinerarioAnt se actulice reactivamente
             * y todo el tiempo se cumple this.itinerario = this.itinerarioAnt */
            this.itinerarioAnt = Object.assign({}, this.itinerario);
          });
          this.observaciones = obs || null;
          this.$store.commit('openModal', 2);
        }
      });
    },
    guardar () {
      if (this.$refs.form.validate()) {
        if (this.$datetime.diffTime(this.itinerario.hora_despegue, this.itinerario.hora_aterrizaje) <= 0) {
          this.$message.warning(`La hora ETD <strong><em>${this.itinerario.hora_despegue}</em></strong> tiene que ser menor a la hora ETA <strong><em>${this.itinerario.hora_aterrizaje}</em></strong>`);
          return false;
        }
        if (!this.itinerario.dias_semana || this.itinerario.dias_semana.length === 0) {
          return this.$message.warning('Debe asignar por lo menos un día de la semana.');
        }
        // de observado a reprogramado
        if (this.itinerario.estado === 'OBSERVADO') {
          // comprobando que los datos realmente han cambiado
          if (this.cambiosEdicionItinerario()) {
            this.itinerario.estado = 'REPROGRAMADO';
          } else {
            this.$message.error('No se han detectado cambios');
          }
        }
        let itinerario = {
          hora_despegue: this.itinerario.hora_despegue,
          hora_aterrizaje: this.itinerario.hora_aterrizaje,
          id_aeronave: this.itinerario.id_aeronave,
          id_aeropuerto_llegada: this.itinerario.id_aeropuerto_llegada,
          id_aeropuerto_salida: this.itinerario.id_aeropuerto_salida,
          nro_vuelo: this.itinerario.nro_vuelo,
          estado: this.itinerario.estado
        };
        for (let i = 1; i <= 7; i++) {
          itinerario[`dia_${i}`] = false;
        }
        const dias = this.itinerario.dias_semana;
        for (let i in dias) {
          itinerario[`dia_${dias[i]}`] = true;
        }
        this.$service.graphql({
          query: `
            mutation edit($id: Int!, $itinerario: EditItinerario!) {
              itinerarioEdit(id: $id, itinerario: $itinerario) {
                id
              }
            }
          `,
          variables: {
            id: this.itinerario.id,
            itinerario
          }
        }).then(response => {
          if (response) {
            this.validar(this.idSolicitud);
            this.$store.commit('closeModal', 2);
            this.$message.success('Itinerario actualizado');
            this.updateSolicitud(this.solicitud.id);
            this.updateList();
          }
        });
      }
    },
    validar (idSolicitud) {
      this.$loading.show('Validando itinerario.');
      this.$service.get(`itinerario/itinerario/validar/${idSolicitud}`).then(response => {
        if (response) {
          this.empty = Object.keys(response.items).length === 0;
          this.itinerarios = response.items;
          this.pendientesAprobacion = response.comprobacionFlujo;
          this.errors = response.errors;
        }
      });
    },
    getSolicitud (idSolicitud) {
      this.$service.graphql({
        query: `
          query item($id: Int!) {
            solicitud(id: $id) {
              ${this.dataGraphql}
            }
          }
        `,
        variables: { id: idSolicitud }
      }).then(response => {
        if (response && response.solicitud) {
          let solicitud = response.solicitud;
          this.getAeronaves(solicitud.id_operador);
          this.idOperador = solicitud.id_operador;
          this.solicitud = solicitud;
          this.validar(idSolicitud);
          this.filters[0].value = this.idSolicitud;
          this.headers = [
            { text: 'Aeronave', value: 'aeronave.matricula', sortable: false }, // TODO: ver la forma de ordenar por un campo ajeno a la tabla
            { text: 'N°. Vuelo', value: 'nro_vuelo' },
            { text: 'Origen', value: 'aeropuerto_salida', sortable: false },
            { text: 'Destino', value: 'aeropuerto_llegada', sortable: false },
            { text: 'Despegue', value: 'hora_despegue' },
            { text: 'Aterrizaje', value: 'hora_aterrizaje' },
            { text: 'Días semana', value: 'dia_1' },
            { text: 'Estado', value: 'estado' }
          ];
          if (['APROBADO', 'SOLICITADO', 'OBSERVADO', 'CREADO'].indexOf(this.solicitud.estado) !== -1 || (this.solicitud.estado === 'OBSERVADO' && this.$util.isRol('OPERADOR_AVION_ADMIN', 'OPERADOR_AVION'))) {
            this.headers.unshift({ text: this.$t('common.actions'), sortable: false });
          }
          this.showListado = true;
          if ((this.solicitud.estado === 'PLAN_VUELO_CREADO' || this.solicitud.estado === 'PLAN_VUELO_APROBADO') && !this.$util.isRol('DGAC_ADMIN', 'DGAC')) {
            this.getPlanSolicitud(idSolicitud);
          }

          this.logDatos2 = null;
          this.$nextTick(() => {
            this.logDatos2 = {
              _user_created: solicitud._user_created,
              _user_updated: solicitud._user_updated,
              _created_at: solicitud._created_at,
              _updated_at: solicitud._updated_at
            };
          });
        } else {
          this.$store.commit('setState403', true);
          this.$router.push('/404');
        }
      });
    },
    getItinerario (id) {
      this.$service.graphql({
        query: `
          query item($id: Int!) {
            itinerario(id: $id) {
              ${this.dataGraphqlItinerarios}
            }
          }
        `,
        variables: { id: id }
      }).then(response => {
        if (response && response.itinerario) {
          let itinerario = response.itinerario;
          this.itinerario = itinerario;
          this.$store.commit('openModal', 4);
        }
      });
    },
    getHistorial (idSolicitud) {
      this.$service.graphql({
        query: `
          query {
            registrosHistorialSolicitudItinerario(id_solicitud: ${idSolicitud}, order: "-id") {
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
        this.historialItinerario = response.registrosHistorialSolicitudItinerario.rows;
      });
    },
    eliminarItinerario (id) {
      this.$confirm('¿Quiere eliminar el registro?', () => {
        this.$service.graphql({
          query: `
          mutation borrarItinerario($id: Int!) {
            itinerarioDelete(id: $id) {
              deleted
            }
          }`,
          variables: { id: id }
        }).then(response => {
          if (response && response['itinerarioDelete'] && response['itinerarioDelete'].deleted) {
            this.validar(this.idSolicitud);
            this.updateList();
            this.$message.success('¡Registro eliminado correctamente!');
          } else {
            this.$message.error('Error al borrar el registro');
          }
        });
      });
    },
    openModalObs (idItinerario) {
      // obteniendo el itinerario
      this.obsId = idItinerario;
      this.obsText = null;
      this.getItinerario(idItinerario);
    },
    guardarObsItinerario () {
      // guardando observacion en BD
      let itinerario = {
        observacion: this.obsText,
        estado: 'OBSERVADO'
      };
      this.obsText = null;
      this.$service.graphql({
        query: `mutation guardarObs($id: Int!, $itinerario: EditItinerario){
          itinerarioEdit(id: $id, itinerario: $itinerario) {
            id
          }
        }
        `,
        variables: {
          id: this.obsId,
          itinerario: itinerario
        }
      }).then(response => {
        if (response) {
          // cambiando en caso de no observado
          this.$store.commit('closeModal', 4);
          this.ObsId = null;
          this.cambiarEstado('OBSERVADO', 'Observación agregada (estado cambió a OBSERVADO)', false);
          this.updateList();
        }
      });
    },
    mostrarModalObs (obs) {
      this.obsText = obs;
      this.$store.commit('openModal', 5);
    },
    cambiosEdicionItinerario () {
      // TODO: hacer un metodo de comparacion profunda de objectos en utils
      if (this.itinerarioAnt !== null && this.itinerario !== null) {
        if (this.itinerarioAnt.id_aeronave !== this.itinerario.id_aeronave ||
            this.itinerarioAnt.nro_vuelo !== this.itinerario.nro_vuelo ||
            this.itinerarioAnt.id_aeropuerto_salida !== this.itinerario.id_aeropuerto_salida ||
            this.itinerarioAnt.id_aeropuerto_llegada !== this.itinerario.id_aeropuerto_llegada ||
            this.itinerarioAnt.hora_despegue !== this.itinerario.hora_despegue ||
            this.itinerarioAnt.hora_aterrizaje !== this.itinerario.hora_aterrizaje ||
            this.itinerarioAnt.dias_semana !== this.itinerario.dias_semana) {
          return true;
        }
      }
      return false;
    },
    loadMapa () {
      this.mostrarMapa = false;
      setTimeout(() => {
        this.mostrarMapa = true;
      }, 500);
    },
    openModalPlanVuelo () {
      console.log(parseInt(this.solicitud.id));
      this.$service.get(`plan/planSolicitud/rangoFechasPermitidas/${this.solicitud.id}`).then(response => {
        let newResponse = {};
        if (response.desde !== this.solicitud.fecha_inicio) {
          newResponse.desde = this.$datetime.format(new Date(this.$datetime.addDays(new Date(response.desde), 1)), 'YYYY-MM-dd');
        } else {
          newResponse.desde = response.desde;
        }
        newResponse.hasta = response.hasta;
        Object.assign(this.rangoFechasPermitidas, newResponse);
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
            idSolicitud: parseInt(this.solicitud.id)
          }
        }).then(response => {
          let data = {};
          let respuesta = response.planVuelosRepetitivosFormGeneral;
          data.nro_serie = respuesta.num_serie;
          data.aeropuertos = respuesta.aeropuertos_salida;
          data.id_operador = this.solicitud.id_operador;
          data.operador_sigla = this.solicitud.operador_sigla;
          data.id_solicitud_itinerario = this.solicitud.id;
          data.fecha = this.$datetime.now(true);
          this.planVuelo = Object.assign({}, data);
        });
      });
      this.$store.commit('openModal', 6);
    },
    getPlanSolicitud (id) {
      this.$service.graphql({
        query: `
          query {
            planSolicitudItinerarioLatest(id: ${id}) {
              id
              nro_serie
              fecha_desde
              fecha_hasta
              inf_suplementaria
              estado
              id_operador
              operador_sigla
              operador_razon_social
              id_solicitud_itinerario
              solicitud_itinerario_estado
            }
          }
        `
      }).then(response => {
        this.planVuelo = response.planSolicitudItinerarioLatest;
      });
    },
    historial () {
      this.$store.commit('openModal', 8);
    },
    verConexion (data) {
      this.idItinerarioA = parseInt(data.id);
      this.getListItinerarioConexiones(data.id);
      this.$store.commit('openModal', 7);
    },
    getListItinerarioConexiones (idItinerarioA) {
      this.$service.get(`itinerario/itinerario/conexiones/${idItinerarioA}`).then(response => {
        this.itinerariosDestino = response;
      });
      this.$service.get(`itinerario/itinerario/itinerariosPermitidos/${idItinerarioA}`).then(response => {
        if (response) {
          let items = response;
          let itinerariosPermitidos = [];
          items.map(item => {
            itinerariosPermitidos.push({
              value: item.id,
              nro_vuelo: item.nro_vuelo,
              aeropuerto_llegada_codigo_iata: item.aeropuerto_llegada_codigo_iata,
              aeropuerto_llegada_ciudad: item.aeropuerto_llegada_ciudad,
              aeropuerto_llegada_pais: item.aeropuerto_llegada_pais,
              hora_despegue: item.hora_despegue,
              hora_aterrizaje: item.hora_aterrizaje
            });
          });
          this.itinerariosPermitidos = itinerariosPermitidos;
        }
      });
    }
  },
  watch: {
    '$store.state.action': function (val) {
      // console.log('action!', val);
      if (val === 'agregar') {
        this.agregar();
        this.$store.commit('setAction', null);
      } else if (val === 'validar') {
        this.validar(this.idSolicitud);
        this.updateList();
        this.loadMapa();
        this.$store.commit('setAction', null);
      }
    },
    active: function (val) {
      // console.log('active', val);
      if (val === 'rutaVuelos') {
        this.loadMapa();
      }
    }
  }
};
</script>

<style lang="scss" src="./itinerario.scss"></style>

