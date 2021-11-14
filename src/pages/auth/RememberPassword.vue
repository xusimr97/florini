<template>
  <div class="container form">
    <q-card-section>
      <div class="text-h5 q-mb-sm text-weight-bold">
        {{ $t("rememberPassword") }}
      </div>
      <div class="text-body1 q-mb-md text-justify">
        {{ $t("rememberPasswordText") }}
      </div>

      <q-form @submit="onResetPassword">
        <div>
          <!-- Email -->
          <q-input
            class="q-mt-sm"
            outlined
            v-model="form.email.value"
            :label="$t('email')"
            lazy-rules
            :rules="form.email.rules"
            :disable="form.disabled"
          />
        </div>
        <div class="justify-center q-mt-md">
          <q-btn
            type="submit"
            :label="$t('enter')"
            class="flover-btn"
            color="primary"
          />
        </div>
      </q-form>
    </q-card-section>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      $t: this.$t,
      form: {
        email: {
          value: null,
          rules: [
            (val) => {
              const re =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              if (re.test(String(val).toLowerCase())) {
                return true;
              } else {
                return this.$t("validInput");
              }
            },
          ],
        },
      },
    };
  },
  methods: {
    async onResetPassword() {
      let params = {
        email: this.form.email.value,
      };
      const res = await this.$axios.post("Customers/ResetPassword", params);
      // this.setToken(res.data.id);
      // await this.getUser(res.data.userId);
    },
  },
};
</script>
<style scoped>
.form {
  max-width: 500px;
}

.logo-img {
  width: 90%;
}

.flover-social-btn {
  height: 56px;
  width: 100%;
  border-radius: 7px;
  color: #c2c2c2;
}
</style>
