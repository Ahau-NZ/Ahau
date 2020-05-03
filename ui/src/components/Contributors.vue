<template>
<!-- TODO: v-for Contributors -->
<div>
    <v-row>
        <v-col class="pa-0" style="text-align: right;">
            <h4><small>Contribution</small></h4>
        </v-col>
        <v-col class="pa-0">
            <v-row class="justify-center ma-0">
                <img v-for="(item, index) in mockdata" :key="index" class="people-circle" v-bind:src="item.avatarImage" />
            </v-row>
        </v-col>
    </v-row>
    <v-row>
        <v-col class="pa-0">
        </v-col>
        <v-col class="pa-0">
            <v-row class="justify-center mx-0 mt-2">
                <small>4 Hours Ago</small>
            </v-row>
        </v-col>
    </v-row>
</div>
</template>

<script>
export default {
    name: 'Contributors',
    props: {
        //TODO prop in real contributor data
    },
    data: () => ({
        mockdata: [{
                id: 123,
                preferredName: 'Ian',
                avatarImage: require('@/assets/koro.svg')
            },
            {
                id: 456,
                preferredName: 'Ben',
                avatarImage: require('@/assets/kuia.svg')
            }
        ]
    }),
    methods: {

    },
    components: {

    }
}
</script>

<style lang="scss">
.people-circle {
    width: 50px;
    margin: 5px;
    border-radius: 50%;
    background-color: lightgrey;
    background-position-y: 10px;
}
</style>
