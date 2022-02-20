<template>
  <div>
    <v-text-field
      v-model="time"
      :label="label"
      :maxlength="plus ? 7 : 5"
      :required="required"
      :rules="rules"
      :single-line="singleLine"
      :class="{ required }"
      @keydown.native="keydownHandler($event)"
      @input.native="inputHandler($event)"
      @keyup.native="keyupHandler($event)"
      ></v-text-field>
  </div>
</template>

<script>
export default {
  props: {
    plus: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => {}
    },
    model: {
      type: String,
      default: 'time'
    },
    value: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: 'Hora'
    },
    required: {
      type: Boolean,
      default: false
    },
    singleLine: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      time: null,
      oldValue: null,
      oldCursor: null,
      maxMinutes: 5,
      regex: this.plus ? new RegExp(/^\d{0,5}$/g) : new RegExp(/^\d{0,4}$/g)
    };
  },
  mounted () {
    if (this.value) {
      this.time = this.value;
    }
  },
  methods: {
    mask (value) {
      let points = false;
      var output = [];
      for (var i = 0; i < value.length; i++) {
        if (i !== 0 && i % 2 === 0 && !points) {
          points = true;
          output.push(':'); // add the separator
        }
        if (i !== 0 && i % 4 === 0) {
          output.push('+'); // add the separator plus
        }
        output.push(value[i]);
      }
      output = output.join('');
      if (points) {
        let data = output.split(':');
        if (data[0]) {
          if (parseInt(data[0]) > 23) {
            data[0] = 23;
            output = data.join(':');
          }
        }
        if (data[1]) {
          if (parseInt(data[1]) > 59) {
            data[1] = 60 - this.maxMinutes;
            output = data.join(':');
          }
        }
      }
      return output;
    },
    unmask (value) {
      var output = value.replace(new RegExp(/[^\d]/, 'g'), ''); // Remove every non-digit character
      return output;
    },
    checkSeparator (position, interval) {
      return Math.floor(position / (interval + 1));
    },
    keydownHandler (e) {
      this.$filter.numeric(e);
      var el = e.target;
      this.oldValue = el.value;
      this.oldCursor = el.selectionEnd;
    },
    getNewCursorPosition  (newValue) {
      return this.oldCursor - this.checkSeparator(this.oldCursor, 2) + this.checkSeparator(this.oldCursor + (newValue.length - this.oldValue.length), 2) + (this.unmask(newValue).length - this.unmask(this.oldValue).length);
    },
    keyupHandler (e) {
      let el = e.target;
      let newValue;
      let newCursorPosition;
      // console.log('keyupHandler', e, e.keyCode, 'start', el.selectionStart, 'end', el.selectionEnd, el);
      if (el.selectionStart <= 2) {
        if (e.keyCode === 38) {
          let data = el.value.split(':');
          if (data[0]) {
            let hours = parseInt(data[0]) + 1;
            if (hours > 23) {
              hours = 0;
            }
            data[0] = (hours + '').padStart(2, '0');
            newValue = data.join(':');

            newCursorPosition = this.getNewCursorPosition(newValue);

            this.time = newValue;
            this.data[this.model] = newValue;
            el.value = newValue;
            el.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }
        if (e.keyCode === 40) {
          let data = el.value.split(':');
          if (data[0]) {
            let hours = parseInt(data[0]) - 1;
            if (hours < 0) {
              hours = 23;
            }
            data[0] = (hours + '').padStart(2, '0');
            newValue = data.join(':');

            newCursorPosition = this.getNewCursorPosition(newValue);

            this.time = newValue;
            this.data[this.model] = newValue;
            el.value = newValue;
            el.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }
      }
      if (el.selectionStart >= 3 && el.selectionStart <= 5) {
        if (e.keyCode === 38) {
          let data = el.value.split(':');
          if (data[1]) {
            let minutes = parseInt(data[1]) + this.maxMinutes;
            minutes = minutes - (minutes % this.maxMinutes);
            if (minutes > 59) {
              minutes = 0;
            }
            data[1] = (minutes + '').padStart(2, '0');
            newValue = data.join(':');

            newCursorPosition = this.getNewCursorPosition(newValue);

            this.time = newValue;
            this.data[this.model] = newValue;
            el.value = newValue;
            el.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }
        if (e.keyCode === 40) {
          let data = el.value.split(':');
          if (data[1]) {
            let minutes = parseInt(data[1]) - this.maxMinutes;
            if (minutes % this.maxMinutes) {
              minutes = minutes - (minutes % this.maxMinutes) + this.maxMinutes;
            }
            if (minutes < 0) {
              minutes = 60 - this.maxMinutes;
            }
            data[1] = (minutes + '').padStart(2, '0');
            newValue = data.join(':');

            newCursorPosition = this.getNewCursorPosition(newValue);

            this.time = newValue;
            this.data[this.model] = newValue;
            el.value = newValue;
            el.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }
      }
    },
    inputHandler (e) {
      let el = e.target;
      let newCursorPosition;
      let newValue = this.unmask(el.value);

      // console.log('new value', newValue, 'old value', el.value);

      if (newValue.match(this.regex)) {
        newValue = this.mask(newValue);
        // console.log('match', newValue);

        newCursorPosition = this.getNewCursorPosition(newValue);

        if (newValue !== '') {
          this.time = newValue;
          this.data[this.model] = newValue;
          el.value = newValue;
        } else {
          this.time = '';
          this.data[this.model] = '';
          el.value = '';
        }
      } else {
        // console.log('no match', this.oldValue);
        this.time = this.oldValue;
        this.data[this.model] = this.oldValue;
        el.value = this.oldValue;
        newCursorPosition = this.oldCursor;
      }
      el.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  }
};
</script>
