<template>
  <v-col>
    <v-row>
      <v-col>
        <small> {{ groupTitle }} </small>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="4" v-for="(profile, index) in profiles" :key="index">
        <v-row justify="center">
          <Avatar size="80px" :show-label="showLabels" :image="profile.avatarImage" :alt="profile.preferredName" :gender="profile.gender" :bornAt="profile.bornAt"/>
        </v-row>
      </v-col>
      <v-col v-if="buttonLabel" md="4" class="pt-8" align="center">
        <v-row justify="center">
          <v-btn @click="click"
            small
            fab
            color="white"
            >
            <v-icon class="black--text">mdi-plus</v-icon>
          </v-btn>
        </v-row>
        <v-row justify="center" class="pt-1">
          {{ buttonLabel }}
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import Avatar from './Avatar.vue'
export default {
  name: 'AvatarGroup',
  components: { Avatar }, // is this too hard to read?
  props: {
    profiles: { type: Array, default: null },
    buttonLabel: { type: String, default: null },
    groupTitle: { type: String, default: null },
    showLabels: { type: Boolean, default: false }
  },
  methods: {
    click () {
      console.log('button-click')
      this.$emit('button-click')
    }
  }
}
// NOTE: this component stretchs to the parent. Can be changes later on as needed to adapt to different sizes
</script>
