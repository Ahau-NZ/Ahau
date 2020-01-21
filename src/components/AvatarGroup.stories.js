import { action } from '@storybook/addon-actions'
import AvatarGroup from './AvatarGroup.vue'
import { personComplete } from '@/mocks/person-profile'

export default {
  title: 'AvatarGroup'
}

export const EmptyGroup = () => ({
  template:
    '<AvatarGroup :profiles="[]" />',
  components: { AvatarGroup }
})

export const WithoutTitle = () => ({
  template:
    '<AvatarGroup :profiles="children" />',
  data: () => ({
    children: personComplete.children
  }),
  components: { AvatarGroup }
})

export const WithTitle = () => ({
  template:
    '<AvatarGroup :profiles="children" :groupTitle="title" />',
  data: () => ({
    children: personComplete.children,
    title: 'Children'
  }),
  components: { AvatarGroup }
})

export const WithButton = () => ({
  template:
    '<AvatarGroup :profiles="children" :groupTitle="title" :buttonLabel="label"/>',
  data: () => ({
    children: personComplete.children,
    title: 'Children',
    label: 'Add Child'
  }),
  methods: {
    click: action('click')
  },
  components: { AvatarGroup }
})

export const WithLabels = () => ({
  template:
    '<AvatarGroup :profiles="children" :groupTitle="title" :showLabels="true"/>',
  data: () => ({
    children: personComplete.children,
    title: 'Children',
    label: 'Add Child'
  }),
  methods: {
    click: action('click')
  },
  components: { AvatarGroup }
})
