
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CheckIcon, ChevronDownIcon } from './Icons';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

/**
 * A themed single-select dropdown following the ARIA "select-only combobox" pattern.
 */
export default function Select<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];
  const listboxId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const open = () => {
    setActiveIndex(selectedIndex);
    setIsOpen(true);
  };

  const choose = (index: number) => {
    onChange(options[index].value);
    setIsOpen(false);
  };

  // Close when clicking anywhere outside the dropdown.
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Keep the highlighted option visible while moving with the keyboard.
  useEffect(() => {
    if (!isOpen) return;

    listRef.current
      ?.querySelector(`#${CSS.escape(`${id}-option-${activeIndex}`)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex, id]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const lastIndex = options.length - 1;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(lastIndex, index + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default: {
        // Jump to the first option starting with the typed letter.
        if (event.key.length !== 1) return;

        const match = options.findIndex((option) =>
          option.label.toLowerCase().startsWith(event.key.toLowerCase()),
        );

        if (match !== -1) setActiveIndex(match);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${id}-label ${id}`}
        aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left text-sm text-gray-900 outline-none transition ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-100'
            : 'border-gray-200 hover:border-gray-300 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-100'
        }`}
      >
        {selected.icon}
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                  isActive ? 'bg-indigo-50' : ''
                } ${isSelected ? 'font-medium text-indigo-600' : 'text-gray-700'}`}
              >
                {option.icon}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-indigo-600" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
