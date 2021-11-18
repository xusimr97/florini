<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  created() {
    const iconPath = "img:app-icons/";
    const myIcons = {
      "app:flower": "flower.svg",
      "app:cart": "cart.svg",
      "app:google": "google.svg",
      "app:icon": "icon.svg",
      "app:icon-white": "icon-white.svg",
      "app:user": "user.svg",
    };
    this.$q.iconMapFn = (iconName) => {
      const icon = myIcons[iconName];
      if (icon !== void 0) {
        return { icon: iconPath + icon };
      }
      return void 0;
    };
  },
});
</script>
