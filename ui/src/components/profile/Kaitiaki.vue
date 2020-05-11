<template>
  <v-card min-height="200px" light class="rounded-card" width="100%">
    <v-tooltip left>
      <template v-slot:activator="{ on }">
        <h4 v-on="on" class="pa-3 mb-0"> {{ title }} </h4>
      </template>
      <span>{{ helperText }}</span>
    </v-tooltip>
    <div>
      <slot name="content"></slot>
    </div>
  </v-card>
</template>

<script>

export default {
  name: 'Kaitiaki',
  props: {
    title: String,
    subtitle: String,
    helperText: String
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
