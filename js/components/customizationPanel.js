// =====================================================
// CUSTOMIZATION PANEL COMPONENT -v1- PIECE PROPERTY EDITOR
// =====================================================

/**
 * Customization panel for editing piece properties, materials, colors, and openings
 * Provides comprehensive controls for modifying selected pieces
 */
const CustomizationPanel = ({ 
  selectedPiece, 
  showPanel, 
  onClose, 
  onUpdateCustomization, 
  openings, 
  onAddOpening, 
  onRemoveOpening, 
  onSelectOpening,
  flipPiece,
  canFlipPiece
}) => {
  const { useState, useEffect, useCallback, useMemo } = React;
  
  // ========================================
  // LOCAL STATE MANAGEMENT
  // ========================================
  const [activeTab, setActiveTab] = useState('properties');
  const [localDimensions, setLocalDimensions] = useState({
    width: 12,
    height: 12,
    depth: 12
  });
  const [localColor, setLocalColor] = useState(null);
  const [localMaterial, setLocalMaterial] = useState('wood');
  const [localTilt, setLocalTilt] = useState({ x: 0, z: 0 });
  const [localApexPosition, setLocalApexPosition] = useState(0.5);
  
  // ========================================
  // DERIVED STATE
  // ========================================
  
  /**
   * Get variant definition for selected piece
   */
  const variant = useMemo(() => {
    if (!selectedPiece) return null;
    return CatTreePieces.getVariantById(selectedPiece.variantId);
  }, [selectedPiece?.variantId]);
  
  /**
   * Get openings for selected piece
   */
  const pieceOpenings = useMemo(() => {
    if (!selectedPiece) return [];
    return openings.filter(o => o.parentPieceId === selectedPiece.id);
  }, [openings, selectedPiece?.id]);
  
  /**
   * Check if piece can be flipped
   */
  const canFlip = useMemo(() => {
    return selectedPiece && canFlipPiece && canFlipPiece(selectedPiece);
  }, [selectedPiece, canFlipPiece]);
  
  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Sync local state with selected piece
   */
  useEffect(() => {
    if (selectedPiece) {
      setLocalDimensions({
        width: selectedPiece.width || 12,
        height: selectedPiece.height || 12,
        depth: selectedPiece.depth || 12
      });
      setLocalColor(selectedPiece.color);
      setLocalMaterial(selectedPiece.material || 'wood');
      setLocalTilt({
        x: selectedPiece.tiltX || 0,
        z: selectedPiece.tiltZ || 0
      });
      setLocalApexPosition(selectedPiece.apexPosition || 0.5);
      
      // Reset to properties tab when new piece is selected
      setActiveTab('properties');
    }
  }, [selectedPiece]);
  
  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handle dimension changes
   */
  const handleDimensionChange = useCallback((dimension, value) => {
    const numValue = parseFloat(value) || 1;
    const clampedValue = Math.max(1, Math.min(dimension === 'height' ? 72 : 48, numValue));
    
    setLocalDimensions(prev => ({
      ...prev,
      [dimension]: clampedValue
    }));
    
    if (selectedPiece) {
      onUpdateCustomization(selectedPiece.id, {
        [dimension]: clampedValue
      });
    }
  }, [selectedPiece, onUpdateCustomization]);
  
  /**
   * Handle color selection
   */
  const handleColorChange = useCallback((color) => {
    const hexColor = parseInt(color.slice(1), 16);
    setLocalColor(hexColor);
    
    if (selectedPiece) {
      onUpdateCustomization(selectedPiece.id, { color: hexColor });
    }
  }, [selectedPiece, onUpdateCustomization]);
  
  /**
   * Handle material change
   */
  const handleMaterialChange = useCallback((material) => {
    setLocalMaterial(material);
    
    if (selectedPiece) {
      onUpdateCustomization(selectedPiece.id, { material });
    }
  }, [selectedPiece, onUpdateCustomization]);
  
  /**
   * Handle tilt changes for panels
   */
  const handleTiltChange = useCallback((axis, value) => {
    const radians = (parseFloat(value) || 0) * Math.PI / 180;
    const clampedRadians = Math.max(-Math.PI/2, Math.min(Math.PI/2, radians));
    
    setLocalTilt(prev => ({
      ...prev,
      [axis]: clampedRadians
    }));
    
    if (selectedPiece) {
      onUpdateCustomization(selectedPiece.id, {
        [`tilt${axis.toUpperCase()}`]: clampedRadians
      });
    }
  }, [selectedPiece, onUpdateCustomization]);
  
  /**
   * Handle apex position for triangular pieces
   */
  const handleApexChange = useCallback((value) => {
    const position = parseFloat(value) || 0.5;
    const clampedPosition = Math.max(0, Math.min(1, position));
    
    setLocalApexPosition(clampedPosition);
    
    if (selectedPiece) {
      onUpdateCustomization(selectedPiece.id, {
        apexPosition: clampedPosition
      });
    }
  }, [selectedPiece, onUpdateCustomization]);
  
  /**
   * Handle adding an opening
   */
  const handleAddOpening = useCallback((openingType) => {
    if (selectedPiece && selectedPiece.hollow) {
      onAddOpening(selectedPiece.id, openingType, 'front');
      setActiveTab('openings'); // Stay on openings tab after adding
    }
  }, [selectedPiece, onAddOpening]);
  
  /**
   * Handle piece flip
   */
  const handleFlip = useCallback(() => {
    if (selectedPiece && canFlip && flipPiece) {
      flipPiece(selectedPiece.id);
    }
  }, [selectedPiece, canFlip, flipPiece]);
  
  // ========================================
  // RENDER
  // ========================================
  
  if (!showPanel || !selectedPiece) {
    return React.createElement('div', {
      className: 'h-full flex items-center justify-center bg-gray-50 text-gray-500'
    }, [
      React.createElement('div', {
        key: 'empty-state',
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'text-4xl mb-2'
        }, '🎨'),
        React.createElement('div', {
          key: 'text',
          className: 'text-sm'
        }, 'Select a piece to customize')
      ])
    ]);
  }
  
  return React.createElement('div', {
    className: 'h-full flex flex-col bg-white overflow-hidden'
  }, [
    // ========================================
    // HEADER
    // ========================================
    React.createElement('div', {
      key: 'header',
      className: 'p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0'
    }, [
      React.createElement('div', {
        key: 'header-content',
        className: 'flex items-center justify-between'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-lg font-bold text-gray-800 flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '🎨'),
          React.createElement('span', { key: 'text' }, 'Customization')
        ]),
        React.createElement('button', {
          key: 'close',
          onClick: onClose,
          className: 'text-gray-400 hover:text-gray-600 transition-colors'
        }, '✕')
      ])
    ]),
    
    // ========================================
    // PIECE INFO
    // ========================================
    React.createElement('div', {
      key: 'piece-info',
      className: 'p-3 bg-blue-50 border-b border-blue-200 flex-shrink-0'
    }, [
      React.createElement('div', {
        key: 'name',
        className: 'font-medium text-blue-900 flex items-center space-x-2'
      }, [
        React.createElement('span', { key: 'icon' }, selectedPiece.hollow ? '🏠' : '📦'),
        React.createElement('span', { key: 'text' }, selectedPiece.name)
      ]),
      React.createElement('div', {
        key: 'details',
        className: 'text-sm text-blue-700 mt-1'
      }, [
        `${selectedPiece.width}" × ${selectedPiece.height}" × ${selectedPiece.depth}" • $${selectedPiece.cost}`,
        selectedPiece.locked && React.createElement('span', {
          key: 'locked',
          className: 'ml-2 text-red-600 font-medium'
        }, '🔒 Locked'),
        canFlip && React.createElement('span', {
          key: 'flippable',
          className: 'ml-2 text-orange-600'
        }, selectedPiece.flipped ? '📐 Vertical' : '📐 Horizontal')
      ])
    ]),
    
    // ========================================
    // TABS
    // ========================================
    React.createElement('div', {
      key: 'tabs',
      className: 'flex bg-gray-50 border-b border-gray-200 flex-shrink-0'
    }, [
      React.createElement('button', {
        key: 'properties-tab',
        onClick: () => setActiveTab('properties'),
        className: `flex-1 px-3 py-2 text-sm font-medium transition-all ${
          activeTab === 'properties'
            ? 'bg-white text-purple-600 border-b-2 border-purple-600'
            : 'text-gray-600 hover:text-gray-900'
        }`
      }, '📏 Properties'),
      React.createElement('button', {
        key: 'materials-tab',
        onClick: () => setActiveTab('materials'),
        className: `flex-1 px-3 py-2 text-sm font-medium transition-all ${
          activeTab === 'materials'
            ? 'bg-white text-purple-600 border-b-2 border-purple-600'
            : 'text-gray-600 hover:text-gray-900'
        }`
      }, '🎨 Materials'),
      selectedPiece.hollow && React.createElement('button', {
        key: 'openings-tab',
        onClick: () => setActiveTab('openings'),
        className: `flex-1 px-3 py-2 text-sm font-medium transition-all ${
          activeTab === 'openings'
            ? 'bg-white text-purple-600 border-b-2 border-purple-600'
            : 'text-gray-600 hover:text-gray-900'
        }`
      }, `🚪 Openings (${pieceOpenings.length})`)
    ]),
    
    // ========================================
    // TAB CONTENT
    // ========================================
    React.createElement('div', {
      key: 'tab-content',
      className: 'flex-1 overflow-y-auto p-4'
    }, [
      // ========================================
      // PROPERTIES TAB
      // ========================================
      activeTab === 'properties' && React.createElement('div', {
        key: 'properties-content',
        className: 'space-y-4'
      }, [
        // Dimensions
        React.createElement('div', {
          key: 'dimensions',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Dimensions (inches)'),
          ['width', 'height', 'depth'].map(dimension => 
            React.createElement('div', {
              key: dimension,
              className: 'flex items-center space-x-3'
            }, [
              React.createElement('label', {
                key: 'label',
                className: 'text-sm text-gray-600 w-16 capitalize'
              }, dimension + ':'),
              React.createElement('input', {
                key: 'input',
                type: 'number',
                min: 1,
                max: dimension === 'height' ? 72 : 48,
                value: localDimensions[dimension],
                onChange: (e) => handleDimensionChange(dimension, e.target.value),
                disabled: selectedPiece.locked,
                className: 'flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-100'
              }),
              React.createElement('span', {
                key: 'unit',
                className: 'text-xs text-gray-500'
              }, '"')
            ])
          )
        ]),
        
        // Panel Tilt Controls
        selectedPiece.shape?.includes('panel') && React.createElement('div', {
          key: 'tilt-controls',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Panel Tilt (degrees)'),
          React.createElement('div', {
            key: 'tilt-x',
            className: 'flex items-center space-x-3'
          }, [
            React.createElement('label', {
              key: 'label',
              className: 'text-sm text-gray-600 w-16'
            }, 'Tilt X:'),
            React.createElement('input', {
              key: 'input',
              type: 'range',
              min: -90,
              max: 90,
              value: (localTilt.x * 180 / Math.PI).toFixed(0),
              onChange: (e) => handleTiltChange('x', e.target.value),
              disabled: selectedPiece.locked,
              className: 'flex-1'
            }),
            React.createElement('span', {
              key: 'value',
              className: 'text-sm text-gray-700 w-12 text-right'
            }, `${(localTilt.x * 180 / Math.PI).toFixed(0)}°`)
          ]),
          React.createElement('div', {
            key: 'tilt-z',
            className: 'flex items-center space-x-3'
          }, [
            React.createElement('label', {
              key: 'label',
              className: 'text-sm text-gray-600 w-16'
            }, 'Tilt Z:'),
            React.createElement('input', {
              key: 'input',
              type: 'range',
              min: -90,
              max: 90,
              value: (localTilt.z * 180 / Math.PI).toFixed(0),
              onChange: (e) => handleTiltChange('z', e.target.value),
              disabled: selectedPiece.locked,
              className: 'flex-1'
            }),
            React.createElement('span', {
              key: 'value',
              className: 'text-sm text-gray-700 w-12 text-right'
            }, `${(localTilt.z * 180 / Math.PI).toFixed(0)}°`)
          ])
        ]),
        
        // Triangle Apex Position
        (selectedPiece.shape === 'triangle' || selectedPiece.shape === 'triangle-panel') && 
        React.createElement('div', {
          key: 'apex-control',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Triangle Apex Position'),
          React.createElement('div', {
            key: 'apex-slider',
            className: 'flex items-center space-x-3'
          }, [
            React.createElement('span', {
              key: 'left',
              className: 'text-xs text-gray-500'
            }, 'Left'),
            React.createElement('input', {
              key: 'input',
              type: 'range',
              min: 0,
              max: 1,
              step: 0.1,
              value: localApexPosition,
              onChange: (e) => handleApexChange(e.target.value),
              disabled: selectedPiece.locked,
              className: 'flex-1'
            }),
            React.createElement('span', {
              key: 'right',
              className: 'text-xs text-gray-500'
            }, 'Right')
          ])
        ]),
        
        // Platform Flip Control
        canFlip && React.createElement('div', {
          key: 'flip-control',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Platform Orientation'),
          React.createElement('button', {
            key: 'flip-button',
            onClick: handleFlip,
            disabled: selectedPiece.locked,
            className: `w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedPiece.locked
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
            }`
          }, selectedPiece.flipped ? '🔄 Flip to Horizontal' : '🔄 Flip to Vertical')
        ])
      ]),
      
      // ========================================
      // MATERIALS TAB
      // ========================================
      activeTab === 'materials' && React.createElement('div', {
        key: 'materials-content',
        className: 'space-y-4'
      }, [
        // Material Selection
        variant?.availableMaterials && React.createElement('div', {
          key: 'materials',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Material'),
          React.createElement('div', {
            key: 'material-buttons',
            className: 'grid grid-cols-2 gap-2'
          }, variant.availableMaterials.map(mat =>
            React.createElement('button', {
              key: mat,
              onClick: () => handleMaterialChange(mat),
              disabled: selectedPiece.locked,
              className: `p-2 rounded-lg text-sm font-medium transition-all ${
                localMaterial === mat
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`
            }, CatTreePieces.materials[mat]?.name || mat)
          ))
        ]),
        
        // Color Selection
        React.createElement('div', {
          key: 'colors',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Color'),
          React.createElement('div', {
            key: 'color-grid',
            className: 'grid grid-cols-4 gap-2'
          }, SharedUtils.COLORS.PALETTE.map(color =>
            React.createElement('button', {
              key: color,
              onClick: () => handleColorChange(color),
              disabled: selectedPiece.locked,
              className: `h-10 rounded-lg border-2 transition-all ${
                localColor === parseInt(color.slice(1), 16)
                  ? 'border-purple-500 shadow-md scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`,
              style: { backgroundColor: color }
            })
          ))
        ])
      ]),
      
      // ========================================
      // OPENINGS TAB
      // ========================================
      activeTab === 'openings' && selectedPiece.hollow && React.createElement('div', {
        key: 'openings-content',
        className: 'space-y-4'
      }, [
        // Add Opening Buttons
        pieceOpenings.length < 4 && React.createElement('div', {
          key: 'add-openings',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Add Opening'),
          React.createElement('div', {
            key: 'opening-buttons',
            className: 'grid grid-cols-2 gap-2'
          }, Object.entries(CatTreePieces.openingTypes).map(([typeId, type]) =>
            React.createElement('button', {
              key: typeId,
              onClick: () => handleAddOpening(typeId),
              disabled: selectedPiece.locked,
              className: 'p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            }, [
              React.createElement('div', {
                key: 'icon',
                className: 'text-lg mb-1'
              }, type.shape === 'circle' ? '⭕' : type.shape === 'arch' ? '🏛️' : '🚪'),
              React.createElement('div', {
                key: 'name',
                className: 'text-xs font-medium text-gray-700'
              }, type.name),
              React.createElement('div', {
                key: 'size',
                className: 'text-xs text-gray-500'
              }, `${type.width}" × ${type.height}"`)
            ])
          ))
        ]),
        
        // Existing Openings List
        pieceOpenings.length > 0 && React.createElement('div', {
          key: 'existing-openings',
          className: 'space-y-3'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-sm font-semibold text-gray-700'
          }, 'Existing Openings'),
          React.createElement('div', {
            key: 'openings-list',
            className: 'space-y-2'
          }, pieceOpenings.map(opening =>
            React.createElement('div', {
              key: opening.id,
              onClick: () => onSelectOpening(opening.id),
              className: 'p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all'
            }, [
              React.createElement('div', {
                key: 'opening-info',
                className: 'flex items-center justify-between'
              }, [
                React.createElement('div', {
                  key: 'details'
                }, [
                  React.createElement('div', {
                    key: 'name',
                    className: 'font-medium text-gray-700'
                  }, opening.name),
                  React.createElement('div', {
                    key: 'face',
                    className: 'text-xs text-gray-500'
                  }, `${opening.face} face • ${opening.width}" × ${opening.height}"`)
                ]),
                React.createElement('button', {
                  key: 'remove',
                  onClick: (e) => {
                    e.stopPropagation();
                    onRemoveOpening(opening.id);
                  },
                  className: 'text-red-500 hover:text-red-700 text-sm'
                }, '✕')
              ])
            ])
          ))
        ]),
        
        // Maximum openings reached message
        pieceOpenings.length >= 4 && React.createElement('div', {
          key: 'max-openings',
          className: 'p-3 bg-yellow-50 border border-yellow-200 rounded-lg'
        }, [
          React.createElement('p', {
            key: 'message',
            className: 'text-sm text-yellow-700'
          }, '⚠️ Maximum 4 openings per piece reached')
        ])
      ])
    ])
  ]);
};