// =====================================================
// OPTIMIZED 3D CANVAS COMPONENT -v30- STRUCTURAL STRESS VISUALIZATION
// =====================================================

const Canvas3D = ({ 
  pieces, 
  selectedPiece, 
  movementIncrement, 
  onPieceClick, 
  onPieceDrag, 
  onOpeningClick = () => {}, 
  gridWidth = 10, 
  gridHeight = 10, 
  openings = [], 
  selectedOpening = null,
  showStressVisualization = false,  // NEW: Control stress visualization
  backgroundImage = null,  // NEW: Background image prop
  gridOffsetX = 0,  // NEW: Grid position X offset
  gridOffsetZ = 0   // NEW: Grid position Z offset
}) => {
  const { useRef, useEffect, useMemo, useCallback, useState } = React;
  
  // ========================================
  // REFS & CORE STATE MANAGEMENT
  // ========================================
  
  // UI State
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Scene & Rendering References
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  
  // Object Management
  const meshMapRef = useRef(new Map()); // Maps piece/opening IDs to Three.js objects
  const animationIdRef = useRef(null);
  
  // Current State References (for event handlers)
  const currentPiecesRef = useRef(pieces);
  const currentOpeningsRef = useRef(openings);
  const currentCallbacksRef = useRef({ onPieceClick, onPieceDrag, onOpeningClick });
  
  // Performance Monitoring
  const performanceRef = useRef({
    lastUpdate: 0,
    frameCount: 0,
    updateCount: 0
  });
  
  // Camera & Interaction State
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const dragStateRef = useRef({
    isDragging: false,
    draggedPieceId: null,
    startPos: { x: 0, y: 0 },
    mode: 'none' // 'none', 'piece', 'rotate', 'pan'
  });

  // Cleanup utilities from SharedUtils
  const { cleanupGeometry, cleanupScene } = SharedUtils.useThreeJSCleanup();

  // ========================================
  // INSTRUCTIONS AUTO-HIDE EFFECT
  // ========================================
  
  /**
   * Auto-hide instructions after 15 seconds
   */
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
        console.log('📋 Instructions auto-hidden after 15 seconds');
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  // ========================================
  // PERFORMANCE OPTIMIZATION - MEMOIZED CHANGE DETECTION
  // ========================================
  
  /**
   * Creates a signature string for pieces to detect changes
   * Only recalculates when piece positions/rotations actually change
   */
  const pieceSignature = useMemo(() => {
  const startTime = performance.now();
  // Include ALL properties that affect visual appearance
  const signature = pieces.map(p => 
      `${p.id}-${p.x.toFixed(1)}-${p.y.toFixed(1)}-${p.z.toFixed(1)}-` +
      `${p.rotationY.toFixed(3)}-${p.tiltX || 0}-${p.tiltZ || 0}-` +
      `${p.width}-${p.height}-${p.depth}-` +
      `${p.locked ? 1 : 0}-${p.color || 0}-${p.material || 'wood'}-` +
      `${p.apexPosition || 0.5}-${showStressVisualization ? 1 : 0}`  // Include stress viz state
    ).join('|');
    
    console.log(`🎬 Canvas3D detected ${pieces.length} piece changes`);
    
    const endTime = performance.now();
    performanceRef.current.updateCount++;
    
    if (performanceRef.current.updateCount % 10 === 0) {
      console.log(`🔄 Piece signature calc: ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return signature;
  }, [pieces, showStressVisualization]);  // Add showStressVisualization as dependency
  
  /**
   * Creates a signature string for openings to detect changes
   */
  const openingSignature = useMemo(() => {
    return openings.map(o => 
      `${o.id}-${o.parentPieceId}-${o.face}-${o.offsetX}-${o.offsetY}-${o.offsetZ}`
    ).join('|');
  }, [openings]);
  
  /**
   * Creates a signature for selection state changes
   */
  const selectionSignature = useMemo(() => {
    return `${selectedPiece?.id || 'none'}-${selectedOpening?.id || 'none'}`;
  }, [selectedPiece?.id, selectedOpening?.id]);

  // ========================================
  // REF UPDATES - KEEP CURRENT STATE FOR EVENT HANDLERS
  // ========================================
  
  /**
   * Updates current refs when props change
   * This ensures event handlers always have access to latest data
   */
  useEffect(() => {
    currentPiecesRef.current = pieces;
    currentOpeningsRef.current = openings;
    currentCallbacksRef.current = { onPieceClick, onPieceDrag, onOpeningClick };
  }, [pieces, openings, onPieceClick, onPieceDrag, onOpeningClick]);

  // ========================================
  // GRID TEXTURE GENERATION
  // ========================================
  
  /**
   * Preloads an image and returns a Promise that resolves with the loaded image
   * @param {string} imageSrc - Image source URL or data URL
   * @returns {Promise<HTMLImageElement>} Promise resolving to loaded image
   */
  const preloadImage = useCallback((imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load background image'));
      img.src = imageSrc;
    });
  }, []);
  
  /**
   * Creates a large background plane with the room image
   * @param {HTMLImageElement} backgroundImg - Preloaded background image
   * @returns {THREE.Mesh} Background plane mesh
   */
  const createBackgroundPlane = useCallback((backgroundImg) => {
    if (!backgroundImg) return null;
    
    console.log('🖼️ Creating scene background plane...');
    
    // Create a large background plane (much bigger than workspace)
    const backgroundSize = Math.max(gridWidth * 12, gridHeight * 12, 200); // At least 200 inches
    const backgroundGeometry = new THREE.PlaneGeometry(backgroundSize, backgroundSize);
    
    // Create texture from the background image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match background geometry (high resolution)
    const textureSize = 2048;
    canvas.width = textureSize;
    canvas.height = textureSize;
    
    // Scale image to fill the entire canvas while maintaining aspect ratio
    const imgAspect = backgroundImg.width / backgroundImg.height;
    const canvasAspect = 1; // Square canvas
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider - fit to height and center horizontally
      drawHeight = textureSize;
      drawWidth = drawHeight * imgAspect;
      drawX = (textureSize - drawWidth) / 2;
      drawY = 0;
    } else {
      // Image is taller - fit to width and center vertically  
      drawWidth = textureSize;
      drawHeight = drawWidth / imgAspect;
      drawX = 0;
      drawY = (textureSize - drawHeight) / 2;
    }
    
    // Fill with neutral background color first
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, textureSize, textureSize);
    
    // Draw the background image
    ctx.drawImage(backgroundImg, drawX, drawY, drawWidth, drawHeight);
    
    const backgroundTexture = new THREE.CanvasTexture(canvas);
    backgroundTexture.needsUpdate = true;
    
    const backgroundMaterial = new THREE.MeshLambertMaterial({ 
      map: backgroundTexture,
      transparent: false,
      opacity: 1.0
    });
    
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    
    // Position behind everything else
    backgroundPlane.rotation.x = -Math.PI / 2;
    backgroundPlane.position.y = -0.1; // Slightly below ground level
    backgroundPlane.userData = { isBackground: true };
    
    console.log('✅ Scene background plane created successfully');
    return backgroundPlane;
  }, [gridWidth, gridHeight]);
  
  /**
   * Creates an optimized grid texture for the ground plane (grid overlay only)
   * @param {number} widthFeet - Workspace width in feet
   * @param {number} heightFeet - Workspace height in feet
   * @returns {HTMLCanvasElement} Canvas element with grid texture
   */
  const createGridTexture = useCallback((widthFeet, heightFeet) => {
    console.log(`🎨 Creating ${widthFeet}' x ${heightFeet}' grid overlay texture...`);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate workspace dimensions in inches
    const workspaceWidthInches = widthFeet * 12;
    const workspaceHeightInches = heightFeet * 12;
    
    // Fixed pixels per inch for consistency
    const PIXELS_PER_INCH = 16;
    const borderSizeInches = 2;
    
    // Calculate canvas size
    const canvasWidthInches = workspaceWidthInches + (borderSizeInches * 2);
    const canvasHeightInches = workspaceHeightInches + (borderSizeInches * 2);
    
    canvas.width = canvasWidthInches * PIXELS_PER_INCH;
    canvas.height = canvasHeightInches * PIXELS_PER_INCH;
    
    const borderSize = borderSizeInches * PIXELS_PER_INCH;
    
    // Calculate workspace boundaries
    const workspacePixelWidth = workspaceWidthInches * PIXELS_PER_INCH;
    const workspacePixelHeight = workspaceHeightInches * PIXELS_PER_INCH;
    const workspaceLeft = borderSize;
    const workspaceTop = borderSize;
    
    // Function to draw the grid overlay
    const drawGrid = () => {
      // Draw fine grid lines (6-inch increments) with better visibility
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';  // White with high opacity for visibility
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 1;
      
      // Vertical 6-inch lines
      for (let inches = 0; inches <= workspaceWidthInches; inches += 6) {
        const x = workspaceLeft + (inches * PIXELS_PER_INCH);
        ctx.moveTo(x, workspaceTop);
        ctx.lineTo(x, workspaceTop + workspacePixelHeight);
      }
      
      // Horizontal 6-inch lines
      for (let inches = 0; inches <= workspaceHeightInches; inches += 6) {
        const y = workspaceTop + (inches * PIXELS_PER_INCH);
        ctx.moveTo(workspaceLeft, y);
        ctx.lineTo(workspaceLeft + workspacePixelWidth, y);
      }
      ctx.stroke();
      
      // Reset shadow for major lines
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.stroke();
      
      // Draw major grid lines (24-inch increments) with better visibility
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';  // Full white for major lines
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      
      // Vertical 24-inch lines
      for (let inches = 0; inches <= workspaceWidthInches; inches += 24) {
        const x = workspaceLeft + (inches * PIXELS_PER_INCH);
        ctx.moveTo(x, workspaceTop);
        ctx.lineTo(x, workspaceTop + workspacePixelHeight);
      }
      
      // Horizontal 24-inch lines
      for (let inches = 0; inches <= workspaceHeightInches; inches += 24) {
        const y = workspaceTop + (inches * PIXELS_PER_INCH);
        ctx.moveTo(workspaceLeft, y);
        ctx.lineTo(workspaceLeft + workspacePixelWidth, y);
      }
      ctx.stroke();
      
      // Reset shadow after drawing
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    };
    
    // Draw transparent background to allow background scene to show through
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw semi-transparent gray border areas
    ctx.fillStyle = 'rgba(245, 245, 245, 0.8)';
    ctx.fillRect(0, 0, canvas.width, borderSize); // top
    ctx.fillRect(0, canvas.height - borderSize, canvas.width, borderSize); // bottom
    ctx.fillRect(0, 0, borderSize, canvas.height); // left
    ctx.fillRect(canvas.width - borderSize, 0, borderSize, canvas.height); // right
    
    // Keep workspace area fully transparent to show background
    // No need to draw anything in the workspace area
    
    // Draw grid overlay (works for both background image and plain grid)
    drawGrid();
    
    // Draw ruler markings and labels
    drawRulerMarkings(ctx, canvas, borderSize, workspaceLeft, workspaceTop, 
      workspacePixelWidth, workspacePixelHeight, widthFeet, heightFeet, PIXELS_PER_INCH);
    
    console.log('✅ Optimized grid texture created successfully');
    return canvas;
  }, []);
  
  /**
   * Helper function to draw ruler markings and labels
   */
  const drawRulerMarkings = (ctx, canvas, borderSize, workspaceLeft, workspaceTop, 
    workspacePixelWidth, workspacePixelHeight, widthFeet, heightFeet, PIXELS_PER_INCH) => {
    
    // Draw ruler markings on borders
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#666666';
    ctx.font = `${Math.max(20, borderSize * 0.6)}px Arial`;
    
    // Top ruler (X-axis)
    for (let feet = 0; feet <= widthFeet; feet++) {
      const x = workspaceLeft + (feet * 12 * PIXELS_PER_INCH);
      
      // Major tick
      ctx.beginPath();
      ctx.moveTo(x, borderSize - 10);
      ctx.lineTo(x, borderSize);
      ctx.stroke();
      
      // Label
      ctx.textAlign = 'center';
      ctx.fillText(`${feet}'`, x, borderSize/2);
    }
    
    // Minor ticks (1-foot intervals)
    for (let feet = 1; feet < widthFeet; feet++) {
      const x = workspaceLeft + (feet * 12 * PIXELS_PER_INCH);
      ctx.beginPath();
      ctx.moveTo(x, borderSize - 5);
      ctx.lineTo(x, borderSize);
      ctx.stroke();
    }
    
    // Left ruler (Z-axis) - adjusted for Three.js coordinates
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let feet = 0; feet <= heightFeet; feet++) {
      const y = workspaceTop + workspacePixelHeight - (feet * 12 * PIXELS_PER_INCH);
      
      // Major tick
      ctx.beginPath();
      ctx.moveTo(borderSize - 10, y);
      ctx.lineTo(borderSize, y);
      ctx.stroke();
      
      // Label - display feet value based on Three.js Z coordinate
      const displayFeet = heightFeet - feet;
      ctx.fillStyle = '#666666';
      ctx.font = `${Math.max(20, borderSize * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Save context for rotation
      const labelX = borderSize/2;
      const labelY = y;
      
      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(-Math.PI/2);
      ctx.fillText(`${displayFeet}'`, 0, 0);
      ctx.restore();
    }
    
    // Minor ticks (1-foot intervals)
    for (let feet = 1; feet < heightFeet; feet++) {
      const y = workspaceTop + workspacePixelHeight - (feet * 12 * PIXELS_PER_INCH);
      ctx.beginPath();
      ctx.moveTo(borderSize - 5, y);
      ctx.lineTo(borderSize, y);
      ctx.stroke();
    }
    
    ctx.restore();
    
    // Add axis labels
    ctx.font = `bold ${Math.max(24, borderSize * 0.5)}px Arial`;
    ctx.fillStyle = '#cc0000';
    ctx.textAlign = 'center';
    ctx.fillText('X', canvas.width - borderSize/2, canvas.height - borderSize/2);
    
    ctx.fillStyle = '#0066cc';
    ctx.save();
    ctx.translate(borderSize/2, canvas.height - borderSize/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Z', 0, 0);
    ctx.restore();
    
    // Add origin marker where new pieces appear (-30, -30)
    ctx.fillStyle = '#00aa00';
    // Convert 3D coordinates to grid pixels: -30 inches from center
    const originX = workspaceLeft + (workspacePixelWidth / 2) + (-30 * PIXELS_PER_INCH);
    const originY = workspaceTop + (workspacePixelHeight / 2) + (30 * PIXELS_PER_INCH); // Z is flipped in 2D
    const markerSize = Math.max(8, borderSize * 0.15);
    ctx.fillRect(originX - 2, originY - markerSize, 4, markerSize);
    ctx.fillRect(originX - markerSize, originY - 2, markerSize, 4);
  };

  // ========================================
  // MOUSE INTERACTION UTILITIES
  // ========================================
  
  /**
   * Converts mouse event to world position using raycasting
   * @param {MouseEvent} event - Mouse event
   * @returns {THREE.Vector3|null} World position or null if no intersection
   */
  const getWorldPosition = useCallback((event) => {
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(mouse, cameraRef.current);
    const groundPlane = sceneRef.current.children.find(child => child.userData.isGroundPlane);
    const intersects = raycasterRef.current.intersectObject(groundPlane);
    return intersects.length > 0 ? intersects[0].point : null;
  }, []);

  /**
   * Snaps position to grid increments
   * @param {THREE.Vector3} position - World position
   * @param {number} gridSize - Grid snap size
   * @returns {Object} Snapped x, z coordinates
   */
  const snapToGrid = useCallback((position, gridSize) => ({
    x: Math.round(position.x / gridSize) * gridSize,
    z: Math.round(position.z / gridSize) * gridSize
  }), []);

  // ========================================
  // SCENE INITIALIZATION - ONE-TIME SETUP
  // ========================================
  
  /**
   * Initializes the Three.js scene, camera, renderer, and event handlers
   * This effect only runs once when the component mounts
   */
  useEffect(() => {
    if (!mountRef.current || sceneRef.current) return;

    console.log('🎬 Initializing Canvas3D scene...');
    const startTime = performance.now();

    try {
      // ========================================
      // SCENE SETUP
      // ========================================
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      sceneRef.current = scene;

      // ========================================
      // CAMERA SETUP
      // ========================================
      const camera = new THREE.PerspectiveCamera(75, 1000/600, 0.1, 1000);
      camera.position.set(0, 60, 75);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // ========================================
      // RENDERER SETUP WITH OPTIMIZATION
      // ========================================
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      });
      
      /**
       * Updates renderer size based on container and viewport
       */
      const updateRendererSize = () => {
        const container = mountRef.current;
        if (container) {
          const width = container.clientWidth;
          const viewportHeight = window.innerHeight;
          const headerHeight = 120; // Fixed header height to avoid selector issues
          const controlsHeight = 200;
          const padding = 48;
          const availableHeight = viewportHeight - headerHeight - controlsHeight - padding;
          const height = Math.max(400, Math.min(840, availableHeight));
          
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      };
      
      // Initial size - delay to ensure DOM is ready
      setTimeout(() => {
        updateRendererSize();
      }, 100);

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = true;
      rendererRef.current = renderer;

      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      // Add resize listener for when layout changes
      const handleResize = () => {
        setTimeout(() => {
          updateRendererSize();
        }, 50);
      };

      window.addEventListener('resize', handleResize);

      // Simple fallback for refresh scenarios - just delay the sizing
      setTimeout(() => {
        updateRendererSize();
      }, 200);

      // ========================================
      // LIGHTING SETUP - OPTIMIZED FOR PERFORMANCE
      // ========================================
      
      // Ambient lighting for general illumination
      const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
      scene.add(ambientLight);
      
      // Main directional light with shadows
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(-80, 80, 60);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 200;
      directionalLight.shadow.camera.left = -100;
      directionalLight.shadow.camera.right = 100;
      directionalLight.shadow.camera.top = 100;
      directionalLight.shadow.camera.bottom = -100;
      directionalLight.shadow.bias = -0.0001;
      directionalLight.shadow.radius = 8;
      scene.add(directionalLight);
      
      // Fill light for softer shadows
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
      fillLight.position.set(60, 60, -60);
      fillLight.castShadow = false;
      scene.add(fillLight);
      
      // Top light for better visibility
      const topLight = new THREE.DirectionalLight(0xffffff, 0.2);
      topLight.position.set(0, 100, 0);
      topLight.castShadow = false;
      scene.add(topLight);

      // ========================================
      // GROUND PLANE SETUP
      // ========================================
      
      // Invisible ground plane for raycasting
      const groundPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      groundPlane.rotation.x = -Math.PI / 2;
      groundPlane.userData = { isGroundPlane: true };
      scene.add(groundPlane);

      // Visible textured ground
      const gridTexture = new THREE.CanvasTexture(createGridTexture(gridWidth, gridHeight, backgroundImage));
      gridTexture.needsUpdate = true;
      
      const workspaceWidthInches = gridWidth * 12;
      const workspaceHeightInches = gridHeight * 12;
      
      const groundGeometry = new THREE.PlaneGeometry(workspaceWidthInches, workspaceHeightInches);
      const groundMaterial = new THREE.MeshLambertMaterial({ 
        map: gridTexture,
        transparent: true
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      ground.userData = { isGround: true };
      scene.add(ground);

      // ========================================
      // MOUSE EVENT HANDLERS
      // ========================================
      
      // Mouse state tracking
      let isMouseDown = false;
      let lastMouseX = 0;
      let lastMouseY = 0;

      /**
       * Handles mouse down events - determines interaction mode
       * @param {MouseEvent} event - Mouse down event
       */
      const onMouseDown = (event) => {
        isMouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        dragStateRef.current.startPos = { x: event.clientX, y: event.clientY };

        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycasterRef.current.setFromCamera(mouse, camera);
        
        const allIntersects = raycasterRef.current.intersectObjects(
          Array.from(meshMapRef.current.values()), true
        );

        if (event.button === 2) {
          // Right click - pan mode
          dragStateRef.current.mode = 'pan';
          renderer.domElement.style.cursor = 'move';
        } else if (event.button === 0) {
          // Left click - check for interactions
          if (allIntersects.length > 0) {
            const hitObject = allIntersects[0].object;
            
            // Check for opening clicks
            if (hitObject.userData.isOpening || (hitObject.parent && hitObject.parent.userData.isOpening)) {
              const openingId = hitObject.userData.openingId || hitObject.parent.userData.openingId;
              if (openingId && currentCallbacksRef.current.onOpeningClick) {
                currentCallbacksRef.current.onOpeningClick(openingId);
              }
              return;
            }
            
            // Check for piece clicks
            let pieceId = hitObject.userData.pieceId;
            if (!pieceId && hitObject.parent && hitObject.parent.userData.pieceId) {
              pieceId = hitObject.parent.userData.pieceId;
            }
            
            if (pieceId) {
              const piece = currentPiecesRef.current.find(p => p.id === pieceId);
              if (piece && !piece.locked) {
                dragStateRef.current.mode = 'piece';
                dragStateRef.current.draggedPieceId = pieceId;
                renderer.domElement.style.cursor = 'grabbing';
              }
              currentCallbacksRef.current.onPieceClick(pieceId);
            }
          } else {
            // Click on empty space - rotate mode
            dragStateRef.current.mode = 'rotate';
            renderer.domElement.style.cursor = 'grab';
          }
        }
      };

      /**
       * Handles mouse move events - performs dragging, rotating, or panning
       * @param {MouseEvent} event - Mouse move event
       */
      const onMouseMove = (event) => {
        if (!isMouseDown) {
          // Handle hover effects when not dragging
          const rect = renderer.domElement.getBoundingClientRect();
          const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
          );
          raycasterRef.current.setFromCamera(mouse, camera);
          const allIntersects = raycasterRef.current.intersectObjects(
            Array.from(meshMapRef.current.values()), true
          );
          
          if (allIntersects.length > 0) {
            const hitObject = allIntersects[0].object;
            
            if (hitObject.userData.isOpening || (hitObject.parent && hitObject.parent.userData.isOpening)) {
              renderer.domElement.style.cursor = 'pointer';
            } else {
              let pieceId = hitObject.userData.pieceId;
              if (!pieceId && hitObject.parent && hitObject.parent.userData.pieceId) {
                pieceId = hitObject.parent.userData.pieceId;
              }
              
              const piece = currentPiecesRef.current.find(p => p.id === pieceId);
              renderer.domElement.style.cursor = piece?.locked ? 'not-allowed' : 'grab';
            }
          } else {
            renderer.domElement.style.cursor = 'default';
          }
          return;
        }

        // Calculate drag distance
        const deltaX = event.clientX - dragStateRef.current.startPos.x;
        const deltaY = event.clientY - dragStateRef.current.startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Handle piece dragging
        if (dragStateRef.current.mode === 'piece' && dragStateRef.current.draggedPieceId && distance > 5) {
          if (!dragStateRef.current.isDragging) {
            dragStateRef.current.isDragging = true;
          }

          const worldPos = getWorldPosition(event);
          if (worldPos) {
            const snapped = snapToGrid(worldPos, movementIncrement);
            const meshOrGroup = meshMapRef.current.get(dragStateRef.current.draggedPieceId);
            if (meshOrGroup) {
              meshOrGroup.position.x = snapped.x;
              meshOrGroup.position.z = snapped.z;
            }
          }
        } 
        // Handle camera rotation
        else if (dragStateRef.current.mode === 'rotate') {
          const deltaX = event.clientX - lastMouseX;
          const deltaY = event.clientY - lastMouseY;
          
          const spherical = new THREE.Spherical();
          spherical.setFromVector3(camera.position.clone().sub(cameraTargetRef.current));
          spherical.theta -= deltaX * 0.01;
          spherical.phi += deltaY * 0.01;
          spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
          
          camera.position.copy(cameraTargetRef.current).add(new THREE.Vector3().setFromSpherical(spherical));
          camera.lookAt(cameraTargetRef.current);
        } 
        // Handle camera panning
        else if (dragStateRef.current.mode === 'pan') {
          const deltaX = event.clientX - lastMouseX;
          const deltaY = event.clientY - lastMouseY;
          
          const panSpeed = 0.1;
          const cameraDirection = new THREE.Vector3();
          camera.getWorldDirection(cameraDirection);
          
          const right = new THREE.Vector3();
          right.crossVectors(cameraDirection, camera.up).normalize();
          
          const up = new THREE.Vector3();
          up.crossVectors(right, cameraDirection).normalize();
          
          const panOffset = new THREE.Vector3();
          panOffset.addScaledVector(right, -deltaX * panSpeed);
          panOffset.addScaledVector(up, deltaY * panSpeed);
          
          camera.position.add(panOffset);
          cameraTargetRef.current.add(panOffset);
          camera.lookAt(cameraTargetRef.current);
        }

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      };

      /**
       * Finishes any active drag operation and resets state
       */
      const finishDrag = () => {
        if (dragStateRef.current.isDragging && dragStateRef.current.draggedPieceId) {
          const meshOrGroup = meshMapRef.current.get(dragStateRef.current.draggedPieceId);
          if (meshOrGroup) {
            const finalX = meshOrGroup.position.x;
            const finalZ = meshOrGroup.position.z;
            const originalPiece = currentPiecesRef.current.find(p => p.id === dragStateRef.current.draggedPieceId);
            const finalY = originalPiece ? originalPiece.y : 0;
            currentCallbacksRef.current.onPieceDrag(dragStateRef.current.draggedPieceId, finalX, finalY, finalZ);
          }
        }

        dragStateRef.current = {
          isDragging: false,
          draggedPieceId: null,
          startPos: { x: 0, y: 0 },
          mode: 'none'
        };
        isMouseDown = false;
        renderer.domElement.style.cursor = 'default';
      };

      /**
       * Handles mouse wheel zoom events
       * @param {WheelEvent} event - Wheel event
       */
      const onWheel = (event) => {
        event.preventDefault();
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        const newPosition = camera.position.clone().sub(cameraTargetRef.current).multiplyScalar(scale);
        const distance = newPosition.length();
        newPosition.setLength(Math.max(20, Math.min(200, distance)));
        camera.position.copy(cameraTargetRef.current).add(newPosition);
      };

      // ========================================
      // EVENT LISTENER REGISTRATION
      // ========================================
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', finishDrag);
      renderer.domElement.addEventListener('mouseleave', finishDrag);
      renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
      document.addEventListener('mouseup', finishDrag);

      // (handleResize already declared above, no need to redeclare)

      // ========================================
      // ANIMATION LOOP WITH PERFORMANCE MONITORING
      // ========================================
      
      /**
       * Main animation loop with performance tracking
       */
      const animate = () => {
        const now = Date.now();
        performanceRef.current.frameCount++;
        
        // Log performance stats every 60 frames
        if (performanceRef.current.frameCount % 60 === 0) {
          const fps = 60000 / (now - performanceRef.current.lastUpdate);
          console.log(`🎮 FPS: ${fps.toFixed(1)}, Updates: ${performanceRef.current.updateCount}`);
          performanceRef.current.lastUpdate = now;
        }

        animationIdRef.current = requestAnimationFrame(animate);
        renderer.render(scene, camera);

      };
      animate();

      const endTime = performance.now();
      console.log(`✅ Canvas3D initialized in ${(endTime - startTime).toFixed(2)}ms`);

      // ========================================
      // CLEANUP FUNCTION
      // ========================================
      return () => {
        try {
          if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
          }
          
          window.removeEventListener('resize', handleResize);
          if (renderer.domElement) {
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('mouseup', finishDrag);
            renderer.domElement.removeEventListener('mouseleave', finishDrag);
            renderer.domElement.removeEventListener('contextmenu', (e) => e.preventDefault());
            renderer.domElement.removeEventListener('wheel', onWheel);
          }
          document.removeEventListener('mouseup', finishDrag);
          
          cleanupScene(scene);
          
          if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
          
          console.log('🧹 Canvas3D cleanup completed');
        } catch (error) {
          console.warn('⚠️ Canvas3D cleanup error:', error);
        }
      };
    } catch (error) {
      console.error('❌ Canvas3D initialization error:', error);
    }
  }, []); // Only run once on mount

  // ========================================
  // GRID UPDATE EFFECT - SEPARATE FROM INITIALIZATION
  // ========================================
  
  /**
   * Updates the ground grid when dimensions change
   * Separated from main initialization for better performance
   */
  useEffect(() => {
    if (!sceneRef.current) return;
    
    console.log(`🔄 Updating grid to ${gridWidth}' x ${gridHeight}'${backgroundImage ? ' with background image' : ''}`);
    
    try {
      // Remove existing ground
      const existingGround = sceneRef.current.children.find(child => child.userData.isGround);
      if (existingGround) {
        cleanupGeometry(existingGround);
        sceneRef.current.remove(existingGround);
      }

      // Create new moveable grid overlay (background handled separately)
      const createGridAndAddToScene = () => {
        // Create transparent grid overlay that shows scene background through it
        const gridTexture = new THREE.CanvasTexture(createGridTexture(gridWidth, gridHeight));
        gridTexture.needsUpdate = true;
        
        const workspaceWidthInches = gridWidth * 12;
        const workspaceHeightInches = gridHeight * 12;
        
        const groundGeometry = new THREE.PlaneGeometry(workspaceWidthInches, workspaceHeightInches);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
          map: gridTexture,
          transparent: true
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.x = gridOffsetX;
        ground.position.z = gridOffsetZ;
        ground.position.y = 0; // At ground level, above scene background
        ground.receiveShadow = false; // Grid overlay doesn't need shadows
        ground.userData = { isGround: true };
        sceneRef.current.add(ground);

        console.log(`✅ Grid updated successfully at offset (${gridOffsetX}, ${gridOffsetZ})`);
      };
      
      // Execute the grid creation
      createGridAndAddToScene();
    } catch (error) {
      console.error('❌ Error updating grid:', error);
    }
  }, [gridWidth, gridHeight, gridOffsetX, gridOffsetZ, createGridTexture]);

  // ========================================
  // BACKGROUND IMAGE MANAGEMENT - SEPARATE FROM GRID
  // ========================================
  
  /**
   * Manages the scene background image independently of grid updates
   * Sets the image as the scene's background (truly stationary, doesn't move with camera)
   */
  useEffect(() => {
    if (!sceneRef.current) return;
    
    console.log(`🎨 Managing scene background${backgroundImage ? ' - setting image' : ' - removing image'}`);
    
    try {
      if (backgroundImage) {
        const setSceneBackground = async () => {
          try {
            const preloadedImage = await preloadImage(backgroundImage);
            console.log('✅ Scene background image preloaded');

            // Load texture and configure for aspect ratio preservation
            const backgroundTexture = new THREE.TextureLoader().load(backgroundImage, (texture) => {
              // Get the actual image dimensions
              const img = texture.image;
              const imageAspect = img.width / img.height;

              // Get renderer/viewport aspect ratio
              const renderer = rendererRef.current;
              if (!renderer) return;

              const viewportAspect = renderer.domElement.width / renderer.domElement.height;

              console.log(`📐 Image aspect: ${imageAspect.toFixed(2)}, Viewport aspect: ${viewportAspect.toFixed(2)}`);

              // Calculate offset and repeat to maintain aspect ratio
              if (imageAspect > viewportAspect) {
                // Image is wider than viewport (landscape in portrait viewport, or very wide landscape)
                // Fit height, center horizontally
                const scale = viewportAspect / imageAspect;
                texture.repeat.set(scale, 1);
                texture.offset.set((1 - scale) / 2, 0);
              } else {
                // Image is taller than viewport (portrait, or landscape in very wide viewport)
                // Fit width, center vertically
                const scale = imageAspect / viewportAspect;
                texture.repeat.set(1, scale);
                texture.offset.set(0, (1 - scale) / 2);
              }

              texture.needsUpdate = true;
              console.log(`✅ Background aspect ratio preserved - repeat: [${texture.repeat.x.toFixed(2)}, ${texture.repeat.y.toFixed(2)}], offset: [${texture.offset.x.toFixed(2)}, ${texture.offset.y.toFixed(2)}]`);
            });

            // Set as scene background - this makes it truly stationary
            sceneRef.current.background = backgroundTexture;
            console.log('✅ Scene background set - image will not move with camera');

          } catch (error) {
            console.warn('⚠️ Failed to set scene background:', error.message);
            // Fall back to default background color
            sceneRef.current.background = new THREE.Color(0xf8fafc);
          }
        };

        setSceneBackground();
      } else {
        // Remove background image, revert to default color
        sceneRef.current.background = new THREE.Color(0xf8fafc);
        console.log('🗑️ Scene background reset to default color');
      }
      
    } catch (error) {
      console.error('❌ Error managing scene background:', error);
      sceneRef.current.background = new THREE.Color(0xf8fafc);
    }
  }, [backgroundImage, preloadImage]);

  // ========================================
  // SCENE OBJECTS UPDATE - FIXED ROTATION ORDER FOR PANELS
  // ========================================
  
  /**
   * Updates all pieces and openings in the scene when data changes
   * FIXED: Uses YXZ rotation order for panels with tilt
   * ENHANCED: Includes structural stress visualization
   */
  useEffect(() => {
    if (!sceneRef.current) return;
  
    console.log(`🔄 Updating scene objects...`);
    const updateStart = performance.now();
  
    try {
      // ========================================
      // COMPLETE REMOVAL OF ALL PIECE/OPENING OBJECTS
      // ========================================
      const objectsToRemove = [];
      sceneRef.current.traverse((child) => {
        if (child.userData.isPiece || child.userData.isOpening) {
          objectsToRemove.push(child);
        }
      });
      
      console.log(`🗑️ Removing ${objectsToRemove.length} old objects`);
      
      // Clean up and remove old objects
      objectsToRemove.forEach(obj => {
        // Dispose of geometry and materials
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
        // Also clean up children for groups
        if (obj.children) {
          obj.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }
        // Remove from parent
        if (obj.parent) {
          obj.parent.remove(obj);
        }
      });
      
      // Clear the mesh map completely
      meshMapRef.current.clear();
    
      // ========================================
      // STRUCTURAL STRESS ANALYSIS (WHEN ENABLED)
      // ========================================
      let supportMap = null;
      if (showStressVisualization && window.StructuralAnalysis && pieces.length > 0) {
        try {
          console.log('🔍 Performing structural analysis for visualization...');
          supportMap = window.StructuralAnalysis.analyzeSupportStructure(pieces);
          console.log(`✅ Analyzed ${Object.keys(supportMap).length} pieces for stress`);
        } catch (error) {
          console.warn('⚠️ Structural analysis error:', error);
        }
      }
    
      // ========================================
      // CREATE ALL PIECES FRESH
      // ========================================
      console.log(`🔨 Creating ${pieces.length} new piece meshes`);
      
      const piecesToCreate = pieces.map(piece => {
        console.log(`  Creating ${piece.name}: color=0x${(piece.color || 0).toString(16)}, material=${piece.material}`);
        
        let mesh;
        if (piece.hollow) {
          mesh = CatTreePieces.createHollowGeometry(piece);
        } else {
          mesh = CatTreePieces.createSolidGeometry(piece);
        }
      
        if (mesh) {
          // SPECIAL POSITIONING FOR PANELS - BOTTOM PIVOT WITH FIXED ROTATION ORDER
          if (piece.shape && piece.shape.includes('panel')) {
            console.log(`🎯 Using BOTTOM PIVOT for panel: ${piece.name}`);
            
            // Create a pivot group at the bottom of the panel
            const pivotGroup = new THREE.Group();
            
            // For tilted panels, adjust position to keep rotation more centered
            let xOffset = 0;
            let zOffset = 0;
            if (piece.tiltX) {
              const tiltCompensation = Math.sin(piece.tiltX) * (piece.height / 2);
              zOffset = -tiltCompensation;
            }
            
            pivotGroup.position.set(piece.x + xOffset, piece.y, piece.z + zOffset);
            
            // CRITICAL: Set rotation order to YXZ
            pivotGroup.rotation.order = 'YXZ';
            
            // Position mesh so its bottom is at the pivot point
            mesh.position.set(0, piece.height/2, 0);
            
            // Apply rotations to the group
            pivotGroup.rotation.y = piece.rotationY || 0;
            if (piece.tiltX) {
              pivotGroup.rotation.x = piece.tiltX;
            }
            if (piece.tiltZ) {
              pivotGroup.rotation.z = piece.tiltZ;
            }
            
            pivotGroup.add(mesh);
            pivotGroup.userData = { isPiece: true, pieceId: piece.id };
            mesh.userData = { isPiece: true, pieceId: piece.id };
            
            return { piece, object: pivotGroup };
          } else {
            // STANDARD POSITIONING FOR NON-PANELS
            console.log(`✅ Using standard positioning for ${piece.name}`);
            
            // Set position: piece sits on ground at y position, centered at x,z
            mesh.position.set(piece.x, piece.y + piece.height/2, piece.z);
            
            // Apply rotations directly to the mesh
            mesh.rotation.y = piece.rotationY || 0;
            if (piece.tiltX) mesh.rotation.x = piece.tiltX;
            if (piece.tiltZ) mesh.rotation.z = piece.tiltZ;
            
            mesh.userData = { isPiece: true, pieceId: piece.id };
            
            return { piece, object: mesh };
          }
        }
        return null;
      }).filter(Boolean);
    
      // Add pieces to scene in batch with stress visualization
      piecesToCreate.forEach(({ piece, object }) => {
        const isSelected = selectedPiece?.id === piece.id;
        
        // Apply selection highlighting
        if (object.type === 'Group') {
          // For grouped panels, apply to the mesh child
          object.traverse((child) => {
            if (child.isMesh) {
              CatTreePieces.applySelectionHighlight(child, isSelected, piece.locked, piece);
            }
          });
        } else {
          CatTreePieces.applySelectionHighlight(object, isSelected, piece.locked, piece);
        }
        
        // ========================================
        // STRUCTURAL STRESS VISUALIZATION
        // ========================================
        if (showStressVisualization && supportMap && supportMap[piece.id]) {
          const node = supportMap[piece.id];
          
          // Show stress for any piece with stress > 0.1 (lowered threshold)
          if (node.stressLevel > 0.1) {
            const stressColor = window.StructuralAnalysis.getStressColor(node.stressLevel);
            
            console.log(`⚖️ Applying stress visualization to ${piece.name}: ${(node.stressLevel * 100).toFixed(1)}% stress`);
            
            // Apply stress visualization to all meshes in the object
            object.traverse((child) => {
              if (child.isMesh && child.material) {
                // Clone material to avoid affecting other instances
                child.material = child.material.clone();
                
                // Apply emissive stress color (glowing effect)
                child.material.emissive = new THREE.Color(stressColor);
                child.material.emissiveIntensity = Math.min(node.stressLevel * 0.6, 0.8); // Increased intensity
                
                // Also blend the base color for better visibility
                const originalColor = child.material.color.clone();
                child.material.color.lerpColors(
                  originalColor,
                  new THREE.Color(stressColor),
                  node.stressLevel * 0.3 // 30% color blend at maximum stress
                );
                
                // Add subtle outline effect for high stress
                if (node.stressLevel > 0.7) {
                  child.material.transparent = true;
                  child.material.opacity = 0.9;
                }
              }
            });
          }
        }
        
        meshMapRef.current.set(piece.id, object);
        sceneRef.current.add(object);
      });
    
      // ========================================
      // CREATE ALL OPENINGS
      // ========================================
      const openingsToCreate = openings.map(opening => {
        const parentPiece = pieces.find(p => p.id === opening.parentPieceId);
        if (parentPiece) {
          const openingMesh = CatTreePieces.createOpeningMarker(opening, parentPiece);
          if (openingMesh) {
            // Match parent positioning style
            if (parentPiece.shape && parentPiece.shape.includes('panel')) {
              openingMesh.position.set(
                parentPiece.x,
                parentPiece.y,
                parentPiece.z
              );
              openingMesh.rotation.order = 'YXZ';
            } else {
              openingMesh.position.set(
                parentPiece.x,
                parentPiece.y + parentPiece.height/2,
                parentPiece.z
              );
            }
            openingMesh.rotation.y = parentPiece.rotationY;
            if (parentPiece.tiltX) openingMesh.rotation.x = parentPiece.tiltX;
            if (parentPiece.tiltZ) openingMesh.rotation.z = parentPiece.tiltZ;
            
            return { opening, object: openingMesh };
          }
        }
        return null;
      }).filter(Boolean);
    
      // Add openings to scene in batch
      openingsToCreate.forEach(({ opening, object }) => {
        if (selectedOpening?.id === opening.id) {
          object.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material = child.material.clone();
              child.material.color.setHex(0xff4444);
              if (child.material.emissive) {
                child.material.emissive.setHex(0x111111);
              }
            }
          });
        }
        
        meshMapRef.current.set(opening.id, object);
        sceneRef.current.add(object);
      });
    
      const updateEnd = performance.now();
      console.log(`✅ Scene update completed in ${(updateEnd - updateStart).toFixed(2)}ms`);
      
      // Log stress visualization stats
      if (showStressVisualization && supportMap) {
        const stressedPieces = Object.values(supportMap).filter(node => node.stressLevel > 0.1);
        console.log(`⚖️ Stress visualization applied to ${stressedPieces.length} pieces`);
      }
      
    } catch (error) {
      console.error('❌ Error updating pieces and openings:', error);
    }
  }, [pieceSignature, openingSignature, selectedPiece?.id, selectedOpening?.id, showStressVisualization]);

  // ========================================
  // SELECTION HIGHLIGHTING - MINIMAL RE-RENDERS FOR PERFORMANCE
  // ========================================
  
  /**
   * Updates selection highlights without rebuilding geometry
   * Only runs when selection state changes
   */
  useEffect(() => {
    if (!sceneRef.current) return;

    console.log('🎯 Updating selection highlights...');

    // Update piece selection highlights
    pieces.forEach(piece => {
      const object = meshMapRef.current.get(piece.id);
      if (object) {
        const isSelected = selectedPiece?.id === piece.id;
        
        // Handle both grouped panels and regular meshes
        if (object.type === 'Group') {
          object.traverse((child) => {
            if (child.isMesh) {
              CatTreePieces.applySelectionHighlight(child, isSelected, piece.locked, piece);
            }
          });
        } else {
          CatTreePieces.applySelectionHighlight(object, isSelected, piece.locked, piece);
        }
      }
    });

    // Update opening selection highlights
    openings.forEach(opening => {
      const object = meshMapRef.current.get(opening.id);
      if (object) {
        const isSelected = selectedOpening?.id === opening.id;
        object.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material = child.material.clone();
            if (isSelected) {
              child.material.color.setHex(0xff4444);
              if (child.material.emissive) {
                child.material.emissive.setHex(0x111111);
              }
            } else {
              child.material.color.setHex(0x00aa00);
              if (child.material.emissive) {
                child.material.emissive.setHex(0x000000);
              }
            }
          }
        });
      }
    });

  }, [selectionSignature]);

  // ========================================
  // COMPONENT RENDER
  // ========================================
  return React.createElement('div', {
    className: 'relative bg-white'
  }, [
    // 3D Canvas Container
    React.createElement('div', {
      key: 'canvas',
      ref: mountRef,
      className: 'w-full',
      style: { minHeight: '400px', maxHeight: '840px' }
    }),
    
    // Control Instructions Overlay (dismissible)
    showInstructions && React.createElement('div', {
      key: 'instructions',
      className: 'absolute top-4 left-4 right-4 z-10'
    }, React.createElement('div', {
      className: 'bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-gray-200'
    }, [
      // Close button
      React.createElement('button', {
        key: 'close-btn',
        onClick: () => setShowInstructions(false),
        className: 'absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors',
        title: 'Dismiss instructions'
      }, '×'),
      
      // Instructions content
      React.createElement('div', {
        key: 'content',
        className: 'text-sm text-gray-600 pr-6'
      }, [
        React.createElement('strong', { key: 'label' }, 'Controls: '),
        'Left-click to select/drag pieces | Right-click + drag to pan view | Left-click + drag empty space to rotate | Scroll to zoom',
        React.createElement('br', { key: 'br' }),
        React.createElement('span', { 
          key: 'grid-info', 
          className: 'text-xs text-blue-600' 
        }, `🎯 Grid: ${gridWidth}' x ${gridHeight}' workspace | Light lines = 6" squares, Dark lines = 2' squares | Snap: ${movementIncrement}"`),
        React.createElement('br', { key: 'br2' }),
        React.createElement('span', { 
          key: 'sidebar-info', 
          className: 'text-xs text-purple-600' 
        }, '💡 Green cross marks origin (0,0) | Panels pivot from bottom edge | Green markers = openings'),
        showStressVisualization && React.createElement('br', { key: 'br3' }),
        showStressVisualization && React.createElement('span', {
          key: 'stress-info',
          className: 'text-xs text-orange-600 font-medium'
        }, '⚖️ Stress visualization active: Green=Safe, Yellow=Caution, Orange=Warning, Red=Critical'),
        backgroundImage && React.createElement('br', { key: 'br4' }),
        backgroundImage && React.createElement('span', {
          key: 'bg-info',
          className: 'text-xs text-purple-600 font-medium'
        }, '🖼️ Background image loaded - Grid overlay shown for reference'),
        React.createElement('div', {
          key: 'auto-hide-info',
          className: 'text-xs text-gray-400 mt-1 italic'
        }, '(Auto-hides in 15 seconds)')
      ])
    ])),

    // Show instructions toggle button when hidden
    !showInstructions && React.createElement('button', {
      key: 'show-instructions-btn',
      onClick: () => setShowInstructions(true),
      className: 'absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white hover:shadow-md transition-all',
      title: 'Show controls help'
    }, [
      React.createElement('span', { key: 'icon' }, '❓'),
      React.createElement('span', { key: 'text', className: 'ml-1' }, 'Help')
    ])
  ]);
};