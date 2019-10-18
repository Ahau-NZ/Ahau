<template>
  <v-container class="white mx-auto pb-12 d-flex justify-space-between align-center">
    <v-row>
      <v-col cols="9">
        <v-row>
          <p class="primary--text caption">{{helperText}}</p>
        </v-row>
        <v-row>
          <v-col cols="3">
            <h3 class="primary--text display-1">Local</h3>
          </v-col>
          <v-col cols="1">
            <div class="pipe" />
          </v-col>
          <v-col cols="3">
            <h3 class="primary--text display-1">Internet</h3>
          </v-col>
          <v-col cols="1">
            <div class="pipe" />
          </v-col>
          <v-col cols="3">
            <h3 class="primary--text display-1">Invite</h3>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="3 justify-end">
        <v-btn class="my-2" tile outlined color="primary">
          <v-icon left>mdi-plus</v-icon> Create
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CommunitiesNav',
  data () {
    return {
      helperText: 'Connect to people or communities'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .pipe {
    height: 30px;
    width: 1px;
    background: black;
  }
</style>
