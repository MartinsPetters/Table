import namor from 'namor'

const range = (len) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

let index = 0

const newPerson = (parent, idx) => {
  index++
  const statusChance = Math.random()
  return {
    index_: index,
    id_: 'ID' + index,
    nr: `${parent ? parent.nr + '.' : ''}${idx + 1}`,
    firstName: namor.generate({ words: 1, numbers: 0, saltLength: 0 }),
    lastName: namor.generate({ words: 1, numbers: 0, saltLength: 0 }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.random() * 100 > 50,
    status:
      statusChance > 0.66
        ? 'relationship'
        : statusChance > 0.33
        ? 'complicated'
        : 'single'
  }
}

export default function makeData(...lens) {
  const makeDataLevel = (depth = 0, parent) => {
    const len = lens[depth]
    return range(len).map((d, idx) => {
      const person = newPerson(parent, idx)
      return {
        ...person,
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1, person) : undefined
      }
    })
  }

  return makeDataLevel()
}
