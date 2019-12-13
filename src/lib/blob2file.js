export default async (blobUrl, name) => {
  let file = await fetch(blobUrl)
    .then(r => r.blob())
    .then(blobFile => new File([blobFile], name || 'file', { type: 'image/jpg' }))
  return file
}
