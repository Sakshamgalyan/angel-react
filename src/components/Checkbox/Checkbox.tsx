"use client";

import React from 'react';
import Icon from '../Icon/Icon';

type CheckboxProps = {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: string;
  className?: string;
};

const Checkbox = React.memo(({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  icon,
  className = '',
}: CheckboxProps) => {
  return (
    <label
      className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        checked
          ? 'bg-primary/5 border-primary/50 shadow-sm'
          : 'bg-background border-border hover:border-primary/30 hover:bg-secondary/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="relative flex items-center justify-center w-5 h-5 mr-4">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer appearance-none w-5 h-5 border-2 border-muted-foreground rounded checked:bg-primary checked:border-primary transition-colors"
        />
        <div className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
          <Icon name="check" size={14} />
        </div>
      </div>
      <span className="flex-1 font-medium text-foreground">{label}</span>
      {icon && <span className="text-lg opacity-70">{icon}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
