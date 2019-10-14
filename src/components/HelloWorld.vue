<template>
  <div class="hello">
    <h1>
      {{ isLoading ? whoami : 'loading...' }}
    </h1>
    <div>working !!</div>
    <div>{{ msg }}</div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  apollo: {
    whoami: gql`query {
      whoami
    }`
  },
  computed: {
    isLoading () {
      return Boolean(this.whoami)
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
