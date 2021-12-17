<template>
  <!-- Product Version Name -->
  <div class="text-h4 q-mb-md">{{ versionName }}</div>

  <!-- Tag -->
  <div v-for="tag in tags" :key="tag.id" class="q-mb-md">
    <div class="text-h6 q-mb-xs">{{ tag.name }}</div>

    <!-- Tag Items -->
    <div class="row justify-start items-start q-gutter-sm">
      <!-- TODO           'tag-affect-other-values': checkTagAffectOtherValues(tagValue),
 -->
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
        @click="setTagValue(tagValue)"
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
  emits: {
    onChangeVersion: null,
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
          this.createTagStructure(version);
        });
      }
    } catch (error) {
      this.errorHandler(error, this);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    createTagStructure(version) {
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

        const value = this.getLabelHTMLFromTag(versionTag);
        this.tags[versionTag.tagValue.tagId].values.push({
          id: versionTag.tagValue.id,
          value: value,
          tagId: versionTag.tagValue.tagId,
        });
      });
    },
    checkTagSelected(tag) {
      let res = false;
      const currentTag = this.currentVersion.tags.find((tmpTag) => {
        return tmpTag.tagValue.id === tag.id;
      });

      if (currentTag) {
        res = true;
      }
      return res;
    },
    // TODO
    checkTagAffectOtherValues(tag) {
      let currentVersionTags = this.getVersionTags(this.currentVersion);
      let otherVersions = this.getOtherVersions();
      // Find at least 1 version
      return !otherVersions.some((version) => {
        // Check if all tags meet the condition
        const noCoincidenceTags = currentVersionTags.filter(
          (currentVersionTag) => {
            return !this.checkTagInsideVersion(currentVersionTag, version);
          }
        );
        // console.log(noCoincidenceTags);
        return noCoincidenceTags.length > 1;
      });
    },
    getVersionTags(version) {
      return version.tags.map((versionTag) => {
        return {
          tagId: versionTag.tagValue.tagId,
          tagValueId: versionTag.tagValue.id,
          value: versionTag.tagValue.value,
        };
      });
    },
    checkTagInsideVersion(currentVersionTag, version) {
      return (
        version.tags.findIndex((tag) => {
          return currentVersionTag.tagValueId === tag.tagValue.id;
        }) > -1
      );
    },
    getLabelHTMLFromTag(versionTag) {
      switch (this.tags[versionTag.tagValue.tagId].type) {
        case "translatable":
          return this.$t(versionTag.tagValue.value);
        case "number":
          return Number.parseInt(versionTag.tagValue.value);
        default:
          return versionTag.tagValue.value;
      }
    },
    getOtherVersions(tagValueId = 0) {
      const array = [];
      this.versions.forEach((version) => {
        if (this.currentVersion.id === version.id) {
          return;
        }

        // If has tagValueId and it isnt inside version-> exit
        if (
          tagValueId &&
          !this.checkTagInsideVersion({ tagValueId }, version)
        ) {
          return;
        }

        array.push(version);
      });
      return array;
    },
    setTagValue(tagValue) {
      const existTagInsideCurrentVersion = this.checkTagInsideVersion(
        { tagValueId: tagValue.id },
        this.currentVersion
      );
      if (existTagInsideCurrentVersion) {
        return;
      }

      const version = this.findVersionWithLessChanges(tagValue);
      if (version) {
        this.$emit("onChangeVersion", version);
      }
    },
    findVersionWithLessChanges(tagValue) {
      const otherVersions = this.getOtherVersions(tagValue.id);
      return otherVersions.sort((versionA, versionB) => {
        if (!versionA) {
          return 1;
        }
        const intersectionA = this.getIntersection(versionA);
        const intersectionB = this.getIntersection(versionB);

        if (intersectionA > intersectionB) {
          return -1;
        }
        if (intersectionA < intersectionB) {
          return 1;
        }
        return 0;
      })[0];
    },
    getIntersection(version) {
      const currentVersionTags = this.getVersionTags(this.currentVersion);
      const versionTags = this.getVersionTags(version);
      return currentVersionTags.filter((x) => versionTags.includes(x)).length;
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

.tag-option.tag-affect-other-values {
  border: 2px solid #bebebe;
  background-color: #bebebe;
  .tag-text {
    color: white;
  }
}

.tag-option.tag-selected {
  border: 2px solid #41d5ab;
  background-color: white;
  .tag-text {
    color: #41d5ab;
  }
}
</style>
