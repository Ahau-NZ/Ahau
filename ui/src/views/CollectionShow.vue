<template>
  <v-container fluid class="body-width pa-0 niho-bg">

    
  </v-container>
</template>

<script>
// import mapCollectionMixins from '@/mixins/collection-mixins'
import { getCollection } from '@/lib/collection-helpers'

export default {
  name: 'CollectionShow',
  apollo: {
    collection () {
      return {
        ...getCollection(this.$route.params.collectionId)
      }
    }
  },
  data () {
    return {
      collection: {}
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  }
}
</script>
<style lang="scss">
@media (min-width: 1264px) and (max-width: 1903px) {
  .col-lg-20p {
    width: 20%;
    max-width: 20%;
    flex-basis: 20%;
  }
  .col-lg-60p {
    width: 60%;
    max-width: 60%;
    flex-basis: 60%;
  }
  .col-lg-80p {
    width: 80%;
    max-width: 80%;
    flex-basis: 80%;
  }
}

.body-width {
  max-width: 100vw;
}

.niho-bg {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.99),
  rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
  background-position-x: 100px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* .fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2;
  transition-property: top;
  transition-timing-function: ease-in-out;
 } */

 .fade-enter-active {
    transition: all 0.6s ease-in-out;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

</style>22px;
