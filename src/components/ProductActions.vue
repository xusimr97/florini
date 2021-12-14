<template>
  <!-- Product Version Name -->
  <div class="text-h4 q-mb-md">{{ versionName }}</div>

  <!-- Tag -->
  <div v-for="tag in tags" :key="tag.id" class="q-mb-md">
    <div class="text-h6 q-mb-xs">{{ tag.name }}</div>

    <!-- Tag Items -->
    <div class="row justify-start items-start q-gutter-sm">
      <div
        :class="{
          'tag-option': true,
          'q-pa-sm': true,
          row: true,
          'justify-center': true,
          'items-center': true,
          'relative-position': true,
          'tag-selected': checkTagSelected(tagValue),
        }"
        v-for="tagValue in tag.values"
        :key="tagValue.id"
        v-ripple
      >
        <div class="text-body1 tag-text">{{ tagValue.value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductActions",
  props: {
    tagOptions: {
      type: Array,
      required: true,
    },
    versions: {
      type: Array,
      required: true,
    },
    currentVersion: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      tags: {},
    };
  },
  async mounted() {
    try {
      this.loading = true;
      if (this.versions?.length) {
        this.versions.forEach((version) => {
          this.orderTags(version);
        });
      }
      console.log(this.tags);
    } catch (error) {
      this.errorHandler(error, this);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    orderTags(version) {
      version.tags.forEach((versionTag) => {
        // Add tag to Tags Object
        if (!this.tags[versionTag.tagValue.tagId]) {
          const tagOption = this.tagOptions.find((opt) => {
            return opt.id === versionTag.tagValue.tagId;
          });

          this.tags[versionTag.tagValue.tagId] = {
            id: versionTag.tagValue.tagId,
            name: tagOption.tagTranslations[0]?.title,
            values: [],
            type: tagOption.type,
          };
        }

        // Check if already added
        const alreadyAdded = this.tags[
          versionTag.tagValue.tagId
        ].values.findIndex((val) => {
          return val.id === versionTag.tagValue.id;
        });

        if (alreadyAdded > -1) {
          return;
        }

        const value = this.getValueFromTag(versionTag);
        this.tags[versionTag.tagValue.tagId].values.push({
          id: versionTag.tagValue.id,
          value: value,
        });
      });
    },
    checkTagSelected(tag) {
      let res = false;
      const currentTag = this.currentVersion.tags.find(
        (tmpTag) => tmpTag.id === tag.id
      );
      if (currentTag) {
        res = true;
      }
      return res;
    },
    getValueFromTag(versionTag) {
      switch (this.tags[versionTag.tagValue.tagId].type) {
        case "translatable":
          return this.$t(versionTag.tagValue.value);
        case "number":
          return Number.parseInt(versionTag.tagValue.value);
        default:
          return versionTag.tagValue.value;
      }
    },
  },
  computed: {
    versionName() {
      let res = "";
      if (this.currentVersion?.productVersionTranslations?.length) {
        res = this.currentVersion.productVersionTranslations[0].title;
      }
      return res;
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-option {
  width: 120px;
  min-height: 80px;
  border: 2px solid #dddede;
  border-radius: 5px;
}

.tag-selected {
  border: 2px solid #41d5ab;
  .tag-text {
    color: #41d5ab;
  }
}
</style>
