<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>
    <!-- Content Slot -->
    <template v-slot:content>
      <v-col class="py-0">
        <p>
          In order for others to connecto to this Pātaka over the Internet you'll need to enable
          <a
            href="https://en.wikipedia.org/wiki/Port_forwarding"
            target="_blank"
          >Port-Forwarding</a> on your router.
        </p>
        <p>Bellow is the public IP we detected. Please enable Port-Fowarding and confirm this is the right IP.</p>
        <v-text-field
          v-model="ip"
          :error-messages="errorMsg"
          label="This machines public IP"
          outlined
        />
      </v-col>
    </template>
    <!-- End Content Slot -->

    <!-- Actions Slot -->
    <template v-slot:actions style="border: 2px solid orange;">
      <v-btn @click="submit('local')" text large class="secondary--text">Use local network</v-btn>
      <v-btn
        @click="checkPortForwarding"
        text
        large
        class="blue--text ml-5"
      >{{checkingPort ? 'Checking' : 'Check Port-Fowarding'}}</v-btn>
    </template>
    <!-- End Actions Slot -->
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog.vue'

export default {
  name: 'GenerateInviteDialog',
  components: {
    Dialog
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String },
    publicIpv4: { type: String, default: 'xxx.xxx.xx.xx' },
    portFowarding: { type: Boolean, default: false },
    checkPortForwarding: { type: Function },
    checkingPort: { type: Boolean, default: false },
    errorMsg: { type: String }
  },
  data () {
    return {
      externalIp: null
    }
  },
  computed: {
    ip: {
      get: function () {
        return this.externalIp || this.publicIpv4
      },
      set: function (newValue) {
        this.externalIp = newValue
      }
    }
  },
  methods: {
    submit (type) {
      this.$emit('generate', type === 'local' ? null : this.externalIp || this.publicIpv4)
      this.close()
    },
    close () {
      this.$emit('close')
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
</style>
