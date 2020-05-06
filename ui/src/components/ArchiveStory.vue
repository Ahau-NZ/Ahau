<template>
<div class="container">
    <v-card class="mx-auto" light width="100%">

        <v-row>
            <v-col cols="8">
                <v-card-subtitle class="ma-0 pb-0">20 March, 2020</v-card-subtitle>
                <v-card-title class="ma-0 pt-1">Enua Manu: The bird that guided our people to Atui</v-card-title>
            </v-col>

            <v-col cols="4">
                <Contributors />
            </v-col>

        </v-row>

        <v-img src="../assets/enuamanu.png" height="200px"></v-img>

        <v-card-text>
            <p class="mb-0">Kia ora.. Spit the dummy, this crook cuzzie is as pearler as a heaps good housie. Mean while, in that one episode of Tux Wonder Dogs, you know the one bro, The Topp Twins and Jonah Lomu were up to no good with a bunch of bung chilly bins. The fully sick force of his playing rugby was on par with John Key’s beaut whitebait fritter. Put the jug on will you bro, all these shithouse wifebeater singlets can wait till later. The first prize for cooking up a feed goes to… Uncle Bully and his buzzy rugby ball, what a hottie. Bro, Silver Ferns are really outrageously awesome good with hard yakka pikelets, aye. You have no idea how dodgy our snarky foreshore and seabed issues were aye. Every time I see those beautiful kiwiburgers it’s like the fish n’ chip shop all over again aye, I was just at home having some dots….. Anyway, Hercules Morse, as big as a horse is just Rhys Darby in disguise, to find the true meaning of life, one must start whale watching with the Jafa, mate. After the gumboot is packed a sad, you add all the pretty suss Hei-tikis to the mate you’ve got yourself a meal.</p>
        </v-card-text>

        <v-card-actions class="pt-0">
            <v-btn text>Share</v-btn>

            <v-btn color="#b02425" text>
                Explore
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn icon @click="show = !show">
                <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </v-card-actions>

        <v-expand-transition>
            <div v-show="show">
                <v-divider></v-divider>

                <v-card-text>
                    <v-row>

                        <v-col col="8">
                            <h4>People</h4>
                            <!-- TODO: v-for People -->
                            <v-row>
                                <img class="people-circle" v-bind:src="require('@/assets/koro.svg')" />
                                <img class="people-circle" v-bind:src="require('@/assets/kuia.svg')" />
                                <img class="people-circle" v-bind:src="require('@/assets/tama.svg')" />
                                <img class="people-circle" v-bind:src="require('@/assets/tane.svg')" />
                                <img class="people-circle" v-bind:src="require('@/assets/wahine.svg')" />
                            </v-row>
                        </v-col>

                        <v-col col="4">
                            <h4>Location</h4>
                        </v-col>

                    </v-row>
                </v-card-text>
            </div>

        </v-expand-transition>
    </v-card>
    <!-- End of first card -->

</div>
</template>

<script>
import Contributors from '@/components/Contributors.vue'

export default {
  name: 'ArchiveStory',
  props: {
    // type: {
    //     type: String, // person / community?
    //     required: true
    // },
    profile: {
      type: Object,
      default: () => ({})
    }
    // editProfile: {
    //   type: Function
    //   // default: () => console.log('need to define editProfile!')
    // }
  },
  data: () => ({
    show: false
  }),
  methods: {

  },
  components: {
    Contributors
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
    width: 100%;
}

.people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
}
</style>
