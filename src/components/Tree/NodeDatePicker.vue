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
      <v-date-picker light v-model="date" no-title scrollable>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
        <v-btn text color="primary" @click="$refs.menu.save(date)">OK</v-btn>
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
