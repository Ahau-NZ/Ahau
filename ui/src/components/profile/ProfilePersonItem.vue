<template>
  <v-col :cols="mobile ? smCols : '12'" :sm="smCols" :md="mdCols">
    <v-row>
      <v-col v-if="title" class=" mb-6 profile-label"><small>{{ title }}</small></v-col>
    </v-row>
    <!-- person -->
    <v-row v-if="person" class="justify-center">
        <Avatar
          class="big-avatar"
          :size="mobile ? '200px':'100px'"
          :image="person.avatarImage ? person.avatarImage : placeholder"
          :alt="person.preferredName"
          :gender="person.gender"
          :aliveInterval="person.aliveInterval"
          :deceased="person.deceased"
          @updateAvatar="person.avatarImage = $event"
        />
    </v-row>
    <!-- no person -->
    <v-row v-else class="justify-center">
        <Avatar
          class="big-avatar"
          :size="mobile ? '200px':'100px'"
          :image="placeholder"
          :alt="person.preferredName"
          :gender="person.gender"
          :aliveInterval="person.aliveInterval"
          :deceased="person.deceased"
          @updateAvatar="person.avatarImage = $event"
        />
    </v-row>
    <!-- person -->
    <v-row v-if="person.preferredName" class="justify-center">
      <p class="ma-0 profile-info"><small>{{ person.preferredName }}</small></p>
    </v-row>
    <!-- no person -->
    <v-row v-else class="justify-center">
      <p class="ma-0 profile-info"><small>Please add person</small></p>
    </v-row>
  </v-col>
</template>

<script>
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfilePersonItem',
  components: {
    Avatar
  },
  props: {
    title: String,
    person: {},
    subValue: String,
    smCols: {
      type: String,
      default: '6'
    },
    mdCols: {
      type: String,
      default: '3'
    }
  },
  data () {
    return {
      placeholder: {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Question-mark-grey.jpg'
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  }
}
</script>

<style>
.profile-label {
  color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
}
</style>
