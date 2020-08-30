<template>
  <v-col :class="mobile ? 'py-0':'px-4 py-0'">
    <v-row>
      <v-col class="pt-0 pb-1" :justify="mobile ? 'center' : 'start'">
        <v-row>
          <v-col class="pt-1 pb-2">
            <small class="label"> {{ title }} </small>
          </v-col>
        </v-row>
        <v-row :style="hover ? 'background-color:rgba(0,0,0,0.04);':''">
          <v-col cols="2" class="pa-0 pl-0">
              <Avatar
                size="50px"
                :image="profile.avatarImage"
                :alt="profile.preferredName"
                :gender="profile.gender"
                :aliveInterval="profile.aliveInterval"
                :deceased="profile.deceased"
              />
          </v-col>
          <v-col v-if="profile.legalName" cols="6" :class="mobile ? 'pl-8 py-0':'py-0'">
            <v-row>
              <span class="text">{{profile.legalName}}</span>
            </v-row>
            <v-row class="sub-title">
              <span>legal name</span>
            </v-row>
          </v-col>
          <v-col cols="2" :class="!profile.legalName ? 'py-0 px-6':'py-0 pl-0 ml-n5'" >
            <v-row>
              <span class="text">{{profile.preferredName}}</span>
            </v-row>
            <v-row class="sub-title">
              <p>preferred name</p>
            </v-row>
          </v-col>
          <v-col v-if="age" cols="1" class="py-0">
            <v-row>
              <span class="text">{{ age }}</span>
            </v-row>
            <v-row class="sub-title">
              <span>age</span>
            </v-row>
          </v-col>
          <v-col v-if="deleteable" cols="1" class="px-0" :style="mobile ? 'position: relative;left: 10px':''">
            <v-btn @click="$emit('removeParent',index)" @mouseenter="hover = !hover" @mouseleave="hover = !hover"  fab text light x-small >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import calculateAge from '@/lib/calculate-age'

export default {
  name: 'ParentGroup',
  components: {
    Avatar
  },
  props: {
    profile: { type: Object, default: null },
    title: { type: String, default: null },
    size: { type: String, default: '80px' },
    spacing: { type: String, default: 'pr-5' },
    index: Number,
    deleteable: { type: Boolean, default: false }
  },
  data () {
    return {
      hover: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    age () {
      var age = calculateAge(this.profile.aliveInterval)
      if (age === null) return ''
      return age.toString()
    },
    grandParents () {
      var grandparents = []
      if (this.profile.parents) {
        this.profile.parents.map(grandparent => {
          console.log(grandparent)
          var profile = {
            ...grandparent.profile,
            relationshipType: grandparent.relationshipType
          }
          grandparents.push(profile)
        })
      }
      return grandparents
    }
  },
  methods: {
    profileClick (profile) {
      this.$emit('profile-click', profile)
    }
  }
}
</script>
<style scoped lang="scss">
.label {
  color: #9b9b9b
}
* {
  color: #383838
}

.sub-title {
  font-size: .7rem;
  color : #9b9b9b
}

.text {
  font-size:100%
}
</style>
