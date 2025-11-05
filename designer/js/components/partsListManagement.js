// =====================================================
// OPTIMIZED PARTS LIST MANAGEMENT -v9- PROPER FLEX LAYOUT FOR SCROLLING
// =====================================================

/**
 * Main parts list management component that displays and manages pieces, groups, and openings
 * Provides search, sorting, selection, and organization features
 * FIXED: Uses proper flex layout to enable internal scrolling
 */
const PartsListManagement = ({ 
  pieces, 
  selectedPiece, 
  onPieceClick, 
  getDesignStats, 
  onToggleLock,
  groups, 
  selectedGroup, 
  onGroupClick, 
  onToggleGroupLock, 
  onCreateGroup, 
  onUngroupPieces,
  openings = [], 
  selectedOpening, 
  onOpeningClick, 
  onToggleOpeningLock,
  // Additional helper functions
  getPieceOpenings,
  getGroupPieces
}) => {
  const { useState, useMemo, useCallback } = React;
  
  // ========================================
  // LOCAL STATE MANAGEMENT
  // ========================================
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('height');
  const [selectedForGrouping, setSelectedForGrouping] = useState([]);
  const [activeSection, setActiveSection] = useState('pieces');
  const [viewMode, setViewMode] = useState('grid');

  // ========================================
  // MEMOIZED DATA PROCESSING - PERFORMANCE OPTIMIZATION
  // ========================================
  
  /**
   * Calculates design statistics using SharedUtils if available, with fallback
   */
  const stats = SharedUtils.useMemoizedStats ? 
    SharedUtils.useMemoizedStats(pieces, openings) :
    useMemo(() => ({
      totalCost: pieces.reduce((sum, piece) => sum + piece.cost, 0),
      maxHeight: pieces.reduce((max, piece) => Math.max(max, piece.y + piece.height), 0),
      averageHeight: pieces.length > 0 ? 
        pieces.reduce((sum, piece) => sum + piece.y + piece.height, 0) / pieces.length : 0,
      totalPieces: pieces.length,
      totalOpenings: openings.length,
      hollowPieces: pieces.filter(p => p.hollow).length,
      lockedPieces: pieces.filter(p => p.locked).length
    }), [pieces, openings]);

  /**
   * Processes pieces with filtering and sorting for optimal performance
   */
  const processedPieces = useMemo(() => {
    console.log(`🔄 Processing ${pieces.length} pieces...`);
    const startTime = performance.now();
    
    // Apply search filter
    const filtered = pieces.filter(piece =>
      piece.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      piece.variantId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'height':
          return (b.y + b.height) - (a.y + a.height);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'material':
          return (a.material || 'wood').localeCompare(b.material || 'wood');
        default:
          return 0;
      }
    });

    const endTime = performance.now();
    console.log(`✅ Piece processing completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    return sorted;
  }, [pieces, searchTerm, sortBy]);

  /**
   * Processes groups with enhanced metadata calculation
   */
  const processedGroups = useMemo(() => {
    return groups.map(group => {
      const groupPieces = getGroupPieces ? getGroupPieces(group.id) : pieces.filter(p => p.groupId === group.id);
      
      // Use SharedUtils DataUtils for enhanced calculations if available
      const groupData = SharedUtils.DataUtils ? 
        SharedUtils.DataUtils.calculateBoundingBox(groupPieces) : null;
        
      return {
        ...group,
        pieceCount: groupPieces.length,
        totalCost: groupPieces.reduce((sum, p) => sum + p.cost, 0),
        pieces: groupPieces,
        boundingBox: groupData,
        maxHeight: groupPieces.reduce((max, p) => Math.max(max, p.y + p.height), 0)
      };
    }).sort((a, b) => {
      // Sort by creation date (newest first)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [groups, pieces, getGroupPieces]);

  /**
   * Processes openings with parent piece validation and grouping
   */
  const processedOpenings = useMemo(() => {
    const openingsWithParent = openings.map(opening => {
      const parentPiece = pieces.find(p => p.id === opening.parentPieceId);
      return {
        ...opening,
        parentPiece,
        isValid: !!parentPiece
      };
    }).filter(opening => opening.isValid);

    // Group by parent piece if SharedUtils available
    if (SharedUtils.DataUtils && SharedUtils.DataUtils.groupOpeningsByPiece) {
      SharedUtils.DataUtils.groupOpeningsByPiece(openingsWithParent);
    }
    
    return openingsWithParent.sort((a, b) => a.parentPiece.name.localeCompare(b.parentPiece.name));
  }, [openings, pieces]);

  // ========================================
  // MEMOIZED EVENT HANDLERS - PREVENT UNNECESSARY RE-RENDERS
  // ========================================
  
  /**
   * Handles search term changes
   */
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  /**
   * Handles sort criteria changes
   */
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  /**
   * Handles view mode toggle (grid/list)
   */
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  /**
   * Handles section tab changes
   */
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
    setSelectedForGrouping([]); // Clear grouping selection when changing sections
  }, []);

  /**
   * Handles piece selection for grouping operations
   */
  const handlePieceSelectionForGrouping = useCallback((pieceId) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (piece?.groupId) return; // Can't group already grouped pieces
    
    setSelectedForGrouping(prev => 
      prev.includes(pieceId) 
        ? prev.filter(id => id !== pieceId)
        : [...prev, pieceId]
    );
  }, [pieces]);

  /**
   * Creates a group from selected pieces
   */
  const handleCreateGroup = useCallback(() => {
    if (selectedForGrouping.length >= 2) {
      onCreateGroup(selectedForGrouping);
      setSelectedForGrouping([]);
    }
  }, [selectedForGrouping, onCreateGroup]);

  /**
   * Clears grouping selection
   */
  const clearGroupingSelection = useCallback(() => {
    setSelectedForGrouping([]);
  }, []);

  // ========================================
  // REUSABLE COMPONENT - PIECE ITEM CARD
  // ========================================
  
  /**
   * Individual piece card component with selection and action capabilities
   */
  const PieceItemCard = useCallback(({ piece, isSelected, isSelectedForGrouping, isGrouped }) => {
    const pieceOpenings = getPieceOpenings ? getPieceOpenings(piece.id) : openings.filter(o => o.parentPieceId === piece.id);
    
    return React.createElement('div', {
      key: piece.id,
      onClick: () => !isGrouped && onPieceClick(piece.id),
      className: `relative rounded-lg border-2 transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
          : isSelectedForGrouping
            ? 'border-green-500 bg-green-50 shadow-sm'
            : isGrouped
              ? 'border-purple-200 bg-purple-25 opacity-75'
              : 'border-app-mint-200 hover:border-app-mint-300 bg-white hover:shadow-sm'
      } ${!isGrouped ? 'cursor-pointer' : 'cursor-default'}`
    }, [
      React.createElement('div', {
        key: 'piece-content',
        className: 'p-2'
      }, [
        // Header Row with Selection and Basic Info
        React.createElement('div', {
          key: 'piece-header',
          className: 'flex items-center justify-between mb-1'
        }, [
          React.createElement('div', {
            key: 'piece-info',
            className: 'flex items-center space-x-1 flex-1 min-w-0'
          }, [
            // Group Selection Checkbox
            !isGrouped && React.createElement('input', {
              key: 'group-checkbox',
              type: 'checkbox',
              checked: isSelectedForGrouping,
              onChange: (e) => {
                e.stopPropagation();
                handlePieceSelectionForGrouping(piece.id);
              },
              className: 'w-4 h-4 rounded border-app-mint-300 text-app-purple-600 focus:ring-app-purple-500 flex-shrink-0'
            }),
            // Piece Type Icon
            React.createElement('span', {
              key: 'piece-icon',
              className: 'text-lg flex-shrink-0'
            }, piece.hollow ? '🏠' : '📦'),
            // Piece Details
            React.createElement('div', { 
              key: 'piece-details',
              className: 'min-w-0 flex-1'
            }, [
              React.createElement('div', {
                key: 'name',
                className: `font-medium truncate ${
                  isSelected ? 'text-blue-900' : 
                  isGrouped ? 'text-purple-700' : 
                  'text-app-purple-900'
                }`
              }, isGrouped ? `🔗 ${piece.name}` : piece.name),
              React.createElement('div', {
                key: 'dimensions',
                className: 'text-xs text-app-purple-500'
              }, `${piece.width}" × ${piece.depth}" × ${piece.height}" • ${piece.material || 'wood'}`)
            ])
          ]),
          // Stresstester
          React.createElement('div', {
            key: 'weight-info',
            className: 'text-xs text-app-purple-400'
          }, window.StructuralAnalysis ? 
             `Weight: ${window.StructuralAnalysis.calculatePieceWeight(piece).toFixed(1)} lbs` : 
             'Weight: --'),
          // Action Buttons
          React.createElement('div', {
            key: 'piece-actions',
            className: 'flex items-center space-x-1 flex-shrink-0'
          }, [
            React.createElement('button', {
              key: 'lock-toggle',
              onClick: (e) => {
                e.stopPropagation();
                onToggleLock(piece.id);
              },
              className: `p-1 rounded text-xs font-medium transition-colors ${
                piece.locked 
                  ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                  : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
              }`
            }, piece.locked ? '🔒' : '🔓'),
          ])
        ]),
        
        // Metadata Row
        React.createElement('div', {
          key: 'piece-meta',
          className: 'space-y-1'
        }, [
          React.createElement('div', {
            key: 'position-info',
            className: 'text-xs text-gray-500'
          }, `Position: ${piece.x.toFixed(1)}", ${piece.y.toFixed(1)}", ${piece.z.toFixed(1)}"`),
          
          piece.hollow && pieceOpenings.length > 0 && React.createElement('div', {
            key: 'openings-count',
            className: 'text-xs text-green-600 font-medium'
          }, `${pieceOpenings.length} opening${pieceOpenings.length !== 1 ? 's' : ''}`),
          
          piece.createdAt && React.createElement('div', {
            key: 'created-info',
            className: 'text-xs text-app-purple-400'
          }, `Created: ${new Date(piece.createdAt).toLocaleDateString()}`)
        ])
      ])
    ]);
  }, [onPieceClick, onToggleLock, handlePieceSelectionForGrouping, openings, getPieceOpenings]);

  // ========================================
  // REUSABLE COMPONENT - GROUP ITEM CARD
  // ========================================
  
  /**
   * Group card component with enhanced metadata display
   */
  const GroupItemCard = useCallback(({ group, isSelected }) => {
    return React.createElement('div', {
      key: group.id,
      onClick: () => onGroupClick(group.id),
      className: `p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-purple-500 bg-purple-50 shadow-md transform scale-[1.02]' 
          : 'border-app-mint-200 hover:border-app-mint-300 bg-white hover:shadow-sm'
      }`
    }, [
      // Header Row
      React.createElement('div', {
        key: 'group-header',
        className: 'flex items-center justify-between mb-3'
      }, [
        React.createElement('div', {
          key: 'group-info',
          className: 'flex items-center space-x-3 flex-1 min-w-0'
        }, [
          React.createElement('span', { key: 'icon', className: 'text-xl flex-shrink-0' }, '📦'),
          React.createElement('div', { key: 'details', className: 'min-w-0 flex-1' }, [
            React.createElement('div', {
              key: 'name',
              className: `font-medium truncate ${isSelected ? 'text-purple-900' : 'text-gray-900'}`
            }, group.name),
            React.createElement('div', {
              key: 'meta',
              className: 'text-sm text-gray-500'
            }, `${group.pieceCount} pieces`),
            React.createElement('div', {
              key: 'dimensions',
              className: 'text-xs text-app-purple-400'
            }, group.boundingBox ? 
              `${group.boundingBox.width?.toFixed(1)}" × ${group.boundingBox.height?.toFixed(1)}" × ${group.boundingBox.depth?.toFixed(1)}"` : 
              `Max height: ${group.maxHeight?.toFixed(1)}"`),
            group.createdAt && React.createElement('div', {
              key: 'created',
              className: 'text-xs text-app-purple-400'
            }, `Created: ${new Date(group.createdAt).toLocaleDateString()}`)
          ])
        ]),
        // Action Buttons
        React.createElement('div', {
          key: 'group-actions',
          className: 'flex items-center space-x-2 flex-shrink-0'
        }, [
          React.createElement('button', {
            key: 'lock-toggle',
            onClick: (e) => {
              e.stopPropagation();
              onToggleGroupLock(group.id);
            },
            className: `p-1 rounded text-xs font-medium transition-colors ${
              group.locked 
                ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
            }`
          }, group.locked ? '🔒' : '🔓'),
          React.createElement('button', {
            key: 'ungroup',
            onClick: (e) => {
              e.stopPropagation();
              onUngroupPieces(group.id);
            },
            className: 'p-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors',
            title: 'Ungroup pieces'
          }, '📤')
        ])
      ]),
      // Pieces List
      React.createElement('div', {
        key: 'group-pieces',
        className: 'text-xs text-gray-600 border-t border-gray-100 pt-2'
      }, [
        React.createElement('div', {
          key: 'pieces-label',
          className: 'font-medium mb-1'
        }, 'Pieces in group:'),
        React.createElement('div', {
          key: 'pieces-list',
          className: 'line-clamp-2'
        }, group.pieces.map(p => p.name).join(', '))
      ])
    ]);
  }, [onGroupClick, onToggleGroupLock, onUngroupPieces]);

  // ========================================
  // REUSABLE COMPONENT - OPENING ITEM CARD
  // ========================================
  
  /**
   * Opening card component with parent piece information
   */
  const OpeningItemCard = useCallback(({ opening, isSelected }) => {
    return React.createElement('div', {
      key: opening.id,
      onClick: () => onOpeningClick(opening.id),
      className: `p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]' 
          : 'border-app-mint-200 hover:border-app-mint-300 bg-white hover:shadow-sm'
      }`
    }, [
      React.createElement('div', {
        key: 'opening-header',
        className: 'flex items-center justify-between mb-2'
      }, [
        React.createElement('div', {
          key: 'opening-info',
          className: 'flex items-center space-x-2 flex-1 min-w-0'
        }, [
          React.createElement('span', {
            key: 'icon',
            className: 'text-lg flex-shrink-0'
          }, opening.shape === 'circle' ? '⭕' : opening.shape === 'square' ? '⬜' : '🚪'),
          React.createElement('div', { key: 'details', className: 'min-w-0 flex-1' }, [
            React.createElement('div', {
              key: 'name',
              className: `font-medium truncate ${isSelected ? 'text-green-900' : 'text-gray-900'}`
            }, opening.name),
            React.createElement('div', {
              key: 'parent-info',
              className: 'text-sm text-gray-500'
            }, `on ${opening.parentPiece.name}`),
            React.createElement('div', {
              key: 'details-info',
              className: 'text-xs text-app-purple-400'
            }, `${opening.face} face • ${opening.width}" × ${opening.height}" • ${opening.shape}`)
          ])
        ]),
        React.createElement('button', {
          key: 'lock-toggle',
          onClick: (e) => {
            e.stopPropagation();
            onToggleOpeningLock(opening.id);
          },
          className: `p-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
            opening.locked 
              ? 'bg-red-100 hover:bg-red-200 text-red-700' 
              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
          }`
        }, opening.locked ? '🔒' : '🔓')
      ])
    ]);
  }, [onOpeningClick, onToggleOpeningLock]);

  // ========================================
  // MAIN COMPONENT RENDER - FIXED FLEX LAYOUT
  // ========================================
  return React.createElement('div', {
    className: 'h-full flex flex-col overflow-hidden'
  }, [
    // ========================================
    // ENHANCED STATS HEADER - FIXED HEIGHT
    // ========================================
    React.createElement('div', {
      key: 'stats-header',
      className: 'bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b border-gray-200 flex-shrink-0'
    }, [
      React.createElement('div', {
        key: 'stats-grid',
        className: 'grid grid-cols-2 gap-3 mb-4'
      }, [
        React.createElement('div', {
          key: 'pieces-stat',
          className: 'bg-white rounded-lg p-3 text-center border border-blue-200 hover:shadow-sm transition-shadow'
        }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-blue-600' }, pieces.length),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Pieces'),
          React.createElement('div', { key: 'breakdown', className: 'text-xs text-gray-500 mt-1' }, `${stats.lockedPieces} locked`)
        ]),
        React.createElement('div', {
          key: 'openings-stat',
          className: 'bg-white rounded-lg p-3 text-center border border-purple-200 hover:shadow-sm transition-shadow'
        }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-purple-600' }, openings.length),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Openings'),
          React.createElement('div', { key: 'hollow', className: 'text-xs text-gray-500 mt-1' }, `${stats.hollowPieces} hollow pieces`)
        ]),
        React.createElement('div', {
          key: 'height-stat',
          className: 'bg-white rounded-lg p-3 text-center border border-yellow-200 hover:shadow-sm transition-shadow'
        }, [
          React.createElement('div', { key: 'number', className: 'text-2xl font-bold text-yellow-600' }, `${stats.maxHeight}"`),
          React.createElement('div', { key: 'label', className: 'text-sm text-gray-600' }, 'Max Height'),
          React.createElement('div', { key: 'avg', className: 'text-xs text-gray-500 mt-1' }, `${(stats.averageHeight || 0).toFixed(1)}" avg`)
        ])
      ])
    ]),

    // ========================================
    // SEARCH AND CONTROLS INTERFACE - FIXED HEIGHT
    // ========================================
    React.createElement('div', {
      key: 'search-controls',
      className: 'p-4 bg-white border-b border-gray-200 space-y-3 flex-shrink-0'
    }, [
      // Search Bar
      React.createElement('div', {
        key: 'search',
        className: 'relative'
      }, [
        React.createElement('input', {
          key: 'search-input',
          type: 'text',
          placeholder: 'Search pieces by name, material, or type...',
          value: searchTerm,
          onChange: handleSearchChange,
          className: 'w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
        }),
        React.createElement('span', {
          key: 'search-icon',
          className: 'absolute left-3 top-2.5 text-gray-400'
        }, '🔍')
      ]),

      // Controls Row
      React.createElement('div', {
        key: 'controls-row',
        className: 'flex items-center justify-between'
      }, [
        // Sort Control
        React.createElement('div', {
          key: 'sort-control',
          className: 'flex items-center space-x-2'
        }, [
          React.createElement('span', {
            key: 'sort-label',
            className: 'text-sm text-gray-600'
          }, 'Sort:'),
          React.createElement('select', {
            key: 'sort-select',
            value: sortBy,
            onChange: handleSortChange,
            className: 'text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all'
          }, [
            React.createElement('option', { key: 'height', value: 'height' }, 'Height'),
            React.createElement('option', { key: 'name', value: 'name' }, 'Name'),
            React.createElement('option', { key: 'created', value: 'created' }, 'Created'),
            React.createElement('option', { key: 'material', value: 'material' }, 'Material')
          ])
        ]),

        // View Mode Toggle
        React.createElement('div', {
          key: 'view-toggle',
          className: 'flex items-center space-x-1 bg-gray-100 rounded-lg p-1'
        }, [
          React.createElement('button', {
            key: 'grid-view',
            onClick: () => handleViewModeChange('grid'),
            className: `px-2 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`
          }, '⊞'),
          React.createElement('button', {
            key: 'list-view',
            onClick: () => handleViewModeChange('list'),
            className: `px-2 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-gray-200'}`
          }, '☰')
        ])
      ])
    ]),

    // ========================================
    // SECTION TABS WITH ENHANCED COUNTS - FIXED HEIGHT
    // ========================================
    React.createElement('div', {
      key: 'section-tabs',
      className: 'flex bg-gray-50 border-b border-gray-200 flex-shrink-0'
    }, [
      React.createElement('button', {
        key: 'pieces-tab',
        onClick: () => handleSectionChange('pieces'),
        className: `flex-1 px-4 py-3 text-sm font-medium transition-all ${
          activeSection === 'pieces' 
            ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`
      }, `📦 Pieces (${processedPieces.length}${searchTerm ? `/${pieces.length}` : ''})`),
      React.createElement('button', {
        key: 'groups-tab',
        onClick: () => handleSectionChange('groups'),
        className: `flex-1 px-4 py-3 text-sm font-medium transition-all ${
          activeSection === 'groups' 
            ? 'bg-white text-purple-600 border-b-2 border-purple-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`
      }, `📦 Groups (${processedGroups.length})`),
      React.createElement('button', {
        key: 'openings-tab',
        onClick: () => handleSectionChange('openings'),
        className: `flex-1 px-4 py-3 text-sm font-medium transition-all ${
          activeSection === 'openings' 
            ? 'bg-white text-green-600 border-b-2 border-green-600 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`
      }, `🚪 Openings (${processedOpenings.length})`)
    ]),

    // ========================================
    // CONTENT AREA WITH OPTIMIZED RENDERING - SCROLLABLE
    // ========================================
    React.createElement('div', {
      key: 'content-area',
      className: 'flex-1 overflow-y-auto bg-gray-50'
    }, [
      // Group Creation Controls (when pieces are selected for grouping)
      selectedForGrouping.length > 0 && React.createElement('div', {
        key: 'grouping-controls',
        className: 'p-4 bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-200 sticky top-0 z-10 shadow-sm'
      }, [
        React.createElement('div', {
          key: 'selected-info',
          className: 'flex items-center justify-between mb-3'
        }, [
          React.createElement('div', {
            key: 'selection-details',
            className: 'flex items-center space-x-2'
          }, [
            React.createElement('span', {
              key: 'count',
              className: 'text-sm font-medium text-blue-700'
            }, `${selectedForGrouping.length} pieces selected`),
          ]),
          React.createElement('button', {
            key: 'clear-selection',
            onClick: clearGroupingSelection,
            className: 'text-blue-500 hover:text-blue-700 text-sm transition-colors'
          }, '✕ Clear')
        ]),
        React.createElement('button', {
          key: 'create-group',
          onClick: handleCreateGroup,
          disabled: selectedForGrouping.length < 2,
          className: `w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            selectedForGrouping.length >= 2
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`
        }, `📦 Create Group from ${selectedForGrouping.length} pieces`)
      ]),

      // ========================================
      // PIECES SECTION
      // ========================================
      activeSection === 'pieces' && React.createElement('div', {
        key: 'pieces-section',
        className: 'p-4'
      }, [
        processedPieces.length === 0 ? React.createElement(SharedUtils.EmptyState, {
          key: 'empty-pieces',
          icon: '📦',
          title: searchTerm ? 'No matching pieces' : 'No pieces yet',
          subtitle: searchTerm ? `No pieces match "${searchTerm}"` : 'Add some from the toolbox!',
          children: searchTerm && React.createElement('button', {
            onClick: () => setSearchTerm(''),
            className: 'mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors'
          }, 'Clear search')
        }) : React.createElement('div', {
          key: 'pieces-content',
          className: viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'
        }, processedPieces.map(piece => {
          const isSelected = selectedPiece?.id === piece.id;
          const isSelectedForGrouping = selectedForGrouping.includes(piece.id);
          const isGrouped = !!piece.groupId;
          
          return React.createElement(PieceItemCard, {
            key: piece.id,
            piece,
            isSelected,
            isSelectedForGrouping,
            isGrouped
          });
        }))
      ]),

      // ========================================
      // GROUPS SECTION  
      // ========================================
      activeSection === 'groups' && React.createElement('div', {
        key: 'groups-section',
        className: 'p-4'
      }, [
        processedGroups.length === 0 ? React.createElement(SharedUtils.EmptyState, {
          key: 'empty-groups',
          icon: '📦',
          title: 'No groups yet',
          subtitle: 'Select multiple pieces to create a group!',
          children: React.createElement('div', {
            className: 'mt-4 text-xs text-gray-500 space-y-1'
          }, [
            React.createElement('p', { key: 'hint1' }, '• Check boxes next to pieces to select them'),
            React.createElement('p', { key: 'hint2' }, '• Select 2+ pieces and click "Create Group"'),
            React.createElement('p', { key: 'hint3' }, '• Groups can be moved and rotated together')
          ])
        }) : React.createElement('div', {
          key: 'groups-content',
          className: 'space-y-3'
        }, processedGroups.map(group => {
          const isSelected = selectedGroup?.id === group.id;
          
          return React.createElement(GroupItemCard, {
            key: group.id,
            group,
            isSelected
          });
        }))
      ]),

      // ========================================
      // OPENINGS SECTION
      // ========================================
      activeSection === 'openings' && React.createElement('div', {
        key: 'openings-section',
        className: 'p-4'
      }, [
        processedOpenings.length === 0 ? React.createElement(SharedUtils.EmptyState, {
          key: 'empty-openings',
          icon: '🚪',
          title: 'No openings yet',
          subtitle: 'Add some to hollow pieces!',
          children: React.createElement('div', {
            className: 'mt-4 text-xs text-gray-500 space-y-1'
          }, [
            React.createElement('p', { key: 'hint1' }, '• Select a hollow piece (🏠) in the customization panel'),
            React.createElement('p', { key: 'hint2' }, '• Go to the "Openings" tab to add doors and windows'),
            React.createElement('p', { key: 'hint3' }, '• Openings can be moved and placed on different faces')
          ])
        }) : React.createElement('div', {
          key: 'openings-content',
          className: 'space-y-3'
        }, processedOpenings.map(opening => {
          const isSelected = selectedOpening?.id === opening.id;
          
          return React.createElement(OpeningItemCard, {
            key: opening.id,
            opening,
            isSelected
          });
        }))
      ])
    ])
  ]);
};