/**
 * Dropdown Component
 * An accessible dropdown menu component built with Radix UI
 */
import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface DropdownItemProps {
  children: React.ReactNode;
  icon?: IconDefinition;
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  icon,
  shortcut,
  disabled = false,
  onSelect
}) => {
  return (
    <DropdownMenu.Item
      className={`
        relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors
        ${disabled 
          ? 'text-gray-400 pointer-events-none' 
          : 'text-gray-700 focus:bg-blue-50 focus:text-blue-700'
        }
      `}
      disabled={disabled}
      onSelect={onSelect}
    >
      {icon && (
        <FontAwesomeIcon 
          icon={icon} 
          className="mr-2 h-4 w-4" 
          aria-hidden="true" 
        />
      )}
      <span className="flex-grow">{children}</span>
      {shortcut && (
        <span className="text-xs text-gray-500 ml-auto">{shortcut}</span>
      )}
    </DropdownMenu.Item>
  );
};

export interface DropdownCheckboxItemProps {
  children: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const DropdownCheckboxItem: React.FC<DropdownCheckboxItemProps> = ({
  children,
  checked,
  onCheckedChange,
  disabled = false
}) => {
  return (
    <DropdownMenu.CheckboxItem
      className={`
        relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors
        ${disabled 
          ? 'text-gray-400 pointer-events-none' 
          : 'text-gray-700 focus:bg-blue-50 focus:text-blue-700'
        }
      `}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    >
      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded border border-gray-300">
        {checked && <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-blue-600" />}
      </div>
      {children}
    </DropdownMenu.CheckboxItem>
  );
};

export interface DropdownSubMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export const DropdownSubMenu: React.FC<DropdownSubMenuProps> = ({
  trigger,
  children
}) => {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className="flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none text-gray-700 focus:bg-blue-50 focus:text-blue-700"
      >
        {trigger}
        <FontAwesomeIcon 
          icon={faChevronRight} 
          className="ml-auto h-4 w-4" 
          aria-hidden="true" 
        />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className="min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg animate-in slide-in-from-left-1"
          sideOffset={2}
          alignOffset={-5}
        >
          {children}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
  alignOffset = 0
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[12rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50"
          align={align}
          side={side}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          {children}
          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const DropdownSeparator: React.FC = () => (
  <DropdownMenu.Separator className="h-px my-1 bg-gray-200" />
);

export const DropdownLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-gray-500">
    {children}
  </DropdownMenu.Label>
);

export default Dropdown;
