// =====================================================
// SAVE DESIGN MODAL COMPONENT -v4- SYSTEMATIC ORGANIZATION & ENHANCED UX
// =====================================================

/**
 * Modal dialog for saving cat tree designs with enhanced user experience
 * Provides name input, validation, and keyboard shortcuts
 */
const SaveDesignModal = ({ isOpen, onClose, onSave }) => {
  const { useState, useEffect, useCallback, useRef } = React;
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [designName, setDesignName] = useState('My Cat Tree');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for focus management
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  
  // ========================================
  // VALIDATION LOGIC
  // ========================================
  
  /**
   * Validates design name input
   * @param {string} name - Name to validate
   * @returns {Object} Validation result with valid flag and message
   */
  const validateDesignName = useCallback((name) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return { valid: false, message: 'Design name cannot be empty' };
    }
    
    if (trimmedName.length < 2) {
      return { valid: false, message: 'Design name must be at least 2 characters' };
    }
    
    if (trimmedName.length > 50) {
      return { valid: false, message: 'Design name cannot exceed 50 characters' };
    }
    
    // Check for invalid filename characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      return { valid: false, message: 'Design name contains invalid characters' };
    }
    
    return { valid: true, message: '' };
  }, []);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handles design name input changes with real-time validation
   */
  const handleNameChange = useCallback((e) => {
    const newName = e.target.value;
    setDesignName(newName);
    
    const validation = validateDesignName(newName);
    setIsValid(validation.valid);
    setErrorMessage(validation.message);
  }, [validateDesignName]);

  /**
   * Handles save operation with validation and loading state
   */
  const handleSave = useCallback(async () => {
    const validation = validateDesignName(designName);
    
    if (!validation.valid) {
      setIsValid(false);
      setErrorMessage(validation.message);
      return;
    }
    
    setIsSaving(true);
    
    try {
      await onSave(designName.trim());
      onClose();
    } catch (error) {
      setErrorMessage('Failed to save design. Please try again.');
      setIsValid(false);
    } finally {
      setIsSaving(false);
    }
  }, [designName, validateDesignName, onSave, onClose]);

  /**
   * Handles keyboard shortcuts and accessibility
   */
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isValid && !isSaving) {
          handleSave();
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (!isSaving) {
          onClose();
        }
        break;
    }
  }, [isValid, isSaving, handleSave, onClose]);

  /**
   * Handles backdrop clicks for modal dismissal
   */
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Reset modal state when opened
   */
  useEffect(() => {
    if (isOpen) {
      setDesignName('My Cat Tree');
      setIsValid(true);
      setErrorMessage('');
      setIsSaving(false);
      
      // Focus the input field when modal opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen]);

  /**
   * Handle focus trap for accessibility
   */
  useEffect(() => {
    if (!isOpen) return;
    
    const handleFocusTrap = (e) => {
      if (!modalRef.current) return;
      
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  // ========================================
  // RENDER LOGIC
  // ========================================
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200',
    onClick: handleBackdropClick,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'modal-title',
    'aria-describedby': 'modal-description'
  }, React.createElement('div', {
    ref: modalRef,
    className: 'bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-200 scale-100',
    onClick: (e) => e.stopPropagation()
  }, [
    // ========================================
    // MODAL HEADER
    // ========================================
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between mb-6'
    }, [
      React.createElement('h2', {
        key: 'title',
        id: 'modal-title',
        className: 'text-xl font-bold text-gray-900 flex items-center space-x-2'
      }, [
        React.createElement('span', { key: 'icon', className: 'text-2xl' }, '💾'),
        React.createElement('span', { key: 'text' }, 'Save Design')
      ]),
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        disabled: isSaving,
        className: 'text-gray-400 hover:text-gray-600 text-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1',
        'aria-label': 'Close modal'
      }, '✕')
    ]),
    
    // ========================================
    // MODAL CONTENT
    // ========================================
    React.createElement('div', {
      key: 'content',
      className: 'space-y-4'
    }, [
      // Description
      React.createElement('p', {
        key: 'description',
        id: 'modal-description',
        className: 'text-sm text-gray-600'
      }, 'Enter a name for your cat tree design. The design will be downloaded as a JSON file.'),
      
      // Input Section
      React.createElement('div', {
        key: 'input-section',
        className: 'space-y-2'
      }, [
        React.createElement('label', {
          key: 'label',
          htmlFor: 'design-name-input',
          className: 'block text-sm font-medium text-gray-700'
        }, 'Design Name'),
        React.createElement('input', {
          key: 'input',
          ref: inputRef,
          id: 'design-name-input',
          type: 'text',
          value: designName,
          onChange: handleNameChange,
          onKeyDown: handleKeyDown,
          disabled: isSaving,
          className: `w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
            isValid 
              ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
              : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`,
          placeholder: 'Enter design name...',
          maxLength: 50,
          'aria-invalid': !isValid,
          'aria-describedby': !isValid ? 'name-error' : undefined
        }),
        
        // Character Counter
        React.createElement('div', {
          key: 'char-counter',
          className: 'flex justify-between items-center text-xs'
        }, [
          React.createElement('span', {
            key: 'counter',
            className: `${designName.length > 45 ? 'text-amber-600' : 'text-gray-500'}`
          }, `${designName.length}/50 characters`),
          React.createElement('span', {
            key: 'hint',
            className: 'text-gray-400'
          }, 'Press Enter to save, Esc to cancel')
        ]),
        
        // Error Message
        !isValid && React.createElement('div', {
          key: 'error',
          id: 'name-error',
          className: 'flex items-center space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3',
          role: 'alert'
        }, [
          React.createElement('span', { key: 'icon' }, '⚠️'),
          React.createElement('span', { key: 'message' }, errorMessage)
        ])
      ])
    ]),
    
    // ========================================
    // MODAL ACTIONS
    // ========================================
    React.createElement('div', {
      key: 'actions',
      className: 'flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200'
    }, [
      React.createElement('button', {
        key: 'cancel',
        onClick: onClose,
        disabled: isSaving,
        className: 'px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500'
      }, 'Cancel'),
      React.createElement('button', {
        key: 'save',
        onClick: handleSave,
        disabled: !isValid || isSaving || !designName.trim(),
        className: `px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 ${
          isValid && designName.trim() && !isSaving
            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`
      }, [
        isSaving && React.createElement(SharedUtils.LoadingSpinner, {
          key: 'spinner',
          size: 'small',
          color: 'white'
        }),
        React.createElement('span', { 
          key: 'text' 
        }, isSaving ? 'Saving...' : 'Save Design')
      ])
    ])
  ]));
};