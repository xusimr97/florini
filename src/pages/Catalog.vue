<template>
  <div>
    <q-drawer v-model="rightDrawerOpen" side="right" elevated>
      <!-- <q-list>
        <q-item-label header>{{ $t("categories") }}</q-item-label>
        <q-item
          clickable
          v-for="category in categories"
          :key="category.icon"
          :to="{ name: 'catalog', params: { type: category.id } }"
        >
          <q-item-section>
            <q-item-label>{{ category.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list> -->
    </q-drawer>
    <div class="q-pa-md row justify-center q-gutter-md">
      <q-spinner v-if="isLoading" color="primary" size="50px"> </q-spinner>
      <q-card class="my-card" v-for="item in items" :key="item.id">
        <img :src="imageUrl + item.image" />
        <q-card-section>
          <div class="name text-h6">{{ item[`name_${$i18n.locale}`] }}</div>
          <q-rating size="24px" v-model="item.stars" :max="5" />
        </q-card-section>
        <q-card-section class="description">
          {{ item.description }}
        </q-card-section>
        <q-card-section>
          {{ item.price | currency }}
        </q-card-section>
        <q-card-actions class="justify-end">
          <q-btn flat>{{ $t("more") }}</q-btn>
          <q-btn flat>{{ $t("buy") }}</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.my-card
  width 100%
  max-width 250px
  .name
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
  .description
    height 40px
    overflow hidden
</style>

<script>
export default {
  name: "Catalog",
  data() {
    return {
      isLoading: false,
      imageUrl: "https://verdnatura.es/vn-image-data/catalog/200x200/",
      items: null,
      itemTypes: null,
      itemType: null,
      rightDrawerOpen: this.$q.platform.is.desktop,
      itemCategory: null,
      itemCategories: null
    };
  },
  async mounted() {
    try {
      console.log(this.$i18n.locale);
      this.isLoading = true;
      let response;
      response = await this.$axios.get("ItemCategories");
      this.itemCategories = response.data;
      this.itemCategory = this.itemCategories[0].id;
      await this.loadCategory(this.itemCategory);
    } catch (error) {
      this.$q.notify({
        message: this.$t(error.message),
        type: "negative"
      });
    } finally {
      this.isLoading = false;
    }
  },
  watch: {
    "$route.params.type": async function(type) {
      await this.loadType(type);
    }
  },
  methods: {
    async loadCategory(category, showLoading = false) {
      try {
        if (showLoading) {
          this.isLoading = true;
        }
        this.itemTypes = [];
        this.itemType = null;
        let params = { filter: { where: { categoryFk: category } } };
        let response = await this.$axios.get("ItemTypes", { params });
        this.itemTypes = response.data;
        this.itemType = this.itemTypes[0].id;
        await this.loadType(this.itemType);
      } catch (error) {
        this.$q.notify({
          message: this.$t(error.message),
          type: "negative"
        });
      } finally {
        if (showLoading) {
          this.isLoading = false;
        }
      }
    },
    async loadType(type, showLoading = false) {
      try {
        if (showLoading) {
          this.isLoading = true;
        }
        this.items = null;

        let params = { filter: { where: { typeFk: type }, limit: 50 } };

        let response = await this.$axios.get("Items", { params });
        this.items = response.data;
      } catch (error) {
        this.$q.notify({
          message: this.$t(error.message),
          type: "negative"
        });
      } finally {
        if (showLoading) {
          this.isLoading = false;
        }
      }
    }
  },
  filters: {
    currency: i => (i ? i.toFixed(2) + "€" : i)
  }
};
</script>
