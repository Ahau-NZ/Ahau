<template>
  <v-col>
    <div class="gender-button" @click="updateSelectedGender">
      <img :src="require('@/assets/'+ getImage +'.svg')" class="gender-image">
    </div>
  </v-col>
</template>

<script>
export default {
  name: 'GenderButton',
  props: {
    gender: String,
    image: String,
  },
  data () {
    return {
     
    }
  },
  computed: {
    getImage() {
      if (this.gender == 'male') {return 'tane-outlined'}
      else if (this.gender == 'female') {return 'wahine-outlined'}
    }
  },
  methods: {
    updateSelectedGender() {
      console.log(this.gender)
      this.$emit('updateSelectedGender', this.gender)
    }
  }
}
</script>

<style scoped lang="scss">

  .gender-button {
    width: auto;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;
  }

    .gender-image {
      width: 6em;
      height: 6em;
      border: 0.5px solid rgba(0,0,0,0.6);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;
    }

    .gender-image:hover {
      border: 2px solid rgba(0,0,0,0.87);
    }
  
</style>
  