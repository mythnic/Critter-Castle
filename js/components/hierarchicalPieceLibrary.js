// =====================================================
// OPTIMIZED PIECE LIBRARY & CUSTOMIZATION -v13- FIXED VARIANT DISPLAY
// =====================================================

// ========================================
// COMPACT TOOLBOX COMPONENT - PIECE SELECTION INTERFACE
// ========================================

/**
 * Compact toolbox for selecting and adding pieces to the design
 * Organized with category selection and variant display
 * FIXED: Variant shapes section now properly displays when category is selected
 */
const CompactToolbox = ({ addPieceFromVariant, selectedCategory, setSelectedCategory }) => {
  const { useState, useMemo, useCallback } = React;
  
  // State for showing piece info
  const [showingInfo, setShowingInfo] = useState(null);

  // ========================================
  // MEMOIZED DATA - PERFORMANCE OPTIMIZATION
  // ========================================
  
  /**
   * Memoized categories to prevent recalculation on re-renders
   */
  const categories = useMemo(() => {
    return Object.entries(CatTreePieces.categories);
  }, []);

  /**
   * Memoized variants for selected category
   */
  const selectedVariants = useMemo(() => {
    return selectedCategory ? CatTreePieces.categories[selectedCategory]?.variants || [] : [];
  }, [selectedCategory]);

  // ========================================
  // EVENT HANDLERS - MEMOIZED FOR PERFORMANCE
  // ========================================
  
  /**
   * Handles category selection toggle
   * @param {string} categoryKey - Key of category to select/deselect
   */
  const handleCategoryClick = useCallback((categoryKey) => {
    setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
  }, [selectedCategory, setSelectedCategory]);

  /**
   * Handles variant selection and piece creation
   * @param {string} variantId - ID of variant to create piece from
   */
  const handleVariantClick = useCallback((variantId) => {
    console.log(`🛠️ Adding piece from variant: ${variantId}`);
    addPieceFromVariant(variantId);
  }, [addPieceFromVariant]);

  /**
   * Handles showing/hiding piece information
   * @param {Event} event - Click event
   * @param {string} variantId - ID of variant to show info for
   */
  const handleInfoClick = useCallback((event, variantId) => {
    event.stopPropagation(); // Prevent triggering the main button click
    setShowingInfo(showingInfo === variantId ? null : variantId);
  }, [showingInfo]);

  /**
   * Gets appropriate icon for variant shape
   * @param {Object} variant - Variant object
   * @returns {string} Icon character for the shape
   */
  const getVariantIcon = useCallback((variant) => {
    const iconMap = {
      'cylinder': '○',
      'box': '□',
      'aframe': '△',
      'triangle': '▲',
      'panel': '▬',
      'triangle-panel': '◤',
      'rock-wall-panel': '🗻',
      'climbing-rock': '🪨'
    };
    return iconMap[variant.shape] || '◊';
  }, []);

  // ========================================
  // RENDER TOOLBOX INTERFACE
  // ========================================
  return React.createElement('div', {
    className: 'h-full flex flex-col bg-transparent overflow-hidden'
  }, [
    // Header Section
    React.createElement('div', {
      key: 'header',
      className: 'p-1 border-b border-app-mint-200 bg-gradient-to-r from-app-mint-50 to-app-pink-50 flex-shrink-0'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xs font-bold text-app-purple-800 text-center flex items-center justify-center space-x-1 mb-1'
      }, [
        React.createElement('span', { key: 'icon' }, '🧰'),
        React.createElement('span', { key: 'text' }, 'Toolbox')
      ]),
      
      // Compact Category Selection Grid (2 rows)
      React.createElement('div', {
        key: 'category-grid',
        className: 'grid grid-cols-3 gap-0.5'
      }, categories.map(([categoryKey, categoryData]) =>
        React.createElement('button', {
          key: categoryKey,
          onClick: () => handleCategoryClick(categoryKey),
          className: `px-1 py-0.5 border rounded text-center transition-all duration-200 ${
            selectedCategory === categoryKey
              ? 'border-app-mint-500 bg-app-mint-100 text-app-mint-800 shadow-sm'
              : 'border-app-purple-300 hover:border-app-purple-400 bg-white hover:bg-app-purple-50 text-app-purple-700'
          }`
        }, [
          React.createElement('div', {
            key: 'icon',
            className: 'text-xs'
          }, categoryData.icon),
          React.createElement('div', {
            key: 'name',
            className: 'text-[10px] font-medium'
          }, categoryData.name)
        ])
      ))
    ]),

    // Main Content Area - Piece Variants (takes up most space)
    React.createElement('div', {
      key: 'main-content',
      className: 'flex-1 overflow-y-auto'
    }, [
      // Show variants when category is selected, otherwise show selection prompt
      selectedCategory ? React.createElement('div', {
        key: 'variant-shapes',
        className: 'h-full'
      }, [
        React.createElement('div', {
          key: 'shapes-grid',
          className: 'p-1 grid grid-cols-3 gap-1 h-full'
        }, selectedVariants.map(variant =>
          React.createElement('button', {
            key: variant.id,
            onClick: () => handleVariantClick(variant.id),
            title: variant.description || `${variant.name} - ${variant.baseWidth}" × ${variant.baseHeight}" × ${variant.baseDepth}" - $${variant.baseCost}`,
            className: 'p-1 bg-white border border-app-mint-200 rounded-md hover:border-app-mint-400 hover:shadow-md transition-all duration-200 text-center group'
          }, [
            React.createElement('div', {
              key: 'variant-icon',
              className: 'w-4 h-4 mx-auto mb-0.5 bg-app-purple-100 rounded border flex items-center justify-center text-xs group-hover:bg-app-mint-100 transition-colors'
            }, getVariantIcon(variant)),
            React.createElement('div', {
              key: 'variant-name',
              className: 'text-[10px] font-medium text-app-purple-900 mb-0.5 leading-tight'
            }, variant.name.replace(CatTreePieces.categories[selectedCategory].name + ' ', '')),
            React.createElement('div', {
              key: 'variant-cost',
              className: 'text-[10px] font-bold text-app-mint-600 mb-0.5'
            }, `$${variant.baseCost}`),
            React.createElement('div', {
              key: 'variant-dimensions',
              className: 'text-xs text-app-purple-500 leading-tight'
            }, `${variant.baseWidth}" × ${variant.baseHeight}" × ${variant.baseDepth}"`),
            React.createElement('div', {
              key: 'variant-features',
              className: 'flex justify-center mt-1 space-x-1'
            }, [
              variant.hollow && React.createElement('span', {
                key: 'hollow',
                className: 'text-xs bg-app-mint-200 text-app-mint-700 px-1 rounded',
                title: 'Hollow piece - can add openings'
              }, '🏠'),
              variant.availableMaterials.length > 2 && React.createElement('span', {
                key: 'materials',
                className: 'text-xs bg-app-pink-200 text-app-pink-700 px-1 rounded',
                title: 'Multiple material options'
              }, '🎨'),
              React.createElement('button', {
                key: 'info-btn',
                onClick: (e) => handleInfoClick(e, variant.id),
                className: 'text-xs bg-app-purple-200 text-app-purple-600 px-1 rounded hover:bg-app-mint-200 hover:text-app-mint-700 transition-colors',
                title: 'Show detailed information'
              }, 'ℹ️')
            ]),
            // Info panel that appears when button is clicked
            showingInfo === variant.id && React.createElement('div', {
              key: 'info-panel',
              className: 'mt-2 p-2 bg-app-mint-50 border border-app-mint-200 rounded text-xs'
            }, [
              React.createElement('div', {
                key: 'description',
                className: 'font-medium text-app-mint-800 mb-1'
              }, variant.description || 'No description available'),
              React.createElement('div', {
                key: 'details',
                className: 'text-app-mint-600 space-y-1'
              }, [
                React.createElement('div', { key: 'materials' }, `Materials: ${variant.availableMaterials.join(', ')}`),
                variant.hollow && React.createElement('div', { key: 'hollow-info' }, 'Can have openings added for cats to enter/exit'),
                React.createElement('div', { key: 'dimensions' }, `Default size: ${variant.baseWidth}" W × ${variant.baseHeight}" H × ${variant.baseDepth}" D`)
              ])
            ])
          ])
        ))
      ]) : React.createElement('div', {
        key: 'no-selection',
        className: 'flex-1 flex items-center justify-center p-6'
      }, [
        React.createElement('div', {
          key: 'prompt',
          className: 'text-center text-app-purple-500'
        }, [
          React.createElement('div', {
            key: 'icon',
            className: 'text-4xl mb-3'
          }, '👆'),
          React.createElement('div', {
            key: 'text',
            className: 'text-sm font-medium'
          }, 'Select a category above'),
          React.createElement('div', {
            key: 'subtext',
            className: 'text-xs mt-1'
          }, 'to browse available pieces')
        ])
      ])
    ])
  ]);
};