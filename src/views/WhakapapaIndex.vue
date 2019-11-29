<template>
  <v-container class="body-width white mx-auto py-12 px-12">

    <v-row v-for="view in views" :key="view.viewId">
      <router-link :to="{ name: 'whakapapaShow', params: { id: view.viewId } }">
        <v-col> {{view.name}} </v-col>
      </router-link>
    </v-row>

    <NewNodeDialog v-if="showForm" :show="showForm"
      @close="toggleForm" @submit="createView($event)"/>
  </v-container>
</template>

<script>
import NewViewForm from '@/components/whakapapa-view/New.vue'

export default {
  data () {
    return {
      views: [],
      showForm: false
    }
  },
  mounted () {
    this.views = [
      { viewId: '%someViewId', name: 'Irving Family' }
    ]
  },
  methods: {
    toggleForm () {
      this.showForm = !this.showForm
    },
    createView ($event) {
      console.log($event)
      
      // publish view, then navigate to it?
    }
  },
  component: {
    NewViewForm
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
