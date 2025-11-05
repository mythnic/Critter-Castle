// =====================================================
// STRESS TEST PANEL COMPONENT -v1- STRUCTURAL ANALYSIS UI
// =====================================================

/**
 * Modal panel for displaying structural analysis results
 * Shows weight testing, connection recommendations, and weak points
 */
const StressTestPanel = ({ isOpen, onClose, pieces, catWeights, onUpdateCatWeights }) => {
  const { useState, useEffect, useCallback } = React;
  const [report, setReport] = useState(null);
  const [localCatWeights, setLocalCatWeights] = useState(catWeights);
  
  // ========================================
  // REPORT GENERATION
  // ========================================
  
  useEffect(() => {
    if (isOpen && pieces.length > 0) {
      const newReport = StructuralAnalysis.generateStressReport(pieces, localCatWeights);
      setReport(newReport);
    }
  }, [isOpen, pieces, localCatWeights]);
  
  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  /**
   * Handle cat weight changes
   */
  const handleWeightChange = useCallback((index, value) => {
    const newWeights = [...localCatWeights];
    newWeights[index] = Math.max(1, parseInt(value) || 1);
    setLocalCatWeights(newWeights);
    onUpdateCatWeights(newWeights);
  }, [localCatWeights, onUpdateCatWeights]);
  
  /**
   * Add a new cat
   */
  const handleAddCat = useCallback(() => {
    const newWeights = [...localCatWeights, 15];
    setLocalCatWeights(newWeights);
    onUpdateCatWeights(newWeights);
  }, [localCatWeights, onUpdateCatWeights]);
  
  /**
   * Remove a cat
   */
  const handleRemoveCat = useCallback((index) => {
    if (localCatWeights.length > 1) {
      const newWeights = localCatWeights.filter((_, i) => i !== index);
      setLocalCatWeights(newWeights);
      onUpdateCatWeights(newWeights);
    }
  }, [localCatWeights, onUpdateCatWeights]);
  
  /**
   * Recalculate report
   */
  const handleRecalculate = useCallback(() => {
    if (pieces.length > 0) {
      const newReport = StructuralAnalysis.generateStressReport(pieces, localCatWeights);
      setReport(newReport);
    }
  }, [pieces, localCatWeights]);
  
  // ========================================
  // RENDER
  // ========================================
  
  if (!isOpen) return null;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm',
    onClick: (e) => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement('div', {
    className: 'bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col'
  }, [
    // ========================================
    // HEADER
    // ========================================
    React.createElement('div', {
      key: 'header',
      className: 'px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-bold text-gray-800 flex items-center space-x-2'
      }, [
        React.createElement('span', { key: 'icon' }, '⚖️'),
        React.createElement('span', { key: 'text' }, 'Structural Analysis Report')
      ]),
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        className: 'text-gray-400 hover:text-gray-600 text-2xl transition-colors'
      }, '✕')
    ]),
    
    // ========================================
    // CONTENT (SCROLLABLE)
    // ========================================
    React.createElement('div', {
      key: 'content',
      className: 'flex-1 overflow-y-auto p-6'
    }, report ? [
      // ========================================
      // OVERALL STATUS
      // ========================================
      React.createElement('div', {
        key: 'status',
        className: `p-4 rounded-lg mb-6 ${
          report.summary.passed 
            ? 'bg-green-100 border-2 border-green-300' 
            : 'bg-red-100 border-2 border-red-300'
        }`
      }, [
        React.createElement('div', {
          key: 'status-header',
          className: 'flex items-center space-x-3 mb-2'
        }, [
          React.createElement('span', {
            key: 'icon',
            className: 'text-2xl'
          }, report.summary.passed ? '✅' : '❌'),
          React.createElement('div', {
            key: 'status-text',
            className: 'font-semibold text-lg'
          }, report.summary.passed 
            ? 'Structure can safely support specified cat weights' 
            : 'Structure needs reinforcement for specified weights')
        ]),
        React.createElement('div', {
          key: 'summary-stats',
          className: 'grid grid-cols-2 gap-4 mt-3 text-sm'
        }, [
          React.createElement('div', { key: 'stat1' }, 
            `Structure Weight: ${report.summary.totalStructureWeight} lbs`),
          React.createElement('div', { key: 'stat2' }, 
            `Total Cat Weight: ${report.summary.totalCatWeight} lbs`),
          React.createElement('div', { key: 'stat3' }, 
            `Safety Factor: ${report.summary.safetyFactor}x`),
          React.createElement('div', { key: 'stat4' }, 
            `Max Single Cat: ${report.summary.maxCatWeight} lbs`)
        ])
      ]),
      
      // ========================================
      // CAT WEIGHT INPUTS
      // ========================================
      React.createElement('div', {
        key: 'cat-weights',
        className: 'bg-blue-50 rounded-lg p-4 mb-6'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold text-gray-800 mb-3 flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '🐱'),
          React.createElement('span', { key: 'text' }, 'Cat Weights (pounds)')
        ]),
        React.createElement('div', {
          key: 'weights-list',
          className: 'space-y-2'
        }, localCatWeights.map((weight, index) => 
          React.createElement('div', {
            key: index,
            className: 'flex items-center space-x-3'
          }, [
            React.createElement('span', {
              key: 'label',
              className: 'text-sm text-gray-600 w-16'
            }, `Cat ${index + 1}:`),
            React.createElement('input', {
              key: 'input',
              type: 'number',
              min: '1',
              max: '50',
              value: weight,
              onChange: (e) => handleWeightChange(index, e.target.value),
              className: 'w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500'
            }),
            React.createElement('span', {
              key: 'lbs',
              className: 'text-sm text-gray-500'
            }, 'lbs'),
            localCatWeights.length > 1 && React.createElement('button', {
              key: 'remove',
              onClick: () => handleRemoveCat(index),
              className: 'text-red-500 hover:text-red-700 text-sm'
            }, '✕ Remove')
          ])
        )),
        React.createElement('div', {
          key: 'actions',
          className: 'flex items-center space-x-3 mt-3'
        }, [
          React.createElement('button', {
            key: 'add',
            onClick: handleAddCat,
            className: 'px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors'
          }, '+ Add Cat'),
          React.createElement('button', {
            key: 'recalc',
            onClick: handleRecalculate,
            className: 'px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors'
          }, '🔄 Recalculate')
        ])
      ]),
      
      // ========================================
      // CRITICAL POINTS / WEAK SPOTS
      // ========================================
      report.criticalPoints && report.criticalPoints.length > 0 && React.createElement('div', {
        key: 'critical-points',
        className: 'bg-red-50 rounded-lg p-4 mb-6'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold text-red-800 mb-3 flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '⚠️'),
          React.createElement('span', { key: 'text' }, 'Critical Weak Points')
        ]),
        React.createElement('div', {
          key: 'points-list',
          className: 'space-y-2'
        }, report.criticalPoints.map((point, index) =>
          React.createElement('div', {
            key: point.pieceId || index,
            className: 'p-3 bg-white rounded border border-red-200'
          }, [
            React.createElement('div', {
              key: 'name',
              className: 'font-medium text-red-700'
            }, point.pieceName),
            React.createElement('div', {
              key: 'issue',
              className: 'text-sm text-gray-600 mt-1'
            }, point.issue),
            point.currentCapacity !== undefined && React.createElement('div', {
              key: 'capacity',
              className: 'text-xs text-gray-500 mt-1'
            }, `Current capacity: ${point.currentCapacity} lbs, Required: ${point.required} lbs`)
          ])
        ))
      ]),
      
      // ========================================
      // RECOMMENDATIONS
      // ========================================
      report.recommendations && report.recommendations.length > 0 && React.createElement('div', {
        key: 'recommendations',
        className: 'bg-yellow-50 rounded-lg p-4 mb-6'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold text-yellow-800 mb-3 flex items-center space-x-2'
        }, [
          React.createElement('span', { key: 'icon' }, '💡'),
          React.createElement('span', { key: 'text' }, 'Structural Recommendations')
        ]),
        React.createElement('div', {
          key: 'rec-list',
          className: 'space-y-2'
        }, report.recommendations.map((rec, index) =>
          React.createElement('div', {
            key: rec.pieceId || index,
            className: 'p-3 bg-white rounded border border-yellow-200'
          }, [
            React.createElement('div', {
              key: 'piece',
              className: 'font-medium text-gray-700'
            }, rec.pieceName),
            rec.stress && React.createElement('div', {
              key: 'stress',
              className: `text-sm ${
                rec.stress > 75 ? 'text-red-600' : 
                rec.stress > 50 ? 'text-orange-600' : 
                'text-yellow-600'
              }`
            }, `Stress Level: ${rec.stress}%`),
            React.createElement('div', {
              key: 'suggestion',
              className: 'text-sm text-gray-600 mt-1'
            }, rec.suggestion)
          ])
        ))
      ]),
      
      // ========================================
      // HARDWARE CONNECTIONS
      // ========================================
      React.createElement('div', {
        key: 'connections',
        className: 'bg-gray-50 rounded-lg p-4 mb-6'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold text-gray-800 mb-3 flex items-center justify-between'
        }, [
          React.createElement('span', {
            key: 'text',
            className: 'flex items-center space-x-2'
          }, [
            React.createElement('span', { key: 'icon' }, '🔩'),
            React.createElement('span', { key: 'label' }, 'Required Hardware Connections')
          ]),
          React.createElement('span', {
            key: 'cost',
            className: 'text-green-600 font-bold'
          }, `Total: $${report.connections.totalHardwareCost}`)
        ]),
        React.createElement('div', {
          key: 'connections-list',
          className: 'space-y-2 max-h-48 overflow-y-auto'
        }, report.connections.connections.length > 0 ? 
          report.connections.connections.map((conn, index) =>
            React.createElement('div', {
              key: index,
              className: 'flex items-center justify-between p-2 bg-white rounded border border-gray-200'
            }, [
              React.createElement('div', {
                key: 'desc',
                className: 'text-sm text-gray-700'
              }, conn.description),
              React.createElement('div', {
                key: 'details',
                className: 'flex items-center space-x-3 text-sm'
              }, [
                React.createElement('span', {
                  key: 'strength',
                  className: 'text-gray-500'
                }, `Strength: ${conn.strength}`),
                React.createElement('span', {
                  key: 'cost',
                  className: 'font-medium text-green-600'
                }, `$${conn.cost}`)
              ])
            ])
          ) : React.createElement('div', {
            className: 'text-sm text-gray-500 text-center py-2'
          }, 'No hardware connections needed')
        )
      ])
    ] : React.createElement('div', {
      className: 'text-center py-8 text-gray-500'
    }, 'Generating analysis report...')),
    
    // ========================================
    // FOOTER
    // ========================================
    React.createElement('div', {
      key: 'footer',
      className: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    }, [
      React.createElement('div', {
        key: 'info',
        className: 'text-xs text-gray-500 mb-3'
      }, '💡 Tip: A 2x safety factor means the structure can handle twice the expected load'),
      React.createElement('div', {
        key: 'actions',
        className: 'flex justify-end'
      }, [
        React.createElement('button', {
          key: 'close',
          onClick: onClose,
          className: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors'
        }, 'Close')
      ])
    ])
  ]));
};