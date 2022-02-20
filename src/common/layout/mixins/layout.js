export default {
  methods: {
    setActive (url) {
      url = this.$util.trimUrl(url);
      let el = document.querySelector('#sidenav-menu .v-list__tile.active');
      if (el) {
        el.classList.remove('active');
      }
      if (url.length) {
        el = document.querySelector(`#sidenav-menu .v-list__tile[data-url='${url}']`);
        if (el) {
          el.classList.add('active');
        }
      }
    },
    clickEvent (url) {
      url = this.$util.trimUrl(url);
      let sidenav = document.getElementById('sidenav-menu');
      if (sidenav) {
        let el = document.querySelector('#sidenav-menu .v-list__tile.active');
        if (el) {
          el.classList.remove('active');
        }
        let element = sidenav.querySelector(`a[data-url="${url}"]`);
        if (element) {
          element.classList.add('active');
          element = element.parentNode.parentNode.previousElementSibling;
          if (element.classList.contains('v-list__group__header') && !element.classList.contains('v-list__group__header--active')) {
            element.dispatchEvent(new window.Event('click'));
          }
        }
      }
    }
  }
};
