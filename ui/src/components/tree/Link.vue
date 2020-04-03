<template>
  <path class="link" :d="link.d" :style="link.style"/>
</template>

<script>
export default {
  props: {
    link: {
      type: Object,
      required: true
    }
  }
}
</script>
