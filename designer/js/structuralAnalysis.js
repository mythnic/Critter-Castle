// =====================================================
// STRUCTURAL ANALYSIS SYSTEM -v1- WEIGHT & STRESS TESTING
// =====================================================

const StructuralAnalysis = {
  
  // ========================================
  // MATERIAL STRENGTH PROPERTIES
  // ========================================
  
  /**
   * Material strength ratings and properties
   * All weights in pounds, stresses in PSI equivalent units
   */
  materialStrength: {
    wood: { 
      baseCapacity: 150,      // lbs per square inch of contact
      tensileStrength: 100,   // Resistance to pulling apart
      shearStrength: 80,      // Resistance to sliding forces
      density: 0.025,         // lbs per cubic inch (for weight calc)
      jointEfficiency: 0.9    // How well it handles connections
    },
    fabric: { 
      baseCapacity: 30,
      tensileStrength: 20,
      shearStrength: 10,
      density: 0.005,
      jointEfficiency: 0.3
    },
    sisal: { 
      baseCapacity: 60,
      tensileStrength: 50,
      shearStrength: 30,
      density: 0.015,
      jointEfficiency: 0.5
    },
    carpet: { 
      baseCapacity: 40,
      tensileStrength: 25,
      shearStrength: 15,
      density: 0.008,
      jointEfficiency: 0.4
    },
    cushion: { 
      baseCapacity: 20,
      tensileStrength: 10,
      shearStrength: 5,
      density: 0.003,
      jointEfficiency: 0.2
    }
  },

  // ========================================
  // CONNECTION TYPES & STRENGTH
  // ========================================
  
  /**
   * Joint/bracket types that could be used between pieces
   * These would be actual hardware in the real build
   */
  connectionTypes: {
    none: { 
      strength: 0, 
      cost: 0,
      description: 'No connection (just stacked)'
    },
    screws: { 
      strength: 50, 
      cost: 2,
      description: 'Wood screws'
    },
    brackets_light: { 
      strength: 75, 
      cost: 5,
      description: 'Light duty L-brackets'
    },
    brackets_heavy: { 
      strength: 150, 
      cost: 12,
      description: 'Heavy duty brackets'
    },
    bolts: { 
      strength: 200, 
      cost: 8,
      description: 'Through-bolts with washers'
    },
    glue_and_screws: { 
      strength: 100, 
      cost: 6,
      description: 'Wood glue + screws'
    },
    metal_plate: { 
      strength: 250, 
      cost: 20,
      description: 'Metal reinforcement plate'
    }
  },

  // ========================================
  // WEIGHT CALCULATIONS
  // ========================================
  
  /**
   * Calculate the weight of a piece based on its dimensions and material
   * @param {Object} piece - Piece object
   * @returns {number} Weight in pounds
   */
  calculatePieceWeight: (piece) => {
    const material = StructuralAnalysis.materialStrength[piece.material] || 
                    StructuralAnalysis.materialStrength.wood;
    
    // Calculate volume in cubic inches
    let volume;
    
    if (piece.hollow) {
      // Hollow pieces - estimate wall thickness at 0.75"
      const wallThickness = 0.75;
      const outerVolume = piece.width * piece.height * piece.depth;
      const innerVolume = Math.max(0, 
        (piece.width - 2*wallThickness) * 
        (piece.height - 2*wallThickness) * 
        (piece.depth - 2*wallThickness)
      );
      volume = outerVolume - innerVolume;
    } else {
      // Solid pieces
      if (piece.shape === 'cylinder') {
        volume = Math.PI * Math.pow(piece.width/2, 2) * piece.height;
      } else {
        volume = piece.width * piece.height * piece.depth;
      }
    }
    
    return Math.round(volume * material.density * 10) / 10;
  },

  /**
   * Calculate total design weight
   * @param {Array} pieces - Array of piece objects
   * @returns {number} Total weight in pounds
   */
  calculateTotalWeight: (pieces) => {
    return pieces.reduce((total, piece) => 
      total + StructuralAnalysis.calculatePieceWeight(piece), 0
    );
  },

  // ========================================
  // STRUCTURAL ANALYSIS
  // ========================================
  
  /**
   * Analyze which pieces are supporting other pieces
   * @param {Array} pieces - Array of piece objects
   * @returns {Object} Support structure map
   */
  analyzeSupportStructure: (pieces) => {
    const supportMap = {};
    
    pieces.forEach(piece => {
      supportMap[piece.id] = {
        piece: piece,
        supporting: [],      // IDs of pieces this supports
        supportedBy: [],     // IDs of pieces supporting this
        connections: [],     // Connection points
        totalLoad: 0,        // Total weight bearing (lbs)
        stressLevel: 0       // 0-1 stress indicator
      };
    });
    
    // Find support relationships
    pieces.forEach(upperPiece => {
      pieces.forEach(lowerPiece => {
        if (upperPiece.id === lowerPiece.id) return;
        
        // Check if lowerPiece supports upperPiece
        if (StructuralAnalysis.isSupporting(lowerPiece, upperPiece)) {
          supportMap[lowerPiece.id].supporting.push(upperPiece.id);
          supportMap[upperPiece.id].supportedBy.push(lowerPiece.id);
          
          // Calculate connection point
          const connection = StructuralAnalysis.calculateConnectionPoint(
            lowerPiece, 
            upperPiece
          );
          supportMap[lowerPiece.id].connections.push(connection);
        }
      });
    });
    
    // Calculate load distribution
    StructuralAnalysis.calculateLoadDistribution(supportMap, pieces);
    
    return supportMap;
  },

  /**
   * Check if one piece is supporting another
   * @param {Object} lowerPiece - Potentially supporting piece
   * @param {Object} upperPiece - Potentially supported piece
   * @returns {boolean} Whether lower supports upper
   */
  isSupporting: (lowerPiece, upperPiece) => {
    // Check vertical alignment
    const lowerTop = lowerPiece.y + lowerPiece.height;
    const upperBottom = upperPiece.y;
    
    // Must be within 1 inch vertically to be supporting
    if (Math.abs(lowerTop - upperBottom) > 1) return false;
    
    // Check horizontal overlap
    const overlapX = StructuralAnalysis.calculateOverlap(
      lowerPiece.x - lowerPiece.width/2, 
      lowerPiece.x + lowerPiece.width/2,
      upperPiece.x - upperPiece.width/2, 
      upperPiece.x + upperPiece.width/2
    );
    
    const overlapZ = StructuralAnalysis.calculateOverlap(
      lowerPiece.z - lowerPiece.depth/2, 
      lowerPiece.z + lowerPiece.depth/2,
      upperPiece.z - upperPiece.depth/2, 
      upperPiece.z + upperPiece.depth/2
    );
    
    // Need at least 2 inches of overlap in both directions
    return overlapX >= 2 && overlapZ >= 2;
  },

  /**
   * Calculate overlap between two ranges
   */
  calculateOverlap: (min1, max1, min2, max2) => {
    return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
  },

  /**
   * Calculate connection point between two pieces
   */
  calculateConnectionPoint: (lowerPiece, upperPiece) => {
    const overlapCenterX = (
      Math.max(lowerPiece.x - lowerPiece.width/2, upperPiece.x - upperPiece.width/2) +
      Math.min(lowerPiece.x + lowerPiece.width/2, upperPiece.x + upperPiece.width/2)
    ) / 2;
    
    const overlapCenterZ = (
      Math.max(lowerPiece.z - lowerPiece.depth/2, upperPiece.z - upperPiece.depth/2) +
      Math.min(lowerPiece.z + lowerPiece.depth/2, upperPiece.z + upperPiece.depth/2)
    ) / 2;
    
    const overlapArea = StructuralAnalysis.calculateOverlap(
      lowerPiece.x - lowerPiece.width/2, 
      lowerPiece.x + lowerPiece.width/2,
      upperPiece.x - upperPiece.width/2, 
      upperPiece.x + upperPiece.width/2
    ) * StructuralAnalysis.calculateOverlap(
      lowerPiece.z - lowerPiece.depth/2, 
      lowerPiece.z + lowerPiece.depth/2,
      upperPiece.z - upperPiece.depth/2, 
      upperPiece.z + upperPiece.depth/2
    );
    
    return {
      x: overlapCenterX,
      y: lowerPiece.y + lowerPiece.height,
      z: overlapCenterZ,
      area: overlapArea,
      upperPieceId: upperPiece.id,
      lowerPieceId: lowerPiece.id,
      suggestedConnection: StructuralAnalysis.suggestConnection(overlapArea, upperPiece)
    };
  },

  /**
   * Suggest connection type based on overlap area and load
   */
  suggestConnection: (overlapArea, upperPiece) => {
    const weight = StructuralAnalysis.calculatePieceWeight(upperPiece);
    
    if (overlapArea < 4) {
      // Small overlap - needs strong connection
      return weight > 20 ? 'metal_plate' : 'brackets_heavy';
    } else if (overlapArea < 16) {
      // Medium overlap
      return weight > 15 ? 'brackets_heavy' : 'brackets_light';
    } else {
      // Good overlap
      return weight > 10 ? 'glue_and_screws' : 'screws';
    }
  },

  /**
   * Calculate load distribution through the structure
   */
  calculateLoadDistribution: (supportMap, pieces) => {
    // Start from top pieces and work down
    const processingQueue = [];
    const processed = new Set();
    
    // Find top-level pieces (nothing above them)
    Object.values(supportMap).forEach(node => {
      if (node.supporting.length === 0) {
        processingQueue.push(node.piece.id);
      }
    });
    
    while (processingQueue.length > 0) {
      const pieceId = processingQueue.shift();
      if (processed.has(pieceId)) continue;
      
      const node = supportMap[pieceId];
      const pieceWeight = StructuralAnalysis.calculatePieceWeight(node.piece);
      
      // Add weight of everything this piece supports
      const supportedWeight = node.supporting.reduce((total, supportedId) => {
        return total + (supportMap[supportedId].totalLoad || 0);
      }, 0);
      
      node.totalLoad = pieceWeight + supportedWeight;
      
      // Calculate stress level
      const material = StructuralAnalysis.materialStrength[node.piece.material] || 
                      StructuralAnalysis.materialStrength.wood;
      const contactArea = node.piece.width * node.piece.depth;
      const maxCapacity = material.baseCapacity * contactArea;
      
      node.stressLevel = Math.min(1, node.totalLoad / maxCapacity);
      
      processed.add(pieceId);
      
      // Add supporting pieces to queue
      node.supportedBy.forEach(supportId => {
        if (!processed.has(supportId)) {
          processingQueue.push(supportId);
        }
      });
    }
  },

  // ========================================
  // CAT WEIGHT TESTING
  // ========================================
  
  /**
   * Test if structure can support specified cat weights
   * @param {Array} pieces - Array of piece objects
   * @param {Array} catWeights - Array of cat weights in pounds
   * @param {Object} supportMap - Pre-calculated support map
   * @returns {Object} Test results with pass/fail and weak points
   */
  testCatWeights: (pieces, catWeights, supportMap) => {
    const totalCatWeight = catWeights.reduce((sum, w) => sum + w, 0);
    const maxSingleCat = Math.max(...catWeights);
    
    const results = {
      passed: true,
      totalCapacity: 0,
      weakPoints: [],
      recommendations: [],
      safetyFactor: 2.0, // Recommended 2x safety factor
      catDistribution: {}
    };
    
    // Find platforms and perches where cats would rest
    const restingSpots = pieces.filter(p => 
      p.variantId?.includes('platform') || 
      p.variantId?.includes('perch') ||
      p.variantId?.includes('house')
    );
    
    // Test each resting spot
    restingSpots.forEach(spot => {
      const node = supportMap[spot.id];
      const material = StructuralAnalysis.materialStrength[spot.material] || 
                      StructuralAnalysis.materialStrength.wood;
      
      // Calculate spot capacity
      const contactArea = spot.width * spot.depth;
      const spotCapacity = material.baseCapacity * contactArea;
      
      // Check if it can hold the heaviest cat with safety factor
      const requiredCapacity = maxSingleCat * results.safetyFactor;
      const totalLoadWithCat = node.totalLoad + maxSingleCat;
      
      results.catDistribution[spot.id] = {
        name: spot.name,
        currentLoad: node.totalLoad,
        capacity: spotCapacity,
        canHoldCat: totalLoadWithCat < spotCapacity / results.safetyFactor,
        maxCatWeight: Math.max(0, (spotCapacity / results.safetyFactor) - node.totalLoad)
      };
      
      if (totalLoadWithCat > spotCapacity / results.safetyFactor) {
        results.passed = false;
        results.weakPoints.push({
          pieceId: spot.id,
          pieceName: spot.name,
          issue: `Cannot safely support ${maxSingleCat}lb cat`,
          currentCapacity: Math.round((spotCapacity / results.safetyFactor) - node.totalLoad),
          required: maxSingleCat
        });
      }
      
      results.totalCapacity += spotCapacity;
    });
    
    // Check support structure
    Object.values(supportMap).forEach(node => {
      if (node.stressLevel > 0.5) {
        results.recommendations.push({
          pieceId: node.piece.id,
          pieceName: node.piece.name,
          stress: Math.round(node.stressLevel * 100),
          suggestion: node.stressLevel > 0.75 ? 
            'Critical: Add reinforcement or use stronger material' :
            'Warning: Consider adding support brackets'
        });
      }
    });
    
    // Overall recommendations
    if (!results.passed) {
      results.recommendations.unshift({
        pieceId: null,
        pieceName: 'Overall Design',
        stress: 100,
        suggestion: `Design cannot safely support ${maxSingleCat}lb cat. Add support posts or use stronger materials.`
      });
    }
    
    return results;
  },

  // ========================================
  // CONNECTION RECOMMENDATIONS
  // ========================================
  
  /**
   * Generate hardware/connection recommendations
   * @param {Object} supportMap - Support structure map
   * @returns {Array} List of recommended connections
   */
  recommendConnections: (supportMap) => {
    const recommendations = [];
    const totalCost = { brackets: 0, hardware: 0 };
    
    Object.values(supportMap).forEach(node => {
      node.connections.forEach(conn => {
        const connectionType = conn.suggestedConnection;
        const connection = StructuralAnalysis.connectionTypes[connectionType];
        
        recommendations.push({
          between: [conn.lowerPieceId, conn.upperPieceId],
          type: connectionType,
          description: connection.description,
          cost: connection.cost,
          strength: connection.strength,
          location: { x: conn.x, y: conn.y, z: conn.z }
        });
        
        totalCost.hardware += connection.cost;
      });
    });
    
    return {
      connections: recommendations,
      totalHardwareCost: totalCost.hardware,
      count: recommendations.length
    };
  },

  // ========================================
  // VISUAL STRESS INDICATORS
  // ========================================
  
  /**
   * Get color for stress visualization
   * @param {number} stressLevel - Stress level 0-1
   * @returns {number} Color hex value
   */
  getStressColor: (stressLevel) => {
    if (stressLevel < 0.3) return 0x00ff00; // Green - safe
    if (stressLevel < 0.5) return 0xffff00; // Yellow - caution
    if (stressLevel < 0.75) return 0xff8800; // Orange - warning
    return 0xff0000; // Red - critical
  },

  /**
   * Generate stress report for display
   * @param {Array} pieces - Array of pieces
   * @param {Array} catWeights - Array of cat weights
   * @returns {Object} Complete analysis report
   */
  generateStressReport: (pieces, catWeights = [15]) => {
    const supportMap = StructuralAnalysis.analyzeSupportStructure(pieces);
    const testResults = StructuralAnalysis.testCatWeights(pieces, catWeights, supportMap);
    const connections = StructuralAnalysis.recommendConnections(supportMap);
    const totalWeight = StructuralAnalysis.calculateTotalWeight(pieces);
    
    return {
      summary: {
        passed: testResults.passed,
        totalStructureWeight: Math.round(totalWeight * 10) / 10,
        maxCatWeight: Math.max(...catWeights),
        totalCatWeight: catWeights.reduce((sum, w) => sum + w, 0),
        numberOfCats: catWeights.length,
        safetyFactor: testResults.safetyFactor
      },
      supportStructure: supportMap,
      testResults: testResults,
      connections: connections,
      criticalPoints: testResults.weakPoints,
      recommendations: testResults.recommendations
    };
  }
};

// Export for use in other modules
window.StructuralAnalysis = StructuralAnalysis;