#! /usr/bin/env node

const fetch = require('node-fetch')
const fs = require('fs')
const env = require('ahau-env')()

fetch(`http://localhost:${env.ahau.graphql.port}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `
  })
}).then(result => result.json())
  .then(result => {
    const possibleTypes = {}

    result.data.__schema.types.forEach(supertype => {
      if (supertype.possibleTypes) {
        possibleTypes[supertype.name] =
          supertype.possibleTypes.map(subtype => subtype.name)
      }
    })

    fs.writeFile('./src/plugins/possibleTypes.json', JSON.stringify(possibleTypes, null, 2), err => {
      if (err) {
        console.error('Error writing possibleTypes.json', err)
      } else {
        console.log('Fragment types successfully extracted!')
      }
    })
  })
