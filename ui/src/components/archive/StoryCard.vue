<template>
  <v-card class="mx-auto" light width="100%">
    <v-list-item class="px-0" style="min-height:0; height:10px">
      <v-list-item-icon class="pt-0 mt-0" style="position:absolute; top:5px; right:1px; margin-right:0px">
        <v-list-item-subtitle v-if="contributorLabel" class="no-flex">contributors</v-list-item-subtitle>
        <AvatarGroup :profiles="story.contributors" customClass="ma-0 pa-0" style="position:relative; bottom:10px;" size="28px" spacing="pr-1"/>
      </v-list-item-icon>
    </v-list-item>
    <v-list-item>
      <v-list-item-content class="pb-0">
        <v-list-item-subtitle>{{ story.recordDate }}</v-list-item-subtitle>
        <v-list-item-title class="headline mb-1 wrap-text">{{ story.title }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="px-0">
      <v-list-item-content>
        <!-- <v-carousel>
          <v-carousel-item v-for="artefact in story.artefacts" :key="artefact.id" v-html="artefact.content">
          </v-carousel-item>
        </v-carousel> -->
        <!-- TODO Artefact and Artefact group component -->
        <v-img src="../../assets/mocks/enuamanu.png" :height="mobile ? '300px' : '400px'"></v-img>
      </v-list-item-content>
    </v-list-item>

    <v-list-item :disabled="disableClick" :ripple="false" @click.stop="showText()">
      <v-list-item-content>
        <p ref="text" :class="turncateText ? 'description' : ''">
          {{ story.description }}
        </p>
      </v-list-item-content>
    </v-list-item>
    <v-row>
      <v-col class="py-0" :cols="mobile ? '12' : '8'">
        <v-list-item-subtitle style="color:grey" class="ml-5"> Mentions </v-list-item-subtitle>
        <AvatarGroup style="position:relative; bottom:15px;" :profiles="story.mentions" show-labels size="30px" spacing="pr-2"/>
      </v-col>
      <v-col class="py-0" v-if="story.location" :cols="mobile ? '12' : '4'">
        <v-list-item-subtitle style="color:grey" class="ms-5"> Location </v-list-item-subtitle>
        <p class="mt-2 ms-5">{{story.location}}</p>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import AvatarGroup from '@/components/AvatarGroup.vue'

export default {
  name: 'StoryCard',
  props: {
    story: Object
  },
  components: {
    AvatarGroup
  },
  data () {
    return {
      show: false,
      turncateText : true,
      textHeight: 0
    }
  },
  mounted () {
    this.textHeight = this.$refs.text.offsetHeight
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    contributorLabel () {
      if (this.mobile && this.story.contributors.length > 6) return false
      return true
    },
    disableClick () {
      if (this.textHeight > 60) return false
      return true
    }
  },
  methods: {
    showStory () {
      this.$emit('showStory')
    },
    showText () {
      this.turncateText = !this.turncateText
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

// Need to keep many contributors in single row
.no-flex {
  flex: unset !important;
}

// Dont cut off a long title 
.wrap-text {
  white-space: unset !important;
}

p {
  font-size: 0.9em;
  line-height: 1.6;
  color: #383838;
  margin-bottom: 0 !important;
// cut of a long description
  &.description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* number of lines to show */
    -webkit-box-orient: vertical;
  }
}

</style>
