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
      @click="$emit('partner-node-click', partner.data.id)"
    />

    <!-- children -->
    <SubTree v-for="child in root.children" :key="`child-${child.data.id}`"
      :root="child"
      :showAvatars="showAvatars"
      @partner-node-click="$emit('partner-node-click', $event)"
      @root-node-click="$emit('root-node-click', $event)"
    />

    <!-- rootNode of this subtree -->
    <Node v-if="root.data && root.data.id" :key="`root-${root.data.id}`"
      :profileId="root.data.id"
      :x="root.x"
      :y="root.y"
      :showAvatars="showAvatars"
      @click="$emit('root-node-click', root.data.id)"
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
    showAvatars: Boolean
  },
  components: {
    Node,
    Link
  },
  computed: {
    ...mapGetters('tree', ['secondaryLinks'])
  }
}

</script>
