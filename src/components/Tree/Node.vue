<template>
  <!--
  <circle :r="settings.radius" @click="onClick">
  </circle>
  -->
  <svg>
      <defs>
        <clipPath id="myCircle">
          <circle :cx="node.x + settings.radius" :cy="node.y + settings.radius" :r="settings.radius-1"/>
        </clipPath>
      </defs>
      <image :width="settings.radius*2" :height="settings.radius*2" xlink:href="https://www.tutorialspoint.com/videotutorials/images/coding_ground_home.jpg" clip-path="url(#myCircle)" />
  </svg>
</template>
<script>
/* es-lint disable */

export default {
  props: ['node'],
  data () {
    return {
      settings: {
        radius: 50
      }
    }
  },
  methods: {
    onClick () {
      alert(this.node.name)
    }
  }
}
</script>

<style scoped lang="scss">
  
</style>
