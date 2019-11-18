<template>
  <svg>
      <defs>
        <clipPath id="myCircle">
          <circle
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
  computed: {
    /*
      temporary function to display placeholder image of male or female based on gender
    */
    image () {
      return this.node.gender === 'male' ? male : female
    },
    /*
      required size for the image based on the given radius value
    */
    imageConstraints () {
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
