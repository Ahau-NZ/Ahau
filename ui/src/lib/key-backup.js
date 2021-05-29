const os = require('os')

const config = require('../../ssb.config.js')
const fs = require('fs')
const { promisify: p } = require('util')
const env = require('ahau-env')

export function downloadKeys (groupIds, latestMssgSeq) {
  const dataToSave = {
    secret: config.keys,
    tribes: groupIds,
    patakaLocations: getPataka(),
    latestSequence: latestMssgSeq
  }

  const fileData = JSONBackupToString(dataToSave)

  const link = document.createElement('a')
  link.download = 'ahau-key-backup.txt'
  link.href = `data:,${encodeURIComponent(fileData)}`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

async function getPataka () {
  try {
    const filePath = `${os.homedir()}/.${env.ahau.appName}/conn.json`

    return p(fs.readFile)(filePath, 'utf8')
  } catch {
    return {}
  }
}

const backupMessage = `# WARNING: Never show this to anyone.
# WARNING: Never edit it or use it on multiple devices at once.
#
# This is your SECRET.
# With this key you can decrypt all of your private information,
# sign your messages so that your friends can verify that the messages came from you.
# If anyone learns your secret, they can use it to access your information and impersonate you.
#
# If you use this secret on more than one device you will create a fork and
# your friends will stop replicating your content.
#
#

`

function JSONBackupToString (dataToSave) {
  var backupString = ''

  backupString += backupMessage
  backupString += JSON.stringify(dataToSave)

  return backupString
}
