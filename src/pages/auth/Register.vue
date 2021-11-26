<template>
  <div class="container form">
    <q-card-section>
      <div class="text-h5 q-mb-sm text-weight-bold">
        {{ $t("createAccount") }}
      </div>
      <div class="text-body1 q-mb-md">
        {{ $t("accountYet") }}
        <router-link :to="{ name: 'login' }" class="link">
          {{ $t("login2") }}
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

      <q-form @submit="onRegister">
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

          <!-- Name -->
          <q-input
            class="q-mt-sm"
            outlined
            v-model="form.name.value"
            :label="$t('name')"
            lazy-rules
            :rules="form.name.rules"
            :disable="form.disabled"
          />

          <!-- Surnames -->
          <q-input
            class="q-mt-sm"
            outlined
            v-model="form.surnames.value"
            :label="$t('surnames')"
            lazy-rules
            :rules="form.surnames.rules"
            :disable="form.disabled"
          />

          <!-- Phone -->
          <q-input
            class="q-mt-sm"
            outlined
            v-model="form.phone.value"
            :label="$t('phone')"
            lazy-rules
            :rules="form.phone.rules"
            :disable="form.disabled"
            mask="(+##) #########"
            fill-mask
          />

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
import { mapMutations } from "vuex";
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

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
        name: {
          value: null,
          rules: [
            (val) => (val && val.length !== null) || this.$t("validInput"),
          ],
        },
        surnames: {
          value: null,
          rules: [
            (val) => (val && val.length !== null) || this.$t("validInput"),
          ],
        },
        phone: {
          value: null,
          rules: [],
        },
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
    async onRegister() {
      let params = {
        email: this.form.email.value,
        password: this.form.password.value,
        name: this.form.name.value,
        surnames: this.form.surnames.value,
        phone: this.form.phone.value,
      };
      const res = await this.$axios.post("Customers/CustomRegister", params);
      this.setToken(res.data.id);
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
