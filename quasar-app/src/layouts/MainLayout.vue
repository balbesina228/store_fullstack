<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          square
          icon="list"
          class="q-ml-sm"
          @click="goToItemsPage"
          label="Items"
        />

        <q-toolbar-title class="absolute-center">
          Quasar App
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  methods: {
    goToItemsPage() {
      this.$router.push('/items');
    }
  }
}
</script>
