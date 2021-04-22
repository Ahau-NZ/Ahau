<template>
  <g @click.stop="click">
    <g
      class="menu-button"
      :transform="transform"
    >
      <circle
        stroke="white"
        fill="white"
        filter="url(#shadow)"
        cx="20"
        cy="1"
        r="10"
      />
      <polygon points="15,0  25,0  20,6" style="fill:#000;" />
    </g>
  </g>
</template>

<script>
export default {
  name: 'NodeMenuButton',
  props: {
    show: Boolean,
    transform: String
  },
  methods: {
    click ($event) {
      this.$emit('click', $event)
    }
  }
}
</script>

<style scoped>
.menu-button {
  transition: opacity ease-in 0.2s;
  opacity: 1;
}
</style>
