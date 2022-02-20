import { Line } from 'vue-chartjs';

export default {
  extends: Line,
  props: {
    titulo: {
      type: String,
      default: 'Grafico'
    },
    labels: {
      type: Array,
      default: () => []
    },
    datasets: {
      type: Array,
      default: () => []
      /* EJEMPLO  de elementos
        {
          label: 'domesticos'
          data: [40, 39, 10, 40, 39, 80, 40, ...] // 1 dato por gestion
        },
       {
         label: 'internacionales'
         data: [3,2,123,...] // 1 dato por gestion
       }
       */
    },
    options: {
      type: Object,
      default: () => {
        return {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Num. Pasajeros'
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Gestión'
              }
            }]
          }

        };
      }
    }
  },
  data () {
    return {
      adicionales: {
      }
    };
  },
  mounted () {
    this.renderChart({
      labels: this.labels,
      datasets: this.datasets
    },
    this.options);
  }
};
