import React from 'react';
import { LuChevronDown } from 'react-icons/lu';

const SelectDropdown = ({ options = [], value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (optionValue) => {
    // Simuler un event pour compatibilité avec les handlers classiques
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder || '';

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-sm text-black outline-none bg-white border border-slate-100 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        <span>{selectedLabel}</span>
        <span className="ml-2">{isOpen ? <LuChevronDown className="rotate-180" /> : <LuChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`cursor-pointer p-2 hover:bg-gray-100 ${option.value === value ? 'bg-blue-50 font-semibold' : ''}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;