/* eslint-disable vue/no-template-shadow */
<template>
  <div>
    <q-carousel
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      animated
      swipeable
      control-color="white"
      padding
      class="bg-grey-10 shadow-1 main-carousel"
      ref="carousel"
    >
      <q-carousel-slide
        v-for="item in slides"
        :key="item.id"
        :img-src="item.image"
        :name="item.id"
        class="column no-wrap bg-slider"
      >
        <div class="slide-text q-mt-md text-h4 text-center">
          {{ item.postTranslations[0]?.title }}
        </div>
        <div class="slide-text q-mt-md text-h5 text-center">
          {{ item.postTranslations[0]?.text }}
        </div>
        <div class="carousel-backdrop"></div>
      </q-carousel-slide>

      <template #control>
        <q-carousel-control class="q-gutter-xs custom-control-back">
          <q-btn
            push
            round
            dense
            color="white"
            text-color="black"
            icon="arrow_left"
            @click="$refs.carousel.previous()"
          />
        </q-carousel-control>
        <q-carousel-control class="q-gutter-xs custom-control-next">
          <q-btn
            push
            round
            dense
            color="white"
            text-color="black"
            icon="arrow_right"
            @click="$refs.carousel.next()"
          />
        </q-carousel-control>
      </template>
    </q-carousel>

    <!-- Start news-->
    <div class="q-pa-md row container">
      <div
        class="col-12 col-sm-6 col-md-4 q-pa-md"
        v-for="item in news"
        :key="item.id"
      >
        <q-card>
          <q-img
            class="custom-image"
            ratio="1"
            position="50% 50%"
            :src="item.image"
          >
            <div
              class="text-h6 absolute-bottom text-center"
              v-if="item.postTranslations[0]?.title"
            >
              {{ item.postTranslations[0]?.title }}
            </div>
          </q-img>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 633px) {
  .q-carousel__slide {
    background-repeat: no-repeat;
    background-origin: inherit;
    background-size: 300% 100%;
  }

  .main-carousel {
    height: 80vw !important;
  }

  .slide-text.text-h4 {
    font-size: 1.7rem;
    font-weight: 400;
    line-height: 2rem;
    letter-spacing: normal;
  }
  .slide-text.text-h5 {
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 1.5rem;
    letter-spacing: normal;
  }
}

.bg-slider {
  position: relative;
}

.bg-slider .carousel-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.slide-text {
  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
  color: white;
  z-index: 2;
}
.custom-control-back {
  z-index: 2;
  top: 50%;
  left: 0;
  margin-top: -16px !important;
}
.custom-control-next {
  z-index: 2;
  top: 50%;
  right: 0;
  margin-top: -16px !important;
}

.backDrop {
  background-color: black;
  height: 100%;
}
</style>

<script>
export default {
  name: "PageIndex",
  data() {
    return {
      slide: null,
      slides: [
        // {
        //   image: "statics/carousel/banner-1.png",
        //   id: "banner-1",
        // },
        // {
        //   image: "statics/carousel/banner-2.png",
        //   id: "banner-2",
        // },
      ],
      news: [
        // {
        //   id: "a",
        //   image: "statics/resources/noticia-1.png",
        //   text: null,
        // },
      ],
    };
  },

  async mounted() {
    let params = {
      filter: {
        where: { state: true },
        include: [
          {
            relation: "postTranslations",
            scope: { where: { locale: this.$i18n.locale } },
          },
        ],
      },
    };
    let response = await this.$axios.get("Posts", { params });
    this.slides = response.data
      .filter((post) => post.type === "slider")
      .map((post) => {
        post.image = process.env.imageUrl + post.image;
        return post;
      });
    this.slide = this.slides[0]?.id;
    console.log(this.slide);
    this.news = response.data
      .filter((post) => post.type === "post")
      .map((post) => {
        post.image = process.env.imageUrl + post.image;
        return post;
      });
    // this.offers = this.offers.concat(res.data);

    // params = { filter: { where: { type: "slider" } } };
    // res = await this.$axios.get("Posts", { params });
    // this.slides = this.slides.concat(res.data);
  },
};
</script>
