// =====================================================
// STATE MANAGEMENT HOOK -v18- PLATFORM FLIP FUNCTIONALITY
// =====================================================

const usePieceManagement = () => {
  const { useState, useCallback } = React;
  
  // ========================================
  // CORE STATE MANAGEMENT
  // ========================================
  
  // Primary Data States
  const [pieces, setPieces] = useState([]);
  const [openings, setOpenings] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Selection States
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedOpening, setSelectedOpening] = useState(null);
  
  // UI States
  const [movementIncrement, setMovementIncrement] = useState(2);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  
  // Auto-naming State
  const [pieceCounts, setPieceCounts] = useState({}); // Tracks piece counts for auto-naming

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Clamps a value between min and max bounds
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  
  /**
   * Normalizes rotation to 0-2π range (for rotationY only)
   * @param {number} rotation - Rotation in radians
   * @returns {number} Normalized rotation
   */
  const normalizeRotation = (rotation) => ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  /**
   * Clamps tilt angles to valid range (-π/2 to π/2)
   * @param {number} tilt - Tilt angle in radians
   * @returns {number} Clamped tilt angle
   */
  const clampTilt = (tilt) => clamp(tilt, -Math.PI/2, Math.PI/2);

  /**
   * Checks if a piece can be flipped (only platforms)
   * @param {Object} piece - Piece to check
   * @returns {boolean} Whether piece can be flipped
   */
  const canFlipPiece = useCallback((piece) => {
    if (!piece || !piece.variantId) return false;
    // Only allow flipping for platform pieces
    return piece.variantId.startsWith('platform-');
  }, []);

  // ========================================
  // PIECE CREATION AND MANAGEMENT
  // ========================================
  
  /**
   * Creates a new piece from a variant definition
   * @param {string} variantId - ID of the variant to create
   * @param {Object} customizations - Optional customizations to apply
   */
  const addPieceFromVariant = useCallback((variantId, customizations = {}) => {
    const variant = CatTreePieces.getVariantById(variantId);
    if (!variant) {
      console.error('Failed to create piece from variant:', variantId);
      return;
    }

    // Generate auto-incrementing name
    const currentCount = pieceCounts[variantId] || 0;
    const newCount = currentCount + 1;
    
    const newPiece = CatTreePieces.createPieceFromVariant(variantId, customizations);
    if (!newPiece) return;
    
    newPiece.name = `${variant.name} ${newCount}`;
    newPiece.variantCount = newCount;
    newPiece.flipped = false; // Add flipped property

    // Update piece count tracking
    setPieceCounts(prev => ({
      ...prev,
      [variantId]: newCount
    }));

    // Add to pieces and select it
    setPieces(prev => [...prev, newPiece]);
    setSelectedPiece(newPiece);
    setShowCustomizationPanel(true);
  }, [pieceCounts]);

  /**
   * Selects a piece and clears other selections
   * @param {string} pieceId - ID of piece to select
   */
  const selectPiece = useCallback((pieceId) => {
    const piece = pieces.find(p => p.id === pieceId);
    setSelectedPiece(piece || null);
    setSelectedGroup(null);
    setSelectedOpening(null);
    if (piece) {
      setShowCustomizationPanel(true);
    }
  }, [pieces]);

  /**
   * Updates piece customization properties with proper validation
   * @param {string} pieceId - ID of piece to update
   * @param {Object} updates - Properties to update
   */
  const updatePieceCustomization = useCallback((pieceId, updates) => {
    setPieces(prev => 
      prev.map(piece => {
        if (piece.id === pieceId) {
          // Apply validation to updated properties
          const validatedUpdates = { ...updates };
          
          if (updates.width !== undefined) validatedUpdates.width = clamp(updates.width, 1, 48);
          if (updates.height !== undefined) validatedUpdates.height = clamp(updates.height, 1, 72);
          if (updates.depth !== undefined) validatedUpdates.depth = clamp(updates.depth, 1, 48);
          if (updates.rotationY !== undefined) validatedUpdates.rotationY = normalizeRotation(updates.rotationY);
          
          // FIXED: Tilt angles should be clamped, not normalized
          if (updates.tiltX !== undefined) validatedUpdates.tiltX = clampTilt(updates.tiltX);
          if (updates.tiltZ !== undefined) validatedUpdates.tiltZ = clampTilt(updates.tiltZ);
          
          const updated = { ...piece, ...validatedUpdates, lastModified: new Date().toISOString() };
          
          // Update selected piece state if this is the selected piece
          setSelectedPiece(current => current?.id === pieceId ? updated : current);
          return updated;
        }
        return piece;
      })
    );
  }, []);

  /**
   * Flips a platform piece between horizontal and vertical orientation
   * @param {string} pieceId - ID of piece to flip
   */
  const flipPiece = useCallback((pieceId) => {
    setPieces(prev => 
      prev.map(piece => {
        if (piece.id === pieceId && canFlipPiece(piece) && !piece.locked) {
          // Swap width and height when flipping
          const newWidth = piece.height;
          const newHeight = piece.width;
          
          const updated = {
            ...piece,
            width: newWidth,
            height: newHeight,
            flipped: !piece.flipped,
            lastModified: new Date().toISOString()
          };
          
          console.log(`🔄 Flipped ${piece.name}: ${piece.flipped ? 'horizontal' : 'vertical'} → ${updated.flipped ? 'vertical' : 'horizontal'}`);
          console.log(`  Dimensions: ${piece.width}" × ${piece.height}" → ${newWidth}" × ${newHeight}"`);
          
          // Update selected piece state if this is the selected piece
          setSelectedPiece(current => current?.id === pieceId ? updated : current);
          return updated;
        }
        return piece;
      })
    );
  }, [canFlipPiece]);

  /**
   * Opens customization panel for a specific piece
   * @param {string} pieceId - ID of piece to customize
   */
  const openCustomizationPanel = useCallback((pieceId) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (piece) {
      setSelectedPiece(piece);
      setShowCustomizationPanel(true);
    }
  }, [pieces]);

  /**
   * Closes the customization panel
   */
  const closeCustomizationPanel = useCallback(() => {
    setShowCustomizationPanel(false);
  }, []);

  /**
   * Toggles the locked state of a piece
   * @param {string} pieceId - ID of piece to toggle
   */
  const togglePieceLock = useCallback((pieceId) => {
    setPieces(prev => {
      let updatedPiece = null;
      const newPieces = prev.map(piece => {
        if (piece.id === pieceId) {
          updatedPiece = { ...piece, locked: !piece.locked, lastModified: new Date().toISOString() };
          return updatedPiece;
        }
        return piece;
      });
      
      // Update selected piece state if this is the selected piece
      setSelectedPiece(current => current?.id === pieceId ? updatedPiece : current);
      return newPieces;
    });
  }, []);

  /**
   * Deletes a piece and all associated openings
   * @param {string} pieceId - ID of piece to delete
   */
  const deletePiece = useCallback((pieceId) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (piece?.locked) return;
    
    // Remove piece
    setPieces(prev => prev.filter(piece => piece.id !== pieceId));
    
    // Clear selection if this piece was selected
    setSelectedPiece(current => current?.id === pieceId ? null : current);
    
    // Remove associated openings
    setOpenings(prev => prev.filter(opening => opening.parentPieceId !== pieceId));
    setSelectedOpening(current => current?.parentPieceId === pieceId ? null : current);
  }, [pieces]);

  /**
   * Duplicates a piece with a new auto-generated name
   * @param {string} pieceId - ID of piece to duplicate
   */
  const duplicatePiece = useCallback((pieceId) => {
    setPieces(prev => {
      const originalPiece = prev.find(p => p.id === pieceId);
      if (!originalPiece) return prev;

      const variantId = originalPiece.variantId;
      const currentCount = pieceCounts[variantId] || 0;
      const newCount = currentCount + 1;

      const duplicatedPiece = {
        ...originalPiece,
        id: `${originalPiece.variantId}-${Date.now()}`,
        name: `${CatTreePieces.getVariantById(variantId)?.name || 'Copy'} ${newCount}`,
        variantCount: newCount,
        x: clamp(originalPiece.x + movementIncrement * 2, -60, 60),
        z: clamp(originalPiece.z + movementIncrement * 2, -60, 60),
        locked: false,
        groupId: null,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      // Update piece count tracking
      setPieceCounts(prevCounts => ({
        ...prevCounts,
        [variantId]: newCount
      }));

      setSelectedPiece(duplicatedPiece);
      return [...prev, duplicatedPiece];
    });
  }, [movementIncrement, pieceCounts]);

  // ========================================
  // PIECE MOVEMENT SYSTEM
  // ========================================
  
  /**
   * Moves a piece in a specified direction or to custom position
   * @param {string} pieceId - ID of piece to move
   * @param {string} direction - Movement direction or 'custom'
   * @param {Object} customPos - Custom position {x, y, z} when direction is 'custom'
   */
  const movePiece = useCallback((pieceId, direction, customPos = null) => {
    setPieces(prev => 
      prev.map(piece => {
        if (piece.id !== pieceId || piece.locked || piece.groupId) return piece;

        let newX = piece.x;
        let newY = piece.y;
        let newZ = piece.z;

        if (customPos) {
          // Apply custom position
          if (customPos.x !== undefined) newX = customPos.x;
          if (customPos.y !== undefined) newY = customPos.y;
          if (customPos.z !== undefined) newZ = customPos.z;
        } else {
          // Apply directional movement
          switch (direction) {
            case 'left': newX -= movementIncrement; break;
            case 'right': newX += movementIncrement; break;
            case 'forward': newZ -= movementIncrement; break;
            case 'back': newZ += movementIncrement; break;
            case 'up': newY += movementIncrement; break;
            case 'down': newY = Math.max(0, newY - movementIncrement); break;
            case 'center': newX = 0; newZ = 0; break;
            case 'ground': newY = 0; break;
          }
        }

        // Apply bounds checking
        newX = clamp(newX, -60, 60);
        newY = Math.max(0, newY);
        newZ = clamp(newZ, -60, 60);

        const updated = { ...piece, x: newX, y: newY, z: newZ, lastModified: new Date().toISOString() };
        
        // Update selected piece state if this is the selected piece
        setSelectedPiece(current => current?.id === pieceId ? updated : current);
        return updated;
      })
    );
  }, [movementIncrement]);

  /**
   * Handles piece dragging from 3D canvas
   * @param {string} pieceId - ID of piece being dragged
   * @param {number} x - New X position
   * @param {number} y - New Y position  
   * @param {number} z - New Z position
   */
  const dragPiece = useCallback((pieceId, x, y, z) => {
    setPieces(prev => 
      prev.map(piece => {
        if (piece.id === pieceId && !piece.locked && !piece.groupId) {
          // Apply bounds checking
          const newX = clamp(x, -60, 60);
          const newY = Math.max(0, y);
          const newZ = clamp(z, -60, 60);
          
          const updated = { ...piece, x: newX, y: newY, z: newZ, lastModified: new Date().toISOString() };
          
          // Update selected piece state if this is the selected piece
          setSelectedPiece(current => current?.id === pieceId ? updated : current);
          return updated;
        }
        return piece;
      })
    );
  }, []);

  /**
   * Rotates a piece by specified degrees
   * SIMPLIFIED: All pieces including panels rotate in place
   * @param {string} pieceId - ID of piece to rotate
   * @param {number} degrees - Degrees to rotate (positive = clockwise)
   */
  const rotatePiece = useCallback((pieceId, degrees) => {
    setPieces(prev => 
      prev.map(piece => {
        if (piece.id === pieceId && !piece.locked) {
          // Simple in-place rotation for ALL pieces including panels
          const angleChange = degrees * Math.PI / 180;
          const newRotationY = normalizeRotation((piece.rotationY || 0) + angleChange);
          
          console.log(`🔄 Rotating ${piece.name} in place by ${degrees}°`);
          console.log(`  New rotationY: ${(newRotationY * 180 / Math.PI).toFixed(1)}°`);
          
          const updated = { 
            ...piece, 
            rotationY: newRotationY,
            lastModified: new Date().toISOString() 
          };
          
          // Update selected piece state if this is the selected piece
          setSelectedPiece(current => current?.id === pieceId ? updated : current);
          return updated;
        }
        return piece;
      })
    );
  }, []);

  /**
   * Updates piece dimensions with validation
   * @param {string} pieceId - ID of piece to update
   * @param {Object} newDimensions - New dimensions {width, height, depth}
   */
  const updatePieceDimensions = useCallback((pieceId, newDimensions) => {
    setPieces(prev => 
      prev.map(piece => {
        if (piece.id === pieceId && !piece.locked) {
          const width = clamp(newDimensions.width ?? piece.width, 1, 48);
          const height = clamp(newDimensions.height ?? piece.height, 1, 72);
          const depth = clamp(newDimensions.depth ?? piece.depth, 1, 48);
          
          const updated = { ...piece, width, height, depth, lastModified: new Date().toISOString() };
          
          // Update selected piece state if this is the selected piece
          setSelectedPiece(current => current?.id === pieceId ? updated : current);
          return updated;
        }
        return piece;
      })
    );
  }, []);

  // ========================================
  // GROUP MANAGEMENT SYSTEM
  // ========================================
  
  /**
   * Creates a new group from selected pieces
   * @param {string[]} pieceIds - Array of piece IDs to group
   * @param {string} groupName - Optional custom group name
   */
  const createGroup = useCallback((pieceIds, groupName = null) => {
    if (pieceIds.length < 2) return;
    
    const groupId = `group-${Date.now()}`;
    const autoGroupName = groupName || `Group ${groups.length + 1}`;
    
    const newGroup = {
      id: groupId,
      name: autoGroupName,
      pieceIds: pieceIds,
      locked: false,
      createdAt: new Date().toISOString()
    };
    
    // Assign pieces to group
    setPieces(prev => 
      prev.map(piece => 
        pieceIds.includes(piece.id) 
          ? { ...piece, groupId, lastModified: new Date().toISOString() }
          : piece
      )
    );
    
    // Add group and select it
    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(newGroup);
    setSelectedPiece(null);
    setSelectedOpening(null);
  }, [groups.length]);

  /**
   * Removes group association from pieces
   * @param {string} groupId - ID of group to ungroup
   */
  const ungroupPieces = useCallback((groupId) => {
    // Remove group ID from pieces
    setPieces(prev => 
      prev.map(piece => 
        piece.groupId === groupId 
          ? { ...piece, groupId: null, lastModified: new Date().toISOString() }
          : piece
      )
    );
    
    // Remove group
    setGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Clear selection if this group was selected
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }
  }, [selectedGroup]);

  /**
   * Selects a group and clears other selections
   * @param {string} groupId - ID of group to select
   */
  const selectGroup = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    setSelectedGroup(group || null);
    setSelectedPiece(null);
    setSelectedOpening(null);
  }, [groups]);

  /**
   * Toggles the locked state of a group
   * @param {string} groupId - ID of group to toggle
   */
  const toggleGroupLock = useCallback((groupId) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, locked: !group.locked, lastModified: new Date().toISOString() }
          : group
      )
    );
  }, []);

  /**
   * Moves all pieces in a group together
   * @param {string} groupId - ID of group to move
   * @param {string} direction - Movement direction or 'custom'
   * @param {Object} customPos - Custom position when direction is 'custom'
   */
  const moveGroup = useCallback((groupId, direction, customPos = null) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.locked) return;

    const groupPieces = pieces.filter(p => p.groupId === groupId);
    if (groupPieces.length === 0) return;

    // Calculate group center
    const groupCenter = {
      x: groupPieces.reduce((sum, p) => sum + p.x, 0) / groupPieces.length,
      y: groupPieces.reduce((sum, p) => sum + p.y, 0) / groupPieces.length,
      z: groupPieces.reduce((sum, p) => sum + p.z, 0) / groupPieces.length
    };

    let deltaX = 0, deltaY = 0, deltaZ = 0;

    if (customPos) {
      // Calculate deltas for custom position
      deltaX = customPos.x !== undefined ? customPos.x - groupCenter.x : 0;
      deltaY = customPos.y !== undefined ? customPos.y - groupCenter.y : 0;
      deltaZ = customPos.z !== undefined ? customPos.z - groupCenter.z : 0;
    } else {
      // Calculate deltas for directional movement
      switch (direction) {
        case 'left': deltaX = -movementIncrement; break;
        case 'right': deltaX = movementIncrement; break;
        case 'forward': deltaZ = -movementIncrement; break;
        case 'back': deltaZ = movementIncrement; break;
        case 'up': deltaY = movementIncrement; break;
        case 'down': deltaY = -movementIncrement; break;
        case 'center': 
          deltaX = -groupCenter.x;
          deltaZ = -groupCenter.z;
          break;
        case 'ground': 
          deltaY = -groupCenter.y;
          break;
      }
    }

    // Apply movement to all pieces in group
    setPieces(prev => 
      prev.map(piece => {
        if (piece.groupId === groupId) {
          const newX = clamp(piece.x + deltaX, -60, 60);
          const newY = Math.max(0, piece.y + deltaY);
          const newZ = clamp(piece.z + deltaZ, -60, 60);
          
          return {
            ...piece,
            x: newX,
            y: newY,
            z: newZ,
            lastModified: new Date().toISOString()
          };
        }
        return piece;
      })
    );
  }, [groups, pieces, movementIncrement]);

  /**
   * Rotates all pieces in a group around the group center
   * @param {string} groupId - ID of group to rotate
   * @param {number} degrees - Degrees to rotate
   */
  const rotateGroup = useCallback((groupId, degrees) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.locked) return;

    console.log(`🔄 Group rotation of group ${groupId} by ${degrees}°`);

    setPieces(prev => {
      const groupPieces = prev.filter(p => p.groupId === groupId);
      if (groupPieces.length === 0) return prev;
    
      // Calculate group center
      const centerX = groupPieces.reduce((sum, p) => sum + p.x, 0) / groupPieces.length;
      const centerZ = groupPieces.reduce((sum, p) => sum + p.z, 0) / groupPieces.length;
      
      console.log(`🎯 Group center: (${centerX.toFixed(2)}, ${centerZ.toFixed(2)})`);
    
      const radians = degrees * Math.PI / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
    
      return prev.map(piece => {
        if (piece.groupId !== groupId) return piece;
      
        // Calculate relative position from group center
        const relX = piece.x - centerX;
        const relZ = piece.z - centerZ;
        
        // Rotate position around group center
        const newRelX = relX * cos + relZ * sin;
        const newRelZ = -relX * sin + relZ * cos;
        
        // New absolute position
        const newX = centerX + newRelX;
        const newZ = centerZ + newRelZ;
        
        // Update rotation for all pieces
        const newRotationY = normalizeRotation((piece.rotationY || 0) + radians);
        
        return {
          ...piece,
          x: newX,
          z: newZ,
          rotationY: newRotationY,
          lastModified: new Date().toISOString()
        };
      });
    });
    
    console.log('✅ Group rotation completed');
  }, [groups]);

  // ========================================
  // OPENING MANAGEMENT SYSTEM
  // ========================================
  
  /**
   * Adds a new opening to a hollow piece
   * @param {string} pieceId - ID of parent piece
   * @param {string} openingType - Type of opening to add
   * @param {string} face - Face to place opening on
   */
  const addOpening = useCallback((pieceId, openingType, face = 'front') => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || !piece.hollow) return;
    
    // Check opening limit
    const pieceOpenings = openings.filter(o => o.parentPieceId === pieceId);
    if (pieceOpenings.length >= 4) {
      console.warn('Maximum 4 openings per piece');
      return;
    }
    
    const template = CatTreePieces.openingTypes[openingType];
    if (!template) return;

    const newOpening = {
      id: `${openingType}-${Date.now()}`,
      type: openingType,
      name: template.name,
      width: template.width,
      height: template.height,
      shape: template.shape,
      parentPieceId: pieceId,
      face: face,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
      locked: false,
      createdAt: new Date().toISOString()
    };

    setOpenings(prev => [...prev, newOpening]);
    setSelectedOpening(newOpening);
  }, [pieces, openings]);

  /**
   * Removes an opening
   * @param {string} openingId - ID of opening to remove
   */
  const removeOpening = useCallback((openingId) => {
    setOpenings(prev => prev.filter(o => o.id !== openingId));
    setSelectedOpening(current => current?.id === openingId ? null : current);
  }, []);

  /**
   * Moves an opening on its face
   * @param {string} openingId - ID of opening to move
   * @param {number} offsetX - X offset on face
   * @param {number} offsetY - Y offset on face
   * @param {number} offsetZ - Z offset on face
   */
  const moveOpening = useCallback((openingId, offsetX, offsetY, offsetZ) => {
    setOpenings(prev => 
      prev.map(opening => {
        if (opening.id === openingId && !opening.locked) {
          const updated = { 
            ...opening, 
            offsetX, 
            offsetY, 
            offsetZ, 
            lastModified: new Date().toISOString() 
          };
          
          // Update selected opening state if this is the selected opening
          setSelectedOpening(current => current?.id === openingId ? updated : current);
          return updated;
        }
        return opening;
      })
    );
  }, []);

  /**
   * Selects an opening and clears other selections
   * @param {string} openingId - ID of opening to select
   */
  const selectOpening = useCallback((openingId) => {
    const opening = openings.find(o => o.id === openingId);
    setSelectedOpening(opening || null);
    setSelectedPiece(null);
    setSelectedGroup(null);
  }, [openings]);

  /**
   * Toggles the locked state of an opening
   * @param {string} openingId - ID of opening to toggle
   */
  const toggleOpeningLock = useCallback((openingId) => {
    setOpenings(prev => 
      prev.map(opening => {
        if (opening.id === openingId) {
          const updated = { 
            ...opening, 
            locked: !opening.locked, 
            lastModified: new Date().toISOString() 
          };
          
          // Update selected opening state if this is the selected opening
          setSelectedOpening(current => current?.id === openingId ? updated : current);
          return updated;
        }
        return opening;
      })
    );
  }, []);

  /**
   * Changes which face an opening is on
   * @param {string} openingId - ID of opening to move
   * @param {string} newFace - New face for opening
   */
  const changeOpeningFace = useCallback((openingId, newFace) => {
    setOpenings(prev => 
      prev.map(opening => {
        if (opening.id === openingId && !opening.locked) {
          const updated = { 
            ...opening, 
            face: newFace, 
            offsetX: 0, 
            offsetY: 0, 
            offsetZ: 0, 
            lastModified: new Date().toISOString() 
          };
          
          // Update selected opening state if this is the selected opening
          setSelectedOpening(current => current?.id === openingId ? updated : current);
          return updated;
        }
        return opening;
      })
    );
  }, []);

  // ========================================
  // DATA MANAGEMENT & STATISTICS
  // ========================================
  
  /**
   * Clears all pieces, groups, openings and resets state
   */
  const clearAllPieces = useCallback(() => {
    setPieces([]);
    setSelectedPiece(null);
    setGroups([]);
    setSelectedGroup(null);
    setOpenings([]);
    setSelectedOpening(null);
    setShowCustomizationPanel(false);
    setPieceCounts({});
  }, []);

  /**
   * Calculates design statistics
   * @returns {Object} Design statistics including cost, height, counts
   */
  const getDesignStats = useCallback(() => {
    return {
      totalCost: pieces.reduce((sum, piece) => sum + piece.cost, 0),
      maxHeight: pieces.reduce((max, piece) => Math.max(max, piece.y + piece.height), 0),
      totalPieces: pieces.length,
      totalOpenings: openings.length,
      hollowPieces: pieces.filter(p => p.hollow).length,
      lockedPieces: pieces.filter(p => p.locked).length
    };
  }, [pieces, openings]);

  // ========================================
  // SAVE/LOAD SYSTEM
  // ========================================
  
  /**
   * Saves the current design to a JSON file
   * @param {string} designName - Name for the saved design
   */
  const saveDesign = useCallback((designName = 'My Cat Tree') => {
    const stats = getDesignStats();
    const designData = {
      name: designName,
      createdAt: new Date().toISOString(),
      version: '1.8',
      pieces: pieces,
      groups: groups,
      openings: openings,
      pieceCounts: pieceCounts,
      stats: stats
    };
    
    const dataStr = JSON.stringify(designData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${designName.replace(/[^a-zA-Z0-9]/g, '_')}_cat_tree.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [pieces, groups, openings, pieceCounts, getDesignStats]);

  /**
   * Loads a design from a JSON file
   * @param {File} file - File to load design from
   */
  const loadDesign = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const designData = JSON.parse(e.target.result);
        if (designData.pieces && Array.isArray(designData.pieces)) {
          // Validate and clean loaded pieces
          const cleanPieces = designData.pieces.map(piece => ({
            ...piece,
            x: clamp(piece.x || 0, -60, 60),
            y: Math.max(0, piece.y || 0),
            z: clamp(piece.z || 0, -60, 60),
            width: clamp(piece.width || 12, 1, 48),
            height: clamp(piece.height || 12, 1, 72),
            depth: clamp(piece.depth || 12, 1, 48),
            rotationY: normalizeRotation(piece.rotationY || 0),
            // FIXED: Apply proper tilt clamping when loading
            tiltX: clampTilt(piece.tiltX || 0),
            tiltZ: clampTilt(piece.tiltZ || 0),
            flipped: piece.flipped ?? false, // Handle flipped property for older saves
            locked: piece.locked ?? false,
            groupId: piece.groupId ?? null,
            lastModified: piece.lastModified || new Date().toISOString()
          }));
          
          // Load all data
          setPieces(cleanPieces);
          setGroups(designData.groups || []);
          setOpenings(designData.openings || []);
          setPieceCounts(designData.pieceCounts || {});
          
          // Clear selections
          setSelectedPiece(null);
          setSelectedGroup(null);
          setSelectedOpening(null);
          setShowCustomizationPanel(false);
          
          console.log(`✅ Loaded design: ${designData.name || 'Unnamed'} (v${designData.version || 'unknown'})`);
        } else {
          alert('Invalid design file format');
        }
      } catch (error) {
        console.error('Error loading design file:', error);
        alert('Error loading design file: ' + error.message);
      }
    };
    reader.readAsText(file);
  }, []);

  // ========================================
  // HOOK RETURN - ORGANIZED BY FUNCTIONALITY
  // ========================================
  return {
    // Core Data
    pieces,
    openings,
    groups,
    
    // Selection State
    selectedPiece,
    selectedGroup,
    selectedOpening,
    
    // UI State
    showCustomizationPanel,
    movementIncrement,
    setMovementIncrement,
    
    // Piece Management
    addPieceFromVariant,
    selectPiece,
    updatePieceCustomization,
    openCustomizationPanel,
    closeCustomizationPanel,
    togglePieceLock,
    deletePiece,
    duplicatePiece,
    flipPiece, // NEW: Platform flip functionality
    canFlipPiece, // NEW: Check if piece can be flipped
    
    // Movement & Positioning
    movePiece,
    dragPiece,
    rotatePiece,
    updatePieceDimensions,
    
    // Group Management
    createGroup,
    ungroupPieces,
    selectGroup,
    toggleGroupLock,
    moveGroup,
    rotateGroup,
    
    // Opening Management
    addOpening,
    removeOpening,
    moveOpening,
    selectOpening,
    toggleOpeningLock,
    changeOpeningFace,
    
    // Data & Statistics
    clearAllPieces,
    getDesignStats,
    saveDesign,
    loadDesign
  };
};