/**
 * Tabs Component
 * An accessible tabbed interface component built with Headless UI
 */
import React from 'react';
import { Tab as HeadlessTab } from '@headlessui/react';

export interface TabItem {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultIndex = 0,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = ''
}) => {
  // Handle tab change
  const handleChange = (index: number) => {
    if (onChange) {
      onChange(index);
    }
  };
  
  // Tab list variant classes
  const tabListVariantClasses = {
    default: 'space-x-2 border-b border-gray-200',
    pills: 'space-x-2',
    underline: 'space-x-8 border-b border-gray-200'
  };
  
  // Tab variant classes
  const tabVariantClasses = {
    default: 'py-2 px-4 border-b-2 border-transparent ui-selected:border-blue ui-selected:text-blue',
    pills: 'py-2 px-4 rounded-md ui-selected:bg-blue-100 ui-selected:text-blue',
    underline: 'py-2 px-1 border-b-2 border-transparent ui-selected:border-blue ui-selected:text-blue'
  };

  return (
    <div className={className}>
      <HeadlessTab.Group defaultIndex={defaultIndex} onChange={handleChange}>
        <HeadlessTab.List 
          className={`flex ${fullWidth ? 'w-full' : ''} ${tabListVariantClasses[variant]}`}
        >
          {tabs.map((tab, index) => (
            <HeadlessTab
              key={index}
              disabled={tab.disabled}
              className={({selected}) => `
                ${fullWidth ? 'flex-1 text-center' : ''}
                ${tabVariantClasses[variant]}
                text-sm font-medium
                ${selected ? '' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue
              `}
            >
              {tab.label}
            </HeadlessTab>
          ))}
        </HeadlessTab.List>
        <HeadlessTab.Panels className="mt-4">
          {tabs.map((tab, index) => (
            <HeadlessTab.Panel
              key={index}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue rounded-md p-1"
            >
              {tab.content}
            </HeadlessTab.Panel>
          ))}
        </HeadlessTab.Panels>
      </HeadlessTab.Group>
    </div>
  );
};

export default Tabs;
