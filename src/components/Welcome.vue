<template>
  <div>
    <h1>
      {{ heading }}
    </h1>
    <div>{{ msg }}</div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'Welcome',
  props: {
    msg: String
  },
  apollo: {
    whoami: gql`query {
      whoami {
        id
        profileId 
        feedId 
      }
    }`
  },
  // mounted () {
  //   if (this.whoami) {
  //     this.$router.push(`/profile`)
  //   }
  // },
  // updated () {
  //   if (this.whoami) {
  //     this.$router.push(`/profile`)
  //   }
  // },
  computed: {
    heading () {
      return this.$apollo.loading
        ? 'loading...'
        : `Welcome ${this.whoami.feedId}`
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
