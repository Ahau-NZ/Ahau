import { isCordova } from './cordova-helpers'

export function makeFile (blob) {
  if (isCordova()) {
    return new window.NativeFile([blob], 'avatar', { type: blob.type })
  }

  return new window.File([blob], 'avatar', { type: blob.type })
}
