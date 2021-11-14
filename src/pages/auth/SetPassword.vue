<template>
  <div class="container form">
    <q-card-section>
      <div class="text-h5 q-mb-sm text-weight-bold">
        {{ $t("changePassword") }}
      </div>
      <div class="text-body1 q-mb-md text-justify">
        {{ $t("changePasswordText") }}
      </div>

      <q-form @submit="onResetPassword">
        <div>
          <!-- Password -->
          <q-input
            class="q-mt-sm"
            outlined
            v-model="form.password.value"
            :label="$t('password')"
            lazy-rules
            :rules="form.password.rules"
            :disable="form.disabled"
            type="password"
          />

          <!-- RepeatPassword -->
          <q-input
            class="q-mt-sm"
            outlined
            v-model="form.repeatPassword.value"
            :label="$t('repeatPassword')"
            lazy-rules
            :rules="form.repeatPassword.rules"
            :disable="form.disabled"
            type="password"
          />
        </div>
        <div class="justify-center q-mt-md">
          <q-btn
            type="submit"
            :label="$t('send')"
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
        password: {
          value: null,
          rules: [
            (val) => {
              if (this.action !== "edit") {
                return (val && val.length > 7) || this.$t("validInput");
              } else {
                return true;
              }
            },
          ],
        },
        repeatPassword: {
          value: null,
          rules: [
            (val) => {
              if (this.action !== "edit") {
                return (val && val.length > 7) || this.$t("validInput");
              } else {
                return true;
              }
            },
            (val) =>
              val === this.form.password.value || this.$t("passwordsNoMatch"),
          ],
        },
      },
    };
  },
  methods: {
    async onResetPassword() {
      let params = {
        password: this.form.password.value,
        token: this.$route.query.access_token,
      };

      const res = await this.$axios.post("Customers/SetPassword", params);

      this.$q.notify({
        message: this.$t("passwordChanged"),
        type: "positive",
      });

      await this.$router.push({ name: "login" });
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
