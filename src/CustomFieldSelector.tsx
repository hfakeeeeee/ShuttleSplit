import React, { useMemo, useState } from 'react'
import type { FieldSelectorProps } from 'react-querybuilder'
import { toFullOption } from 'react-querybuilder'

const FIXED = [
  { name: 'baseUrl', label: 'Domain' },
  { name: 'path', label: 'Path' },
  { name: 'title', label: 'Title' },
].map(toFullOption)

const CUSTOM = '__custom__'

export default function CustomFieldSelector({
  className,
  handleOnChange,
  value,
}: FieldSelectorProps) {
  const [mode, setMode] = useState<'fixed' | 'custom'>(
    value && value !== CUSTOM ? 'fixed' : 'custom',
  )
  const [customName, setCustomName] = useState(
    value && value !== CUSTOM ? '' : (value ?? ''),
  )

  const options = useMemo(
    () => [...FIXED, { name: CUSTOM, label: 'Custom field…' }],
    [],
  )

  return (
    <div className={className} style={{ display: 'flex', gap: 8 }}>
      <select
        value={mode === 'custom' ? CUSTOM : value ?? FIXED[0].name}
        onChange={(e) => {
          const v = e.target.value
          if (v === CUSTOM) {
            setMode('custom')
            handleOnChange(customName || CUSTOM)
          } else {
            setMode('fixed')
            handleOnChange(v)
          }
        }}
      >
        {options.map((o) => (
          <option key={o.name} value={o.name}>
            {o.label}
          </option>
        ))}
      </select>

      {mode === 'custom' && (
        <input
          type="text"
          placeholder="Enter field name (e.g., h1, meta.description)"
          value={customName}
          onChange={(e) => {
            const v = e.target.value
            setCustomName(v)
            handleOnChange(v || CUSTOM)
          }}
          style={{ flex: 1 }}
        />
      )}
    </div>
  )
}
