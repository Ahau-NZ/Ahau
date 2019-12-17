<template>
    <v-card light outlined min-height="200px">
      <v-card-title class="headline">Kaitiaki</v-card-title>
      <v-btn text v-for="t in profile.tiaki" :key="t.id"
        :to="{ name: 'personShow', params: { id: t.id } }">
        {{ t.preferredName }}
      </v-btn>
    </v-card>
</template>

<script>
export default {
  name: 'Kaitiaki',
  props: {
    profile: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
