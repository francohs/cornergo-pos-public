<template>
  <PageResponsive :maxWidth="600">
    <h4 class="text-center text-blue-grey-9">Ingresar</h4>

    <q-form class="q-py-lg q-px-xl" @submit="login">
      <Input
        required
        v-model="auth.credentials.username"
        label="Usuario"
        class="full-width"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </Input>

      <Input
        password
        required
        v-model="auth.credentials.password"
        label="Contraseña"
        @keyup.enter="login"
        class="full-width"
      >
        <template v-slot:prepend>
          <q-icon name="visibility_off" />
        </template>
      </Input>

      <div class="q-my-lg">
        <q-btn
          type="submit"
          label="INGRESAR"
          color="positive"
          class="full-width"
          :loading="auth.loading"
        />
      </div>
    </q-form>
  </PageResponsive>
</template>

<script setup>
import { useAuth } from "stores/auth";
import { useRouter } from "vue-router";

const auth = useAuth();
const router = useRouter();

async function login() {
  await auth.login();
  router.push({ name: "home" });
}
</script>
