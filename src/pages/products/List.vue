<template>
  <!-- eslint-disable vue/no-template-shadow -->
  <div class="q-mt-md">
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
      class="q-pa-md row justify-start q-gutter-md container"
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
          :src="imageBasePath + item.productVersions[0]?.images[0]?.url"
          placeholder-src="logo2.svg"
          basic
          class="item-img"
        >
        </q-img>
        <q-card-section>
          <div class="name text-h6">
            {{ item.productVersions[0]?.productVersionTranslations[0].title }}
          </div>
          <div class="description text-justify">
            {{
              item.productVersions[0]?.productVersionTranslations[0].shortText
            }}
          </div>
          <div class="text-h6">
            {{ item.productVersions[0]?.price + "€" }}
          </div>
        </q-card-section>
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
          :src="imageBasePath + item.productVersions[0]?.images[0]?.url"
          placeholder-src="logo2.svg"
          basic
          class="mobile-item-img col-4"
          :img-style="{ 'background-size': 'contain' }"
        >
        </q-img>
        <div class="col-8 q-pa-sm">
          <div class="name text-subtitle1">
            {{ item.productVersions[0]?.productVersionTranslations[0].title }}
          </div>
          <div class="description text-justify">
            {{
              item.productVersions[0]?.productVersionTranslations[0].shortText
            }}
          </div>
          <div class="text-subtitle1 q-mt-xs">
            {{ item.productVersions[0]?.price + "€" }}
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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
      rightDrawerOpen: this.$q.platform.is.desktop,
      categories: null,
      imageBasePath: process.env.imageUrl,
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
                  ],
                },
              },
            ],
            where: {
              categoryId: category,
            },
          },
        };
        const response = await this.$axios.get(`Products/`, { params });
        this.products = response.data;
        this.items = response.data;
        console.log(this.items);
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
};
</script>
