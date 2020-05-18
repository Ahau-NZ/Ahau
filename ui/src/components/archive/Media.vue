<template>
  <div>
    <audio v-if="type === 'audio'" class="fit">
      <source  :src="src" :type="type + '/' + format"/>
    </audio>
    <video v-if="type === 'video'" class="fit">
      <source :src="src" :type="type + '/' + format"/>
    </video>
    <img v-if="type === 'photo'" :src="src" class="fit"/>
  </div>
</template>

<script>
export default {
  name: 'Media',
  props: {
    type: {
      validator: (val) => [
        'audio', 'video', 'photo'
      ].includes(val)
    },
    format: String,
    src: String
  }
}
</script>

<style scoped>
.fit {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
