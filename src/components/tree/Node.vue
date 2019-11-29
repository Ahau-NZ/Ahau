<template>
  <svg>
    <g :style="groupStyle" @click="click">
      <defs>
        <clipPath id="myCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <image
        :xlink:href="imageSource"
        :width="diameter"
        :height="diameter"
        clip-path="url(#myCircle)"
      />
      <g :style="textStyle">
        <rect :width="textWidth" y="-16" height="20"></rect>
        <text>{{ profile.preferredName }}</text>
      </g>
    </g>
  </svg>
</template>

<script>
import get from 'lodash.get'
import tane from '@/assets/tane.svg'
import wahine from '@/assets/wahine.svg'

import gql from 'graphql-tag'

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
      collapsed: false,
      count: 0
    }
  },
  computed: {
    profile () {
      return this.node.data
    },
    diameter () {
      return this.radius * 2
    },
    imageSource () {
      const uri = get(this.node, 'data.avatarImage.uri')
      if (uri) return uri

      // fallback
      switch (this.profile.gender) {
        case 'male': return tane
        case 'female': return wahine
        default: return wahine // TODO androgenous avatar
      }
    },
    textWidth () {
      // const { x, y } = textElm.getBBox();
      const width = (this.profile.preferredName.length * 8)
      this.$emit('textWidth', width)
      return width
    },
    groupStyle () {
      var transform = (!this.collapsed)
        ? `translate(${this.node.x}px, ${this.node.y}px)`
        : `translate(${this.node.x}px, ${this.node.y}px) scale(1.2)`
      return { transform }
    },
    textStyle () {
      // centers the text element under image

      return {
        transform: `translate(${this.radius - (this.textWidth / 2)}px, ${this.diameter + 15}px)`
        // calculate the transform to draw nodes vertically
      }
    }
  },
  methods: {
    click () {
      this.$emit('click')
      this.collapsed = !this.collapsed
      // probably want to draw something below avatar if collapsed === true?
    },
    async getCloseWhakapapa (profileId) {
      const request = {
        query: gql`query ($id: String) {
          closeWhakapapa(id: $id) {
            id
            gender
            preferredName
            avatarImage {
              uri
            }
            children {
              id
              gender
              preferredName
              avatarImage {
                uri
              }
            }
            parents {
              id
              gender
              preferredName
              avatarImage {
                uri
              }
            }
          }
        }`,
        variables: {
          id: profileId
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        return result
      } catch (err) {
        console.error('WARNING, something went wrong')
        console.error(err)
        return err
      }
    },
    async partners(){
      /*
      // this wouldnt work
      let unique = []
      let partners = []
       this.profile.children.forEach(child => {
         child.parents.forEach(profileId => {
          if(!unique[profileId]){
            unique[profileId] = true
            const partner = this.loadPartner(profileId)
            partners.push(partner)
          }
        })
      })
      */
     let unique = []
     let partners = []
     for(const child of this.profile.children){
       for(const profileId of child.parents){
         if(!unique[profileId]){
           unique[profileId] = true
           const partner = await this.loadPartner(profileId)
           partners.push(partner)
         }
       }
     }
      return partners
    },
    async loadPartner(profileId){
      const result = await this.getCloseWhakapapa(profileId)
      const record = result.data.closeWhakapapa
      return record
    }
  },
  mounted(){
    setTimeout(async () => {
      const partners = await this.partners()
      console.log(partners)
    }, 1000);
  }

}
</script>

<style scoped lang="scss">
  svg {
    &:not(:root) {
      overflow: visible;
    }
    &:hover{
      cursor: pointer;
    }

    image {
      transition: ease-in 0.2s;

      &:hover{
        filter: contrast(1.4) brightness(1.4);
      }
    }
    rect {
      fill: #fff;
    }
    text {
      fill: #555;
    }
  }
</style>
