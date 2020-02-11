<template>
  <div :class="mobile ? null : 'desktop-wrapper'">
    <Header
      :preferredName="profile.preferredName"
      :avatarImage="profile.avatarImage"
      :headerImage="profile.headerImage"
      :addImages="addChanges"
    />
    <v-container
      class="body"
      :class="{ 'px-12': !mobile, 'pt-12': !mobile, 'px-6': mobile }"
    >
      <v-row :class="{ 'pt-12': !mobile }">
        <v-col>
          <v-form
            class="body white pt-0"
            ref="form"
            v-model="form.valid"
            lazy-validation
          >
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="profile.preferredName"
                  label="Preferred name"
                  light
                ></v-text-field>
                <v-text-field
                  v-model="profile.legalName"
                  label="Legal name"
                  light
                ></v-text-field>
                <v-textarea
                  v-model="profile.description"
                  name="input-7-1"
                  label="Description"
                  hint="Hint text"
                  light
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>

      <v-row :class="mobile ? '' : 'pt-12'">
        <v-col class="text-right">
          <Actions
            :hasChanges="hasChanges"
            @cancel="$emit('cancel')"
            @save="$emit('save-profile', profileChanges)"
          />
        </v-col>
      </v-row>

      <v-row class="spacer" />
    </v-container>
  </div>
</template>

<script>
import pick from 'lodash.pick'
import get from 'lodash.get'
import Header from '@/components/profile-form/Header'
import Actions from '@/components/profile-form/Actions'
import { RULES, PERMITTED_PROFILE_ATTRS } from '@//lib/constants'

export default {
  name: 'ProfileForm',
  props: {
    persistedState: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      permitted: PERMITTED_PROFILE_ATTRS,
      profile: {
        id: '',
        preferredName: '',
        legalName: '',
        description: '',
        avatarImage: undefined,
        headerImage: undefined
      },
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
    altNames () {
      return get(this, 'profile.altNames', [])
    },
    profileChanges () {
      let changes = {}
      Object.entries(this.profile).map(([key, value]) => {
        // TODO: special case for altNames

        // if this value hasn't been written before
        if (this.persistedState[key] === null) {
          // and the new value isn't "empty", then it's a change
          if (value !== '') changes[key] = value
        } else {
          // it has been written before, and it's a new value!
          if (this.persistedState[key] !== value) changes[key] = value
        }
      })
      return changes
    },
    hasChanges () {
      return Object.keys(this.profileChanges).length > 0
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  watch: {
    persistedState: {
      handler (nextValue) {
        // map persistedState into this.profile (form state which might become new profile state)
        Object.entries(nextValue)
          .filter(([key]) => !key.startsWith('_'))
          .forEach(([key, value]) => {
            if (value !== null) this.profile[key] = value
          })
      },
      immediate: true
    }
  },
  methods: {
    addChanges (changes) {
      this.profile = Object.assign(
        {},
        this.profile,
        pick(changes, this.permitted)
      )
    }
  },
  components: {
    Header,
    Actions
  }
}
</script>
<style scoped lang="scss">
.desktop-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(
    to right,
    grey 0%,
    grey 50%,
    #000000 50%,
    white 50%,
    white 100%
  );

  > .body {
    min-width: 600px;
    max-width: 60vw;
    background: #fff;

    padding: 0;

    .row {
      .col {
        padding: 0;
      }
    }
    .row.spacer {
      background: #fff;
      height: 20vh;
    }
  }
}
</style>
