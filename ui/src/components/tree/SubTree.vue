<template>
  <g>
    <!-- only draw this for top node -->
    <g v-if="root.parent === null">
      <Link v-for="link in secondaryLinks" :key="link.key"
        :link="link"
      />
    </g>

    <!--
      links between root node and:
        - partners
        - children
    -->
    <Link v-for="link in root.links" :link="link" :key="link.key"/>

    <!-- partners -->
    <Node v-for="partner in root.partners" :key="`partner-${partner.data.id}`"
      :profileId="partner.data.id"
      :x="partner.x"
      :y="partner.y"
      isPartner
      :showAvatars="showAvatars"
      @focus="focus"
    />

    <!-- children -->
    <SubTree v-for="child in root.children" :key="`child-${child.data.id}`"
      :root="child"
      :changeFocus="changeFocus"
      :centerNode="centerNode"
      :showAvatars="showAvatars"
    />

    <!-- rootNode of this subtree -->
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
  computed: {
    ...mapGetters('tree', ['secondaryLinks'])
  },
  methods: {
    focus ($event) {
      this.changeFocus($event)
    }
  }
}

</script>
