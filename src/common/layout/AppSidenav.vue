<template>
  <v-navigation-drawer
    persistent
    :mini-variant="$store.state.layout.miniVariant"
    :clipped="clipped"
    v-model="drawer"
    enable-resize-watcher
    fixed
    class="app-sidenav"
    app
    width="260"
    mini-variant-width="68"
  >
    <div class="app-logo">
      <h1 class="app-title">
        <v-icon color="warning">flight</v-icon>
        <span>{{ $t('app.title') }}</span>
      </h1>
    </div>
    <div
      class="app-operador"
      :class="{ 'airplane': $store.state.user.tipo === 'AVION', 'bus': $store.state.user.tipo === 'BUS' }"
      v-if="$store.state.user.operador">
      <v-icon>{{ $store.state.user.tipo === 'AVION' ? 'flight' : 'directions_bus' }}</v-icon>
      <div class="app-operador-title">{{ $store.state.user.operador }}</div>
    </div>
    <v-list id="sidenav-menu">
      <v-list-tile
        @click="send('')"
        data-url="/"
      >
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Dashboard</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-group
        v-model="item.active"
        v-for="item in menu"
        :key="item.label"
        :prepend-icon="item.icon"
        v-if="item.submenu"
        no-action
      >
        <v-list-tile
          slot="activator"
          @click="send(item.url, item.submenu)"
          :data-url="item.url"
        >
          <v-list-tile-content>
            <v-list-tile-title>{{ getLabel(item) }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-for="subItem in item.submenu"
          :key="subItem.label"
          @click="send(subItem.url)"
          :data-url="subItem.url"
        >
          <v-list-tile-content>
            <v-list-tile-title>{{ getLabel(subItem) }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list-group>
      <v-list-tile
        v-else
        @click="send(item.url, item.submenu)"
        :data-url="item.url"
      >
        <v-list-tile-action>
          <v-icon color="warning">{{ item.icon }}</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ getLabel(item) }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex';
import Layout from './mixins/layout';

export default {
  mixins: [ Layout ],
  mounted () {
    if (this.$storage.exist('menu')) {
      this.$store.commit('setMenu', this.$storage.get('menu'));
    }

    if (this.$storage.existUser()) {
      this.$store.commit('setUser', this.$storage.getUser());
    }

    this.setActive(this.$route.path);
    setTimeout(() => (this.clickEvent(this.$route.path)), 600);
  },
  data: () => ({
    drawer: true,
    clipped: false
  }),
  computed: {
    ...mapState(['menu', 'user'])
  },
  methods: {
    send (url, submenu) {
      if (submenu === undefined) {
        if (this.$storage.exist('menu')) {
          let page = this.$util.getMenuOption(this.$storage.get('menu'), url);
          this.$store.state.breadcrumbs = page;
        }

        this.setActive(url);

        this.$router.push('/' + (url || ''));
      }
    },
    getLabel (item) {
      // if (item.url) {
      //   let label = this.$t(`menu.${item.url.replace('/', '')}`);
      //   if (label.indexOf('.') === -1) {
      //     return label;
      //   }
      // }

      return item.label;
    }
  }
};
</script>

<style lang="scss">
@import '../../assets/scss/_variables.scss';

$linkColor: #868aa8;
$iconColor: #525672;

.theme--light .app-sidenav {
  background-color: $bgSidenav !important;

  .v-list {
    background-color: $bgSidenav;
    padding: 0;
  }

  .v-list .v-list__tile--link.active {
    background-color: rgba(0,0,0,0.12);
  }

  .v-list__group__items--no-action .v-list__tile {
    padding-left: 60px;
  }

  .v-list__tile__action, {
    padding: 0 4px 0 12px;
  }

  .v-list__group__header__prepend-icon, {
    padding: 0 4px 0 16px;
  }

  .v-list__tile.primary--text, .v-list__group {
    color: lighten($primary, 40%);
  }

  .v-icon {
    // color: $iconColor;
    color: lighten($linkColor, 10%);
  }

  .v-list__tile {
    padding-left: 4px;
  }

  .v-list__tile__title {
    font-size: 16px;
    color: $linkColor;
  }

  .app-logo {
    background-color: darken($bgSidenav, 2%);
    height: 70px;

    .v-icon {
      font-size: 36px;
      margin: -5px 5px 0 0;
    }

    .app-title {
      color: lighten($warning, 0%);
      font-weight: 300;
      line-height: 66px;
      font-size: 1.6rem;
      padding: 0 15px;
      white-space: nowrap;
    }
  }

  .app-operador {
    background-color: lighten($bgSidenav, 3%);
    background-position: center;
    background-size: cover;
    padding: 15px 20px;
    color: #ddd;
    position: relative;

    &.airplane {
      background-image: url(../../assets/images/logos/airplane.jpg);
    }

    &.bus {
      background-image: url(../../assets/images/logos/bus.jpg);
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba($bgSidenav, .7);
    }

    .app-operador-title {
      padding-left: 25px;
      line-height: 1.3rem;
      position: relative;
      z-index: 1;
    }

    .v-icon {
      position: absolute;
      top: 16px;
      left: 20px;
      color: #ddd;
      font-size: 1.3rem;
      z-index: 1;
    }
  }

  &.v-navigation-drawer--mini-variant {
    .app-title {
      span {
        display: none;
      }
    }
  }

}
</style>
