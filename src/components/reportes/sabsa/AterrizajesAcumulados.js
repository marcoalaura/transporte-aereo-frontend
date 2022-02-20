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
          label: 'viru viru internacional'
          data: [42,765,3,4,5,6,7,8,9,10,11,12] // uno por cada gestion,
        },
        {
          label: 'viru viru nacional',
          data: [42,765,3,4,5,6,7,8,9,10,11,12] // uno por cada gestion
        },
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
                labelString: 'Num. Aterrizajes'
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
