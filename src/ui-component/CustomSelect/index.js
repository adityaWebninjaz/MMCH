/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IconChevronDown } from '@tabler/icons-react';
import styles from './CustomSelect.module.css';

const CustomSelect = ({
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  width,
  minWidth,
  size = 'normal' // 'normal' | 'small'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value !== undefined ? value : (defaultValue || (options[0]?.value ?? options[0] ?? '')));
  const containerRef = useRef(null);

  const currentValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    setInternalValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: opt.label, value: opt.value };
    }
    return { label: String(opt), value: opt };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(currentValue));
  const displayText = selectedOption ? selectedOption.label : (currentValue || placeholder);

  return (
    <div
      ref={containerRef}
      className={`${styles.dropdownWrapper} ${className}`}
      style={{
        width: width || 'auto',
        minWidth: minWidth || 'auto'
      }}
    >
      <button
        type="button"
        className={`${styles.dropdownButton} ${isOpen ? styles.dropdownButtonOpen : ''} ${buttonClassName}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
        }}
        style={{
          height: size === 'small' ? '30px' : '36px',
          fontSize: size === 'small' ? '12px' : '13px'
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.selectedText}>{displayText}</span>
        <span className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotated : ''}`}>
          <IconChevronDown size={size === 'small' ? 14 : 16} stroke={2} />
        </span>
      </button>

      {isOpen && (
        <ul
          className={`${styles.dropdownMenu} ${menuClassName}`}
          role="listbox"
          tabIndex={-1}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(currentValue);
            return (
              <li
                key={String(opt.value)}
                className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemSelected : ''}`}
                onClick={() => handleSelect(opt.value)}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

CustomSelect.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        label: PropTypes.node,
        value: PropTypes.any
      })
    ])
  ),
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  menuClassName: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.string
};

export default CustomSelect;
