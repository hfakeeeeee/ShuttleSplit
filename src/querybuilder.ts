import type { RuleGroupType } from 'react-querybuilder'

type Op = 'eq' | 'ne' | 'contains' | 'not_contains'

export const OP_MAP: Record<string, Op> = {
  eq: 'eq',
  ne: 'ne',
  'search.ismatch(': 'contains',
  'not search.ismatch(': 'not_contains',
}

const isValidFieldName = (f: string) =>
  /^[A-Za-z0-9_.\/-]+$/.test(f)

const esc = (s: string) => s.replace(/'/g, "''")

const renderEq = (field: string, value: string, op: 'eq' | 'ne') =>
  `${field} ${op} '${value}'`

const renderContains = (field: string, value: string, negate: boolean) => {
  const core = `search.ismatch('${value}', '${field}', 'full', 'all')`
  return negate ? `not ${core}` : core
}

const normalizeValueForField = (field: string, op: Op, value: string) => {
  if (field === 'baseUrl' && (op === 'eq' || op === 'ne')) {
    return value.replace(/\s+/g, '')
  }
  return value
}

export function buildSearchQuery(
  filter?: RuleGroupType<any, string>
): string {
  if (!filter || !filter.rules?.length) return ''

  const parts = filter.rules
    .map((r: any) => {
      const field: string = r?.field
      const rawOp: string = r?.operator
      const rawVal: string | undefined = r?.value
      if (!field || !rawOp || rawVal == null || rawVal === '') return ''
      if (!isValidFieldName(field)) return ''

      const op = OP_MAP[rawOp]
      if (!op) return ''

      const safeVal = esc(normalizeValueForField(field, op, String(rawVal)))
      switch (op) {
        case 'eq':
        case 'ne':
          return renderEq(field, safeVal, op)
        case 'contains':
          return renderContains(field, safeVal, false)
        case 'not_contains':
          return renderContains(field, safeVal, true)
      }
    })
    .filter(Boolean)

  const combinator = filter.combinator ? ` ${filter.combinator} ` : ' and '
  return parts.join(combinator)
}
