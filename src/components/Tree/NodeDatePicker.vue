<template>
  <div id="app">
    <v-menu
      ref="menu"
      v-model="menu"
      :close-on-content-click="false"
      :return-value.sync="date"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="date"
          label="Date of Birth*"
          readonly
          required
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="date"
        no-title
        scrollable
        light
      >
        <v-spacer></v-spacer>
        <v-btn @click="menu = false"
          text
          color="primary"
        >
          Cancel
        </v-btn>
        <v-btn  @click="$refs.menu.save(date)"
          text
          color="primary"
        >
          OK
        </v-btn>
      </v-date-picker>
    </v-menu>
  </div>
</template>

<script>
export default {
  data () {
    return {
      date: null,
      menu: false,
      modal: false
    }
  }
}
</script>
