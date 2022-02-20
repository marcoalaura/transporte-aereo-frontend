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
          label: 'Data One',
          backgroundColor: '#FC2525',
          data: [40, 39, 10, 40, 39, 80, 40]
        },
        {
          label: 'Data Two',
          backgroundColor: '#05CBE1',
          data: [60, 55, 32, 10, 2, 12, 53]
        }, ...
        // en este caso cada dataset seria:
        {
          label: '2015 Nacional',
          data: [10,4,43,2,5,4,3,1,2,77,88,19] // contando por cada mes del anyo
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
                labelString: 'Num. Aterrizajes'
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Mes'
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
