<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-secondary">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> {{ $t($route.name) }} </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <!-- <div v-if="customer.email" class="q-mv-sm"></div> -->
      <div>
        <q-img
          src="https://cdn.quasar.dev/img/material.png"
          style="height: 200px"
        >
          <div class="absolute-bottom bg-transparent">
            <q-avatar size="56px" class="q-mb-sm">
              <img :src="`avatars/${randomId()}.svg`" />
            </q-avatar>
            <div class="text-weight-bold text-subtitle1">
              {{ customer.username }}
            </div>
            <div class="text-weight-bold text-subtitle2">
              {{ customer.email }}
            </div>
            <div class="row justify-end">
              <q-btn outline @click="logout">
                {{ $t("logout") }}
              </q-btn>
            </div>
          </div>
        </q-img>
      </div>
      <q-list>
        <q-item
          v-for="page of pages"
          :key="page.nameUrl"
          clickable
          :to="{ name: page.nameUrl }"
        >
          <q-item-section v-if="page.icon" avatar>
            <q-icon :name="page.icon" class="image-primary-filter" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t(page.title) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

const pages = [
  {
    icon: "fas fa-home",
    title: "home",
    nameUrl: "home",
  },
];

export default defineComponent({
  name: "MainLayout",
  data() {
    return {
      $t: this.$t,
      leftDrawerOpen: false,
      pages: pages,
      customer: this.$store.state.customer,
    };
  },
  methods: {
    randomId(min = 1, max = 9) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    async logout() {
      await this.$axios.post("Customers/logout");
      await this.$router.push("/login");
    },
  },
});
</script>
<style lang="scss" scoped>
.q-item.q-router-link--active {
  .image-primary-filter {
    filter: $primary-filter;
  }
}
</style>
