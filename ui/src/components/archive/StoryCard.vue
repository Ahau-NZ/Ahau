<template>
  <v-card class="mx-auto" light width="100%">
    <v-list-item>
      <v-list-item-content>
        <v-list-item-subtitle>{{ story.recordDate }}</v-list-item-subtitle>
        <v-list-item-title class="headline mb-1">{{ story.title }}</v-list-item-title>
      </v-list-item-content>

      <v-list-item-icon class="pt-0 mt-0">
        <AvatarGroup group-title="Contribution" :profiles="story.contributors" customClass="ma-0 pa-0 justify-end" size="20px" spacing=" "/>
      </v-list-item-icon>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-img src="../../assets/enuamanu.png" height="300px"></v-img>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-list-item-subtitle>
          {{ story.description }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-card-actions class="pt-0">
      <v-btn text>Share</v-btn>

      <v-btn color="#b02425" text>
        Explore
      </v-btn>

      <v-spacer></v-spacer>

      <v-btn icon @click="show = !show">
        <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
  </v-card-actions>

    <v-expand-transition>
      <div v-show="show">
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col>
              <h4>People</h4>
              <AvatarGroup :profiles="story.mentions" show-labels size="40px"/>
              <AddButton @click="addMention()" />
            </v-col>

            <v-col>
              <h4>Location</h4>
            </v-col>
          </v-row>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'StoryCard',
  props: {
    story: Object
  },
  components: {
    AvatarGroup,
    AddButton
  },
  data () {
    return {
      show: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    addMention () {
      console.warn('StoryCard.vue: Add mention not implemented yet')
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
    width: 100%;
}

.people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
}
</style>
