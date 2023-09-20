const CORDOVA_ENV_NAME = 'cordova'

export function isCordova () {
  return process.env.VUE_APP_PLATFORM === CORDOVA_ENV_NAME
}

function writeErrorOnDownloadFile (err) {
  alert('Unable to open')
  console.error(err)
}

export function downloadFile (fileData, fileName, mimeType) {
  if (!window.cordova || !window.resolveLocalFileSystemURL) {
    throw new Error('Platform not supported')
  }

  const blob = new Blob([fileData], {
    type: mimeType
  })

  const storageLocation = window.cordova.file.cacheDirectory

  window.resolveLocalFileSystemURL(storageLocation,
    function (dir) {
      // create the file in the cache dir
      dir.getFile(
        fileName,
        { create: true },
        function (file) {
          // write data to the file
          file.createWriter(
            function (fileWriter) {
              fileWriter.write(blob)

              fileWriter.onwriteend = function () {
                const url = file.toURL()

                // open file for the user
                window.cordova.plugins.fileOpener2.open(url, mimeType, {
                  error: writeErrorOnDownloadFile
                })
              }

              fileWriter.onerror = writeErrorOnDownloadFile
            },
            writeErrorOnDownloadFile
          )
        },
        writeErrorOnDownloadFile
      )
    },
    writeErrorOnDownloadFile
  )
}
