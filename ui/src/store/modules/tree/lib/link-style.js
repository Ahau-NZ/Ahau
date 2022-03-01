import settings from '../../../../lib/link'

export default function linkStyle (opts = {}) {
  return {
    fill: 'none',
    stroke: settings.color.default,
    opacity: settings.opacity,
    strokeWidth: settings.thickness,
    strokeLinejoin: 'round',
    ...opts
  }
}
