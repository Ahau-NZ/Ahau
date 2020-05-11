<template>
  <div :class="['wrapper', mobile ? '' : 'top-padding']">
    <v-container fluid class="body-width white pa-5 niho-bg">
      <v-row class="content-top-margin">
        <!-- LEFT SIDE COLUMN -->
        <v-col cols="12" xs="12" sm="12" md="2">
          <slot name="nav"></slot>
        </v-col>
        <!-- RIGHT SIDE COLUMN -->
        <v-col cols="12" sx="12" sm="12" md="8">
          <h1>Timeline</h1>
          <StoryTimeline :data="mockTimelineData"/>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import StoryTimeline from '@/components/story/StoryTimeline'

export default {
  name: 'Timeline',
  components: {
    StoryTimeline
  },
  props: {
    profile: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      mockTimelineData: [
        {
          title: 'Ukurau was born',
          description: 'In Aatea, Tangaroa had a son called Ukurau',
          img: 'https://picsum.photos/200/300',
          people: [{
            id: 123,
            preferredName: 'Ian',
            avatarImage: require('@/assets/koro.svg')
          },
          {
            id: 456,
            preferredName: 'Ben',
            avatarImage: require('@/assets/kuia.svg')
          }
          ],
          storyTypeIcon: 'mdi-diamond-outline'
        },
        {
          title: 'Ukurau travelled to Rarotonga',
          description: 'Ukurau landed in Rarotonga and picked up his wife Puera',
          img: 'https://picsum.photos/200/300',
          people: [{
            id: 123,
            preferredName: 'Ian',
            avatarImage: require('@/assets/koro.svg')
          },
          {
            id: 456,
            preferredName: 'Ben',
            avatarImage: require('@/assets/kuia.svg')
          }
          ],
          storyTypeIcon: 'mdi-creation'
        },
        {
          title: 'Ukurau arrived in Ma\'uke',
          description: 'Ukurau arrived in Ma\'uke',
          img: 'https://picsum.photos/200/300',
          people: [{
            id: 123,
            preferredName: 'Ian',
            avatarImage: require('@/assets/koro.svg')
          },
          {
            id: 456,
            preferredName: 'Ben',
            avatarImage: require('@/assets/kuia.svg')
          }
          ],
          storyTypeIcon: 'mdi-account-circle'
        }
      ]
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    }
  }
}
</script>
<style lang="scss">

</style>
