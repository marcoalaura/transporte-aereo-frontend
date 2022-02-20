<template>
  <v-card>
    <v-card-title class="headline">
      <v-icon>edit</v-icon>&nbsp;&nbsp;Editar Plan de Vuelo {{ planVuelo.id }}
      <v-spacer></v-spacer>
      <v-btn icon @click.native="close()">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-form
      v-model="valid"
      ref="form"
      lazy-validation>
      <v-card-text class="pt-0">
        <v-container grid-list-md class="pt-0">
          Plan de Vuelo Nro {{ planVuelo.id }}
          <v-layout>
            <v-flex md12>
              <div class="detalle-title text-xs-left">
                <p>VÁLIDO DESDE: <strong>{{ $datetime.format(planVuelo.fecha_desde) }}</strong> &nbsp;HASTA&nbsp; <strong>{{ $datetime.format(planVuelo.fecha_hasta) }}</strong></p>
                <p>DIAS DE OPERACIÓN:
                  <v-chip v-if="planVuelo.dia_1" color="primary" text-color="white"><v-avatar class="primary lighten-2">1</v-avatar>Lunes</v-chip>
                  <v-chip v-if="planVuelo.dia_2" color="primary" text-color="white"><v-avatar class="primary lighten-2">2</v-avatar>Martes</v-chip>
                  <v-chip v-if="planVuelo.dia_3" color="primary" text-color="white"><v-avatar class="primary lighten-2">3</v-avatar>Miercoles</v-chip>
                  <v-chip v-if="planVuelo.dia_4" color="primary" text-color="white"><v-avatar class="primary lighten-2">4</v-avatar>Jueves</v-chip>
                  <v-chip v-if="planVuelo.dia_5" color="primary" text-color="white"><v-avatar class="primary lighten-2">5</v-avatar>Viernes</v-chip>
                  <v-chip v-if="planVuelo.dia_6" color="primary" text-color="white"><v-avatar class="primary lighten-2">6</v-avatar>Sábado</v-chip>
                  <v-chip v-if="planVuelo.dia_7" color="primary" text-color="white"><v-avatar class="primary lighten-2">7</v-avatar>Domingo</v-chip>
                </p>
                <p>AERONAVE: <strong>{{ planVuelo.aeronave_matricula }}</strong></p>
                <p>TIPO DE AERONAVE:
                  <strong>{{ (planVuelo.aeronave_tipo) ? planVuelo.aeronave_tipo : 'NO EXISTE TIPO' }}</strong>
                </p>
                <p>CATEGORIA ESTELA DE AERONAVE:
                  <strong>{{ (planVuelo.aeronave_categoria_estela) ? planVuelo.aeronave_categoria_estela : 'NO EXISTE CATEGORÍA ESTELA' }}</strong>
                </p>
                <p>AEROPUERTO DE SALIDA: <strong>{{ planVuelo.aeropuerto_salida_codigo_iata }}</strong></p>
                <p>HORA: <strong class="info--text">{{ planVuelo.hora_salida}}</strong></p>
                <p>AEROPUERTO DE DESTINO: <strong>{{ planVuelo.aeropuerto_destino_codigo_iata }}</strong></p>
                <p>DURACIÓN TOTAL: <strong>{{ planVuelo.duracion_total }}</strong></p>
              </div>
            </v-flex>
          </v-layout>
          <v-layout wrap>
            <v-flex md4>
              <v-text-field
                label="Velocidad de Crucero"
                v-model="planVuelo.velocidad_crucero"
              ></v-text-field>
            </v-flex>
            <v-flex md4>
              <v-text-field
                label="Nivel de Crucero"
                v-model="planVuelo.nivel"
              ></v-text-field>
            </v-flex>
            <v-flex md4>
              <v-text-field
                label="Ruta"
                v-model="planVuelo.ruta"
              ></v-text-field>
            </v-flex>
            <v-flex md12>
              <v-textarea
                label="Observaciones"
                v-model="planVuelo.observacion"
              ></v-textarea>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <small class="error--text text-required">* Los campos son obligatorios</small>
        <v-spacer></v-spacer>
        <v-btn
          @click.native="close()">
          <v-icon>cancel</v-icon> Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click.native="editPlanVuelo"
          type="submit">
          <v-icon dark>save</v-icon>&nbsp; Guardar Cambios
        </v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>

export default {
  props: {
    planVuelo: {
      type: Object
    }
  },
  data () {
    return {
      valid: true
    };
  },
  methods: {
    close () {
      this.$store.commit('closeModal', 6);
    },
    editPlanVuelo () {
      let planVueloEdit = {};
      planVueloEdit.velocidad_crucero = this.planVuelo.velocidad_crucero;
      planVueloEdit.ruta = this.planVuelo.ruta;
      planVueloEdit.nivel_crucero = this.planVuelo.nivel_crucero;
      planVueloEdit.observacion = this.planVuelo.observacion;
      this.$service.graphql({
        query: `
          mutation edit($id: Int!, $planVuelo: EditPlanVuelo) {
            planVueloEdit(id: $id, planVuelo: $planVuelo) {
              velocidad_crucero
              ruta
              nivel_crucero
              observacion
            }
          }
        `,
        variables: {
          id: parseInt(this.planVuelo.id),
          planVuelo: planVueloEdit
        }
      }).then(response => {
        console.log('llega aca');
        console.log('RESPUESTA SERVIDOR-->', response);
        this.$message.success('Plan de Vuelo editado');
        // this.updateList();
        this.$store.commit('closeModal', 6);
      })
      .catch(error => console.log(`Ocurrio un errorsito:::${error}`));
    }
  }
};
</script>

