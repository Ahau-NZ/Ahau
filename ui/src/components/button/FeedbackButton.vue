<template>
  <v-tooltip bottom>
      <template v-slot:activator="{ on }">
          <v-btn  href="https://chat.ahau.io/channel/help" target="_blank" x-small v-on="on" fab  color="#b12526">
            <v-icon light>mdi-message-alert</v-icon>
          </v-btn>
      </template>
      <span>Help</span>
    </v-tooltip>
</template>
