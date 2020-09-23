// NOT CURRENTLY IN USE

<template>
  <v-container
    class="white mx-auto pb-12 d-flex justify-space-between align-center"
  >
    <v-row>
      <v-col cols="9">
        <v-row>
          <p class="primary--text caption">{{ helperText }}</p>
        </v-row>
        <v-row>
          <v-col cols="3">
            <router-link
              to="/discovery?page=local"
              class="nav d-flex flex-column align-center"
              active-class="-active"
              exact
            >
              <h3 class="primary--text display-1">Local</h3>
              <div class="underline"></div>
            </router-link>
          </v-col>
          <v-col
            cols="1"
            class="d-flex flex-column justify-center align-center"
          >
            <div class="pipe" />
          </v-col>
          <v-col cols="3">
            <router-link
              to="/discovery?page=internet"
              class="nav d-flex flex-column align-center"
              active-class="-active"
              exact
            >
              <h3 class="primary--text display-1">Internet</h3>
              <div class="underline" />
            </router-link>
          </v-col>
          <v-col
            cols="1"
            class="d-flex flex-column justify-center align-center"
          >
            <div class="pipe" />
          </v-col>
          <v-col cols="3">
            <router-link
              to="/discovery?page=invite"
              class="nav d-flex flex-column align-center"
              active-class="-active"
              exact
            >
              <h3 class="primary--text display-1">Invite</h3>
              <div class="underline" />
            </router-link>
          </v-col>
        </v-row>
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
.nav {
  h3 {
    font-weight: 300;
    text-transform: none;
  }
  .underline {
    width: 20px;
    border-bottom: 3px solid rgba(0, 0, 0, 0);
  }

  &.-active {
    h3 {
      font-weight: 400;
    }
    .underline {
      border-bottom: 3px solid #a80000;
    }
  }
}

.pipe {
  height: 30px;
  width: 1px;
  background: black;
}
</style>
