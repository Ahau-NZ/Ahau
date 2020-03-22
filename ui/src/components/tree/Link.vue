<template>
  <path class="link" :style="link.style" :d="elbowV"/>
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
  mounted () {
    console.log('link', this.link)
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
    elbowV () {
      return `
        M ${this.link.x1}, ${this.link.y1} 
        v ${this.branch} 
        H ${this.link.x2} 
        V ${this.link.y2}
      `
    }
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
