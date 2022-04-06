<template>
  <div style="width: 110px">
    <q-input
      v-bind="$attrs"
      outlined
      dense
      readonly
      input-style="width: 20px;"
      input-class="text-center"
      class="numcontrol readonly"
    >
      <template v-slot:prepend>
        <q-btn dense flat icon="remove" @click="$emit('subtract')" />
      </template>
      <template v-slot:append>
        <q-btn dense flat icon="add" @click="$emit('add')" />
      </template>
    </q-input>
  </div>
</template>

<style>
.numcontrol.q-field--outlined .q-field__control {
  padding: 0 6px;
}
</style>
