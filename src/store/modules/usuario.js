'use strict';

import { getField, updateField } from 'vuex-map-fields';

const layout = {
  namespaced: true,
  state: {
    form: {
      id: '',
      usuario: '',
      contrasena: '',
      email: '',
      cargo: '',
      estado: '',
      id_entidad: null,
      id_rol: null,
      id_persona: null,
      id_aeropuerto: null,
      id_operador: null,
      tipo_documento: '',
      tipo_documento_otro: '',
      nro_documento: '',
      fecha_nacimiento: '',
      nombres: '',
      primer_apellido: '',
      segundo_apellido: '',
      nombre_completo: '',
      telefono: '',
      movil: '',
      nacionalidad: '',
      pais_nacimiento: '',
      genero: '',
      estado_persona: '',
      persona: null
    }
  },
  getters: {
    getField
  },
  mutations: {
    updateField,
    cleanForm (state) {
      state.form = {
        id: '',
        usuario: '',
        contrasena: '',
        email: '',
        cargo: '',
        estado: '',
        id_entidad: null,
        id_rol: null,
        id_persona: null,
        id_aeropuerto: null,
        id_operador: null,
        tipo_documento: '',
        tipo_documento_otro: '',
        nro_documento: '',
        fecha_nacimiento: '',
        nombres: '',
        primer_apellido: '',
        segundo_apellido: '',
        nombre_completo: '',
        telefono: '',
        movil: '',
        nacionalidad: '',
        pais_nacimiento: '',
        genero: '',
        estado_persona: '',
        persona: null
      };
    },
    setForm (state, data) {
      for (let key in data) {
        state.form[key] = data[key];
      }
    }
  }
};

export default layout;
