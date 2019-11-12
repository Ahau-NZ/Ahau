<template>
  <vue-context ref="menu">
      <li v-for="(option, index) in options" :key="index">
        <a href="#" @click.prevent="onClick()">{{ option.title }}</a>
      </li>
    </vue-context>
</template>
<script>
import { VueContext } from 'vue-context'

export default {
  components: {
    VueContext
  },
  data () {
    return {
      options: [
        {
          title: 'Option1'
        },
        {
          title: 'Option2'
        }
      ]
    }
  },
  methods: {

  }
}
</script>

<style scoped>
  @import '~vue-context/dist/css/vue-context.css';
</style>
