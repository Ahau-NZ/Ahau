import Collection from './Collection.vue'
import CollectionGroup from './CollectionGroup.vue'
import { collectionComplete, collectionMinimum } from '@/mocks/collections'

export default {
  title: 'Collection'
}

export const CompleteCollection = () => ({
  template: '<Collection :collection="collection"/>',
  data () {
    return {
      collection: collectionComplete
    }
  },
  components: { Collection }
})

export const MinimumCollection = () => ({
  template: '<Collection :collection="collection"/>',
  data () {
    return {
      collection: collectionMinimum
    }
  },
  components: { Collection }
})

export const CompleteCollectionGroup = () => ({
  template: '<CollectionGroup :collections="collections"/>',
  data () {
    return {
      collections: [
        collectionComplete,
        collectionComplete,
        collectionComplete,
        collectionComplete,
        collectionComplete,
        collectionComplete,
        collectionComplete,
        collectionComplete
      ]
    }
  },
  components: { CollectionGroup }
})
