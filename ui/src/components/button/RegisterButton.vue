<template>
  <v-btn
    pill
    outlined
    large
    :color="text !== 'Join Community' ? 'grey' : '#b12526'"
    height="50px"
    :class="[{ btn: !mobile && !tablet }, { mobileBtn: mobile }, { tabletBtn: tablet }, { disabled: text !== '' }]"
    @click="$emit('click')"
  >
    <span>{{ text }}</span>
  </v-btn>
</template>
<script>
import { mapActions } from 'vuex'

export default {
  props: {
    text: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    tablet () {
      return this.$vuetify.breakpoint.md
    }
  },
  methods: {
    ...mapActions(['setDialog'])
  }
}
</script>
<style lang="scss">
.disabled {
  pointer-events: none;
  background-color: rgb(12, 8, 8);
}

.btn {
    margin-top:37px;
    margin-left:20px;
    background-color: white;
    border-radius: 10px;
    font-size: 1rem !important;
    max-width: 250px;
    width:17vw;
    border-width: 1px;
}

.tabletBtn {
    margin-top:34px;
    margin-left:10px;
    background-color: white;
    border-radius: 10px;
    font-size: 0.8rem !important;
    max-width: 250px;
    width:14vw;
    border-width: 1px;
}

.mobileBtn {
  margin-top: 10px;
  border-radius: 10px;
  font-size: 1rem !important;
  width: 100%;
  border-width: 1px;
  background-color: white;
}
</style>
