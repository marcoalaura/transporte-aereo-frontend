<template>
  <v-card>
    <v-card-title class="headline">
      <v-flex xs10>
        <v-icon>assignment</v-icon> Importación de pasajeros
      </v-flex>
      <v-flex xs2 text-md-right>
        <v-btn icon @click.native="$store.commit('closeModal', 2)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-flex>
    </v-card-title>

    <v-stepper v-model="e1" class="modal-solicitud">
      <v-stepper-header>
        <v-stepper-step step="1" :complete="e1 > 1">Subiendo archivo</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="2" :complete="e1 > 2">Finalizado</v-stepper-step>
      </v-stepper-header>
      <v-stepper-items>
        <v-stepper-content step="1" class="pt-1">
          <v-card-text>
            <v-expansion-panel v-model="panel">
              <v-expansion-panel-content>
                <div slot="header"><span class="primary--text">PLANTILLA</span></div>
                <v-alert outline color="info" :value="true">
                  Descargue la plantilla para la importación de sus itinerarios.
                  <div class="text-xs-center">
                    <v-btn
                      color="success"
                      class="mb-0"
                      :href="urlPlantilla">
                      <v-icon dark>file_download</v-icon> Descargar plantilla
                    </v-btn>
                  </div>
                </v-alert>
              </v-expansion-panel-content>
              <v-expansion-panel-content>
                <div slot="header"><span class="primary--text">INSTRUCCIONES</span></div>
                <v-alert outline color="info" :value="true">
                   Llene los campos de acuerdo a la siguiente descripción:
                  <table>
                    <thead>
                      <tr>
                        <th>Campo</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong class="primary--text">TIPO</strong></td>
                        <td>Tipo de pasajero: <strong>TRIPULANTE</strong>, <strong>PASAJERO</strong></td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">TIPO_VIAJERO</strong></td>
                        <td>Tipo de viajero: <strong>NACIONAL</strong>, <strong>EXTRANJERO</strong> (Solo en caso de que el tipo de pasajero sea <strong>PASAJERO</strong>)</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">TIPO_TRIPULACION</strong></td>
                        <td>Tipo de tripulación: <strong>PILOTO</strong>, <strong>TRIPULANTE_DE_CABINA</strong> (Solo en caso de que el tipo de pasajero sea <strong>TRIPULANTE</strong>)</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">NRO_ASIENTO</strong></td>
                        <td>Número de asiento</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">FECHA_VENCIMIENTO_DOC</strong></td>
                        <td>Fecha de vencimiento del documento de identificación</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">ENTIDAD_EMISORA_DOC</strong></td>
                        <td>Entidad emisora del documento de identificación</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">LUGAR_ORIGEN</strong></td>
                        <td>Lugar de origen del pasajero</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">LUGAR_DESTINO</strong></td>
                        <td>Lugar de destino final del pasajero</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">EMAIL</strong></td>
                        <td>Correo electrónico</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">NRO_LICENCIA</strong></td>
                        <td>Número de licencia del tripulante(solo para tipo de pasajero <strong>TRIPULANTE</strong>)</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">NOMBRES</strong></td>
                        <td>Nombres</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">PRIMER_APELLIDO</strong></td>
                        <td>Primer apellido</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">SEGUNDO_APELLIDO</strong></td>
                        <td>Segundo apellido</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">TIPO_DOCUMENTO</strong></td>
                        <td>Tipo de documento de identificación: <strong>CI</strong>, <strong>PASAPORTE</strong>, <strong>OTRO</strong></td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">NRO_DOCUMENTO</strong></td>
                        <td>Número de documento de identificación</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">FECHA_NACIMIENTO</strong></td>
                        <td>Fecha de nacimiento</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">TELEFONO</strong></td>
                        <td>Teléfono</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">MOVIL</strong></td>
                        <td>Móvil</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">NACIONALIDAD</strong></td>
                        <td>Nacionalidad</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">PAIS_NACIMIENTO</strong></td>
                        <td>País de nacimiento</td>
                      </tr>
                      <tr>
                        <td><strong class="primary--text">GENERO</strong></td>
                        <td>Genero: <strong>M</strong>, <strong>F</strong>, <strong>OTRO</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </v-alert>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-alert outline color="info" icon="info" :value="true">
              Una vez haya llenado su archivo CSV proceda a subir el archivo.
            </v-alert>
            <v-alert outline color="warning" icon="warning" :value="true">
              <strong>Nota.-</strong> El archivo CSV tiene que estar guardado con codificación <strong>UTF-8</strong> separado por <strong>comas</strong>.
            </v-alert>
            <file-upload
              :url="urlFile"
              types=".csv"
              name="csvFile"
              :form="form"
              :on-success="onSuccess"
              label="Arrastre su archivo CSV aquí <br>o haga clic aquí para subir su archivo"></file-upload>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click.native="$store.commit('closeModal', 2);">
              <v-icon>cancel</v-icon> {{$t('common.cancel') }}
            </v-btn>
            <v-btn
              @click.native="e1 = 1">
              <v-icon>keyboard_arrow_left</v-icon> Atrás
            </v-btn>
          </v-card-actions>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-card-text v-if="errors">
            <v-alert outline color="error" icon="error" :value="true">
              Se encontraron los siguientes errores en la importación.
            </v-alert>
            <table class="v-table">
              <thead>
                <tr>
                  <th>Nro. de registro</th>
                  <th>Campo - Error</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, key) in errors" :index="key">
                  <td class="text-xs-right">{{ key }}</td>
                  <td>
                    <ul class="no-style">
                      <li v-for="(error, campo) in item">
                        <strong class="primary--text">{{ campo.toUpperCase() }}</strong>: <span v-html="error"></span>
                      </li>
                    </ul>
                 </td>
                </tr>
              </tbody>
            </table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click.native="$store.commit('closeModal', 2);">
              <v-icon>cancel</v-icon> {{$t('common.cancel') }}
            </v-btn>
            <v-btn
              @click.native="e1 = 1">
              <v-icon>keyboard_arrow_left</v-icon> Atrás
            </v-btn>
          </v-card-actions>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-card>
</template>

<script>
import FileUpload from '@/common/util/FileUpload.vue';
import crud from '@/common/util/crud-table/mixins/crud-table';

export default {
  mixins: [ crud ],
  props: {
    idVuelo: {
      type: Number,
      default: 0
    }
  },
  mounted () {
    if (this.idVuelo) {
      this.form.id_vuelo = this.idVuelo;
    }
  },
  data () {
    return {
      panel: [true],
      urlPlantilla: this.$authUrl.split('auth')[0] + 'plantilla-pasajeros.csv',
      urlFile: this.$apiUrl + 'vuelo/pasajero/upload',
      errors: null,
      e1: 1,
      form: {}
    };
  },
  methods: {
    onSuccess (file, response) {
      // Método que se ejecuta después de realizar la importación del csv
      if (response.errors) {
        this.errors = response.errors;
        this.e1 = 2;
      } else {
        if (response.success) {
          this.updateList();
          this.$message.success('¡La importación se realizó correctamente!');
          this.$store.commit('closeModal', 2);
        }
      }
    }
  },
  components: {
    FileUpload
  }
};
</script>
<style lang="scss">
$font-size: 0.9rem;
$line-height: 1.2;
$lines-to-show: 5;

.modal-solicitud {
  .date {
    position: relative;

    label {
      position: absolute;
      z-index: 1;
      right: 24px;
      top: 13px;
      color: white;
      font-size: 1.2rem;
    }
  }

  .sin-fecha {
    padding-top: 30px !important;
    padding-left: 25px !important;
  }

  .vue-dropzone {
    text-align: center;
  }
}

.dz-error-message {
  span {
    display: block;
    display: -webkit-box;
    max-width: 400px;
    height: $font-size*$line-height*$lines-to-show;
    margin: 0 auto;
    font-size: $font-size;
    line-height: $line-height;
    overflow: hidden;
    -ms-text-overflow: ellipsis;
  }
}
</style>
