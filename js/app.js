// =====================================================
// MAIN APPLICATION COMPONENT -v13- WITH STRESS VISUALIZATION SYSTEM
// =====================================================

/**
 * Main Cat Tree Builder application component
 * Orchestrates the entire design interface including toolbox, canvas, and controls
 * Provides fixed layout with internal scrolling for sidebars to keep canvas centered
 */
const CatTreeBuilder = () => {
  const { useState } = React;
  
  // ========================================
  // CORE STATE MANAGEMENT - UI LAYOUT & WORKSPACE
  // ========================================
  
  // Modal States
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Workspace Configuration
  const [gridWidth, setGridWidth] = useState(6); // 6 feet default
  const [gridHeight, setGridHeight] = useState(6); // 6 feet default
  
  // Toolbox State
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Stress test panel state
  const [showStressPanel, setShowStressPanel] = useState(false);
  const [catWeights, setCatWeights] = useState([15]); // Default 15lb cat
  const [showStressVisualization, setShowStressVisualization] = useState(false); // NEW: Control stress colors

  // ========================================
  // PIECE MANAGEMENT HOOK - CENTRAL DATA MANAGEMENT
  // ========================================
  
  /**
   * Main piece management hook providing all design functionality
   * Handles pieces, groups, openings, and all related operations
   */
  const {
    // Core Data Arrays
    pieces,
    selectedPiece,
    movementIncrement,
    groups,
    selectedGroup,
    openings,
    selectedOpening,
    showCustomizationPanel,
    
    // Piece Operations
    addPieceFromVariant,
    selectPiece,
    movePiece,
    dragPiece,
    rotatePiece,
    deletePiece,
    clearAllPieces,
    getDesignStats,
    setMovementIncrement,
    updatePieceDimensions,
    duplicatePiece,
    saveDesign,
    loadDesign,
    togglePieceLock,
    flipPiece,        // NEW: Platform flip functionality
    canFlipPiece,     // NEW: Check if piece can be flipped
    
    // Group Operations
    createGroup,
    ungroupPieces,
    selectGroup,
    moveGroup,
    toggleGroupLock,
    rotateGroup,
    
    // Opening Operations
    addOpening,
    removeOpening,
    moveOpening,
    selectOpening,
    toggleOpeningLock,
    changeOpeningFace,
    
    // Customization Operations
    updatePieceCustomization,
    closeCustomizationPanel,
    openCustomizationPanel
  } = usePieceManagement();

  // ========================================
  // EVENT HANDLERS - FILE & DESIGN MANAGEMENT
  // ========================================
  
  /**
   * Handles file upload for loading saved designs
   * @param {Event} event - File input change event
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`📁 Loading design file: ${file.name}`);
      loadDesign(file);
    }
  };

  /**
   * Handles design save operation with optional name
   * @param {string} designName - Name for the saved design
   */
  const handleSaveDesign = (designName) => {
    console.log(`💾 Saving design: ${designName || 'My Cat Tree'}`);
    saveDesign(designName || 'My Cat Tree');
  };

  /**
   * Handles opening click events from the 3D canvas
   * @param {string} openingId - ID of the clicked opening
   */
  const handleOpeningClick = (openingId) => {
    console.log(`🚪 Opening clicked: ${openingId}`);
    selectOpening(openingId);
  };

  /**
   * Handles stress test panel opening with visualization toggle
   */
  const handleStressTest = () => {
    console.log('⚖️ Opening stress test panel with visualization');
    setShowStressPanel(true);
    setShowStressVisualization(true);  // Turn on stress colors when panel opens
  };

  /**
   * Handles stress test panel closing
   */
  const handleStressTestClose = () => {
    console.log('⚖️ Closing stress test panel');
    setShowStressPanel(false);
    setShowStressVisualization(false);  // Turn off stress colors when panel closes
  };

  /**
   * Validates and clamps grid dimension input
   * @param {number} value - Input value to validate
   * @returns {number} Clamped value within valid range
   */
  const validateGridDimension = (value) => {
    const numValue = parseInt(value) || SharedUtils.MOVEMENT.MIN_GRID_SIZE;
    return Math.max(
      SharedUtils.MOVEMENT.MIN_GRID_SIZE, 
      Math.min(SharedUtils.MOVEMENT.MAX_GRID_SIZE, numValue)
    );
  };

  /**
   * Handles grid width changes with validation
   * @param {Event} e - Input change event
   */
  const handleGridWidthChange = (e) => {
    const validatedValue = validateGridDimension(e.target.value);
    setGridWidth(validatedValue);
  };

  /**
   * Handles grid height changes with validation
   * @param {Event} e - Input change event
   */
  const handleGridHeightChange = (e) => {
    const validatedValue = validateGridDimension(e.target.value);
    setGridHeight(validatedValue);
  };

  // ========================================
  // COMPUTED VALUES - DESIGN STATISTICS
  // ========================================
  
  /**
   * Gets current design statistics using memoized calculations
   */
  const stats = getDesignStats();

  // ========================================
  // UI COMPONENTS - REUSABLE INTERFACE ELEMENTS
  // ========================================
  
  /**
   * Renders the enhanced header with stats and controls
   * @returns {React.Element} Header component
   */
  const renderEnhancedHeader = () => {
    return React.createElement('div', {
      key: 'header',
      className: 'bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40'
    }, [
      React.createElement('div', {
        key: 'header-content',
        className: 'max-w-full mx-auto px-4 py-3'
      }, [
        React.createElement('div', {
          key: 'header-layout',
          className: 'flex items-center justify-between'
        }, [
          // ========================================
          // TITLE AND QUICK STATS SECTION
          // ========================================
          React.createElement('div', {
            key: 'title-stats',
            className: 'flex items-center space-x-6'
          }, [
            // Main Title
            React.createElement('div', {
              key: 'title'
            }, [
              React.createElement('h1', {
                key: 'main-title',
                className: 'text-2xl font-bold text-gray-900'
              }, '🗂️ Cat Tree Builder'),
              React.createElement('p', {
                key: 'subtitle',
                className: 'text-sm text-gray-600'
              }, 'Design custom cat furniture with precision')
            ]),
            
            // Quick Stats Bar with Live Updates
            React.createElement('div', {
              key: 'quick-stats',
              className: 'flex items-center space-x-4 text-sm bg-gray-50 rounded-lg px-4 py-2'
            }, [
              // Pieces Count
              React.createElement('div', {
                key: 'pieces-count',
                className: 'flex items-center space-x-1'
              }, [
                React.createElement('span', { key: 'icon' }, '📦'),
                React.createElement('span', { 
                  key: 'count', 
                  className: 'font-medium',
                  title: `${pieces.length} total pieces in design`
                }, pieces.length)
              ]),
              // Openings Count
              React.createElement('div', {
                key: 'openings-count',
                className: 'flex items-center space-x-1'
              }, [
                React.createElement('span', { key: 'icon' }, '🚪'),
                React.createElement('span', { 
                  key: 'count', 
                  className: 'font-medium',
                  title: `${openings.length} openings on hollow pieces`
                }, openings.length)
              ]),
              // Total Cost
              React.createElement('div', {
                key: 'cost',
                className: 'flex items-center space-x-1'
              }, [
                React.createElement('span', { key: 'icon' }, '💰'),
                React.createElement('span', { 
                  key: 'amount', 
                  className: 'font-medium text-green-600',
                  title: `Total estimated cost: $${stats.totalCost}`
                }, `$${stats.totalCost}`)
              ]),
              // Maximum Height
              React.createElement('div', {
                key: 'height',
                className: 'flex items-center space-x-1'
              }, [
                React.createElement('span', { key: 'icon' }, '📏'),
                React.createElement('span', { 
                  key: 'height', 
                  className: 'font-medium',
                  title: `Tallest point in design: ${stats.maxHeight} inches`
                }, `${stats.maxHeight}"`)
              ])
            ])
          ]),

          // ========================================
          // CONTROLS SECTION - GRID & ACTIONS
          // ========================================
          React.createElement('div', {
            key: 'controls-section',
            className: 'flex items-center space-x-4'
          }, [
            // Grid Dimension Controls
            React.createElement('div', {
              key: 'grid-controls',
              className: 'flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border'
            }, [
              React.createElement('span', {
                key: 'label',
                className: 'text-sm font-medium text-gray-700',
                title: 'Workspace dimensions in feet'
              }, '📐'),
              // Width Input
              React.createElement('input', {
                key: 'width-input',
                type: 'number',
                min: SharedUtils.MOVEMENT.MIN_GRID_SIZE,
                max: SharedUtils.MOVEMENT.MAX_GRID_SIZE,
                value: gridWidth,
                onChange: handleGridWidthChange,
                className: 'w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500',
                title: `Workspace width (${SharedUtils.MOVEMENT.MIN_GRID_SIZE}-${SharedUtils.MOVEMENT.MAX_GRID_SIZE} feet)`
              }),
              React.createElement('span', { key: 'x', className: 'text-gray-500' }, '×'),
              // Height Input
              React.createElement('input', {
                key: 'height-input',
                type: 'number',
                min: SharedUtils.MOVEMENT.MIN_GRID_SIZE,
                max: SharedUtils.MOVEMENT.MAX_GRID_SIZE,
                value: gridHeight,
                onChange: handleGridHeightChange,
                className: 'w-12 px-1 py-1 text-xs border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500',
                title: `Workspace depth (${SharedUtils.MOVEMENT.MIN_GRID_SIZE}-${SharedUtils.MOVEMENT.MAX_GRID_SIZE} feet)`
              }),
              React.createElement('span', { key: 'feet', className: 'text-xs text-gray-600' }, 'ft')
            ]),

            // ========================================
            // ACTION BUTTONS - SAVE/LOAD/CLEAR/STRESS
            // ========================================
            React.createElement('div', {
              key: 'action-buttons',
              className: 'flex items-center space-x-2'
            }, [
              // Save Design Button
              React.createElement('button', {
                key: 'save',
                onClick: () => setShowSaveModal(true),
                disabled: pieces.length === 0,
                className: `px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                  pieces.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`,
                title: pieces.length === 0 ? 'Add pieces to save design' : 'Save current design to file'
              }, [
                React.createElement('span', { key: 'icon' }, '💾'),
                React.createElement('span', { key: 'text' }, 'Save')
              ]),
              
              // Load Design Button with Hidden File Input - FIXED
              React.createElement('div', {
                key: 'load-wrapper',
                className: 'relative'
              }, [
                React.createElement('input', {
                  key: 'file-input',
                  id: 'file-upload-input',
                  type: 'file',
                  accept: '.json',
                  onChange: handleFileUpload,
                  className: 'hidden'  // Changed from absolute positioning to hidden
                }),
                React.createElement('label', {  // Changed from button to label
                  key: 'load-button',
                  htmlFor: 'file-upload-input',  // Links label to input
                  className: 'inline-flex px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer',
                  title: 'Load a saved design from file'
                }, [
                  React.createElement('span', { key: 'icon' }, '📂'),
                  React.createElement('span', { key: 'text' }, 'Load')
                ])
              ]),
              
              // Clear All Button
              React.createElement('button', {
                key: 'clear-all',
                onClick: clearAllPieces,
                disabled: pieces.length === 0,
                className: `px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                  pieces.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`,
                title: pieces.length === 0 ? 'No pieces to clear' : 'Remove all pieces from design'
              }, [
                React.createElement('span', { key: 'icon' }, '🗑️'),
                React.createElement('span', { key: 'text' }, 'Clear')
              ]),

              // Stress Test Button - ENHANCED WITH VISUALIZATION TOGGLE
              React.createElement('button', {
                key: 'stress-test',
                onClick: handleStressTest,
                disabled: pieces.length === 0,
                className: `px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                  pieces.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showStressVisualization
                      ? 'bg-orange-600 text-white shadow-lg scale-105 ring-2 ring-orange-300' // Active state
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`,
                title: pieces.length === 0 ? 'Add pieces to test structure' : 'Test structural integrity with visual stress indicators'
              }, [
                React.createElement('span', { key: 'icon' }, '⚖️'),
                React.createElement('span', { key: 'text' }, showStressVisualization ? 'Stress ✓' : 'Stress')
              ])
            ])
          ])
        ])
      ])
    ]);
  };

  /**
   * Renders the left sidebar containing toolbox and customization panel
   * @returns {React.Element} Left sidebar component
   */
  const renderLeftSidebar = () => {
    return React.createElement('div', {
      key: 'left-sidebar',
      className: 'col-span-3 flex flex-col space-y-4 h-full overflow-hidden'
    }, [
      // ========================================
      // TOP HALF: PIECE LIBRARY TOOLBOX
      // ========================================
      React.createElement('div', {
        key: 'toolbox-container',
        className: 'bg-white rounded-xl shadow-lg border border-gray-200 flex-1 overflow-hidden'
      }, [
        React.createElement(CompactToolbox, {
          key: 'toolbox',
          addPieceFromVariant: addPieceFromVariant,
          selectedCategory: selectedCategory,
          setSelectedCategory: setSelectedCategory
        })
      ]),

      // ========================================
      // BOTTOM HALF: CUSTOMIZATION PANEL
      // ========================================
      React.createElement('div', {
        key: 'customization-container',
        className: 'bg-white rounded-xl shadow-lg border border-gray-200 flex-1 overflow-hidden'
      }, [
        React.createElement(CustomizationPanel, {
          key: 'customization',
          selectedPiece: selectedPiece,
          showPanel: showCustomizationPanel,
          onClose: closeCustomizationPanel,
          onUpdateCustomization: updatePieceCustomization,
          openings: openings,
          onAddOpening: addOpening,
          onRemoveOpening: removeOpening,
          onSelectOpening: selectOpening,
          flipPiece: flipPiece,           // NEW: Pass flip function
          canFlipPiece: canFlipPiece      // NEW: Pass flip check function
        })
      ])
    ]);
  };

  /**
   * Renders the center area with 3D canvas and movement controls
   * @returns {React.Element} Center area component
   */
  const renderCenterArea = () => {
    return React.createElement('div', {
      key: 'canvas-area',
      className: 'col-span-6 flex flex-col space-y-4 h-full overflow-hidden'
    }, [
      // ========================================
      // 3D CANVAS WITH ENHANCED INTERACTION AND STRESS VISUALIZATION
      // ========================================
      React.createElement('div', {
        key: 'canvas-container',
        className: 'bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-grow'
      }, [
        React.createElement(Canvas3D, {
          key: 'canvas',
          pieces: pieces,
          selectedPiece: selectedPiece,
          movementIncrement: movementIncrement,
          gridWidth: gridWidth,
          gridHeight: gridHeight,
          openings: openings,
          selectedOpening: selectedOpening,
          onPieceClick: selectPiece,
          onPieceDrag: dragPiece,
          onOpeningClick: handleOpeningClick,
          showStressVisualization: showStressVisualization  // NEW: Pass stress visualization state
        })
      ]),
      
      // ========================================
      // MOVEMENT AND EDITING CONTROLS
      // ========================================
      React.createElement('div', {
        key: 'movement-controls',
        className: 'bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-shrink-0'
      }, [
        React.createElement(PieceEditingControls, {
          key: 'editing-controls',
          pieces: pieces,
          selectedPiece: selectedPiece,
          selectedGroup: selectedGroup,
          selectedOpening: selectedOpening,
          openings: openings,
          onMovePiece: movePiece,
          onMoveGroup: moveGroup,
          onRotatePiece: rotatePiece,
          onRotateGroup: rotateGroup,
          onDeletePiece: deletePiece,
          onDuplicatePiece: duplicatePiece,
          onRemoveOpening: removeOpening,
          onMoveOpening: moveOpening,
          onChangeOpeningFace: changeOpeningFace,
          selectOpening: selectOpening,
          movementIncrement: movementIncrement,
          onUpdateCustomization: updatePieceDimensions,
          setMovementIncrement: setMovementIncrement,
          flipPiece: flipPiece,         // NEW: Pass flip function
          canFlipPiece: canFlipPiece    // NEW: Pass flip check function
        })
      ])
    ]);
  };

  /**
   * Renders the right sidebar with parts list management
   * FIXED: Added proper height constraints and internal scrolling
   * @returns {React.Element} Right sidebar component
   */
  const renderRightSidebar = () => {
    return React.createElement('div', {
      key: 'right-column',
      className: 'col-span-3 h-full overflow-hidden'
    }, [
      React.createElement('div', {
        key: 'parts-list-container',
        className: 'bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden'
      }, [
        // ========================================
        // PARTS LIST HEADER - FIXED HEIGHT
        // ========================================
        React.createElement('div', {
          key: 'parts-header',
          className: 'p-4 border-b border-gray-200 flex-shrink-0'
        }, [
          React.createElement('h2', {
            key: 'title',
            className: 'text-lg font-bold text-gray-800'
          }, '📋 Parts List'),
          React.createElement('p', {
            key: 'subtitle',
            className: 'text-sm text-gray-600'
          }, 'Manage pieces, groups, and project overview')
        ]),
        
        // ========================================
        // PARTS LIST CONTENT WITH INTERNAL SCROLL
        // ========================================
        React.createElement('div', {
          key: 'parts-content',
          className: 'flex-1 overflow-hidden'
        }, [
          React.createElement(PartsListManagement, {
            pieces: pieces,
            selectedPiece: selectedPiece,
            onPieceClick: selectPiece,
            getDesignStats: getDesignStats,
            onToggleLock: togglePieceLock,
            groups: groups,
            selectedGroup: selectedGroup,
            onGroupClick: selectGroup,
            onToggleGroupLock: toggleGroupLock,
            onCreateGroup: createGroup,
            onUngroupPieces: ungroupPieces,
            openings: openings,
            selectedOpening: selectedOpening,
            onOpeningClick: selectOpening,
            onToggleOpeningLock: toggleOpeningLock
          })
        ])
      ])
    ]);
  };

  // ========================================
  // MAIN APPLICATION RENDER
  // ========================================
  return React.createElement('div', {
    className: 'h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden'
  }, [
    // ========================================
    // SAVE DESIGN MODAL
    // ========================================
    React.createElement(SaveDesignModal, {
      key: 'save-modal',
      isOpen: showSaveModal,
      onClose: () => setShowSaveModal(false),
      onSave: handleSaveDesign
    }),
    
    // ========================================
    // STRESS TEST PANEL WITH ENHANCED CALLBACKS
    // ========================================
    React.createElement(StressTestPanel, {
      key: 'stress-panel',
      isOpen: showStressPanel,
      onClose: handleStressTestClose,  // Use enhanced close handler
      pieces: pieces,
      catWeights: catWeights,
      onUpdateCatWeights: setCatWeights
    }),
    
    // ========================================
    // ENHANCED HEADER WITH STATS AND CONTROLS
    // ========================================
    renderEnhancedHeader(),

    // ========================================
    // MAIN CONTENT LAYOUT - FIXED GRID WITH PROPER HEIGHT
    // ========================================
    React.createElement('div', {
      key: 'main-content',
      className: 'flex-1 px-4 py-6 overflow-hidden'
    }, [
      React.createElement('div', {
        key: 'layout',
        className: 'grid grid-cols-12 gap-4 h-full'
      }, [
        // Left Sidebar - Toolbox + Customization (always visible)
        renderLeftSidebar(),

        // Center - Canvas and Movement Controls
        renderCenterArea(),

        // Right Sidebar - Parts List (always visible)
        renderRightSidebar()
      ])
    ])
  ]);
};

// ========================================
// APPLICATION INITIALIZATION WITH ERROR BOUNDARY
// ========================================

/**
 * Initializes the React application with proper error handling
 * Supports both React 18 and React 17 rendering methods
 */
const initializeApplication = () => {
  console.log('🚀 Initializing Cat Tree Builder application...');
  
  try {
    // React 18 compatible initialization
    const root = ReactDOM.createRoot ? 
      ReactDOM.createRoot(document.getElementById('root')) : 
      null;

    if (root) {
      // React 18 concurrent features
      console.log('✅ Using React 18 createRoot API');
      root.render(
        React.createElement(SharedUtils.ErrorBoundary, {}, 
          React.createElement(CatTreeBuilder)
        )
      );
    } else {
      // React 17 fallback for compatibility
      console.log('✅ Using React 17 legacy render API');
      ReactDOM.render(
        React.createElement(SharedUtils.ErrorBoundary, {}, 
          React.createElement(CatTreeBuilder)
        ), 
        document.getElementById('root')
      );
    }
    
    console.log('🎉 Cat Tree Builder application initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    // Fallback error display
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #dc2626;">
          <h1>⚠️ Application Failed to Load</h1>
          <p>Please refresh the page and try again.</p>
          <details style="margin-top: 1rem; text-align: left;">
            <summary>Error Details</summary>
            <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow: auto;">
${error.message}
${error.stack}
            </pre>
          </details>
        </div>
      `;
    }
  }
};

// ========================================
// APPLICATION STARTUP
// ========================================

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  initializeApplication();
}