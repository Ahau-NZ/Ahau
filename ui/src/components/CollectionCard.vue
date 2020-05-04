<template>
<div>
    <v-row class="ma-0" style="display: flex; justify-content: flex-start">
        <v-card v-for="(collection, index) in collections" :key="index" class="mr-6 mb-6" max-width="23%" light>
            <v-img height="150" :src="collection.image"></v-img>
            <v-row class="ma-0">
                <v-col style="display: flex; flex-direction: column; justify-content: space-around;">
                    <v-row>

                        <v-card-title class="py-0">{{collection.title}}</v-card-title>

                        <v-card-text class="py-2">
                            <div class="my-0 grey--text">
                                {{collection.description}}
                            </div>
                            <v-row align="center" class="mb-0">
                                <v-col class="pt-3 pb-0">
                                    <div class="grey--text"><small>Records: {{collection.stories.length}}</small></div>

                                    <div class="grey--text"><small>Last submission: {{formatSubmissionDate(collection.lastSubmissionDate)}}</small></div>
                                </v-col>
                            </v-row>
                        </v-card-text>

                    </v-row>
                    <v-row>
                        <v-card-text class="py-2">
                            <v-divider class="mx-4"></v-divider>
                            <div class="grey--text pt-2">Access:</div>

                            <img v-for="(person, index) in collection.hasAccess" :key="index" class="people-circle" v-bind:src="person.avatarImage" />

                        </v-card-text>
                    </v-row>
                </v-col>
            </v-row>
            <!-- <v-card-actions>
            <v-btn color="deep-purple lighten-2" text @click="reserve">
                View
            </v-btn>
        </v-card-actions> -->
        </v-card>
    </v-row>
</div>
</template>

<script>
import formatDate from '@/lib/format-date.js'
export default {
    name: 'CollectionCard',
    props: ['collections'],
    // data() { 
    //     return {

    //     }
    // },
    methods: {
        formatSubmissionDate(date) {
            return formatDate(date)
        }
    },
    components: {

    }
}
</script>

<style lang="scss" scoped>
.people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
}
</style>
