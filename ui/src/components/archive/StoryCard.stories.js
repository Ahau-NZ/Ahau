import StoryCard from './StoryCard.vue'
import { STORIES } from '@/mocks/stories'

export default {
  title: 'StoryCard'
}

export const Complete = () => ({
  template: '<StoryCard :story="story"/>',
  data () {
    return {
      story: STORIES[2]
    }
  },
  components: { StoryCard }
})

export const Minimum = () => ({
  template: '<StoryCard :story="story"/>',
  data () {
    return {
      story: STORIES[0]
    }
  },
  components: { StoryCard }
})
