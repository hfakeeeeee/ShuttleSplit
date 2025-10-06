// operators.ts
export const notContains = 'not contains'
export const notMatch = 'not search.ismatch('
export const match = 'search.ismatch('

export const OPERATORS = [
  { name: 'eq', label: 'equal' },
  { name: 'ne', label: 'not equal' },
  { name: match, label: 'contains' },
  { name: notMatch, label: notContains },
]
