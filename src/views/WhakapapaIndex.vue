<template>
  <v-container class="body-width white mx-auto py-12 px-12">
    <v-row v-for="view in views" :key="view.viewId">
      <router-link :to="{ name: 'whakapapaShow', params: { id: view.viewId } }">
        <v-col>
          {{view.name}}
        </v-col>
      </router-link>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      views: []
    }
  },
  mounted () {
    setTimeout(
      () => {
        this.views = [
          { viewId: '%someViewId', name: 'Irving Family' }
        ]
      },
      1e3
    )
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
