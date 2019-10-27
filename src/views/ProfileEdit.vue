<template>
  <div>
    <ProfileHeader :addToForm="addToForm" :id="id" :edit="true"/>
    <ProfileInfoEdit :images="images" :id="id" :edit="true"/>
  </div>
</template>

<script>
import ProfileHeader from '@/components/ProfileHeader.vue'
import ProfileInfoEdit from '@/components/ProfileInfoEdit.vue'

export default {
  name: 'Edit',
  data () {
    return {
      id: this.$route.params.id,
      images: {}
    }
  },
  components: {
    ProfileHeader,
    ProfileInfoEdit
  },
  methods: {
    addToForm (form, data) {
      let cleanData = {}
      Object.keys(data).map(d => {
        if (d !== '__typename') {
          cleanData[d] = data[d]
        }
      })
      this.images[form] = cleanData
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
