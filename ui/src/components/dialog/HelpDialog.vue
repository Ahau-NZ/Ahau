<template>
  <DialogContainer
    :show="show"
    :title="title"
    width="720px"
    :goBack="close"
    enableMenu
    @close="close"
    :submitLabel="t('send')"
    @submit="send"
    :hideActions="tab === 1 || sending"
  >
    <!-- Content Slot -->
    <template v-slot:content>
      <!-- Tabs -->
      <v-tabs grow v-model="tab" color="secondary">
        <v-tab>{{ t('report') }}</v-tab>
        <v-tab>{{ t('chat') }}</v-tab>
      </v-tabs>
      <!-- Tab items -->
      <v-tabs-items v-model="tab" light>
        <v-tab-item>
          <!-- email issue -->
          <v-form
            v-model="valid"
            ref="form"
            light
            class="px-4"
          >
            <p class="pt-4 text-center">{{ t('context') }}</p>
            <v-col cols="12" :sm="mobile ? '12' : '12'" :class="mobile ? 'pt-4 pb-0' : 'py-0'">
              <v-row justify="center">
                <v-col cols="12" class="pa-1 pt-2">
                  <!-- <p class="mb-0">Please provide a title or brief description of the issue</p> -->
                  <v-text-field
                    :label="t('subject')"
                    placeholder=" "
                    outlined
                    v-model="formData.title"
                    :rules="rules"
                  ></v-text-field>
                  <v-textarea
                    :label="t('action')"
                    v-model="formData.action"
                    :rules="rules"
                    v-bind="customProps"
                  ></v-textarea>
                  <p class="mb-0"></p>
                  <v-textarea
                    v-bind="customProps"
                    v-model="formData.outcome"
                    :label="t('outcome')"
                    :rules="rules"
                  ></v-textarea>
                  <v-textarea
                    v-bind="customProps"
                    :label="t('expected')"
                    v-model="formData.expected"
                  ></v-textarea>
                  <v-textarea
                    v-bind="customProps"
                    :label="t('moreInfo')"
                    v-model="formData.moreInfo"
                  ></v-textarea>
                  <p>Fill out the following fields if you would like to be notified about the issue</p>
                  <v-text-field
                    :label="t('name')"
                    v-bind="customProps"
                    v-model="formData.name"
                  ></v-text-field>
                  <v-text-field
                    :label="t('email')"
                    type="email"
                    v-bind="customProps"
                    v-model="formData.email"
                  ></v-text-field>
                </v-col>
                <p v-if="showErr" style="color: red">Please complete all required fields</p>
              </v-row>
            </v-col>
          </v-form>
        </v-tab-item>
        <!-- chat -->
        <v-tab-item>
          <v-row class="text-center justify-center pb-12">
            <v-col class="mx-12">
              <p>{{ t('chatDesc') }}</p>
              <v-btn
                dark
                color="secondary"
                elevation="5"
                href="https://chat.ahau.io/channel/help"
                target="_blank"
                class="mt-5"
              >
                {{ t('chatBtn') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-tab-item>

      </v-tabs-items>
    </template>
    <!-- End Content Slot -->
  </DialogContainer>
</template>

<script>
import { mapActions } from 'vuex'
import pkg from '@/../../desktop/package.json'

export default {
  name: 'HelpDialog',
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: '' }
  },
  data () {
    return {
      formData: {},
      sending: false,
      hasSelection: false,
      tab: 0,
      showDeleteProfile: false,
      valid: false,
      rules: [value => !!value || 'Required.'],
      showErr: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customProps () {
      return {
        outlined: true,
        placeholder: ' ',
        autogrow: true,
        rows: 3
      }
    }
  },
  methods: {
    ...mapActions('alerts', ['showAlert']),
    send () {
      this.$refs.form.validate()
      if (!this.valid) {
        return this.showAlert({
          message: this.t('completeForm'),
          color: 'secondary'
        })
      }
      this.sending = true
      const data = new FormData()
      const obj = {
        version: pkg.version,
        url: this.$route.name,
        name: '',
        email: '',
        moreInfo: '',
        ...this.formData
      }
      data.append('json', JSON.stringify(obj))
      fetch('https://ahau.io/sendIssue', {
      // fetch('http://localhost:3001/sendIssue', { // for dev testing
        method: 'post',
        body: data

      }).then((res) => {
        if (res.status === 200) {
          this.sending = false
          this.showAlert({
            message: this.t('issueSent'),
            color: 'green'
          })
          this.close()
        } else {
          this.sending = false
          this.close()
          return this.showAlert({
            message: this.t('sendErr'),
            color: 'secondary'
          })
        }
      })
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('help.' + key, vars)
    }
  }
}
</script>
