<template>
  <div class="container form">
    <!-- <q-card-section>
      <router-link to="/">
        <div class="row justify-center items-center">
          <img src="logo.svg" alt="Canini" class="logo-img" />
        </div>
      </router-link>
    </q-card-section> -->
    <q-card-section>
      <div class="text-h5 q-mb-sm text-weight-bold">
        {{ $t("login") }}
      </div>
      <div class="text-body1 q-mb-md">
        {{ $t("noAccountYet") }}
        <router-link :to="{ name: 'login' }" class="link">
          {{ $t("createAccount") }}
        </router-link>
      </div>

      <q-btn outline class="flover-social-btn q-mb-lg" @click="onLoginGoogle">
        <q-icon name="app:google" style="font-size: 30px"></q-icon>
      </q-btn>

      <q-btn outline class="flover-social-btn" @click="onLoginFacebook">
        <q-icon
          name="fab fa-facebook"
          style="color: #1278f3; font-size: 30px"
        ></q-icon>
      </q-btn>

      <hr class="q-my-lg" />

      <q-form @submit="onLogin">
        <div>
          <q-input
            v-model="email"
            :label="$t('email')"
            :rules="[(val) => !!val || $t('inputEmail')]"
            outlined
          />
          <q-input
            v-model="password"
            :label="$t('password')"
            :type="showPwd ? 'password' : 'text'"
            :rules="[(val) => !!val || $t('inputPassword')]"
            outlined
            class="q-my-md"
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
            class="flover-btn"
            color="primary"
          />
        </div>
        <div class="text-body2 q-mt-md">
          <router-link :to="{ name: 'login' }" class="link">
            {{ $t("notRememberPassword") }}
          </router-link>
        </div>
      </q-form>
    </q-card-section>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

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
    async onLoginGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        // Start a sign in process for an unauthenticated user.
        provider.addScope("profile");
        provider.addScope("email");
        const google = await signInWithPopup(this.$auth, provider);
        const res = await this.$axios.post("Customers/GoogleLogin", {
          uid: google.user.uid,
        });
        this.setToken(res.data.id);
        await this.getUser(res.data.userId);
      } catch (error) {
        if (error.message !== "Firebase: Error (auth/popup-closed-by-user).") {
          this.handleError(error, this);
        }
      }
    },
    async onLoginFacebook() {
      try {
        const provider = new FacebookAuthProvider();
        provider.addScope("email");

        // Start a sign in process for an unauthenticated user.
        const facebook = await signInWithPopup(this.$auth, provider);
        const res = await this.$axios.post("Customers/FacebookLogin", {
          uid: facebook.user.uid,
        });
        this.setToken(res.data.id);
        await this.getUser(res.data.userId);
      } catch (error) {
        if (error.message !== "Firebase: Error (auth/popup-closed-by-user).") {
          this.handleError(error, this);
        }
      }
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

.flover-social-btn {
  height: 56px;
  width: 100%;
  border-radius: 7px;
  color: #c2c2c2;
}
</style>
