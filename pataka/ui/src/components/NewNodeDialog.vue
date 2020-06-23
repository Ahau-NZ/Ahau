<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>
    <!-- Content Slot -->
    <template v-slot:content>
      <v-col class="py-0">
        <ProfileForm :profile.sync="formData" :mobile="mobile">
          <!-- Slot = Search -->
          <template v-slot:search>
            <v-combobox
              v-model="formData.preferredName"
              item-value="id"
              item-text="id"
              label="Pātaka name"
              :menu-props="{ light: true }"
              append-icon
              @click:clear="resetFormData()"
              outlined
            >
              <!-- Slot:item = Data -->
              <template v-slot:item="data">
                <template v-if="typeof data.item === 'object'">
                  <v-list-item @click="setFormData(data.item)">
                    <Avatar
                      class="mr-3"
                      size="40px"
                      :image="data.item.profile.avatarImage"
                      :alt="data.item.profile.preferredName"
                    />
                    <v-list-item-content>
                      <v-list-item-title>{{ data.item.profile.preferredName }}</v-list-item-title>
                      <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </template>
            </v-combobox>
          </template>
        </ProfileForm>
      </v-col>
    </template>
    <!-- End Content Slot -->

    <!-- Actions Slot -->
    <template v-slot:actions style="border: 2px solid orange;">
      <v-btn @click="close" text large fab class="secondary--text">
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn @click="submit" text large fab class="blue--text ml-5">
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
    <!-- End Actions Slot -->
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
import ProfileForm from '@/components/ProfileForm.vue'
import Avatar from '@/components/Avatar.vue'
import isEmpty from 'lodash.isempty'

function setDefaultData () {
  const formData = {
    id: '',
    preferredName: '',
    avatarImage: {},
    description: ''
  }

  return formData
}

export default {
  name: 'NewNodeDialog',
  components: {
    Avatar,
    Dialog,
    ProfileForm
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new Pātaka' }
  },
  data () {
    return {
      formData: setDefaultData()
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    submission () {
      let submission = {}
      Object.entries(this.formData).map(([key, value]) => {
        submission[key] = value
      })

      return submission
    }
  },
  methods: {
    submit () {
      this.$emit('create', this.submission)
      this.close()
    },
    close () {
      this.resetFormData()
      this.$emit('close')
    },
    async setFormData (person) {
      this.hasSelection = true
      this.formData = person.profile
    },
    resetFormData () {
      this.formData = setDefaultData()
    }

  },
  watch: {
    // watch for changes to avatarImage to decide when to show avatar
    'formData.avatarImage' (newValue) {
      if (!isEmpty(this.formData.avatarImage)) {
        this.showAvatar = true
      }
    }
  }
}
</script>

<style scoped>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.close {
  top: -25px;
  right: -10px;
}
.big-avatar {
  position: relative;
  top: -20px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}
</style>
