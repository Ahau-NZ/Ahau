<template>
  <g>
    <!-- only draw this for top node -->
    <g v-if="parent === null">
      <Link v-for="link in secondaryLinks" :key="link.key"
        :link="link"
      />
    </g>

    <!--
      links between root node and:
        - partners
        - children
    -->
    <Link v-for="link in links" :link="link" :key="link.key"/>

    <!-- partners -->
    <Node v-for="partner in partners" :key="`partner-${partner.data.id}`"
      :profileId="partner.data.id"
      :x="partner.x"
      :y="partner.y"
      isPartner
      :showAvatars="showAvatars"
      @click="$emit('partner-node-click', partner.data.id)"
    />

    <!-- children -->
    <SubTree v-for="child in children" :key="`child-${child.data.id}`"
      v-bind="child"
      :root="child"
      :showAvatars="showAvatars"
      @partner-node-click="$emit('partner-node-click', $event)"
      @root-node-click="$emit('root-node-click', $event)"
    />

    <!-- rootNode of this subtree -->
    <Node v-if="data && data.id" :key="`root-${data.id}`"
      :profileId="data.id"
      :x="x"
      :y="y"
      :showAvatars="showAvatars"
      @click="$emit('root-node-click', data.id)"
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
    x: Number,
    y: Number,
    data: Object,
    parent: Object,
    children: Array,
    partners: Array,
    links: Array,
    showAvatars: Boolean
  },
  computed: {
    ...mapGetters('tree', ['secondaryLinks'])
  },
  components: {
    Node,
    Link
  }
}

</script>
