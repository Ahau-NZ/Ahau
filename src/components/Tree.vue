<template>
    <div id="app">
        <svg :width="settings.width" :height="settings.height" style="{margin-left: 100px;}">
            <transition-group tag="g" name="link">
                <g class="link" v-for="link in links" :key="link.id">
                    <path class="link" :d="link.d"></path>
                </g>
            </transition-group>
            <transition-group tag="g" name="node">
                <g class="node" v-for="node in nodes" :key="node.id" :style="node.style">
                    <circle class="node-circle" @click="nodeClick(node.name)" :r="node.radius"></circle>
                </g>
            </transition-group>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3"

export default {
    data(){
        return {
            settings: {
                width: 1000,
                height: 500,
                branch: 70
            },
            treeData: { //my family data -> Claudine is the mother of 5 children, and one of them has a child 'Otene'
                id: 0,
                name: 'Claudine',
                children: [
                    {
                        id: 1,
                        name: 'Zara',
                        children: [
                            {
                                id: 6,
                                name: 'Otene'
                            }
                        ]
                    },
                    {   
                        id: 2,
                        name: 'Cherese'
                    },
                    {
                        id: 3,
                        name: 'Daynah'
                    },
                    {
                        id: 4,
                        name: 'Pititi'
                    },
                    {
                        id: 5,
                        name: 'Damon'
                    }
                ]
            }
        }
    },
    computed: {
        nodes() {
            const root = d3.hierarchy(this.treeData) //create a d3 hierarchical structure out of the defined data

            const treeLayout = d3.tree() //create a new tree layout and specify the size
                .size([250, 200])
        
            const output = treeLayout(root) //set the tree with the hierarchy data
                .descendants() //only interested in the descendants which is all nodes in the hierarchy including root 

            return output.map((d, i) => { //defined my own mapping for each node
                return {
                    id: 'node-' + d.data.id,
                    name: d.data.name, //name of the person in this instance
                    index: i,
                    style: {
                        transform: "translate(" + (d.x + 100) + "px," + (d.y + 100) +"px)" //TOP-BOTTOM -> must uncomment other parts
                        //transform: "translate(" + d.y + "px," + d.x +"px)" //LEFT-RIGHT -> must uncomment other parts
                    },
                    radius: 20,
                    x: d.x, //x position for this node in the tree
                    y: d.y //y position for this node in the tree
                }
            })
        },
        links() {
            const root = d3.hierarchy(this.treeData) //create a d3 hierarchical structure out of the defined data
            const treeLayout = d3.tree() //create a new tree layout and specify the size
                .size([250, 200])
        
            const output = treeLayout(root) //set the tree with the hierarchy data
                .links() //only interested in the links -> paths from parent to child node

            
            return output.map((d, i) => { //defined my own mapping for each link
                return {
                    id: 'link-' + d.source.data.id + '-' + d.target.data.id,
                    index: i, //index in the tree of current node
                    x1: d.source.x, //x position for the parent node
                    x2: d.target.x, //x position for the child node 
                    y1: d.source.y, //y position for the parent node
                    y2: d.target.y, //y position for the child node
                    //d: 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y // LEFT-RIGHT -> must uncomment other parts
                    // d: 'M ' + d.source.y + ' ' + d.source.x + ' L ' + d.target.y + ' ' + d.target.x // TOP-BOTTOM -> must uncomment other parts
                    d: 'M ' + (d.source.x + 100) + ',' + (d.source.y + 100) + ' v ' + this.settings.branch + ' H ' + (d.target.x + 100) + ' V ' + (d.target.y + 100)
                    //the d attribute for <path> M=moveto(absolute) v=vertical(relative) H=horizontal(absolute) V=vertical(absolute)
                }
            })
        }
    },
    mounted(){
        // eslint-disable-next-line no-console
        console.log(this.nodes)      
        
        // eslint-disable-next-line no-console
        console.log(this.links) 
    },
    methods: {
        /*
            temp method for when a node is clicked
        */
        nodeClick(name){
            alert(name)
        }
    }
}
</script>

<style scoped>
    .nodes {
        padding: 100px;
    }
    circle {
        fill: #5F9EA0;
        stroke: black;
    }
    circle:hover {
        cursor: pointer;
        transform: scale(1.5);
    }
    path {
        fill: none;
        stroke: black;
    }
</style>