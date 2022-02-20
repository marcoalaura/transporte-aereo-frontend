'use strict';

export default {
  methods: {
    login (data) {
      this.$http.post(this.$authUrl, {
        usuario: data.username,
        contrasena: data.password,
        nit: data.nit
      }).then(response => {
        if (response.data) {
          let menu = response.data.menu;
          let usuario = response.data.usuario;
          let permisos = response.data.permisos;
          let token = response.data.token;
          let redirect = response.data.redirect;
          let sidenav = data.sidenav === undefined ? true : data.sidenav;

          this.$storage.setUser(usuario);
          this.$storage.set('menu', menu);
          this.$storage.set('token', token);
          this.$storage.set('sidenav', sidenav);
          this.$storage.set('permissions', permisos);

          this.$store.commit('setUser', usuario);
          this.$store.commit('setMenu', menu);
          this.$store.commit('setSidenav', sidenav);
          this.$store.commit('setPermissions', permisos);
          this.$store.commit('setAuth', true);
          this.$storage.remove('oauth2_state');

          this.timerSession();
          this.$router.push(redirect || data.redirect || '/');
        }
      }).catch((error) => {
        this.$message.error(error.response ? error.response.data.error || 'Usuario y/o contraseña inválida' : 'El sistema no pudo conectarse, revise su conexión de internet.');
      });
    },

    logout (store, router, loading) {
      const codigo = this.$storage.get('oauth2_state');
      if (codigo) {
        this.$service.get(`system/salir?codigo=${codigo}`)
          .then(response => {
            store = store || this.$store;
            this.cleanData(store);
            window.location.href = response.url;
          });
      } else {
        store = store || this.$store;
        router = router || this.$router;
        loading = loading || this.$loading;

        this.$storage.removeUser();
        this.$storage.remove('menu');
        this.$storage.remove('token');
        this.$storage.remove('sidenav');
        this.$storage.remove('permissions');

        if (loading) {
          loading.hide();
        }

        this.cleanData(store);
        router.push('/login');
      }
    },

    cleanData (store) {
      store.commit('setDefault');
      store.commit('DESTROY_INTERVAL');
      // Debemos resetear todos los formularios que usamos con vuex-map-fields
      store.commit('usuario/cleanForm');
      store.commit('pasajero/cleanForm');
      store.commit('tripulacion/cleanForm');
    },

    timerSession () {
      // Definiendo el tiempo en el que dura una sesión sin actividad
      this.$store.commit('SET_TIME', process.env.TIME_SESSION_EXPIRED * 60);
      this.$store.commit('INIT_INTERVAL', window.setInterval(() => {
        this.$store.commit('TIME_DECREASE');
        if (this.$store.state.time <= 0) {
          this.$message.warning('Su sesión ha sido cerrada automáticamente después de ' + process.env.TIME_SESSION_EXPIRED + ' minutos de inactividad.', '¡Sesión cerrada!', { timeout: 30000 });
          this.logout();
        }
      }, 15000));
    },

    reload () {
      this.$store.commit('setMain', false);
      this.$nextTick(function () {
        this.$store.commit('setMain', true);
      });
    },

    getCode () {
      this.$http.get(`${this.$apiUrl}public/codigo`).then(response => {
        console.log('Respuest API public/codigo:::', response);
        if (response.data) {
          this.$storage.set('oauth2_state', response.data.codigo);
          window.location.href = response.data.url;
        }
      }).catch((error) => {
        this.$message.error(error.response ? error.response.data.error || 'Usuario y/o contraseña inválida' : 'El sistema no pudo conectarse, revise su conexión de internet.');
      });
    }
  }
};
