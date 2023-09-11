<template>
  <v-card outlined class="py-1 mx-3 pl-6">
    <!-- What do i want to display here? -->
    <v-card-subtitle class="row wrap justify-center">
      {{ helpText }}
    </v-card-subtitle>

    <div v-if="isChildLink">
      <Avatar v-if="parentProfile"
        class="small-avatar"
        size="80px"
        :image="parentProfile.avatarImage"
        :alt="parentName"
        :gender="parentProfile.gender"
        showLabel
      />
      <div class="row wrap justify-center" style="height:50px;">
        <svg>
          <line
            x1="150"
            y1="0"
            x2="150"
            y2="50"
            :style="linkStyle"
          />
        </svg>
      </div>
      <Avatar v-if="childProfile"
        class="small-avatar"
        size="80px"
        :image="childProfile.avatarImage"
        :alt="childName"
        :gender="childProfile.gender"
        showLabel
      />
    </div>
    <div v-else class="d-flex justify-center align-center">
      <Avatar v-if="parentProfile"
        class="small-avatar"
        size="80px"
        :image="parentProfile.avatarImage"
        :alt="parentName"
        :gender="parentProfile.gender"
        showLabel
      />
      <div>
        <svg style="width: 50px;">
          <line
            x1="0"
            y1="70"
            x2="50"
            y2="70"
            :style="linkStyle"
          />
        </svg>
      </div>
      <Avatar v-if="childProfile"
        class="small-avatar"
        size="80px"
        :image="childProfile.avatarImage"
        :alt="childName"
        :gender="childProfile.gender"
        showLabel
      />
    </div>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'
import { getDisplayName } from '@/lib/person-helpers.js'
import linkStyle from '@/store/modules/tree/lib/link-style.js'
import settings from '@/lib/link.js'
import {
  LINK_TYPE_CHILD,
  LINK_CHILD,
  LINK_PARTNER
} from '@/lib/constants.js'

import Avatar from '@/components/Avatar.vue'

export default {
  name: 'LinkSubmission',
  props: {
    submission: Object
  },
  components: {
    Avatar
  },
  data () {
    return {
      parentProfile: null,
      childProfile: null
    }
  },
  watch: {
    submission: {
      deep: true,
      immediate: true,
      async handler (submission) {
        const { parent, child } = submission?.changes

        // load the profiles being linked together
        this.parentProfile = await this.getPersonMinimal(parent)
        this.childProfile = await this.getPersonMinimal(child)
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    linkStyle () {
      return linkStyle({
        stroke: this.isDashed ? '#333' : settings.color.default,
        strokeDasharray: this.isDashed ? 2.5 : 0
      })
    },
    type () {
      return this.submission?.targetType === LINK_TYPE_CHILD
        ? LINK_CHILD
        : LINK_PARTNER
    },
    childName () {
      return getDisplayName(this.childProfile)
    },
    parentName () {
      return getDisplayName(this.parentProfile)
    },
    relationshipType () {
      return this.submission?.changes?.relationshipType
    },
    isPartnerLink () {
      return this.type === LINK_PARTNER
    },
    isChildLink () {
      return this.type === LINK_CHILD
    },
    helpText () {
      const opts = {
        childName: this.childName,
        type: this.type,
        parentName: this.parentName,
        relatedBy: this.relationshipType
      }

      if (this.isPartnerLink) {
        delete opts.relatedBy

        return this.t('helpText.partner', opts)
      }

      return this.t('helpText.child', opts)
    },
    legallyAdopted () {
      return this.submission?.changes?.legallyAdopted
    },
    isDashed () {
      return ['whangai', 'adopted'].includes(this.relationshipType)
    }
  },
  methods: {
    ...mapActions('person', ['getPersonMinimal']),
    t (key, vars) {
      return this.$t('linkSubmissions.' + key, vars)
    }
  }
}
</script>

<style>
.small-tree {
  /* position:absolute; */
  max-height: 500px;
  /* height: calc(100vh - 43px); */
  margin-top: -55px;
}
</style>
