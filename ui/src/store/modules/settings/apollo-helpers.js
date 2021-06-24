import pick from 'lodash.pick'
import gql from 'graphql-tag'

export const PERMITTED_SETTINGS_ATTRS = [
  'id',
  'keyBackedUp',
  'authors',
  'tombstone',
  'recps'
]

export const saveSettings = input => {
  input = {
    ...pick(input, PERMITTED_SETTINGS_ATTRS)
  }

  return {
    mutation: gql`
      mutation($input: SettingsInput!) {
        saveSettings(input: $input)
      }
    `,
    variables: { input }
  }
}

export const getSettings = id => ({
  query: gql`
    query ($id: ID!) {
      settings(id: $id) {
        id
        keyBackedUp
        recps
      }
    }
  `,
  variables: { id },
  fetchPolicy: 'no-cache'
})

export const getAllSettings = {
  query: gql`
    query {
      allSettings {
        id
        keyBackedUp
        recps
      }
    }
  `
}

export const deleteSettings = (id, date) => ({
  mutation: gql`
    mutation ($input: SettingsInput!) {
      saveSettings (input: $input)
    }
  `,
  variables: {
    input: {
      id,
      tombstone: { date }
    }
  }
})

export const getBackup = {
  query: gql`
    query {
      backup
    }
  `,
  fetchPolicy: 'no-cache'
}

export const deleteAhau = {
  mutation: gql`
    mutation {
      deleteAhau
    }
  `
}
