<template>
  <q-header class="bg-blue-grey-10">
    <q-toolbar class="justify-between q-pl-none q-pr-lg">
      <div class="row items-center">
        <q-btn
          flat
          icon="menu"
          aria-label="Menu"
          @click="$emit('drawer-open')"
        />
        <q-btn flat dense style="font-size: 18px" to="/">CornerGO POS</q-btn>
      </div>

      <q-btn
        dense
        flat
        v-if="auth.isLogged"
        :label="auth.user.username"
        icon="person"
      >
        <q-menu :offset="[0, 7]">
          <q-list style="width: 180px">
            <ItemLink
              page="users/:id"
              :id="auth.user._id"
              icon="person"
              label="Mi Cuenta"
            />
            <q-separator />
            <ItemLinkLogout />
          </q-list>
        </q-menu>
      </q-btn>

      <div v-else class="row no-wrap">
        <q-btn
          flat
          :dense="isMovile"
          :stack="isMovile"
          label="INGRESAR"
          icon="login"
          :to="{ name: 'login' }"
        />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useAuth } from "stores/auth";
import { useQuasar } from "quasar";

const auth = useAuth();
const quasar = useQuasar();

const isMovile = quasar.screen.width < 480;
</script>
