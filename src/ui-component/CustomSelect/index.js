import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { IconChevronDown } from '@tabler/icons-react';
import { Menu, MenuItem } from '@mui/material';
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
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const buttonRef = useRef(null);

  const [internalValue, setInternalValue] = useState(
    value !== undefined ? value : defaultValue || (options[0]?.value ?? options[0] ?? '')
  );

  const currentValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (optionValue) => {
    setInternalValue(optionValue);
    handleClose();
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
  const isPlaceholder =
    !currentValue ||
    (selectedOption && (selectedOption.value === '' || selectedOption.value === null || selectedOption.value === undefined));

  return (
    <div
      className={`${styles.dropdownWrapper} ${className}`}
      style={{
        width: width || 'auto',
        minWidth: minWidth || 'auto',
        display: 'inline-block'
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.dropdownButton} ${isOpen ? styles.dropdownButtonOpen : ''} ${buttonClassName}`}
        onClick={handleOpen}
        style={{
          height: size === 'small' ? '32px' : '38px',
          fontSize: size === 'small' ? '13px' : '13px',
          padding: size === 'small' ? '0 6px 0 10px' : '0 10px 0 12px',
          gap: size === 'small' ? '4px' : '8px'
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`${styles.selectedText} ${isPlaceholder ? styles.placeholderText : ''}`}>
          {displayText}
        </span>
        <span className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotated : ''}`}>
          <IconChevronDown size={size === 'small' ? 14 : 16} stroke={2} />
        </span>
      </button>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          className: menuClassName,
          sx: {
            minWidth: buttonRef.current ? `${buttonRef.current.offsetWidth}px` : 'auto',
            maxHeight: 280,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid #E2E8F0',
            mt: 0.5,
            py: 0.5,
            bgcolor: '#FFFFFF',
            '& .MuiMenuItem-root': {
              fontFamily: "'Inter', sans-serif !important",
              fontSize: size === 'small' ? '12px !important' : '13px !important',
              fontWeight: '400 !important',
              color: '#1E293B',
              py: '6px',
              px: '12px',
              '&:hover': {
                bgcolor: '#F8FAFC'
              },
              '&.Mui-selected': {
                bgcolor: '#EEF2FF !important',
                color: '#6366F1 !important',
                fontWeight: '500 !important'
              }
            }
          }
        }}
      >
        {normalizedOptions.map((opt) => {
          const isSelected = String(opt.value) === String(currentValue);
          return (
            <MenuItem
              key={String(opt.value)}
              selected={isSelected}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </MenuItem>
          );
        })}
      </Menu>
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
