import { action } from '@storybook/addon-actions'
import NewRegistrationDialog from './NewRegistrationDialog'
import store from '../../../store'

import { storiesOf } from '@storybook/vue'

const defaultMethods = {
  close: action('toggle view'),
  submit: console.log('Submit')
}

storiesOf('NewRegistrationDialog', module)
  .add('whoami', () => {
    return {
      template: `
        <NewRegistrationDialog
          show
          title="test"
          :profile="whoami.personal.profile"
          :tribe="tribe"
        />
      `,
      methods: defaultMethods,
      data () {
        return {
          whoami,
          profile: whoami.personal.profile,
          tribe: {
            id: whoami.personal.groupId,
            private: [whoami.personal.profile],
            public: [whoami.public.profile]
          }
        }
      },
      components: { NewRegistrationDialog },
      store
    }
  })

const whoami = {
  public: {
    feedId: '@58MByuWxOHWJmpXlVdhdWha0z/n2efYb0bR+hO2EBpQ=.ed25519',
    profile: {
      id: '%NfGfTEd7/Cm4leXVFGsvEvT4Ad5kOGexd54d8r0t1LY=.sha256',
      preferredName: 'Cherese_',
      avatarImage: {
        uri: 'http://localhost:26835/%2600PTaxMFMFha6l3y2aMEkoVSr%2FCbnsCmyXcajNFvdLw%3D.sha256?unbox=p2tZYoG7zumw2Mbacz77CwJLygfhakibLjBaS7oA2YE%3D.boxs'
      },
      canEdit: true,
      authors: [
        {
          feedId: '@58MByuWxOHWJmpXlVdhdWha0z/n2efYb0bR+hO2EBpQ=.ed25519',
          profile: {
            id: '%NfGfTEd7/Cm4leXVFGsvEvT4Ad5kOGexd54d8r0t1LY=.sha256',
            preferredName: 'Cherese_'
          }
        }
      ],
      tiaki: [
        {
          feedId: '@58MByuWxOHWJmpXlVdhdWha0z/n2efYb0bR+hO2EBpQ=.ed25519',
          id: '%NfGfTEd7/Cm4leXVFGsvEvT4Ad5kOGexd54d8r0t1LY=.sha256'
        }
      ]
    }
  },
  personal: {
    groupId: '%mqqY3VPfL6KWN1R2dE7mssSri2ergXFYJ5isHDGOCGw=.cloaked',
    profile: {
      id: '%CBPFpRpn+EUJlcvkiLngyvzTTPG569xeVquV+Pop8p4=.sha256',
      preferredName: 'Cherese_',
      legalName: 'Cherese Putiputi Eriepa_',
      canEdit: true,
      authors: [
        {
          feedId: '@58MByuWxOHWJmpXlVdhdWha0z/n2efYb0bR+hO2EBpQ=.ed25519'
        }
      ],
      recps: [
        '%mqqY3VPfL6KWN1R2dE7mssSri2ergXFYJ5isHDGOCGw=.cloaked'
      ]
    }
  }
}
