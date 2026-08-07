const LOWERCASE_WORDS = new Set([
  'da',
  'de',
  'do',
  'das',
  'dos',
  'e',
  'a',
  'o',
  'as',
  'os',
  'em',
  'na',
  'no',
  'nas',
  'nos',
  'com',
  'por',
  'pela',
  'pelo',
  'pelas',
  'pelos',
  'van',
  'von',
  'di',
  'del',
  'der',
])

export const capitalizeWord = (word: string): string => {
  if (!word) return ''
  if (word.includes('-')) {
    return word
      .split('-')
      .map((part) => capitalizeWord(part))
      .join('-')
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export const formatName = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return ''

  const words = trimmed.split(/\s+/).filter(Boolean)

  return words
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && LOWERCASE_WORDS.has(lower)) {
        return lower
      }
      return capitalizeWord(word)
    })
    .join(' ')
}

export const clearName = (name: string): string => {
  const parts = name
    .split(/\s+/)
    .filter((w) => w.trim().length > 0)
    .filter((w) => !LOWERCASE_WORDS.has(w.toLowerCase()))
  const res = parts.join(' ')
  return res.length > 0 ? res : name
}

export const getInitials = (name: string): string => {
  const words = clearName(name).split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}