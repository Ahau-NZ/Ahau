// AppIcon.vue
<template>
  <svg
    viewBox="0 0 510.9 510.9"
    class="icon"
    :class="styleClasses"
  >
  <g>
		<path class="st0" d="M255.2,30.4c-124.4,0-225.3,100.9-225.3,225.3s100.9,225.3,225.3,225.3s225.3-100.9,225.3-225.3
      S379.7,30.4,255.2,30.4z M255.2,110.8c40,0,72.4,32.4,72.4,72.4s-32.4,72.4-72.4,72.4s-72.4-32.4-72.4-72.4
      c-0.1-39.9,32.2-72.3,72.1-72.4C255,110.8,255.1,110.8,255.2,110.8z M384,399.2c-73.1,66.1-184.4,66.1-257.5,0v-9.3
      c-1.3-45.9,34.6-84.2,80.5-85.9h96.6c45.6,1.8,81.4,39.8,80.5,85.4V399.2z"/>
	</g>
  </svg>
</template>

<script>
export default {
  name: 'ArchiveIcon',
  props: {
    size: String,
    color: String,
    active: Boolean
  },
  computed: {
    isActive () {
      console.log("active: ", this.active)
      if (this.active) this.color = "red"
      else this.color = "black"
    },
    styleClasses() {
      return [this.size, this.color].map(val => val && `is-${val}`);
    },
  },
};
</script>
