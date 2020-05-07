<template>
  <v-card min-height="200px" light class="rounded-card" width="100%">
    <h4 class="pa-3 mb-0"> {{ title }}</h4>
    <v-card-text>
      <p>{{ subtitle }}</p>
    </v-card-text>
    <div>
      <p style="color: lightgrey; text-align: center;">TODO: v-for</p>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'Kaitiaki',
  props: {
    title: String,
    subtitle: String,
    profiles: {
      type: Array,
      default: () => ([])
    }
  }
}
</script>

<style scoped>
.rounded-card {
    border-radius: 10px;
    p {
      font-size: 0.8em;
      line-height: 1.6;
    }
  }
</style>
