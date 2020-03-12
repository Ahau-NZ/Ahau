<template>
  <path class="link" :d="link.d" />
</template>

<script>
export default {
  props: {
    link: {
      type: Object,
      required: true
    },
    branch: {
      type: Number,
      required: true
    }
  },
  // data () {
  //   return {
  //     settings: {
  //       branch: 75
  //     }
  //   }
  // },
  computed: {
    /*
      generates a d attribute for the <path> which orientates the link vertically
      in an elbow shape
    */
    /*
      generates a d attribute for the <path> which orientates the link horizontally
      in an elbow shape
    */
    // elbowH () {
    //   return `
    //     M ${this.link.y1}, ${this.link.x1}
    //     h ${this.branch}
    //     H ${this.link.y2}
    //     V ${this.link.x2}
    //   `
    // }
  }
}
</script>

<style scoped lang="scss">
path {
  transition: all ease-in .6s;
  fill: none;
  stroke: black;
}
</style>
