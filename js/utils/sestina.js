function sestina (poem) {
  const shuffle = (a) => {
    // via: https://stackoverflow.com/a/6274381/1104148
    let j, x, i
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = a[i]
      a[i] = a[j]
      a[j] = x
    }
    return a
  }

  const newLines = []
  poem.split('\n').forEach(line => {
    // take center 3rd of each line && randomize
    let words = line.split(' ')
    if (words.length > 3) {
      const third = Math.ceil(words.length / 3)
      const begin = words.slice(0, third)
      let middle = words.slice(third, third * 2)
      const end = words.slice(third * 2)
      middle = shuffle(middle)
      words = [...begin, ...middle, ...end]
    }
    newLines.push(words.join(' '))
  })

  if (newLines[newLines.length - 1] === '') newLines.pop()

  // take second half of lines && interweave in reverse (from the start)
  const half = Math.floor(newLines.length / 2)
  const newLinesA = newLines.slice(0, half)
  const newLinesB = newLines.slice(half, newLines.length).reverse()
  const tinad = []
  const length = newLinesA.length > newLinesB.length ? newLinesA.length : newLinesB.length
  for (let i = 0; i < length; i++) {
    if (typeof newLinesB[i] === 'string') tinad.push(newLinesB[i])
    if (typeof newLinesA[i] === 'string') tinad.push(newLinesA[i])
  }
  console.log(tinad)
  return tinad.join('\n')
}

if (typeof module !== 'undefined') module.exports = sestina
else window.sestina = sestina
