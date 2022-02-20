import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '@/components/admin/Dashboard';
import AppNotFound from '@/common/layout/pages/AppNotFound';
import AppForbidden from '@/common/layout/pages/AppForbidden';
import AppError from '@/common/layout/pages/AppError';

// System
import Login from '@/components/admin/auth/Login';
import LoginCiudadania from '@/components/admin/auth/LoginCiudadania';
import Account from '@/components/admin/account/Account';
import Entidad from '@/components/admin/entidad/Entidad';
import Usuario from '@/components/admin/usuario/Usuario';
import Modulo from '@/components/admin/modulo/Modulo';
import Preferencias from '@/components/admin/preferencias/Preferencias';
import Log from '@/components/admin/Log';

// Itinerarios
import Operador from '@/components/itinerarios/operador/Operador';
import Aeropuerto from '@/components/itinerarios/aeropuerto/Aeropuerto';
import Mapa from '@/components/itinerarios/aeropuerto/Mapa';
import MapaRutas from '@/components/itinerarios/itinerario/Mapa';
import Puertas from '@/components/itinerarios/puerta/Puerta';
import Aeronave from '@/components/itinerarios/aeronave/Aeronave';
import Solicitud from '@/components/itinerarios/solicitud/Solicitud';
import NuevoSolicitud from '@/components/itinerarios/solicitud/Nuevo';
import Itinerario from '@/components/itinerarios/itinerario/Itinerario';

// Vuelos
import Vuelo from '@/components/vuelos/vuelo/Vuelo';
import Tripulacion from '@/components/vuelos/tripulacion/Tripulacion';
import Pasajero from '@/components/vuelos/pasajero/Pasajero';

// Plan de Vuelos
//    repetitivos
import PlanSolicitud from '@/components/plan/solicitud/PlanSolicitud';
import PlanVuelo from '@/components/plan/vuelo/PlanVuelo';
//    no regulares
import PlanNoRegular from '@/components/plan/no-regular/PlanNoRegular';

// Reportes
import Sabsa from '@/components/reportes/sabsa/Sabsa';
import Tracking from '@/components/reportes/tracking/Tracking';
import BuscarPasajeros from '@/components/reportes/pasajeros/BuscarPasajeros';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/login-ciudadania',
      name: 'LoginCiudadania',
      component: LoginCiudadania
    },
    {
      path: '/usuarios',
      name: 'Usuario',
      component: Usuario
    },
    {
      path: '/account',
      name: 'Account',
      component: Account
    },
    {
      path: '/entidades',
      name: 'Entidad',
      component: Entidad
    },
    {
      path: '/parametros',
      name: 'Preferencias',
      component: Preferencias
    },
    {
      path: '/modulos',
      name: 'Módulo',
      component: Modulo
    },
    {
      path: '/logs',
      name: 'Logs',
      component: Log
    },
    {
      path: '/404',
      component: AppNotFound
    },
    {
      path: '/403',
      component: AppForbidden
    },
    {
      path: '/500',
      component: AppError
    },
    {
      path: '*',
      component: AppNotFound
    },
    // Itinerarios
    {
      path: '/operadores',
      name: 'Operador',
      component: Operador
    },
    {
      path: '/aeropuertos',
      name: 'Aeropuerto',
      component: Aeropuerto
    },
    {
      path: '/mapa',
      name: 'Mapa',
      component: Mapa
    },
    {
      path: '/puertas/:id',
      name: 'puertas',
      component: Puertas
    },
    {
      path: '/mapaRutas',
      name: 'MapaRutas',
      component: MapaRutas
    },
    {
      path: '/aeronaves',
      name: 'Aeronave',
      component: Aeronave
    },
    {
      path: '/solicitudes',
      name: 'Solicitud',
      component: Solicitud
    },
    {
      path: '/itinerario/nuevo',
      name: 'NuevoSolicitud',
      component: NuevoSolicitud
    },
    {
      path: '/itinerario/:id',
      name: 'Itinerario',
      component: Itinerario
    },
    // Vuelos
    {
      path: '/vuelos',
      name: 'Vuelo',
      component: Vuelo
    },
    {
      path: '/tripulaciones',
      name: 'Tripulacion',
      component: Tripulacion
    },
    {
      path: '/vuelo/:id',
      name: 'Pasajero',
      component: Pasajero
    },
    // Rutas RPORTES
    {
      path: '/sabsa',
      name: 'Sabsa',
      component: Sabsa
    },
    {
      path: '/tracking',
      name: 'Tracking',
      component: Tracking
    },
    // Rutas para Plan de Vuelos repetitivos
    {
      path: '/planSolicitudes',
      name: 'PlanSolicitud',
      component: PlanSolicitud
    },
    {
      path: '/planVuelo/:id',
      name: 'PlanVuelo',
      component: PlanVuelo
    },
    // Rutas para plan de vuelos regulares
    {
      path: '/planNoRegulares',
      name: 'PlanNoRegular',
      component: PlanNoRegular
    },
    {
      path: '/buscarPasajeros',
      name: 'Pasajeros',
      component: BuscarPasajeros
    }
  ]
});
