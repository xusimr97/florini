<template>
  <!-- eslint-disable vue/no-template-shadow -->
  <div>
    <q-drawer v-model="rightDrawerOpen" side="right" elevated>
      <q-list>
        <q-item-label header>{{ $t("categories") }}</q-item-label>
        <q-item
          v-for="category in categories"
          :key="category.id"
          :to="{ name: 'products', params: { category: category.id } }"
        >
          <q-item-section>
            <q-item-label>{{
              category.categoryTranslations[0]?.title
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <!-- <q-expansion-item
          expand-separator
          v-for="category in categories"
          :key="category.id"
          :label="category.categoryTranslations[0]?.title"
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
        </q-expansion-item> -->
      </q-list>
    </q-drawer>

    <!-- Desktop -->
    <div
      class="q-pa-md row justify-center q-gutter-md container"
      v-if="$q.platform.is.desktop"
    >
      <q-spinner v-if="isLoading" color="primary" size="50px"> </q-spinner>
      <q-card
        class="my-card"
        v-for="item in items"
        :key="item.id"
        @click="$router.push({ name: 'item', params: { id: item.id } })"
      >
        <q-img
          :src="item.image"
          placeholder-src="statics/resources/noticia-1.png"
          basic
          class="item-img"
        >
        </q-img>
        <q-card-section>
          <div class="name text-h6">{{ item[`name_${$i18n.locale}`] }}</div>
          <q-rating size="24px" v-model="item.stars" :max="5" readonly />
        </q-card-section>
        <q-card-section class="description">
          {{ item[`description_${$i18n.locale}`] }}
        </q-card-section>
        <q-card-section>
          {{ currency(item.price) }}
        </q-card-section>
        <!-- <q-card-actions class="justify-end">
          <q-btn flat>{{ $t("more") }}</q-btn>
          <q-btn flat>{{ $t("buy") }}</q-btn>
        </q-card-actions> -->
      </q-card>
    </div>

    <!-- Mobile -->
    <div class="q-pa-md container" v-else>
      <q-spinner v-if="isLoading" color="primary" size="50px"> </q-spinner>
      <q-card
        v-for="item in items"
        :key="item.id"
        class="row q-mb-sm my-card-mobile"
        @click="$router.push({ name: 'item', params: { id: item.id } })"
      >
        <q-img
          :src="item.image"
          placeholder-src="statics/resources/noticia-1.png"
          basic
          class="mobile-item-img col-4"
          :img-style="{ 'background-size': 'contain' }"
        >
        </q-img>
        <div class="col-8 q-pa-sm">
          <div>
            <div class="name text-subtitle1">
              {{ item[`name_${$i18n.locale}`] }}
            </div>
            <q-rating size="18px" v-model="item.stars" :max="5" readonly />
          </div>
          <div class="description">
            {{ item[`description_${$i18n.locale}`] }}
          </div>
          <div>
            {{ currency(item.price) }}
          </div>
        </div>
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

<style>
.my-card {
  width: 100%;
  max-width: 250px;
}
.my-card .name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.my-card .description {
  height: 40px;
  overflow: hidden;
}
.my-card .item-img {
  max-width: 100%;
  height: 250px;
}
.my-card-mobile .name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.my-card-mobile .description {
  height: 40px;
  overflow: hidden;
}
.my-card-mobile .mobile-item-img {
  height: 150px;
  background-color: #f8f8f8;
}
</style>

<script>
export default {
  name: "Catalog",
  data() {
    return {
      isLoading: false,
      items: null,
      itemTypes: null,
      itemType: null,
      rightDrawerOpen: this.$q.platform.is.desktop,
      itemCategory: null,
      categories: null,
    };
  },
  async mounted() {
    try {
      this.isLoading = true;
      let response;
      let params = {
        filter: {
          include: [
            {
              relation: "categoryTranslations",
              scope: { where: { locale: this.$i18n.locale } },
            },
          ],
          where: {
            state: true,
          },
        },
      };
      response = await this.$axios.get(`Categories`, { params });
      console.log(response.data);
      this.categories = response.data.filter(
        (cat) => cat.parentCategoryId === null
      );
      await this.loadCategory(this.categories[0].id);
    } catch (error) {
      this.$q.notify({
        message: this.$t(error.message),
        type: "negative",
      });
    } finally {
      this.isLoading = false;
    }
  },
  watch: {
    "$route.params.category": async function (category) {
      await this.loadCategory(category);
    },
  },
  methods: {
    async loadCategory(category, showLoading = false) {
      try {
        if (showLoading) {
          this.isLoading = true;
        }
        let params = {
          filter: {
            include: [
              {
                relation: "productVersions",
                scope: {
                  limit: 1,
                  include: [
                    {
                      relation: "productVersionTranslations",
                      scope: {
                        where: { locale: this.$i18n.locale },
                        limit: 1,
                      },
                    },
                    {
                      relation: "images",
                      scope: {
                        where: { order: 0 },
                        limit: 1,
                      },
                    },
                    {
                      relation: "ratings",
                      scope: {
                        fields: { value: true },
                      },
                    },
                  ],
                },
              },
            ],
          },
        };
        const response = await this.$axios.get(`Products/`, { params });
        this.products = response.data;
        this.items = response.data;
      } catch (error) {
        this.$q.notify({
          message: this.$t(error.message),
          type: "negative",
        });
      } finally {
        if (showLoading) {
          this.isLoading = false;
        }
      }
    },
  },
  computed: {
    currency: (i) => (i ? i.toFixed(2) + "€" : i),
  },
};
</script>
