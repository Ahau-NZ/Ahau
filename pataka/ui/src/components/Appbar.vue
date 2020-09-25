<template>
  <div>
    <v-app-bar color="#303030" flat>
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo_red.svg" class="logo" />
      </router-link>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: 'Appbar'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.logo {
  height: 45px;
  padding: 0 25px;
}
</style>
