// =====================================================
// UNIFIED MOVEMENT CONTROLS COMPONENT -v16- FIXED HOOKS ORDER
// =====================================================

/**
 * Unified editing controls for pieces, groups, and openings
 * Provides movement, rotation, flip, and action controls based on current selection
 */
const PieceEditingControls = ({ 
  pieces, 
  selectedPiece, 
  selectedGroup, 
  selectedOpening, 
  openings, 
  onMovePiece, 
  onMoveGroup, 
  onRotatePiece, 
  onDeletePiece, 
  onDuplicatePiece,
  movementIncrement, 
  setMovementIncrement, 
  onRotateGroup, 
  onRemoveOpening, 
  onMoveOpening, 
  onChangeOpeningFace, 
  selectOpening,
  onUpdateCustomization,
  flipPiece,        // Function to flip pieces
  canFlipPiece      // Function to check if piece can be flipped
}) => {
  const { useCallback, useMemo } = React;

  // ========================================
  // MEMOIZED CALCULATIONS - PERFORMANCE OPTIMIZATION
  // ========================================
  
  /**
   * Calculates the highest point in the design for stacking operations
   */
  const highestPoint = useMemo(() => {
    return pieces.reduce((max, p) => Math.max(max, p.y + p.height), 0);
  }, [pieces]);

  /**
   * Checks if the selected piece can be flipped
   */
  const canFlip = useMemo(() => {
    return selectedPiece && canFlipPiece && canFlipPiece(selectedPiece);
  }, [selectedPiece, canFlipPiece]);

  // ========================================
  // MEMOIZED ACTION HANDLERS - PREVENT RE-RENDERS
  // ========================================
  
  /**
   * Handles piece stacking to highest point
   */
  const handlePieceStack = useCallback(() => {
    if (selectedPiece) {
      onMovePiece(selectedPiece.id, 'custom', { y: highestPoint });
    }
  }, [selectedPiece, onMovePiece, highestPoint]);

  /**
   * Handles group stacking to highest point
   */
  const handleGroupStack = useCallback(() => {
    if (selectedGroup) {
      onMoveGroup(selectedGroup.id, 'custom', { y: highestPoint });
    }
  }, [selectedGroup, onMoveGroup, highestPoint]);

  /**
   * Handles piece flip toggle
   */
  const handlePieceFlip = useCallback(() => {
    if (selectedPiece && canFlip && flipPiece) {
      flipPiece(selectedPiece.id);
    }
  }, [selectedPiece, canFlip, flipPiece]);

  // ========================================
  // OPENING MOVEMENT CONTROLS - MOVED OUTSIDE CONDITIONAL
  // ========================================
  
  /**
   * Generates movement controls based on opening face orientation
   * Different faces have different movement axes available
   * FIXED: Moved outside conditional to respect hooks rules
   */
  const getOpeningMovementControls = useCallback((face, opening) => {
    if (!opening || !onMoveOpening) return {};
    
    const baseHandlers = {
      center: () => onMoveOpening(opening.id, 0, 0, 0)
    };

    switch (face) {
      case 'front':
      case 'back':
        // Front/back faces: X (left/right) and Y (up/down) movement
        return {
          ...baseHandlers,
          up: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY + movementIncrement, opening.offsetZ),
          down: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY - movementIncrement, opening.offsetZ),
          left: () => onMoveOpening(opening.id, opening.offsetX - movementIncrement, opening.offsetY, opening.offsetZ),
          right: () => onMoveOpening(opening.id, opening.offsetX + movementIncrement, opening.offsetY, opening.offsetZ)
        };
      
      case 'left':
      case 'right':
        // Left/right faces: Z (forward/back) and Y (up/down) movement
        return {
          ...baseHandlers,
          up: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY + movementIncrement, opening.offsetZ),
          down: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY - movementIncrement, opening.offsetZ),
          forward: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY, opening.offsetZ - movementIncrement),
          back: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY, opening.offsetZ + movementIncrement)
        };
      
      case 'top':
      case 'bottom':
        // Top/bottom faces: X (left/right) and Z (forward/back) movement
        return {
          ...baseHandlers,
          forward: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY, opening.offsetZ - movementIncrement),
          back: () => onMoveOpening(opening.id, opening.offsetX, opening.offsetY, opening.offsetZ + movementIncrement),
          left: () => onMoveOpening(opening.id, opening.offsetX - movementIncrement, opening.offsetY, opening.offsetZ),
          right: () => onMoveOpening(opening.id, opening.offsetX + movementIncrement, opening.offsetY, opening.offsetZ)
        };
      
      default:
        return baseHandlers;
    }
  }, [onMoveOpening, movementIncrement]);

  // ========================================
  // OPENING CONTROLS - SPECIALIZED INTERFACE FOR OPENING MANAGEMENT
  // ========================================
  if (selectedOpening) {
    const parentPiece = pieces.find(p => p.id === selectedOpening.parentPieceId);
    
    // Now we can safely use the memoized function that was defined outside the conditional
    const movementHandlers = getOpeningMovementControls(selectedOpening.face, selectedOpening);
    
    /**
     * Custom movement grid component for opening face-specific controls
     * @param {Object} handlers - Movement handler functions
     * @param {boolean} disabled - Whether controls are disabled
     */
    const OpeningMovementGrid = ({ handlers, disabled }) => {
      const face = selectedOpening.face;
      let controls = [];
      
      // Configure grid layout based on face orientation
      if (face === 'front' || face === 'back') {
        controls = [
          { key: 'spacer1', content: '' },
          { key: 'up', content: '↑', onClick: handlers.up },
          { key: 'spacer2', content: '' },
          { key: 'left', content: '←', onClick: handlers.left },
          { key: 'center', content: '⊙', onClick: handlers.center },
          { key: 'right', content: '→', onClick: handlers.right },
          { key: 'spacer3', content: '' },
          { key: 'down', content: '↓', onClick: handlers.down },
          { key: 'spacer4', content: '' }
        ];
      } else if (face === 'left' || face === 'right') {
        controls = [
          { key: 'spacer1', content: '' },
          { key: 'up', content: '↑', onClick: handlers.up },
          { key: 'spacer2', content: '' },
          { key: 'forward', content: '←', onClick: handlers.forward },
          { key: 'center', content: '⊙', onClick: handlers.center },
          { key: 'back', content: '→', onClick: handlers.back },
          { key: 'spacer3', content: '' },
          { key: 'down', content: '↓', onClick: handlers.down },
          { key: 'spacer4', content: '' }
        ];
      } else { // top or bottom
        controls = [
          { key: 'spacer1', content: '' },
          { key: 'forward', content: '↑', onClick: handlers.forward },
          { key: 'spacer2', content: '' },
          { key: 'left', content: '←', onClick: handlers.left },
          { key: 'center', content: '⊙', onClick: handlers.center },
          { key: 'right', content: '→', onClick: handlers.right },
          { key: 'spacer3', content: '' },
          { key: 'back', content: '↓', onClick: handlers.back },
          { key: 'spacer4', content: '' }
        ];
      }
      
      return React.createElement('div', {
        className: 'grid grid-cols-3 gap-1'
      }, controls.map(control => 
        control.content ? React.createElement('button', {
          key: control.key,
          onClick: control.onClick,
          disabled,
          className: 'bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        }, control.content) : React.createElement('div', { key: control.key })
      ));
    };

    // ========================================
    // OPENING CONTROLS RENDER
    // ========================================
    return React.createElement('div', {
      className: 'space-y-4'
    }, [
      // Opening Header Section
      React.createElement('div', {
        key: 'header',
        className: 'text-center bg-green-50 rounded-lg p-3 border border-green-200'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-medium text-green-700 flex items-center justify-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '🚪'),
          React.createElement('span', { key: 'name' }, selectedOpening.name)
        ]),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-sm text-gray-600 mt-1'
        }, [
          `On ${parentPiece?.name || 'Unknown'} • ${selectedOpening.face} face`,
          React.createElement('br', { key: 'br' }),
          React.createElement('span', {
            key: 'status',
            className: selectedOpening.locked ? 'text-red-600 font-medium' : 'text-green-600'
          }, selectedOpening.locked ? '🔒 Locked' : '🔓 Unlocked')
        ])
      ]),

      // Opening Controls (only when unlocked)
      !selectedOpening.locked && React.createElement('div', {
        key: 'controls',
        className: 'space-y-4'
      }, [
        // Movement increment selector
        React.createElement(SharedUtils.IncrementSelector, {
          key: 'increment',
          value: movementIncrement,
          onChange: setMovementIncrement,
          colorClass: 'green',
          label: 'Move:'
        }),

        // Face selection and movement controls
        React.createElement('div', {
          key: 'controls-row',
          className: 'flex items-start justify-center space-x-4'
        }, [
          // Face Selection Panel
          React.createElement('div', {
            key: 'face-selection',
            className: 'bg-green-50 rounded-lg p-3 border border-green-200'
          }, [
            React.createElement('div', {
              key: 'face-label',
              className: 'text-xs font-medium text-gray-700 mb-2 text-center'
            }, 'Opening Face'),
            React.createElement('div', {
              key: 'face-buttons',
              className: 'grid grid-cols-2 gap-1'
            }, ['front', 'back', 'left', 'right', 'top', 'bottom'].map(face =>
              React.createElement('button', {
                key: `face-button-${face}`,
                onClick: () => onChangeOpeningFace(selectedOpening.id, face),
                className: `px-2 py-1 rounded text-xs font-medium capitalize transition-colors ${
                  selectedOpening.face === face
                    ? 'bg-green-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                }`
              }, face)
            ))
          ]),

          // Movement Controls Panel
          React.createElement('div', {
            key: 'movement-section',
            className: 'bg-gray-50 rounded-lg p-3 border border-gray-200'
          }, [
            React.createElement('div', {
              key: 'movement-label',
              className: 'text-xs font-medium text-gray-700 text-center mb-2'
            }, 'Adjust Position on Face'),
            
            React.createElement(OpeningMovementGrid, {
              key: 'movement-grid',
              handlers: movementHandlers,
              disabled: selectedOpening.locked
            })
          ])
        ]),

        // Action Buttons
        React.createElement('div', {
          key: 'actions',
          className: 'flex justify-center'
        }, [
          React.createElement('button', {
            key: 'delete',
            onClick: () => onRemoveOpening(selectedOpening.id),
            className: 'px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg text-sm transition-colors'
          }, '🗑️ Delete Opening')
        ])
      ]),

      // Locked Opening Notice
      selectedOpening.locked && React.createElement('div', {
        key: 'lock-notice',
        className: 'text-center bg-red-50 rounded-lg p-4 border border-red-200'
      }, [
        React.createElement('p', {
          key: 'lock-message',
          className: 'text-sm text-red-600 font-medium flex items-center justify-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '🔒'),
          React.createElement('span', { key: 'text' }, 'This opening is locked. Unlock it in the Parts List to move it.')
        ])
      ])
    ]);
  }

  // ========================================
  // GROUP CONTROLS - COORDINATED MULTI-PIECE MANAGEMENT
  // ========================================
  if (selectedGroup) {
    const groupPieces = pieces.filter(p => p.groupId === selectedGroup.id);
    
    /**
     * Action buttons configuration for group operations
     */
    const groupActionButtons = [
      {
        key: 'ground',
        content: '🏠 Ground',
        onClick: () => onMoveGroup(selectedGroup.id, 'ground'),
        color: 'yellow',
        description: 'Move group to ground level'
      },
      {
        key: 'stack',
        content: '🔝 Stack',
        onClick: handleGroupStack,
        color: 'green',
        description: 'Stack group on top of existing pieces'
      },
      {
        key: 'rotate-left',
        content: '↺ -15°',
        onClick: () => onRotateGroup(selectedGroup.id, -15),
        color: 'blue',
        description: 'Rotate group counter-clockwise'
      },
      {
        key: 'rotate-right',
        content: '↻ +15°',
        onClick: () => onRotateGroup(selectedGroup.id, 15),
        color: 'blue',
        description: 'Rotate group clockwise'
      }
    ];

    // ========================================
    // GROUP CONTROLS RENDER
    // ========================================
    return React.createElement('div', {
      className: 'space-y-4'
    }, [
      // Group Header Section
      React.createElement('div', {
        key: 'header',
        className: 'text-center bg-purple-50 rounded-lg p-3 border border-purple-200'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-medium text-purple-700 flex items-center justify-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '📦'),
          React.createElement('span', { key: 'name' }, selectedGroup.name)
        ]),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-sm text-gray-600 mt-1'
        }, [
          `${groupPieces.length} pieces • $${groupPieces.reduce((sum, p) => sum + p.cost, 0)}`,
          React.createElement('br', { key: 'br' }),
          React.createElement('span', {
            key: 'status',
            className: selectedGroup.locked ? 'text-red-600 font-medium' : 'text-purple-600'
          }, selectedGroup.locked ? '🔒 Locked' : '🔓 Unlocked')
        ])
      ]),

      // Group Controls (only when unlocked)
      !selectedGroup.locked && React.createElement('div', {
        key: 'controls',
        className: 'space-y-4'
      }, [
        // Movement increment selector
        React.createElement(SharedUtils.IncrementSelector, {
          key: 'increment',
          value: movementIncrement,
          onChange: setMovementIncrement,
          colorClass: 'purple',
          label: 'Move:'
        }),

        // Movement and action controls
        React.createElement('div', {
          key: 'compact-controls',
          className: 'flex items-center justify-center space-x-6'
        }, [
          // Movement Grid
          React.createElement('div', {
            key: 'movement-section',
            className: 'text-center'
          }, [
            React.createElement('div', {
              key: 'movement-label',
              className: 'text-xs font-medium text-gray-700 mb-2'
            }, 'Move Group'),
            React.createElement(SharedUtils.MovementGrid, {
              key: 'movement-grid',
              onMove: (direction) => onMoveGroup(selectedGroup.id, direction),
              onCenter: () => onMoveGroup(selectedGroup.id, 'center'),
              disabled: selectedGroup.locked,
              colorClass: 'purple',
              type: 'group'
            })
          ]),

          // Action Buttons
          React.createElement('div', {
            key: 'actions-section',
            className: 'text-center'
          }, [
            React.createElement('div', {
              key: 'actions-label',
              className: 'text-xs font-medium text-gray-700 mb-2'
            }, 'Group Actions'),
            React.createElement(SharedUtils.ActionButtonGrid, {
              key: 'action-buttons',
              buttons: groupActionButtons,
              columns: 2
            })
          ])
        ])
      ]),

      // Locked Group Notice
      selectedGroup.locked && React.createElement('div', {
        key: 'lock-notice',
        className: 'text-center bg-red-50 rounded-lg p-4 border border-red-200'
      }, [
        React.createElement('p', {
          key: 'lock-message',
          className: 'text-sm text-red-600 font-medium flex items-center justify-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '🔒'),
          React.createElement('span', { key: 'text' }, 'This group is locked. Unlock it in the Parts List to move it.')
        ])
      ])
    ]);
  }

  // ========================================
  // NO SELECTION STATE - HELPFUL GUIDANCE
  // ========================================
  if (!selectedPiece) {
    return React.createElement(SharedUtils.EmptyState, {
      icon: '🎯',
      title: 'No Selection',
      subtitle: 'Select a piece, group, or opening to control it',
      children: React.createElement('div', {
        className: 'mt-4 text-xs text-gray-500 space-y-1'
      }, [
        React.createElement('p', { key: 'hint1' }, '• Click on pieces in the 3D view to select them'),
        React.createElement('p', { key: 'hint2' }, '• Use the Parts List to select groups or openings'),
        React.createElement('p', { key: 'hint3' }, '• Drag pieces directly in the 3D view to move them')
      ])
    });
  }

  // ========================================
  // GROUPED PIECE NOTICE - REDIRECT TO GROUP CONTROLS
  // ========================================
  if (selectedPiece.groupId) {
    const parentGroup = pieces.filter(p => p.groupId === selectedPiece.groupId);
    
    return React.createElement('div', {
      className: 'text-center py-6 bg-purple-50 rounded-lg border border-purple-200'
    }, [
      React.createElement('div', {
        key: 'grouped-notice',
        className: 'text-purple-600 space-y-2'
      }, [
        React.createElement('div', {
          key: 'icon-name',
          className: 'text-lg'
        }, [
          React.createElement('span', { key: 'icon' }, '🔗'),
          React.createElement('span', { key: 'text' }, ` ${selectedPiece.name}`)
        ]),
        React.createElement('p', {
          key: 'status',
          className: 'text-sm font-medium'
        }, 'is part of a group'),
        React.createElement('p', {
          key: 'instruction',
          className: 'text-xs text-gray-600'
        }, [
          `This piece is grouped with ${parentGroup.length - 1} other${parentGroup.length > 2 ? 's' : ''}`,
          React.createElement('br', { key: 'br' }),
          'Select the group in the Parts List to move all pieces together'
        ])
      ])
    ]);
  }

  // ========================================
  // INDIVIDUAL PIECE CONTROLS - FULL FEATURE SET
  // ========================================

  /**
   * Standard piece action buttons with flip support
   */
  const pieceActionButtons = [
    {
      key: 'ground',
      content: '🏠 Ground',
      onClick: () => onMovePiece(selectedPiece.id, 'ground'),
      color: 'yellow'
    },
    {
      key: 'stack',
      content: '🔝 Stack',
      onClick: handlePieceStack,
      color: 'green'
    },
    {
      key: 'rotate-left',
      content: '↺ -15°',
      onClick: () => onRotatePiece(selectedPiece.id, -15),
      color: 'purple'
    },
    {
      key: 'rotate-right',
      content: '↻ +15°',
      onClick: () => onRotatePiece(selectedPiece.id, 15),
      color: 'purple'
    },
    // Flip button (only for platforms)
    ...(canFlip ? [{
      key: 'flip',
      content: selectedPiece.flipped ? '🔄 Horizontal' : '🔄 Vertical',
      onClick: handlePieceFlip,
      color: 'orange',
      description: `Flip to ${selectedPiece.flipped ? 'horizontal' : 'vertical'} orientation`
    }] : []),
    {
      key: 'duplicate',
      content: '📋 Copy',
      onClick: () => onDuplicatePiece(selectedPiece.id),
      color: 'green'
    },
    {
      key: 'delete',
      content: '🗑️ Delete',
      onClick: () => onDeletePiece(selectedPiece.id),
      color: 'red'
    }
  ];

  // ========================================
  // INDIVIDUAL PIECE CONTROLS RENDER
  // ========================================
  return React.createElement('div', {
    className: 'space-y-4'
  }, [
    // Piece Header Section with Enhanced Info
    React.createElement('div', {
      key: 'header',
      className: 'text-center bg-blue-50 rounded-lg p-3 border border-blue-200'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'font-medium text-blue-700 flex items-center justify-center space-x-2'
      }, [
        React.createElement('span', { key: 'icon' }, selectedPiece.hollow ? '🏠' : '📦'),
        React.createElement('span', { key: 'name' }, selectedPiece.name)
      ]),
      React.createElement('div', {
        key: 'details',
        className: 'text-sm text-gray-600 mt-1 space-y-1'
      }, [
        React.createElement('p', {
          key: 'dimensions'
        }, `${selectedPiece.width}" × ${selectedPiece.height}" × ${selectedPiece.depth}"`),
        // Show flip status for platforms
        canFlip && React.createElement('p', {
          key: 'orientation',
          className: 'text-xs text-orange-600 font-medium'
        }, selectedPiece.flipped ? '📐 Standing Vertical' : '📐 Laying Horizontal'),
        React.createElement('p', {
          key: 'status-cost',
          className: 'flex items-center justify-center space-x-4'
        }, [
          React.createElement('span', {
            key: 'status',
            className: selectedPiece.locked ? 'text-red-600 font-medium' : 'text-blue-600'
          }, selectedPiece.locked ? '🔒 Locked' : '🔓 Unlocked'),
          React.createElement('span', {
            key: 'cost',
            className: 'text-green-600 font-medium'
          }, `$${selectedPiece.cost}`)
        ])
      ])
    ]),

    // Piece Controls (only when unlocked)
    !selectedPiece.locked && React.createElement('div', {
      key: 'controls',
      className: 'space-y-4'
    }, [
      // Movement increment selector
      React.createElement(SharedUtils.IncrementSelector, {
        key: 'increment',
        value: movementIncrement,
        onChange: setMovementIncrement,
        colorClass: 'blue',
        label: 'Move:'
      }),

      // Movement and action controls
      React.createElement('div', {
        key: 'compact-controls',
        className: 'flex items-center justify-center space-x-6'
      }, [
        // Movement Grid
        React.createElement('div', {
          key: 'movement-section',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'movement-label',
            className: 'text-xs font-medium text-gray-700 mb-2'
          }, 'Move Piece'),
          React.createElement(SharedUtils.MovementGrid, {
            key: 'movement-grid',
            onMove: (direction) => onMovePiece(selectedPiece.id, direction),
            onCenter: () => onMovePiece(selectedPiece.id, 'center'),
            disabled: selectedPiece.locked,
            colorClass: 'blue',
            type: 'piece'
          })
        ]),

        // Action Buttons (now includes flip for platforms)
        React.createElement('div', {
          key: 'actions-section',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'actions-label',
            className: 'text-xs font-medium text-gray-700 mb-2'
          }, 'Piece Actions'),
          React.createElement(SharedUtils.ActionButtonGrid, {
            key: 'action-buttons',
            buttons: pieceActionButtons,
            columns: canFlip ? 3 : 2  // Use 3 columns when flip button is present
          })
        ])
      ])
    ]),

    // Panel Rotation Notice
    selectedPiece.shape?.includes('panel') && React.createElement('div', {
      key: 'panel-notice',
      className: 'text-center bg-yellow-50 rounded-lg p-3 border border-yellow-200'
    }, [
      React.createElement('p', {
        key: 'panel-message',
        className: 'text-xs text-yellow-700 flex items-center justify-center space-x-1'
      }, [
        React.createElement('span', { key: 'icon' }, '📐'),
        React.createElement('span', { key: 'text' }, 'Panel rotates from top edge. Use rotation controls to adjust angle.')
      ])
    ]),

    // Platform Flip Notice
    canFlip && React.createElement('div', {
      key: 'flip-notice',
      className: 'text-center bg-orange-50 rounded-lg p-3 border border-orange-200'
    }, [
      React.createElement('p', {
        key: 'flip-message',
        className: 'text-xs text-orange-700 flex items-center justify-center space-x-1'
      }, [
        React.createElement('span', { key: 'icon' }, '🔄'),
        React.createElement('span', { key: 'text' }, 'Platform can be flipped between horizontal and vertical orientations.')
      ])
    ]),

    // Customization Hint
    React.createElement('div', {
      key: 'customization-hint',
      className: 'text-center bg-purple-50 rounded-lg p-3 border border-purple-200'
    }, [
      React.createElement('p', {
        key: 'hint-text',
        className: 'text-xs text-purple-700 flex items-center justify-center space-x-1'
      }, [
        React.createElement('span', { key: 'icon' }, '💡'),
        React.createElement('span', { key: 'text' }, 'Use the Customization Panel to change materials, colors, and dimensions')
      ])
    ]),

    // Locked Piece Notice
    selectedPiece.locked && React.createElement('div', {
      key: 'lock-notice',
      className: 'text-center bg-red-50 rounded-lg p-4 border border-red-200'
    }, [
      React.createElement('p', {
        key: 'lock-message',
        className: 'text-sm text-red-600 font-medium flex items-center justify-center space-x-2'
      }, [
        React.createElement('span', { key: 'icon' }, '🔒'),
        React.createElement('span', { key: 'text' }, 'This piece is locked. Unlock it in the Parts List to move it.')
      ])
    ])
  ]);
};