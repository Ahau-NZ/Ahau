import Avatar from './Avatar.vue'

export default {
  title: 'Avatar'
}

export const NoProps = () => ({
  template: '<Avatar />',
  components: { Avatar }
})

const ruru = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ruru-morepork-heaphy-track.jpg/800px-Ruru-morepork-heaphy-track.jpg'

export const Image = () => ({
  template: `<Avatar :image="image" alt="Ruru"/>`,
  data: () => ({
    image: { uri: ruru }
  }),
  components: { Avatar }
})

export const Small = () => ({
  template: `<Avatar :image="image" size="10vh" />`,
  data: () => ({
    image: { uri: ruru }
  }),
  components: { Avatar }
})
