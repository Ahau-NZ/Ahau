<template>
  <v-form class="body white pt-0">
    <v-row>
      <v-col cols="12" md="12">
        <v-btn
          @click="$emit('cancel')"
          outlined
          text
          color="secondary"
          class="mr-4"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn
          v-if="hasChanges"
          @click="$emit('save')"
          text
          color="blue"
          class="mr-4"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn v-else outlined color="blue" text>
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  name: 'ProfileFormAction',
  props: {
    hasChanges: Boolean
  }
}
</script>

<style scoped lang="scss">
.body {
  background: white;
}
</style>
