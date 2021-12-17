<template>
  <div class="q-my-xl">
    <!-- Spinner -->
    <div class="flex flex-center" v-if="loading">
      <q-spinner color="primary" size="50px"> </q-spinner>
    </div>

    <div class="container" v-else>
      <!-- product-container 1 -->
      <div class="product-container">
        <div class="productImages">
          <!-- Carousel -->
          <q-carousel
            animated
            v-model="currentSlide"
            arrows
            thumbnails
            infinite
            control-color="primary"
            height="30rem"
            swipeable
            transition-prev="slide-right"
            transition-next="slide-left"
          >
            <q-carousel-slide
              v-for="image in currentProductVersion.images"
              :key="image.id"
              :name="image.order"
              :img-src="imageBasePath + image.url"
            />
          </q-carousel>

          <!-- Show on Mobile -->
          <div class="productActions product-actions-mobile q-mt-md">
            <product-actions
              :versions="productVersions"
              :current-version="currentProductVersion"
              :tag-options="tags"
              @on-change-version="changeVersion($event)"
            />
          </div>

          <!-- Description -->
          <div class="text-body1 text-justify q-mt-md">
            {{ getDescription }}
          </div>
        </div>

        <div class="productActions product-actions-desktop">
          <div class="sticky">
            <product-actions
              :versions="productVersions"
              :current-version="currentProductVersion"
              :tag-options="tags"
              @on-change-version="changeVersion($event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductActions from "../../components/ProductActions.vue";
export default {
  name: "ProductShow",
  data() {
    return {
      loading: false,
      currentSlide: 0,
      productVersions: [],
      currentProductVersion: {},
      imageBasePath: process.env.imageUrl,
      tags: [],
    };
  },
  components: {
    ProductActions,
  },
  async mounted() {
    try {
      this.loading = true;

      if (!this.$route.params.id) {
        throw new TypeError("NO_PRODUCT_ID");
      }

      await this.getProductData(this.$route.params.id);
    } catch (error) {
      this.errorHandler(error, this);
      this.$router.back();
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async getProductData(id) {
      try {
        let params1 = {
          filter: {
            include: [
              {
                relation: "productVersions",
                scope: {
                  include: [
                    {
                      relation: "productVersionTranslations",
                      scope: {
                        where: { locale: this.$i18n.locale },
                      },
                    },
                    {
                      relation: "images",
                      scope: {
                        order: "order ASC",
                      },
                    },
                    {
                      relation: "tags",
                      scope: {
                        include: [
                          {
                            relation: "tagValue",
                          },
                        ],
                      },
                    },
                    {
                      relation: "ratings",
                      scope: {
                        include: [
                          {
                            relation: "customer",
                            scope: {
                              fields: { name: true },
                            },
                          },
                        ],
                      },
                    },
                  ],
                  where: { state: true },
                },
              },
            ],
          },
        };
        let params2 = {
          filter: {
            include: [
              {
                relation: "tagTranslations",
                scope: {
                  where: { locale: this.$i18n.locale },
                },
              },
            ],
            where: { state: true },
          },
        };

        const requests = [
          this.$axios.get(`Products/${id}`, { params: params1 }),
          this.$axios.get(`Tags`, { params: params2 }),
        ];

        const responses = await Promise.all(requests);
        const response = responses[0];
        this.tags = responses[1].data;

        console.log(response);

        if (!response.data.productVersions.length) {
          throw new TypeError("NO_PRODUCT_VERSIONS");
        }

        this.productVersions = response.data.productVersions;

        this.currentProductVersion = response.data.productVersions[0];
      } catch (error) {
        this.errorHandler(error, this);
      }
    },

    changeVersion(version) {
      this.currentProductVersion = version;
    },
  },
  computed: {
    getDescription() {
      if (Object.keys(this.currentProductVersion).length) {
        return this.currentProductVersion.productVersionTranslations[0].text;
      }
      return "";
    },
  },
};
</script>

<style lang="scss" scoped>
.product-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  .productImages {
    flex-basis: 0;
    flex-grow: 999;
    min-width: 60%;
  }

  .productActions {
    flex-basis: 25rem;
    flex-grow: 1;

    .sticky {
      position: sticky;
      top: 60px;
    }
  }

  .productDetails {
    flex-basis: 0;
    flex-grow: 999;
    min-width: 60%;
  }
}

.product-actions-desktop {
  display: none;
  @media (min-width: 1200px) {
    display: block;
  }
}
.product-actions-mobile {
  display: block;
  @media (min-width: 1200px) {
    display: none;
  }
}
</style>
