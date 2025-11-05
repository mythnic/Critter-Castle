// =====================================================
// SHARED UTILITIES & CONSTANTS -v2- SYSTEMATIC ORGANIZATION & DOCUMENTATION
// =====================================================

// ========================================
// COLOR SYSTEM - SINGLE SOURCE OF TRUTH
// ========================================

/**
 * Centralized color system for consistent theming throughout the application
 * All colors are defined as hex values for Three.js compatibility
 */
const COLORS = {
  // ========================================
  // PIECE TYPE COLORS - FUNCTIONAL CATEGORIZATION
  // ========================================
  PIECE_TYPES: {
    'house': 0xB8860B,        // Dark goldenrod - enclosed shelters
    'tunnel': 0xA0522D,       // Sienna - movement passages  
    'perch': 0xCD853F,        // Peru - elevated resting spots
    'post': 0x654321,         // Dark brown - scratching posts
    'platform': 0xD2691E,     // Chocolate - horizontal surfaces
    'bedding': 0xDEB887,      // Burlywood - comfort pieces
    'panel': 0x654321         // Dark brown - climbing surfaces
  },
  
  // ========================================
  // MATERIAL COLORS - VISUAL REPRESENTATION
  // ========================================
  MATERIALS: {
    'wood': 0x8B4513,         // Saddle brown - natural wood
    'fabric': 0x4682B4,       // Steel blue - soft materials
    'sisal': 0xF4A460,        // Sandy brown - scratching surfaces
    'carpet': 0x800080,       // Purple - plush surfaces
    'cushion': 0xFF6347       // Tomato - soft padding
  },
  
  // ========================================
  // COLOR PALETTE - USER CUSTOMIZATION OPTIONS
  // ========================================
  PALETTE: [
    '#8B4513', '#D2691E', '#654321', '#B8860B',  // Brown family
    '#CD853F', '#A0522D', '#DEB887', '#8FBC8F',  // Earth tones
    '#4682B4', '#800080', '#FF6347', '#F4A460'   // Accent colors
  ],
  
  // ========================================
  // UI STATE COLORS - INTERACTION FEEDBACK
  // ========================================
  SELECTION: 0x4A90E2,       // Bright blue - selected items
  LOCKED: 0x330000,          // Dark red - locked items
  GROUPED: 0x9966CC,         // Purple - grouped items
  HOVER: 0x87CEEB,           // Sky blue - hover state
  ERROR: 0xFF4444,           // Red - error states
  SUCCESS: 0x44FF44          // Green - success states
};

// ========================================
// MOVEMENT & GRID SYSTEM CONSTANTS
// ========================================

/**
 * Movement and grid configuration constants
 * Used for consistent spacing and positioning throughout the application
 */
const MOVEMENT = {
  // Available movement increments in inches
  INCREMENTS: [0.5, 2, 6],
  DEFAULT_INCREMENT: 2,
  
  // Grid size limits for workspace
  MAX_GRID_SIZE: 20,        // Maximum grid size in feet
  MIN_GRID_SIZE: 2,         // Minimum grid size in feet
  
  // Bounds for piece positioning
  MAX_POSITION: 60,         // Maximum X/Z position in inches
  MIN_HEIGHT: 0,            // Minimum Y position
  
  // Dimension limits for pieces
  MAX_WIDTH: 48,            // Maximum piece width in inches
  MAX_HEIGHT: 72,           // Maximum piece height in inches
  MAX_DEPTH: 48             // Maximum piece depth in inches
};

// ========================================
// PERFORMANCE CONSTANTS
// ========================================

/**
 * Performance monitoring and optimization constants
 */
const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,      // Default debounce delay in ms
  ANIMATION_DURATION: 200,   // Standard animation duration in ms
  UPDATE_THROTTLE: 16,      // ~60fps update throttling in ms
  BATCH_SIZE: 50            // Maximum items to process in a batch
};

// ========================================
// VALIDATION UTILITIES - INPUT SANITIZATION
// ========================================

/**
 * Comprehensive validation utilities for user inputs and data
 */
const PieceValidator = {
  
  /**
   * Validates and clamps piece dimensions to acceptable ranges
   * @param {number} width - Piece width in inches
   * @param {number} height - Piece height in inches
   * @param {number} depth - Piece depth in inches
   * @returns {Object} Validated dimensions object
   */
  validateDimensions: (width, height, depth) => ({
    width: Math.max(1, Math.min(MOVEMENT.MAX_WIDTH, width || 1)),
    height: Math.max(1, Math.min(MOVEMENT.MAX_HEIGHT, height || 1)), 
    depth: Math.max(1, Math.min(MOVEMENT.MAX_DEPTH, depth || 1))
  }),
  
  /**
   * Validates and clamps piece position within workspace bounds
   * @param {number} x - X position in inches
   * @param {number} y - Y position in inches
   * @param {number} z - Z position in inches
   * @param {number} gridWidth - Workspace width in feet
   * @param {number} gridHeight - Workspace height in feet
   * @returns {Object} Validated position object
   */
  validatePosition: (x, y, z, gridWidth = 10, gridHeight = 10) => ({
    x: Math.max(-gridWidth * 6, Math.min(gridWidth * 6, x || 0)),
    y: Math.max(MOVEMENT.MIN_HEIGHT, y || 0),
    z: Math.max(-gridHeight * 6, Math.min(gridHeight * 6, z || 0))
  }),
  
  /**
   * Normalizes rotation angle to 0-2π range
   * @param {number} rotation - Rotation in radians
   * @returns {number} Normalized rotation
   */
  validateRotation: (rotation) => {
    return ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  },
  
  /**
   * Validates if a piece can have an opening added
   * @param {Object} piece - Piece to validate
   * @param {Array} existingOpenings - Array of existing openings
   * @returns {Object} Validation result with valid flag and reason
   */
  canAddOpening: (piece, existingOpenings) => {
    if (!piece.hollow) {
      return { valid: false, reason: 'Only hollow pieces can have openings' };
    }
    const pieceOpenings = existingOpenings.filter(o => o.parentPieceId === piece.id);
    if (pieceOpenings.length >= 4) {
      return { valid: false, reason: 'Maximum 4 openings per piece' };
    }
    return { valid: true };
  },
  
  /**
   * Validates grid dimensions
   * @param {number} width - Grid width in feet
   * @param {number} height - Grid height in feet
   * @returns {Object} Validated grid dimensions
   */
  validateGridSize: (width, height) => ({
    width: Math.max(MOVEMENT.MIN_GRID_SIZE, Math.min(MOVEMENT.MAX_GRID_SIZE, width || MOVEMENT.MIN_GRID_SIZE)),
    height: Math.max(MOVEMENT.MIN_GRID_SIZE, Math.min(MOVEMENT.MAX_GRID_SIZE, height || MOVEMENT.MIN_GRID_SIZE))
  }),
  
  /**
   * Validates material selection for a piece variant
   * @param {string} material - Material to validate
   * @param {Array} availableMaterials - Available materials for the piece
   * @returns {string} Valid material or default
   */
  validateMaterial: (material, availableMaterials) => {
    return availableMaterials.includes(material) ? material : availableMaterials[0] || 'wood';
  }
};

// ========================================
// PERFORMANCE HOOKS - OPTIMIZATION UTILITIES
// ========================================

/**
 * Debounced value hook for performance optimization
 * @param {any} value - Value to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {any} Debounced value
 */
const useDebounced = (value, delay = PERFORMANCE.DEBOUNCE_DELAY) => {
  const { useState, useEffect } = React;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Memoized statistics calculation hook for design data
 * @param {Array} pieces - Array of piece objects
 * @param {Array} openings - Array of opening objects
 * @returns {Object} Calculated statistics
 */
const useMemoizedStats = (pieces, openings) => {
  const { useMemo } = React;
  
  return useMemo(() => {
    const totalCost = pieces.reduce((sum, piece) => sum + piece.cost, 0);
    const maxHeight = pieces.reduce((max, piece) => Math.max(max, piece.y + piece.height), 0);
    const averageHeight = pieces.length > 0 ? 
      pieces.reduce((sum, piece) => sum + piece.y + piece.height, 0) / pieces.length : 0;
    
    // Type breakdown analysis
    const typeBreakdown = pieces.reduce((acc, piece) => {
      const type = piece.variantId?.split('-')[0] || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Material breakdown analysis
    const materialBreakdown = pieces.reduce((acc, piece) => {
      const material = piece.material || 'wood';
      acc[material] = (acc[material] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCost,
      maxHeight,
      averageHeight: Math.round(averageHeight * 10) / 10,
      totalPieces: pieces.length,
      totalOpenings: openings.length,
      typeBreakdown,
      materialBreakdown,
      hollowPieces: pieces.filter(p => p.hollow).length,
      lockedPieces: pieces.filter(p => p.locked).length,
      groupedPieces: pieces.filter(p => p.groupId).length
    };
  }, [pieces, openings]);
};

/**
 * Throttled callback hook for limiting function execution frequency
 * @param {Function} callback - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
const useThrottled = (callback, limit = PERFORMANCE.UPDATE_THROTTLE) => {
  const { useRef, useCallback } = React;
  const inThrottle = useRef();

  return useCallback((...args) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => inThrottle.current = false, limit);
    }
  }, [callback, limit]);
};

// ========================================
// SHARED UI COMPONENTS - REUSABLE INTERFACE ELEMENTS
// ========================================

/**
 * Movement increment selector component
 * Used across all control panels for consistent movement increments
 * @param {Object} props - Component props
 * @param {number} props.value - Current increment value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.colorClass - Tailwind color class
 * @param {string} props.label - Label text
 */
const IncrementSelector = ({ value, onChange, colorClass = 'blue', label = 'Move:' }) => 
  React.createElement('div', {
    className: 'flex items-center justify-center space-x-2'
  }, [
    React.createElement('span', { 
      key: 'label', 
      className: 'text-sm text-gray-600 font-medium' 
    }, label),
    React.createElement('div', { 
      key: 'buttons', 
      className: 'flex space-x-1' 
    }, MOVEMENT.INCREMENTS.map(increment =>
      React.createElement('button', {
        key: increment,
        onClick: () => onChange(increment),
        className: `px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
          value === increment 
            ? `bg-${colorClass}-500 text-white shadow-md scale-105` 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-sm'
        }`,
        title: `Set movement increment to ${increment} inches`
      }, `${increment}"`)
    ))
  ]);

/**
 * 3x3 Movement grid component
 * Unified component used in piece, group, and opening controls
 * @param {Object} props - Component props
 * @param {Function} props.onMove - Movement handler
 * @param {Function} props.onCenter - Center handler
 * @param {boolean} props.disabled - Whether controls are disabled
 * @param {string} props.colorClass - Tailwind color class
 * @param {string} props.type - Control type for accessibility
 */
const MovementGrid = ({ 
  onMove, 
  onCenter, 
  disabled = false, 
  colorClass = 'blue',
  type = 'piece' 
}) => {
  const controls = [
    { key: 'spacer1', content: '' },
    { key: 'up', content: '↑ Y', direction: 'up', title: 'Move up' },
    { key: 'spacer2', content: '' },
    { key: 'left', content: '← X', direction: 'left', title: 'Move left' },
    { key: 'center', content: '⊙', action: 'center', title: 'Center position' },
    { key: 'right', content: 'X →', direction: 'right', title: 'Move right' },
    { key: 'back', content: '↓ Z', direction: 'back', title: 'Move back' },
    { key: 'down', content: '↓ Y', direction: 'down', title: 'Move down' },
    { key: 'forward', content: 'Z ↑', direction: 'forward', title: 'Move forward' }
  ];

  return React.createElement('div', {
    className: 'grid grid-cols-3 gap-2',
    role: 'group',
    'aria-label': `${type} movement controls`
  }, controls.map(control => 
    control.content ? React.createElement('button', {
      key: control.key,
      onClick: () => control.action === 'center' ? onCenter() : onMove(control.direction),
      disabled,
      title: control.title,
      className: `bg-${colorClass}-100 hover:bg-${colorClass}-200 text-${colorClass}-800 font-medium py-2 px-3 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-${colorClass}-500`
    }, control.content) : React.createElement('div', { key: control.key })
  ));
};

/**
 * Flexible action button grid component
 * @param {Object} props - Component props
 * @param {Array} props.buttons - Array of button configurations
 * @param {number} props.columns - Number of grid columns
 */
const ActionButtonGrid = ({ buttons, columns = 2 }) => 
  React.createElement('div', {
    className: `grid grid-cols-${columns} gap-2`,
    role: 'group',
    'aria-label': 'Action buttons'
  }, buttons.map(button =>
    React.createElement('button', {
      key: button.key,
      onClick: button.onClick,
      disabled: button.disabled,
      title: button.description || button.content,
      className: `${button.className || `bg-${button.color || 'blue'}-100 hover:bg-${button.color || 'blue'}-200 text-${button.color || 'blue'}-800`} font-medium py-2 px-3 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-${button.color || 'blue'}-500`
    }, button.content)
  ));

/**
 * Loading spinner component with size variants
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (small, medium, large)
 * @param {string} props.color - Color theme
 */
const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };
  
  return React.createElement('div', {
    className: `${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-${color}-600`,
    role: 'status',
    'aria-label': 'Loading'
  });
};

/**
 * Empty state component with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.icon - Icon character
 * @param {string} props.title - Main title
 * @param {string} props.subtitle - Subtitle text
 * @param {ReactNode} props.children - Optional action elements
 */
const EmptyState = ({ icon, title, subtitle, children }) =>
  React.createElement('div', {
    className: 'text-center py-8 text-gray-500',
    role: 'region',
    'aria-label': 'Empty state'
  }, [
    React.createElement('div', { 
      key: 'icon', 
      className: 'text-4xl mb-3',
      'aria-hidden': 'true'
    }, icon),
    React.createElement('h3', { 
      key: 'title', 
      className: 'font-medium mb-2 text-sm text-gray-700' 
    }, title),
    subtitle && React.createElement('p', { 
      key: 'subtitle', 
      className: 'text-xs mb-4 text-gray-500 max-w-sm mx-auto' 
    }, subtitle),
    children && React.createElement('div', { 
      key: 'actions',
      className: 'mt-4'
    }, children)
  ]);

/**
 * Toast notification component
 * @param {Object} props - Component props
 * @param {string} props.type - Notification type (success, error, warning, info)
 * @param {string} props.message - Notification message
 * @param {boolean} props.visible - Whether toast is visible
 * @param {Function} props.onClose - Close handler
 */
const Toast = ({ type = 'info', message, visible, onClose }) => {
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  if (!visible) return null;

  return React.createElement('div', {
    className: `fixed top-4 right-4 z-50 ${typeStyles[type]} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`,
    role: 'alert'
  }, [
    React.createElement('span', { key: 'icon' }, typeIcons[type]),
    React.createElement('span', { key: 'message', className: 'text-sm font-medium' }, message),
    onClose && React.createElement('button', {
      key: 'close',
      onClick: onClose,
      className: 'ml-2 text-lg leading-none hover:opacity-75',
      'aria-label': 'Close notification'
    }, '×')
  ]);
};

// ========================================
// THREE.JS UTILITIES & MEMORY MANAGEMENT
// ========================================

/**
 * Three.js cleanup utilities for memory management
 * Prevents memory leaks when disposing of 3D objects
 */
const useThreeJSCleanup = () => {
  const { useCallback } = React;
  
  /**
   * Properly disposes of Three.js geometry and materials
   * @param {THREE.Object3D} object - Object to clean up
   */
  const cleanupGeometry = useCallback((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => {
          if (material.map) material.map.dispose();
          if (material.normalMap) material.normalMap.dispose();
          if (material.bumpMap) material.bumpMap.dispose();
          material.dispose();
        });
      } else {
        if (object.material.map) object.material.map.dispose();
        if (object.material.normalMap) object.material.normalMap.dispose();
        if (object.material.bumpMap) object.material.bumpMap.dispose();
        object.material.dispose();
      }
    }
  }, []);

  /**
   * Recursively cleans up an entire Three.js scene
   * @param {THREE.Scene} scene - Scene to clean up
   */
  const cleanupScene = useCallback((scene) => {
    while (scene.children.length > 0) {
      const child = scene.children[0];
      scene.remove(child);
      if (child.children) {
        child.children.forEach(cleanupGeometry);
      }
      cleanupGeometry(child);
    }
  }, [cleanupGeometry]);

  /**
   * Cleans up Three.js textures
   * @param {THREE.Texture} texture - Texture to dispose
   */
  const cleanupTexture = useCallback((texture) => {
    if (texture && typeof texture.dispose === 'function') {
      texture.dispose();
    }
  }, []);

  return { cleanupGeometry, cleanupScene, cleanupTexture };
};

// ========================================
// DATA TRANSFORMATION UTILITIES
// ========================================

/**
 * Comprehensive data utility functions for processing design data
 */
const DataUtils = {
  
  /**
   * Groups pieces by their group ID
   * @param {Array} pieces - Array of piece objects
   * @returns {Object} Object with group IDs as keys
   */
  groupPiecesByGroup: (pieces) => {
    return pieces.reduce((acc, piece) => {
      const groupId = piece.groupId || 'ungrouped';
      if (!acc[groupId]) acc[groupId] = [];
      acc[groupId].push(piece);
      return acc;
    }, {});
  },
  
  /**
   * Groups openings by their parent piece
   * @param {Array} openings - Array of opening objects
   * @returns {Object} Object with piece IDs as keys
   */
  groupOpeningsByPiece: (openings) => {
    return openings.reduce((acc, opening) => {
      const pieceId = opening.parentPieceId;
      if (!acc[pieceId]) acc[pieceId] = [];
      acc[pieceId].push(opening);
      return acc;
    }, {});
  },
  
  /**
   * Calculates 3D bounding box for a collection of pieces
   * @param {Array} pieces - Array of piece objects
   * @returns {Object|null} Bounding box dimensions or null if no pieces
   */
  calculateBoundingBox: (pieces) => {
    if (pieces.length === 0) return null;
    
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let maxY = 0;
    
    pieces.forEach(piece => {
      const halfWidth = piece.width / 2;
      const halfDepth = piece.depth / 2;
      
      minX = Math.min(minX, piece.x - halfWidth);
      maxX = Math.max(maxX, piece.x + halfWidth);
      minZ = Math.min(minZ, piece.z - halfDepth);
      maxZ = Math.max(maxZ, piece.z + halfDepth);
      maxY = Math.max(maxY, piece.y + piece.height);
    });
    
    return {
      minX, maxX, minZ, maxZ, maxY,
      width: maxX - minX,
      depth: maxZ - minZ,
      height: maxY,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      volume: (maxX - minX) * (maxZ - minZ) * maxY
    };
  },

  /**
   * Filters pieces by various criteria
   * @param {Array} pieces - Array of piece objects
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered pieces array
   */
  filterPieces: (pieces, filters) => {
    return pieces.filter(piece => {
      if (filters.locked !== undefined && piece.locked !== filters.locked) return false;
      if (filters.hollow !== undefined && piece.hollow !== filters.hollow) return false;
      if (filters.material && piece.material !== filters.material) return false;
      if (filters.category) {
        const category = piece.variantId?.split('-')[0];
        if (category !== filters.category) return false;
      }
      if (filters.minCost !== undefined && piece.cost < filters.minCost) return false;
      if (filters.maxCost !== undefined && piece.cost > filters.maxCost) return false;
      return true;
    });
  },

  /**
   * Sorts pieces by various criteria
   * @param {Array} pieces - Array of piece objects
   * @param {string} sortBy - Sort criteria
   * @param {boolean} ascending - Sort direction
   * @returns {Array} Sorted pieces array
   */
  sortPieces: (pieces, sortBy, ascending = true) => {
    const sorted = [...pieces].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'height':
          comparison = (a.y + a.height) - (b.y + b.height);
          break;
        case 'cost':
          comparison = a.cost - b.cost;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case 'material':
          comparison = (a.material || 'wood').localeCompare(b.material || 'wood');
          break;
        case 'size':
          const volumeA = a.width * a.height * a.depth;
          const volumeB = b.width * b.height * b.depth;
          comparison = volumeA - volumeB;
          break;
        default:
          return 0;
      }
      
      return ascending ? comparison : -comparison;
    });
    
    return sorted;
  }
};

// ========================================
// ERROR BOUNDARY COMPONENT - ROBUST ERROR HANDLING
// ========================================

/**
 * Error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cat Tree Builder Error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // In a real app, you might want to send this to an error reporting service
    if (window.errorReporting) {
      window.errorReporting.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'min-h-screen bg-red-50 flex items-center justify-center p-4'
      }, [
        React.createElement('div', {
          key: 'error-container',
          className: 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full border-l-4 border-red-500'
        }, [
          React.createElement('div', {
            key: 'error-icon',
            className: 'text-red-500 text-4xl mb-4 text-center'
          }, '⚠️'),
          React.createElement('h2', {
            key: 'error-title',
            className: 'text-xl font-bold text-gray-900 mb-2 text-center'
          }, 'Something went wrong'),
          React.createElement('p', {
            key: 'error-message',
            className: 'text-gray-600 text-center mb-4'
          }, 'The cat tree builder encountered an unexpected error. Please refresh the page and try again.'),
          React.createElement('div', {
            key: 'error-actions',
            className: 'flex space-x-2'
          }, [
            React.createElement('button', {
              key: 'refresh-button',
              onClick: () => window.location.reload(),
              className: 'flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors'
            }, 'Refresh Page'),
            React.createElement('button', {
              key: 'details-button',
              onClick: () => this.setState({ showDetails: !this.state.showDetails }),
              className: 'flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded transition-colors'
            }, this.state.showDetails ? 'Hide Details' : 'Show Details')
          ]),
          this.state.showDetails && React.createElement('div', {
            key: 'error-details',
            className: 'mt-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 max-h-32 overflow-y-auto'
          }, [
            React.createElement('div', { key: 'error-name' }, `Error: ${this.state.error?.name || 'Unknown'}`),
            React.createElement('div', { key: 'error-message' }, `Message: ${this.state.error?.message || 'No details available'}`),
            this.state.errorInfo?.componentStack && React.createElement('div', { 
              key: 'component-stack' 
            }, `Component Stack: ${this.state.errorInfo.componentStack.slice(0, 200)}...`)
          ])
        ])
      ]);
    }

    return this.props.children;
  }
}

// ========================================
// UTILITY FUNCTIONS - GENERAL PURPOSE HELPERS
// ========================================

/**
 * General purpose utility functions
 */
const Utils = {
  
  /**
   * Generates a unique ID with optional prefix
   * @param {string} prefix - Optional prefix for the ID
   * @returns {string} Unique identifier
   */
  generateId: (prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Formats a number as currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency symbol
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount, currency = '$') => {
    return `${currency}${amount.toFixed(2)}`;
  },

  /**
   * Formats dimensions as a readable string
   * @param {number} width - Width in inches
   * @param {number} height - Height in inches
   * @param {number} depth - Depth in inches
   * @returns {string} Formatted dimensions
   */
  formatDimensions: (width, height, depth) => {
    return `${width}" × ${height}" × ${depth}"`;
  },

  /**
   * Downloads data as a JSON file
   * @param {any} data - Data to download
   * @param {string} filename - Filename for download
   */
  downloadJSON: (data, filename) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },

  /**
   * Reads a file as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File contents as text
   */
  readFileAsText: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
};

// ========================================
// EXPORTS - CENTRALIZED UTILITIES OBJECT
// ========================================

/**
 * Main SharedUtils export containing all utilities and components
 * This is the single source of truth for shared functionality
 */
window.SharedUtils = {
  // Constants
  COLORS,
  MOVEMENT,
  PERFORMANCE,
  
  // Validation
  PieceValidator,
  
  // Performance hooks
  useDebounced,
  useMemoizedStats,
  useThrottled,
  
  // UI Components
  IncrementSelector,
  MovementGrid,
  ActionButtonGrid,
  LoadingSpinner,
  EmptyState,
  Toast,
  
  // Three.js utilities
  useThreeJSCleanup,
  
  // Data utilities
  DataUtils,
  
  // Error handling
  ErrorBoundary,
  
  // General utilities
  Utils
};