import Avatar from './Avatar.vue'

export default {
  title: 'Avatar'
}

export const NoProps = () => ({
  template: '<Avatar />',
  components: { Avatar }
})

const ruru =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ruru-morepork-heaphy-track.jpg/800px-Ruru-morepork-heaphy-track.jpg'

export const Image = () => ({
  template: '<Avatar :image="image" alt="Ruru"/>',
  data: () => ({
    image: { uri: ruru }
  }),
  components: { Avatar }
})

export const Small = () => ({
  template: '<Avatar :image="image" size="10vh" />',
  data: () => ({
    image: { uri: ruru }
  }),
  components: { Avatar }
})

export const Koro = () => ({
  template: '<Avatar gender="male" aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const Kuia = () => ({
  template: '<Avatar gender="female" aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const Tane = () => ({
  template: '<Avatar gender="male" aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const Wahine = () => ({
  template: '<Avatar gender="female" aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const Tama = () => ({
  template: '<Avatar gender="male" aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const Kotiro = () => ({
  template: '<Avatar gender="female" aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const Unknown = () => ({
  template: '<Avatar gender="unknown"/>',
  components: { Avatar }
})

export const NoGender = () => ({
  template: '<Avatar aliveInterval="1950-01-01/"/>',
  components: { Avatar }
})

export const NoBornAt = () => ({
  template: '<Avatar gender="male"/>',
  components: { Avatar }
})
