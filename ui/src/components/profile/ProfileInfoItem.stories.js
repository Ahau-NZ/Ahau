import ProfileInfoItem from './ProfileInfoItem.vue'
import { personComplete, personMinimum } from '@/mocks/person-profile'
export default {
  title: 'ProfileInfoItem'
}

export const Name = () => ({
  template: '<ProfileInfoItem :title="title" :value="value"/>',
  data () {
    return {
      title: 'Preferred Name',
      value: personComplete.preferredName
    }
  },
  components: { ProfileInfoItem }
})

export const DateOfBirth = () => ({
  template: '<ProfileInfoItem :title="title" :value="value" :sub-value="subValue"/>',
  data () {
    return {
      title: 'Age',
      value: '17',
      subValue: '1 Feb 2003'

    }
  },
  components: { ProfileInfoItem }
})
