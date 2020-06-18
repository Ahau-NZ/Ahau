<template>
  <v-row cols="12" class="rounded-border">
    <v-col v-if="title" cols="12">
      <h4 class="mb-0"> {{ title }}</h4>
    </v-col>
    <v-col :class="!title ? 'pb-0':''" class="pt-0">
      <slot name="content"></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ProfileCard',
  props: {
    title: String,
    left: Boolean
  }
}
</script>

<style scoped>
h4 {
  color : #383838
}
.rounded-border {
  border: 0.5px solid rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: white;
  margin-top: 20px;
}
</style>
