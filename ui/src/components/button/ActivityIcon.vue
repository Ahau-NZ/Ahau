 /* eslint-disable */
 /* eslint-disable */

<template>
  <svg
    viewBox="0 0 512 512"
    class="icon"
    :class="styleClasses"
  >
  <g id="Capa_1">
    <path d="M405.1,172.7H108.9c-6.1,0-11.1-5-11.1-11.1v-24.1c0-17.9,14.5-32.3,32.3-32.3h251.7c17.9,0,32.3,14.5,32.3,32.3v26.1
      C414.2,168.7,410.1,172.7,405.1,172.7z"
      />
    <path d="M370.6,87.2H142.7c-7.6,0-13.8-6.2-13.8-13.8V46.3c0-13.1,10.6-23.8,23.8-23.8h206.7c13.1,0,23.8,10.6,23.8,23.8v28.4
      C383.1,81.6,377.5,87.2,370.6,87.2z"/>
  </g>
  <g id="Layer_2">
    <path d="M415,195.7H97c-35.9,0-65,29.1-65,65v145c0,35.9,29.1,65,65,65h318c35.9,0,65-29.1,65-65v-145
      C480,224.8,450.9,195.7,415,195.7z M202.6,403V263.5l120.8,69.7L202.6,403z"/>
  </g>
  </svg>
</template>

<script>
export default {
  name: 'ActivityIcon',
  props: {
    size: String,
    color: String
  },
  computed: {
    styleClasses () {
      return [this.size, this.color].map(val => val && `is-${val}`)
    }
  }
}
</script>
