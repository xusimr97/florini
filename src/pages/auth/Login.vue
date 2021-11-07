<template>
  <div class="form">
    <q-card-section>
      <router-link to="/">
        <div class="row justify-center items-center">
          <img src="logo.svg" alt="Canini" class="logo-img" />
        </div>
      </router-link>
    </q-card-section>
    <q-card-section>
      <q-form @submit="onLogin" class="q-gutter-y-md">
        <div class="q-gutter-y-sm">
          <q-input
            v-model="email"
            :label="$t('email')"
            :rules="[(val) => !!val || $t('inputEmail')]"
            filled
          />
          <q-input
            v-model="password"
            :label="$t('password')"
            :type="showPwd ? 'password' : 'text'"
            :rules="[(val) => !!val || $t('inputPassword')]"
            filled
          >
            <template #append>
              <q-icon
                :name="showPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPwd = !showPwd"
              />
            </template>
          </q-input>
        </div>
        <div class="justify-center">
          <q-btn
            type="submit"
            :label="$t('enter')"
            class="full-width"
            color="black"
            rounded
          />
        </div>
      </q-form>
    </q-card-section>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "Login",
  data() {
    return {
      $t: this.$t,
      email: null,
      password: null,
      showPwd: true,
      emailError: false,
      emailMessage: "",
      pwdError: false,
      pwdMessage: "",
    };
  },
  methods: {
    async onLogin() {
      let params = {
        email: this.email,
        password: this.password,
      };
      const res = await this.$axios.post("Customers/CustomLogin", params);
      this.setToken(res.data.id);
      // this.setId(res.data.userId);

      await this.getUser(res.data.userId);
    },
    async getUser(id) {
      const res = await this.$axios.get(`Customers/${id}`);
      this.setCustomer(res.data);
      this.$q.notify({
        message: this.$t("loginSuccessfully"),
        type: "positive",
      });
      await this.$router.push("/");
    },
    ...mapMutations("customer", ["setToken", "setCustomer"]),
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
</style>
