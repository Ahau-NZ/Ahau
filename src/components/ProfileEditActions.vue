<template>
  <v-form class="body-width pt-0">
    <v-container class="white mx-auto pt-12 px-12">
      <v-row>
        <v-col cols="12" md="12">
          <v-btn @click="cancel" outlined text color="secondary" class="mr-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn v-if="hasChanges" @click="save" text color="secondary" class="mr-4">
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn v-else outlined color="secondary" text class="mr-4">
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  name: 'ProfileEditAction',
  props: {
    save: Function,
    cancel: Function,
    hasChanges: Boolean
  }
}
</script>

<style scoped lang="scss">
  .body-width {
    background: white;

    min-width: 600px;
    max-width: 60vw;
    margin: 0 auto;
  }
</style>
