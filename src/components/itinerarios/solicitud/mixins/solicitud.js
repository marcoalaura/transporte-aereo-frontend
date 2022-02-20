export default {
  computed: {
    rango () {
      let fechas = [];
      if (!this.form.fecha_inicio) {
        // en caso de limpiar fecha inicio solamente
        this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(this.$datetime.now(true), 365)), 'YYYY-MM-dd');
      }
      if (this.form.fecha_inicio && this.form.fecha_fin) {
        const ini = this.$datetime.transform(this.form.fecha_inicio);
        const fin = this.$datetime.transform(this.form.fecha_fin);
        this.fecha_fin_maxima = this.$datetime.format(new Date(this.$datetime.addDays(ini, 365)), 'YYYY-MM-dd');
        // controlando rango de fechas
        if (this.$datetime.daysBetweenTwoDates(ini, fin) > 365) {
          this.form.fecha_fin = this.fecha_fin_maxima;
          this.$message.warning('No se permite itinerarios de más de 365 días.');
        }
        let max = this.$datetime.daysBetweenTwoDates(ini, fin);
        for (var i = 0; i <= max; i++) {
          const d = new Date(this.$datetime.addDays(ini, i));
          fechas.push(d.toISOString().substr(0, 10));
        }

        return fechas;
      }
      return null;
    }
  }
};
