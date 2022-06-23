<template>
  <q-drawer v-bind="$attrs" bordered content-class="bg-grey-1" :width="220">
    <q-list bordered padding class="text-grey-9">
      <ItemLink page="pos" icon="point_of_sale" label="POS" />
      <ItemLink page="cashmoves" icon="sync_alt" label="ARQUEO" />
      <ItemLink page="emitteddtes" icon="receipt_long" label="VENTAS" />
      <ItemLink page="clients" icon="groups" label="CLIENTES" />
      <!-- <ItemLink page="items" icon="checklist" label="Items" /> -->
    </q-list>
  </q-drawer>
</template>
