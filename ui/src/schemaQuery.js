const fetch = require('node-fetch')
const fs = require('fs')
const env = require('ahau-env')

fetch(`http://localhost:${env.ahau.graphql.port}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: `
      query {
        __schema {
          types {
            name
            kind
            possibleTypes {
              name
              description
            }
          }
        }
      }    
    `
  })
}).then(result => result.json())
  .then(result => {
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null
    )
    result.data.__schema.types = filteredData

    fs.writeFile('./src/plugins/possibleTypes.json', JSON.stringify(result.data, null, 2), err => {
      if (err) {
        console.error('Error writing possibleTypes.json', err)
      } else {
        console.log('Fragment types successfully extracted!')
      }
    })
  })
