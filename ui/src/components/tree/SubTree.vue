<template>
  <g>
    <!-- only draw this for top node -->
    <g v-if="root.data.id === whakapapaView.focus">
      <Link v-for="link in secondaryLinks" :key="`l-i-${link.id}`"
        :link="link"
      />
    </g>

    <!-- links between root node and partners -->
    <Link v-for="link in root.links" :link="link" :key="link.key"/>

    <!-- all partners and links to their children -->
    <Node v-for="partner in root.partners" :key="`partner-${partner.data.id}`"
      :profileId="partner.data.id"
      :x="partner.x"
      :y="partner.y"
      isPartner
      :showAvatars="showAvatars"
      @focus="focus"
    />

    <!-- draw all children last to overvoid link overlapping -->
    <SubTree v-for="child in childNodes" :key="`child-${child.data.id}`"
      :root="child"
      :changeFocus="changeFocus"
      :centerNode="centerNode"
      :showAvatars="showAvatars"
    />

    <!-- this subtree root node -->
    <Node v-if="root.data && root.data.id" :key="`root-${root.data.id}`"
      :profileId="root.data.id"
      :x="root.x"
      :y="root.y"
      :showAvatars="showAvatars"
      @center="centerNode(root)"
      />
  </g>
</template>

<script>
import { mapGetters } from 'vuex'

import Node from './Node.vue'
import Link from './Link.vue'

export default {
  name: 'SubTree',
  props: {
    root: Object,
    changeFocus: Function,
    centerNode: Function,
    showAvatars: Boolean
  },
  components: {
    Node,
    Link
  },
  data () {
    return {
      radius: 50
    }
  },
  computed: {
    ...mapGetters('whakapapa', [
      'whakapapaView', 'isCollapsedNode', 'showExtendedFamily',
      'getChildIds', 'getParentIds', 'getPartnerIds', 'getPartnerRelationshipType', 'getChildRelationshipType'
    ]),
    ...mapGetters('tree', ['secondaryLinks']),
    diameter () {
      return this.radius * 2
    },
    profileId () {
      return this.root.data.id
    },
    isCollapsed () {
      return this.isCollapsedNode(this.profileId)
    },
    childNodes () {
      // if (this.isCollapsed) return []
      // WIP - this shouldn't be needed is we're fully reactive?

      return this.root.children || []
    }
  },
  methods: {
    focus ($event) {
      this.changeFocus($event)
    }
  }
}

</script>
