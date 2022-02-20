'use strict';

export default {
  methods: {
    generarToken (tipo, data) {
      this.$confirm('¿Realmente quiere generar el token?, el token creado anteriormente dejará de funcionar.', () => {
        data.tipo = tipo;
        this.$service.post('system/token/generar', data)
        .then(response => {
          if (response) {
            this.$message.info(`Se envió el nuevo token al correo electrónico de ${tipo}`);
            this.$alert(`
              <div class="token-container">
                <p class="v-alert v-alert--outline success--text">
                  <i aria-hidden="true" class="icon material-icons alert__icon">check_circle</i>
                  <span> ¡Token generado correctamente para <strong>${tipo}</strong>! <br />Copie y guarde el token generado.</span>
                </p>
                <div class="token-textarea">
                  <textarea readonly id="select-token">${response.token}</textarea>
                </div>
              </div>
            `, null, 'Token generado');
            this.selectText();
          }
        });
      });
    },
    selectText () {
      setTimeout(() => {
        document.querySelector('#select-token').focus();
        if (typeof document.querySelector('#select-token').select === 'function') {
          document.querySelector('#select-token').select();
        }
      }, 200);
    }
  }
};
