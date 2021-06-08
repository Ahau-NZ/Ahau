import { isCordova, downloadFile as cordovaDownloadFile } from './cordova-helpers'

function forceDownload (fileData, fileName) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = `data:,${encodeURIComponent(fileData)}`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function downloadBackup (fileData) {
  if (!isCordova()) {
    return forceDownload(fileData, 'ahau-key-backup.txt')
  }

  // download with cordova
  return cordovaDownloadFile(fileData, 'ahau-key-backup.txt', 'text/plain')
}
