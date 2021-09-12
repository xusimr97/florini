<template>
  <div>
    <q-drawer v-model="rightDrawerOpen" side="right" elevated>
      <q-list>
        <q-item-label header>{{ $t("categories") }}</q-item-label>
        <q-expansion-item
          expand-separator
          v-for="category in itemCategories"
          :key="category.id"
          :label="category[`name_${$i18n.locale}`]"
        >
          <q-item
            v-for="itemType in category.itemTypes"
            :key="itemType.id"
            :to="{ name: 'catalog', params: { type: itemType.id } }"
            :inset-level="0.5"
          >
            <q-item-section>
              <q-item-label>{{
                itemType[`name_${$i18n.locale}`]
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <div class="q-pa-md row justify-center q-gutter-md">
      <q-spinner v-if="isLoading" color="primary" size="50px"> </q-spinner>
      <q-card class="my-card" v-for="item in items" :key="item.id">
        <q-img
          :src="imageUrl + item.image"
          placeholder-src="statics/resources/noticia-1.png"
          basic
          class="item-img"
        >
        </q-img>
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

    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      v-if="$q.platform.is.mobile"
    >
      <q-btn
        round
        icon="fas fa-filter"
        color="primary"
        @click="rightDrawerOpen = !rightDrawerOpen"
      />
    </q-page-sticky>
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
  .item-img
    height 250px
    max-width 100%
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
      this.isLoading = true;
      let response;
      response = await this.$axios.get("ItemCategories");
      this.itemCategories = response.data;

      response = await this.$axios.get("ItemTypes");

      this.itemCategories.forEach(itemCategory => {
        itemCategory.itemTypes = response.data.filter(
          itemType => itemType.categoryFk === itemCategory.id
        );
      });

      await this.loadType(this.itemCategories[0].itemTypes[0].id);
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
