<template>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
               <!-- <v-btn v-on="on" @click="$emit('update:search', true)" fab x-small color="blue-grey">
                 <v-icon >mdi-magnify</v-icon>
               </v-btn> -->
              <form id="demo-2">
                <input type="search" placeholder="Search" v-model="searchString" v-on="on">
              </form>
      
            </template>
            <span>Search</span>
          </v-tooltip>
      </template>
      
      <script>
      export default {
        name: 'SearchButton',
        props: {
          search: Boolean
        },
        data () {
          return {
            searchString: '',
            hasSelection: false
          }
        },
      
      }
      
      </script>
      
      <style scoped lang="scss">
      
      input {
          outline: none;
      }
      input[type=search] {
          -webkit-appearance: textfield;
          -webkit-box-sizing: content-box;
          font-family: inherit;
          font-size: 100%;
      }
      input::-webkit-search-decoration,
      input::-webkit-search-cancel-button {
          display: none; 
      }
      
      
      input[type=search] {
          background: #ededed url(https://static.tumblr.com/ftv85bp/MIXmud4tx/search-icon.png) no-repeat 9px center;
          border: solid 1px #ccc;
          padding: 4.5px 10px 4.5px 32px;
          width: 55px;
          
          -webkit-border-radius: 10em;
          -moz-border-radius: 10em;
          border-radius: 10em;
          
          -webkit-transition: all .5s;
          -moz-transition: all .5s;
          transition: all .5s;
      }
      
      input[type=search]:focus {
          width: 130px;
          background-color: #fff;
          border-color: #66CC75;
          
          -webkit-box-shadow: 0 0 5px rgba(109,207,246,.5);
          -moz-box-shadow: 0 0 5px rgba(109,207,246,.5);
          box-shadow: 0 0 5px rgba(109,207,246,.5);
      }
      
      
      input:-moz-placeholder {
          color: #999;
      }
      input::-webkit-input-placeholder {
          color: #999;
      }
      
      /* Demo 2 */
      #demo-2 input[type=search] {
          width: 15px;
          padding-left: 10px;
          color: transparent;
          cursor: pointer;
      }
      #demo-2 input[type=search]:hover {
          background-color: #fff;
      }
      #demo-2 input[type=search]:focus {
          width: 150px;
          padding-left: 32px;
          color: #000;
          background-color: #fff;
          cursor: auto;
      }
      #demo-2 input:-moz-placeholder {
          color: transparent;
      }
      #demo-2 input::-webkit-input-placeholder {
          color: transparent;
      }
      
      </style>