import { HorizontalBar } from 'vue-chartjs';

export default {
  extends: HorizontalBar,
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
          label: '2011 domesticos'
          data: [1] // 1 dato
        },
        {
          label: '2011 intrenacional',
          data: [3] //  1 dato
        },
        {
         'label'
        }
        ...
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
                labelString: 'Gestión'
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Num. Pasajeros'
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
