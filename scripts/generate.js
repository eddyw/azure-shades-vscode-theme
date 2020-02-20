const path = require('path')
const fs = require('fs')
const { produce } = require('immer')

const template = require('../template/Template-color-theme.json')

const alternativeContrast = {
  default: '#6AB0A3', // Green sheen
  chingu: '#6EC19F', // Chingu.io color (less brightness and saturation)
  pearly: '#C16E98', // Pearly purple
  rose: '#C16E6E', // Rose gold
}

const palette = {
  night: {
    black: '#000000',
    background: '#0D0F12',
    background__active: '#232530',
    elements: '#2B313C',
    elements__hover: '#464F61',
    comments: '#616E88',
  },
  snow: {
    text: '#E2E7EF',
    text__hover: '#F1F3F7',
  },
  palette: {
    black: '#131419',
    red: '#AA505D',
    green: '#9EBF82',
    yellow: '#EAD88B',
    blue: '#508AAA',
    magenta: '#88528C',
    cyan: '#699CAF',
    white: '#ECEFF4',
    brightBlack: '#464F61',
    brightRed: '#C45C6B',
    brightGreen: '#B3D893',
    brightYellow: '#FFEB96',
    brightBlue: '#5C9FC4',
    brightMagenta: '#CEA3C6',
    brightCyan: '#70BCD1',
    brightWhite: '#F1F3F7',
  },
  paletteAdditional: {
    label: '#9EA2AA',
    orange: '#C88470',
    contrast: '#6AB0A3',
    string: '#EAD88B',
    constant: '#699CAF',
  },
}

const getPalette = (colors = palette) => {
  const editor = [
    { tag: '<ui-editor-bg>', color: colors.night.background },
    { tag: '<ui-editor-bg__active>', color: colors.night.background__active },
    { tag: '<ui-editor-text>', color: colors.snow.text },
    { tag: '<ui-editor-text__hover>', color: colors.snow.text__hover },
    { tag: '<ui-editor-widget__shadow>', color: colors.night.black },
    { tag: '<ui-editor-highlight>', color: colors.paletteAdditional.contrast },
    { tag: '<ui-editor-elements>', color: colors.night.elements },
    { tag: '<ui-editor-elements__hover>', color: colors.night.elements__hover },
    { tag: '<ui-editor-info>', color: colors.palette.blue },
    { tag: '<ui-editor-error>', color: colors.palette.red },
    { tag: '<ui-editor-hint>', color: colors.palette.yellow },
    { tag: '<ui-editor-warn>', color: colors.paletteAdditional.orange },
    { tag: '<ui-editor-bg__added>', color: colors.palette.green },
    { tag: '<ui-editor-debug__bg>', color: colors.palette.blue },
    { tag: '<ui-editor-sub-module>', color: colors.palette.cyan },
  ]
  const tokens = [
    { tag: '<token-punctuation>', color: colors.snow.text__hover },
    { tag: '<token-symbols>', color: colors.snow.text },
    { tag: '<token-strings>', color: colors.paletteAdditional.string },
    { tag: '<token-bullet>', color: colors.palette.cyan },
    { tag: '<token-comment>', color: colors.night.comments },
    { tag: '<token-tag>', color: colors.palette.blue },
    { tag: '<token-variable__other>', color: colors.snow.text },
    { tag: '<token-variable__parameter>', color: colors.snow.text },
    { tag: '<token-object-literal__key>', color: colors.paletteAdditional.contrast },
    { tag: '<token-storage>', color: colors.palette.blue },
    { tag: '<token-storage__name>', color: colors.paletteAdditional.contrast },
    { tag: '<token-regexp>', color: colors.paletteAdditional.orange },
    { tag: '<token-number>', color: colors.palette.yellow },
    { tag: '<token-entity__name>', color: colors.paletteAdditional.contrast },
    { tag: '<token-entity__type>', color: colors.palette.brightCyan },
    { tag: '<token-entity__attribute>', color: colors.palette.cyan },
    { tag: '<token-constant__language>', color: colors.paletteAdditional.constant },
    { tag: '<token-control>', color: colors.palette.blue },
    { tag: '<token-label>', color: colors.paletteAdditional.label },
    { tag: '<token-error>', color: colors.palette.red },
    { tag: '<token-warn>', color: colors.paletteAdditional.orange },
    { tag: '<token-debug>', color: colors.palette.magenta },
    { tag: '<token-info>', color: colors.palette.brightCyan },
  ]
  const terminal = [
    { tag: '<terminal-ansiBlack>', color: colors.palette.black },
    { tag: '<terminal-ansiRed>', color: colors.palette.red },
    { tag: '<terminal-ansiGreen>', color: colors.palette.green },
    { tag: '<terminal-ansiYellow>', color: colors.palette.yellow },
    { tag: '<terminal-ansiBlue>', color: colors.palette.blue },
    { tag: '<terminal-ansiMagenta>', color: colors.palette.magenta },
    { tag: '<terminal-ansiCyan>', color: colors.palette.cyan },
    { tag: '<terminal-ansiWhite>', color: colors.palette.white },
    { tag: '<terminal-ansiBrightBlack>', color: colors.palette.brightBlack },
    { tag: '<terminal-ansiBrightRed>', color: colors.palette.brightRed },
    { tag: '<terminal-ansiBrightGreen>', color: colors.palette.brightGreen },
    { tag: '<terminal-ansiBrightYellow>', color: colors.palette.brightYellow },
    { tag: '<terminal-ansiBrightBlue>', color: colors.palette.brightBlue },
    { tag: '<terminal-ansiBrightMagenta>', color: colors.palette.brightMagenta },
    { tag: '<terminal-ansiBrightCyan>', color: colors.palette.brightCyan },
    { tag: '<terminal-ansiBrightWhite>', color: colors.palette.brightWhite },
  ]
  return { editor, tokens, terminal }
}

const findTag = (color, colors) => {
  return colors.find(c => {
    return color.toLowerCase().includes(c.tag.toLowerCase())
  })
}
const replaceColors = (parentKey, obj, colors) => {
  const keys = Object.keys(obj)
  const rootKey = parentKey ? `${parentKey}.` : ''

  keys.forEach(key => {
    const value = obj[key]
    const path = `${rootKey}${key}`

    if (typeof value === 'object') {
      if (!value) return
      replaceColors(path, value, colors)
    }

    if (typeof value === 'string') {
      const replacement = findTag(value, colors)

      if (replacement) {
        const orgLower = replacement.tag.toLowerCase()
        const repLower = replacement.color.toLowerCase()
        const valLower = value.toLowerCase()
        const replaceWith = valLower.replace(orgLower, repLower)

        if (replaceWith === valLower) return

        // console.log(
        //   '+ %o from %o to %o',
        //   path,
        //   valLower,
        //   replaceWith,
        // )
        obj[key] = replaceWith
      }
    }
  })
}

const defaultTheme = produce(template, draft => {
  const { editor, terminal, tokens } = getPalette()
  replaceColors('colors', draft.colors, editor)
  replaceColors('colors', draft.colors, terminal)
  replaceColors('tokenColors', draft.tokenColors, tokens)
})
const chinguTheme = produce(template, draft => {
  const { editor, terminal, tokens } = getPalette(produce(palette, draftColors => {
    draftColors.paletteAdditional.contrast = alternativeContrast.chingu
  }))
  replaceColors('colors', draft.colors, editor)
  replaceColors('colors', draft.colors, terminal)
  replaceColors('tokenColors', draft.tokenColors, tokens)
})
const pearlyTheme = produce(template, draft => {
  const { editor, terminal, tokens } = getPalette(produce(palette, draftColors => {
    draftColors.paletteAdditional.contrast = alternativeContrast.pearly
  }))
  replaceColors('colors', draft.colors, editor)
  replaceColors('colors', draft.colors, terminal)
  replaceColors('tokenColors', draft.tokenColors, tokens)
})
const roseTheme = produce(template, draft => {
  const { editor, terminal, tokens } = getPalette(produce(palette, draftColors => {
    draftColors.paletteAdditional.contrast = alternativeContrast.rose
  }))
  replaceColors('colors', draft.colors, editor)
  replaceColors('colors', draft.colors, terminal)
  replaceColors('tokenColors', draft.tokenColors, tokens)
})

const FILE_DEFAULT_THEME = path.resolve(__dirname, '..', 'themes', 'Azure Shades – Default-color-theme.json')
const FILE_CHINGU_THEME = path.resolve(__dirname, '..', 'themes', 'Azure Shades – Chingu-color-theme.json')
const FILE_PEARLY_THEME = path.resolve(__dirname, '..', 'themes', 'Azure Shades – Wine-color-theme.json')
const FILE_ROSE_THEME = path.resolve(__dirname, '..', 'themes', 'Azure Shades – Rose-color-theme.json')

fs.writeFileSync(FILE_DEFAULT_THEME, JSON.stringify(defaultTheme, null, 2))
fs.writeFileSync(FILE_CHINGU_THEME, JSON.stringify(chinguTheme, null, 2))
fs.writeFileSync(FILE_PEARLY_THEME, JSON.stringify(pearlyTheme, null, 2))
fs.writeFileSync(FILE_ROSE_THEME, JSON.stringify(roseTheme, null, 2))
