import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client' // partners with graphql-upload
// import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client' // TODO rm
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory' // TODO rm ?

import possibleTypes from './possibleTypes.json'

const env = require('ahau-env')

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: possibleTypes
})

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Http endpoint
const httpEndpoint =
  process.env.VUE_APP_GRAPHQL_HTTP || `http://localhost:${env.ahau.graphql.port}/graphql`

// Config
// const defaultOptions = {
//   // You can use `https` for secure connection (recommended in production)
//   httpEndpoint,
//   // You can use `wss` for secure connection (recommended in production)
//   // Use `null` to disable subscriptions
//   wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || `ws://localhost:${env.ahau.graphql.port}/graphql`,
//   // LocalStorage token
//   tokenName: AUTH_TOKEN,
//   // Enable Automatic Query persisting with Apollo Engine
//   persisting: false,
//   // Use websockets for everything (no HTTP)
//   // You need to pass a `wsEndpoint` for this to work
//   websocketsOnly: false,
//   // Is being rendered on the server?
//   ssr: false,

//   // Override default apollo link
//   // note: don't override httpLink here, specify httpLink options in the
//   // httpLinkOptions property of defaultOptions.
//   link: ApolloLink.from([
//     // ...
//     createUploadLink({
//       uri: httpEndpoint // '/graphql'
//       // opts: {
//       //   mode: 'no-cors',
//       // },
//       // credentials: DEV ? "same-origin" : "include"
//     })
//   ])

//   // Override default cache
//   // cache: myCache

//   // Override the way the Authorization header is set
//   // getAuth: (tokenName) => ...

//   // Additional ApolloClient options
//   // apollo: { ... }

//   // Client local data (see apollo-link-state)
//   // clientState: { resolvers: { ... }, defaults: { ... } }
// }

// Call this in the Vue app file
export function createProvider (options = {}) {
  // Create apollo client
  const apolloClient = new ApolloClient({
    ...options,
    ssrMode: typeof window === 'undefined',
    cache: new InMemoryCache({
      fragmentMatcher
    }),
    link: createUploadLink({ uri: httpEndpoint })
  })
  // apolloClient.wsClient = wsClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        // fetchPolicy: 'cache-and-network',
      }
    },
    errorHandler (error) {
      // eslint-disable-next-line no-console
      console.log(
        '%cError',
        'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
        error.message
      )
    }
  })

  return apolloProvider
}

// currently we just use this so we don't instantiate heaps of providers
export const apolloProvider = createProvider()

// Manually call this when user log in
export async function onLogin (apolloClient, token) {
  if (typeof localStorage !== 'undefined' && token) {
    localStorage.setItem(AUTH_TOKEN, token) // eslint-disable-line
  }
  // if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message)
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN) // eslint-disable-line
  }
  // if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
}
