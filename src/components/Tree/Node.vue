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
        :width="imageConstraints"
        :height="imageConstraints"
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
    },
    imageConstraints() {
      return this.radius * 2
    }
  }
}
</script>

<style scoped lang="scss">
  image {
    border: 4 solid black;
  }
</style>
