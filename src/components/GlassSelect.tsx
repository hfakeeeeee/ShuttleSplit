import React, { useEffect, useId, useRef, useState } from 'react';

interface GlassSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
}

const GlassSelect: React.FC<GlassSelectProps> = ({ value, options, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = options.findIndex(option => option.value === value);
  const show = () => { setActive(Math.max(0, selected)); setOpen(true); };
  const close = () => { setOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, id]);

  return (
    <div className="glass-select" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
    }}>
      <button ref={trigger} type="button" className="glass-select-trigger" aria-label={label}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={() => open ? close() : show()}
        onKeyDown={event => {
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); show(); }
        }}>
        <span>{options[selected]?.label || value}</span>
        <i className="fas fa-chevron-down" aria-hidden="true" />
      </button>
      {open && <div id={id} ref={list} className="glass-select-menu" role="listbox" aria-label={label}
        tabIndex={-1} aria-activedescendant={`${id}-${active}`}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); close(); }
          if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(options.length - 1, index + 1)); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
          if (event.key === 'Home') { event.preventDefault(); setActive(0); }
          if (event.key === 'End') { event.preventDefault(); setActive(options.length - 1); }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (options[active]) onChange(options[active].value);
            close();
          }
          if (event.key === 'Tab') setOpen(false);
        }}>
        {options.map((option, index) => <div key={option.value} id={`${id}-${index}`} role="option"
          aria-selected={option.value === value} className={`glass-select-option ${index === active ? 'is-active' : ''}`}
          onPointerMove={() => setActive(index)}
          onMouseDown={event => event.preventDefault()}
          onClick={() => { onChange(option.value); close(); }}>
          <span>{option.label}</span>
          {option.value === value && <i className="fas fa-check" aria-hidden="true" />}
        </div>)}
      </div>}
    </div>
  );
};

export default GlassSelect;
