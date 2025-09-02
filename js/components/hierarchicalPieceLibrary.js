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
      'honeycomb-panel': '⬢',
      'rock-wall-panel': '🗻'
    };
    return iconMap[variant.shape] || '◊';
  }, []);

  // ========================================
  // RENDER TOOLBOX INTERFACE
  // ========================================
  return React.createElement('div', {
    className: 'h-full flex flex-col bg-white overflow-hidden'
  }, [
    // Header Section
    React.createElement('div', {
      key: 'header',
      className: 'p-2 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-sm font-bold text-gray-800 text-center flex items-center justify-center space-x-1 mb-2'
      }, [
        React.createElement('span', { key: 'icon' }, '🧰'),
        React.createElement('span', { key: 'text' }, 'Toolbox')
      ]),
      
      // Compact Category Selection Grid (2 rows)
      React.createElement('div', {
        key: 'category-grid',
        className: 'grid grid-cols-3 gap-1'
      }, categories.map(([categoryKey, categoryData]) =>
        React.createElement('button', {
          key: categoryKey,
          onClick: () => handleCategoryClick(categoryKey),
          className: `px-2 py-1 border rounded text-center transition-all duration-200 ${
            selectedCategory === categoryKey
              ? 'border-green-500 bg-green-100 text-green-800 shadow-sm'
              : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700'
          }`
        }, [
          React.createElement('div', {
            key: 'icon',
            className: 'text-sm'
          }, categoryData.icon),
          React.createElement('div', {
            key: 'name',
            className: 'text-xs font-medium'
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
          className: 'p-2 grid grid-cols-3 gap-2 h-full'
        }, selectedVariants.map(variant =>
          React.createElement('button', {
            key: variant.id,
            onClick: () => handleVariantClick(variant.id),
            className: 'p-2 bg-white border border-gray-200 rounded-md hover:border-green-400 hover:shadow-md transition-all duration-200 text-center group transform hover:scale-105'
          }, [
            React.createElement('div', {
              key: 'variant-icon',
              className: 'w-6 h-6 mx-auto mb-1 bg-gray-100 rounded border flex items-center justify-center text-sm group-hover:bg-green-100 transition-colors'
            }, getVariantIcon(variant)),
            React.createElement('div', {
              key: 'variant-name',
              className: 'text-xs font-medium text-gray-900 mb-1 leading-tight'
            }, variant.name.replace(CatTreePieces.categories[selectedCategory].name + ' ', '')),
            React.createElement('div', {
              key: 'variant-cost',
              className: 'text-xs font-bold text-green-600 mb-1'
            }, `$${variant.baseCost}`),
            React.createElement('div', {
              key: 'variant-dimensions',
              className: 'text-xs text-gray-500 leading-tight'
            }, `${variant.baseWidth}" × ${variant.baseHeight}" × ${variant.baseDepth}"`),
            React.createElement('div', {
              key: 'variant-features',
              className: 'flex justify-center mt-1 space-x-1'
            }, [
              variant.hollow && React.createElement('span', {
                key: 'hollow',
                className: 'text-xs bg-blue-200 text-blue-700 px-1 rounded',
                title: 'Hollow piece - can add openings'
              }, '🏠'),
              variant.availableMaterials.length > 2 && React.createElement('span', {
                key: 'materials',
                className: 'text-xs bg-purple-200 text-purple-700 px-1 rounded',
                title: 'Multiple material options'
              }, '🎨')
            ])
          ])
        ))
      ]) : React.createElement('div', {
        key: 'no-selection',
        className: 'flex-1 flex items-center justify-center p-6'
      }, [
        React.createElement('div', {
          key: 'prompt',
          className: 'text-center text-gray-500'
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