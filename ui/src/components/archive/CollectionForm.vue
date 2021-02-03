<template>
  <v-form ref="form" v-model="form.valid" lazy-validation>
    <v-row class="px-2">
      <v-col cols="12" sm="5" order-sm="2">
        <v-row class="pa-0">
          <v-col cols="12" class="pa-0">
            <!-- Avatar -->
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.image"
              :alt="formData.name"
              isView
            />
          </v-col>
          <v-col cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker label="Edit collection image"
              @updateAvatar="formData.image = $event"
              isView
            />
          </v-col>
          <!-- END of Avatar -->
        </v-row>
      </v-col>
      <!-- Information Col -->
      <v-col cols="12" sm="7" class="border-right">
        <v-row>
          <!-- Name -->
          <v-col cols="12" class="pa-1">
            <v-text-field
              v-model="formData.name"
              label="Collection Name"
              placeholder=" "
              hide-details
            />
          </v-col>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea
              v-model="formData.description"
              label="Collection Description"
              placeholder=" "
              hide-details
              no-resize
              rows="1"
              auto-grow
            ></v-textarea>
          </v-col>
          <v-col cols="12" md="auto" class="pa-5">
            <v-tooltip top open-delay="700" :disabled="showStories">
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-row v-if="!showStories" @click="showStories = true" class="pl-5">
                    <v-icon small>mdi-plus</v-icon>
                    <AddButton size="20px" icon="mdi-book-multiple" iconClass="pr-3" label="Stories"  justify="start"/>
                  </v-row>
                </div>
              </template>
              <span>Add stories from this archive to this collection</span>
            </v-tooltip>

            <ProfileSearchBar
              :selectedItems.sync="formData.stories"
              :items="stories"
              :openMenu.sync="showStories"
              placeholder="add related record"
              item="title"
            />
            <ChipGroup
              v-if="formData.stories && formData.stories.length > 0"
              type="story"
              :chips="formData.stories"
              deletable
              @delete="removeStory"
            />
            <v-divider v-if="mobile" light class="mt-6 mr-4"></v-divider>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'

import { storiesApolloMixin } from '@/mixins/story-mixins.js'

import AddButton from '@/components/button/AddButton.vue'
import ChipGroup from '@/components/archive/ChipGroup.vue'
import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'

import { mapGetters } from 'vuex'

export default {
  name: 'CollectionForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton,
    ChipGroup,
    ProfileSearchBar
  },
  props: {
    formData: {
      type: Object
    },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false }
  },
  mixins: [
    storiesApolloMixin
  ],
  data () {
    return {
      form: {
        valid: true,
        rules: RULES
      },
      stories: [],
      showStories: false
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    removeStory (i) {
      this.formData.stories.splice(i, 1)
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
