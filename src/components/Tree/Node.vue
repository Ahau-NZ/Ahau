<template>
  <svg>
      <defs>
        <clipPath id="myCircle">
          <circle id="myCircle"
            :cx="radius"
            :cy="radius"
            :r="radius"
          />
        </clipPath>
      </defs>
      <image
        :width="radius*2"
        :height="radius*2"
        :xlink:href="image"
        clip-path="url(#myCircle)"
      />
  </svg>
</template>
<script>
/* es-lint disable */

export default {
  props: {
    node: {
      type: Object,
      required: true
    },
    radius: {
      type: Number,
      required: true
    }
  },
  data () {
    return {

    }
  },
  methods: {
    onClick () {
      alert(this.node.name)
    }
  },
  computed: {
    image () {
      return this.node.gender === 'male' ? male : female
    }
  }
}
</script>

<style scoped lang="scss">
  image {
    border: 4 solid black;
  }
</style>
