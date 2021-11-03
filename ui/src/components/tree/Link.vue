<template>
  <g>
    <!--
      draws a white link underneath this link so the links dont show the overlaps
      from the opacity
     -->
    <path class="white-link" :d="link.d" :style="whiteStyle"/>
    <path class="link" :d="link.d" :style="link.style"/>
  </g>
</template>

<script>
export default {
  props: {
    link: {
      type: Object,
      required: true
    }
  },
  computed: {
    whiteStyle () {
      var style = { ...this.link.style }

      style.stroke = 'white'
      style.opacity = 1

      return style
    }
  }
}
</script>
