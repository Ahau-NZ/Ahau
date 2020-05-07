<template>
  <v-row cols="12" class="rounded-border">
    <v-col cols="12">
      <h4 class="pa-3 mb-0"> {{ title }}</h4>
    </v-col>
    <v-col>
      <slot name="content"></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ProfileCard',
  props: {
    title: String
  }
}
</script>

<style scoped>
.rounded-border {
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 10px;
  background-color: white;
  margin-top: 20px;
}
</style>
