export const clearName = (name: string): string => {
    const stopwords = new Set(['da', 'de', 'do', 'das', 'dos', 'e'])
    const parts = name
        .split(/\s+/)
        .filter((w) => w.trim().length > 0)
        .filter((w) => !stopwords.has(w.toLowerCase()))
    const res = parts.join(' ')
    return res.length > 0 ? res : name
}

export const getInitials = (name: string): string => {
    const words = clearName(name).split(/\s+/).filter(Boolean)
    if (words.length === 0) return ''
    if (words.length === 1) return words[0][0].toUpperCase()
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}