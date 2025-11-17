// =====================================================
// OPTIMIZED CAT TREE PIECES SYSTEM -v23- RANDOM COLOR SELECTION
// =====================================================

// Performance debugging flag
const DEBUG_PERFORMANCE = false;
const log = (message) => DEBUG_PERFORMANCE && console.log(message);

const CatTreePieces = {
  
  // ========================================
  // MATERIAL SYSTEM - COST MULTIPLIERS & PROPERTIES
  // ========================================
  
  /**
   * Material definitions with cost multipliers and visual properties
   * Each material affects the final cost and appearance of pieces
   */
  materials: {
    wood: { 
      name: 'Wood', 
      costMultiplier: 1.0, 
      color: SharedUtils.COLORS.MATERIALS.wood,
      description: 'Standard wood construction - balanced cost and durability'
    },
    fabric: { 
      name: 'Fabric Wrap', 
      costMultiplier: 1.2, 
      color: SharedUtils.COLORS.MATERIALS.fabric,
      description: 'Soft fabric wrapped around a hollow frame- comfortable and affordable'
    },
    sisal: { 
      name: 'Sisal Wrap', 
      costMultiplier: 1.2, 
      color: SharedUtils.COLORS.MATERIALS.sisal,
      description: 'Natural sisal rope - perfect for scratching'
    },
    carpet: { 
      name: 'Carpet', 
      costMultiplier: 1.3, 
      color: SharedUtils.COLORS.MATERIALS.carpet,
      description: 'Plush carpet covering - luxurious feel'
    },
    cushion: { 
      name: 'Cushion', 
      costMultiplier: 1.5, 
      color: SharedUtils.COLORS.MATERIALS.cushion,
      description: 'Soft cushioned surface - maximum comfort'
    }
  },

  // ========================================
  // PIECE CATEGORY DEFINITIONS - ORGANIZED BY FUNCTIONALITY
  // ========================================
  
  /**
   * Complete piece category system with variants for each type
   * Organized by functional purpose: shelter, movement, rest, scratching, climbing
   */
  categories: {
    
    // ========================================
    // SHELTER PIECES - ENCLOSED SPACES
    // ========================================
    house: {
      name: 'Cat House',
      icon: '🏠',
      description: 'Enclosed shelters for privacy and security',
      variants: [
        {
          id: 'house-basic', 
          name: 'Basic House', 
          baseWidth: 14, baseHeight: 12, baseDepth: 14, baseCost: 17.5,
          hollow: true, shape: 'box', 
          availableMaterials: ['wood', 'fabric'], 
          availableColors: true,
          description: 'Simple rectangular hideaway'
        },
        {
          id: 'house-aframe', 
          name: 'A-Frame House', 
          baseWidth: 16, baseHeight: 14, baseDepth: 14, baseCost: 21,
          hollow: true, shape: 'aframe', 
          availableMaterials: ['wood', 'fabric'], 
          availableColors: true,
          description: 'Distinctive triangular roof design'
        },
        {
          id: 'house-cylinder', 
          name: 'Cylinder House', 
          baseWidth: 12, baseHeight: 12, baseDepth: 12, baseCost: 19,
          hollow: true, shape: 'cylinder', 
          availableMaterials: ['wood', 'fabric', 'sisal'], 
          availableColors: true,
          description: 'Round house with curved walls'
        }
      ]
    },

    // ========================================
    // MOVEMENT PIECES - TUNNELS & PASSAGES
    // ========================================
    tunnel: {
      name: 'Tunnel',
      icon: '🚇',
      description: 'Connected passages for movement and play',
      variants: [
        {
          id: 'tunnel-straight', 
          name: 'Straight Tunnel', 
          baseWidth: 16, baseHeight: 8, baseDepth: 8, baseCost: 15,
          hollow: true, shape: 'tunnel', 
          availableMaterials: ['wood', 'fabric', 'carpet'], 
          availableColors: true,
          description: 'Direct passage between areas'
        },
        {
          id: 'tunnel-cylinder', 
          name: 'Tube Tunnel', 
          baseWidth: 16, baseHeight: 10, baseDepth: 10, baseCost: 17.5,
          hollow: true, shape: 'tube-tunnel', 
          availableMaterials: ['wood', 'fabric', 'carpet'], 
          availableColors: true,
          description: 'Cylindrical tube for crawling'
        },
        {
          id: 'tunnel-curve90',
          name: '90° Curved Tunnel',
          baseWidth: 16, baseHeight: 10, baseDepth: 16, baseCost: 21,
          hollow: true, shape: 'tunnel-curve90',
          availableMaterials: ['wood', 'fabric', 'carpet'],
          availableColors: true,
          description: 'Right-angle turn connector'
        },
        {
          id: 'tunnel-ramp', 
          name: 'Ramp Tunnel', 
          baseWidth: 18, baseHeight: 8, baseDepth: 8, baseCost: 19,
          hollow: true, shape: 'tunnel-ramp', 
          availableMaterials: ['wood', 'fabric', 'carpet'], 
          availableColors: true,
          description: 'Sloped tunnel for elevation changes'
        }
      ]
    },

    // ========================================
    // REST PIECES - ELEVATED PERCHES
    // ========================================
    perch: {
      name: 'Perch',
      icon: '🪑',
      description: 'Elevated resting spots for observation',
      variants: [
        {
          id: 'perch-rectangle', 
          name: 'Rectangle Perch', 
          baseWidth: 8, baseHeight: 0.5, baseDepth: 5, baseCost: 6,
          hollow: false, shape: 'box', 
          availableMaterials: ['wood', 'carpet', 'sisal'], 
          availableColors: true,
          description: 'Classic rectangular platform'
        },
        {
          id: 'perch-circular', 
          name: 'Circular Perch', 
          baseWidth: 8, baseHeight: 0.5, baseDepth: 8, baseCost: 7.5,
          hollow: false, shape: 'cylinder', 
          availableMaterials: ['wood', 'carpet', 'sisal'], 
          availableColors: true,
          description: 'Round perching surface'
        },
        {
          id: 'perch-lshaped', 
          name: 'L-Shaped Perch', 
          baseWidth: 10, baseHeight: 0.5, baseDepth: 8, baseCost: 9,
          hollow: false, shape: 'lshaped', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Corner-fitting L-shaped design'
        }
      ]
    },

    // ========================================
    // SCRATCHING PIECES - VERTICAL POSTS
    // ========================================
    post: {
      name: 'Scratching Post',
      icon: '🪵',
      description: 'Vertical structures for scratching and climbing',
      variants: [
        {
          id: 'post-straight', 
          name: 'Straight Post', 
          baseWidth: 3.5, baseHeight: 24, baseDepth: 3.5, baseCost: 10,
          hollow: false, shape: 'cylinder', 
          availableMaterials: ['wood', 'sisal', 'carpet'], 
          availableColors: true,
          description: 'Standard cylindrical scratching post'
        },
        {
          id: 'post-tapered', 
          name: 'Tapered Post', 
          baseWidth: 5, baseHeight: 30, baseDepth: 5, baseCost: 14,
          hollow: false, shape: 'tapered', 
          availableMaterials: ['wood', 'sisal', 'carpet'], 
          availableColors: true,
          description: 'Tapered design for stability'
        },
        {
          id: 'post-square', 
          name: 'Square Post', 
          baseWidth: 4, baseHeight: 24, baseDepth: 4, baseCost: 11,
          hollow: false, shape: 'box', 
          availableMaterials: ['wood', 'sisal', 'carpet'], 
          availableColors: true,
          description: 'Square post (4x4) wrapped in sisal for scratching or for support'
        }
      ]
    },

    // ========================================
    // PLATFORM PIECES - HORIZONTAL SURFACES
    // ========================================
    platform: {
      name: 'Platform',
      icon: '⬜',
      description: 'Flat surfaces for resting and as bases',
      variants: [
        {
          id: 'platform-square', 
          name: 'Square Platform', 
          baseWidth: 12, baseHeight: 0.5, baseDepth: 12, baseCost: 7.5,
          hollow: false, shape: 'box', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Basic square platform'
        },
        {
          id: 'platform-round', 
          name: 'Round Platform', 
          baseWidth: 14, baseHeight: 0.5, baseDepth: 14, baseCost: 9,
          hollow: false, shape: 'cylinder', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Circular platform surface'
        },
        {
          id: 'platform-base', 
          name: 'Base Platform', 
          baseWidth: 24, baseHeight: 0.75, baseDepth: 16, baseCost: 12.5,
          hollow: false, shape: 'box', 
          availableMaterials: ['wood'], 
          availableColors: true,
          description: 'Large foundation platform'
        },
        {
          id: 'platform-quarter-circle', 
          name: 'Quarter Circle Platform', 
          baseWidth: 12, baseHeight: 0.5, baseDepth: 12, baseCost: 8,
          hollow: false, shape: 'quarter-circle', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Corner-fitting quarter circle'
        },
        {
          id: 'platform-half-circle', 
          name: 'Half Circle Platform', 
          baseWidth: 14, baseHeight: 0.5, baseDepth: 10, baseCost: 8.5,
          hollow: false, shape: 'semicircle', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Semi-circular platform'
        },
        {
          id: 'platform-triangle', 
          name: 'Triangle Platform', 
          baseWidth: 12, baseHeight: 0.5, baseDepth: 10, baseCost: 7,
          hollow: false, shape: 'triangle', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Triangular platform for tight spaces'
        },
        {
          id: 'platform-hexagon', 
          name: 'Hexagon Platform', 
          baseWidth: 14, baseHeight: 0.5, baseDepth: 12, baseCost: 9.5,
          hollow: false, shape: 'hexagon', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Six-sided platform design'
        },
        {
          id: 'platform-oval', 
          name: 'Oval Platform', 
          baseWidth: 16, baseHeight: 0.5, baseDepth: 8, baseCost: 8.5,
          hollow: false, shape: 'oval', 
          availableMaterials: ['wood', 'carpet'], 
          availableColors: true,
          description: 'Elongated oval surface'
        }
      ]
    },

    // ========================================
    // COMFORT PIECES - BEDDING & CUSHIONS
    // ========================================
    bedding: {
      name: 'Bedding',
      icon: '🛏️',
      description: 'Soft surfaces for comfortable resting',
      variants: [
        {
          id: 'bedding-cushion', 
          name: 'Cushion', 
          baseWidth: 10, baseHeight: 2, baseDepth: 8, baseCost: 4,
          hollow: false, shape: 'cushion', 
          availableMaterials: ['cushion', 'fabric'], 
          availableColors: true,
          description: 'Soft padded cushion'
        },
        {
          id: 'bedding-mat', 
          name: 'Sleeping Mat', 
          baseWidth: 12, baseHeight: 0.25, baseDepth: 10, baseCost: 3,
          hollow: false, shape: 'box', 
          availableMaterials: ['fabric', 'carpet'], 
          availableColors: true,
          description: 'Thin heat resistant mat for placement of heating pads or beds'
        },
        {
          id: 'bedding-raised-square',
          name: 'Square Raised-Edge Bed',
          baseWidth: 16, baseHeight: 3, baseDepth: 16, baseCost: 6,
          hollow: false, shape: 'raised-edge-square',
          availableMaterials: ['cushion', 'fabric'],
          availableColors: true,
          description: 'Square cushioned bed with plush raised border'
        },
        {
          id: 'bedding-raised-round',
          name: 'Round Raised-Edge Bed',
          baseWidth: 16, baseHeight: 3, baseDepth: 16, baseCost: 7,
          hollow: false, shape: 'raised-edge-round',
          availableMaterials: ['cushion', 'fabric'],
          availableColors: true,
          description: 'Circular cushioned bed with plush raised border'
        }
      ]
    },

    // ========================================
    // CLIMBING PIECES - VERTICAL SURFACES
    // ========================================
    panel: {
      name: 'Climbing Panel',
      icon: '🧱',
      description: 'Vertical climbing and scratching surfaces',
      variants: [
        {
          id: 'panel-basic', 
          name: 'Basic Wall Panel', 
          baseWidth: 18, baseHeight: 24, baseDepth: 1, baseCost: 11,
          hollow: false, shape: 'panel', 
          availableMaterials: ['wood', 'sisal', 'carpet', 'fabric'], 
          availableColors: true,
          description: 'Flat vertical climbing surface'
        },
        {
          id: 'panel-triangle', 
          name: 'Triangle Panel', 
          baseWidth: 18, baseHeight: 24, baseDepth: 1, baseCost: 10,
          hollow: false, shape: 'triangle-panel', 
          availableMaterials: ['wood', 'sisal', 'carpet', 'fabric'], 
          availableColors: true,
          description: 'Triangular climbing surface'
        },
        {
          id: 'panel-rockwall', 
          name: 'Rock Wall Panel', 
          baseWidth: 18, baseHeight: 24, baseDepth: 2, baseCost: 17.5,
          hollow: false, shape: 'rock-wall-panel', 
          availableMaterials: ['wood', 'sisal'], 
          availableColors: true,
          description: 'Panel with slotted areas to attach sisal climbing rocks (panel comes with 4 sisal rocks) and other climbing accessories'
        }
      ]
    },

    // ========================================
    // ACCESSORIES - SMALL CLIMBING & PLAY ITEMS
    // ========================================
    accessories: {
      name: 'Accessories',
      icon: '🪨',
      description: 'Small climbing rocks and play accessories',
      variants: [
        {
          id: 'accessory-sisal-rock-small',
          name: 'Small Sisal Rock',
          baseWidth: 3, baseHeight: 2, baseDepth: 3, baseCost: 4,
          hollow: false, shape: 'climbing-rock',
          availableMaterials: ['sisal'],
          availableColors: true,
          description: 'Small sisal-wrapped climbing rock for grip and scratching'
        },
        {
          id: 'accessory-sisal-rock-medium',
          name: 'Medium Sisal Rock',
          baseWidth: 5, baseHeight: 3, baseDepth: 5, baseCost: 6,
          hollow: false, shape: 'climbing-rock',
          availableMaterials: ['sisal'],
          availableColors: true,
          description: 'Medium sisal-wrapped climbing rock for enhanced grip'
        },
        {
          id: 'accessory-sisal-rock-large',
          name: 'Large Sisal Rock',
          baseWidth: 7, baseHeight: 4, baseDepth: 7, baseCost: 9,
          hollow: false, shape: 'climbing-rock',
          availableMaterials: ['sisal'],
          availableColors: true,
          description: 'Large sisal-wrapped climbing rock for challenging climbs'
        },
        {
          id: 'accessory-rockwall-bed',
          name: 'Rockwall Bed',
          baseWidth: 14, baseHeight: 4, baseDepth: 14, baseCost: 12,
          hollow: false, shape: 'rockwall-bed',
          availableMaterials: ['cushion', 'fabric', 'sisal'],
          availableColors: true,
          description: 'Rocky bed with concave top for holding fluffy bedding'
        }
      ]
    }
  },
 
  // ========================================
  // OPENING TYPES - DOORS & WINDOWS FOR HOLLOW PIECES
  // ========================================
  
  /**
   * Opening definitions for hollow pieces
   * Each opening type has specific dimensions and shape characteristics
   */
  openingTypes: {
    'round-entrance': { 
      name: 'Round Entrance', 
      width: 8, height: 8, shape: 'circle', cost: 0,
      description: 'Classic circular entrance hole'
    },
    'square-entrance': { 
      name: 'Square Entrance', 
      width: 6, height: 6, shape: 'square', cost: 0,
      description: 'Square doorway opening'
    },
    'window-small': { 
      name: 'Small Window', 
      width: 4, height: 3, shape: 'rectangle', cost: 0,
      description: 'Small viewing window'
    },
    'window-large': { 
      name: 'Large Window', 
      width: 6, height: 4, shape: 'rectangle', cost: 0,
      description: 'Large observation window'
    },
    'arch-entrance': { 
      name: 'Arch Entrance', 
      width: 7, height: 9, shape: 'arch', cost: 0,
      description: 'Arched doorway entrance'
    }
  },

  // ========================================
  // UTILITY FUNCTIONS - PIECE MANAGEMENT
  // ========================================
  
  /**
   * Finds a variant definition by its ID
   * @param {string} variantId - The variant ID to search for
   * @returns {Object|null} Variant object or null if not found
   */
  getVariantById: (variantId) => {
    for (const categoryData of Object.values(CatTreePieces.categories)) {
      const variant = categoryData.variants.find(v => v.id === variantId);
      if (variant) return variant;
    }
    return null;
  },

  /**
   * Creates a piece instance from a variant definition
   * @param {string} variantId - ID of the variant to create
   * @param {Object} customizations - Optional customizations to apply
   * @returns {Object|null} New piece object or null if variant not found
   */
  createPieceFromVariant: (variantId, customizations = {}) => {
    const variant = CatTreePieces.getVariantById(variantId);
    if (!variant) return null;

    // Use customization color if provided, otherwise use random color from palette
    const pieceColor = customizations.color !== undefined && customizations.color !== null 
      ? customizations.color 
      : CatTreePieces.getRandomColor();  // Changed from getDefaultColor to getRandomColor

    return {
      id: `${variantId}-${Date.now()}`,
      variantId, 
      name: variant.name,
      width: customizations.width || variant.baseWidth,
      height: customizations.height || variant.baseHeight,
      depth: customizations.depth || variant.baseDepth,
      cost: variant.baseCost, 
      hollow: variant.hollow, 
      shape: variant.shape,
      material: customizations.material || 'wood',
      color: pieceColor,
      x: -30, y: 0, z: -30, 
      rotationY: 0,
      tiltX: customizations.tiltX || 0, 
      tiltZ: customizations.tiltZ || 0,
      apexPosition: customizations.apexPosition || 0.5,
      flipped: customizations.flipped || false,
      locked: false, 
      groupId: null,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  },

  /**
   * Gets a random color from the palette for new pieces
   * @returns {number} Random color value from palette
   */
  getRandomColor: () => {
    const palette = SharedUtils.COLORS.PALETTE;
    const randomIndex = Math.floor(Math.random() * palette.length);
    const hexColor = palette[randomIndex];
    // Convert hex string to number (remove # and parse as hex)
    return parseInt(hexColor.slice(1), 16);
  },

  /**
   * Gets the default color for a piece based on its category
   * @param {string} variantId - Variant ID to determine category
   * @returns {number} Default color value
   */
  getDefaultColor: (variantId) => {
    for (const [categoryKey, categoryData] of Object.entries(CatTreePieces.categories)) {
      if (categoryData.variants.some(v => v.id === variantId)) {
        return SharedUtils.COLORS.PIECE_TYPES[categoryKey] || SharedUtils.COLORS.PIECE_TYPES.platform;
      }
    }
    return SharedUtils.COLORS.PIECE_TYPES.platform;
  },

  // ========================================
  // TEXTURE GENERATION FUNCTIONS
  // ========================================

  /**
   * Helper function to create material with appropriate texture based on piece properties
   * @param {Object} piece - Piece object with material and color properties
   * @returns {THREE.MeshLambertMaterial} Configured material
   */
  _createMaterialForPiece: (piece) => {
    // Get the color for this piece
    const color = piece.color !== undefined && piece.color !== null
      ? piece.color
      : CatTreePieces.getRandomColor();

    // Rock wall panels always use rock texture regardless of material
    if (piece.shape === 'rock-wall-panel') {
      const texture = CatTreePieces._createRockWallTexture(512, 512, color);
      return new THREE.MeshLambertMaterial({ map: texture });
    }

    // Apply material-specific textures based on the piece's material property
    if (piece.material) {
      let texture;
      switch (piece.material) {
        case 'sisal':
          texture = CatTreePieces._createSisalTexture(512, 512, color);
          break;
        case 'carpet':
          texture = CatTreePieces._createCarpetTexture(512, 512, color);
          break;
        case 'fabric':
          texture = CatTreePieces._createFabricTexture(512, 512, color);
          break;
        case 'wood':
          texture = CatTreePieces._createWoodTexture(512, 512, color);
          break;
        case 'cushion':
          // Cushion uses a soft solid color appearance
          return new THREE.MeshLambertMaterial({ color });
        default:
          // Default to solid color if material not recognized
          return new THREE.MeshLambertMaterial({ color });
      }
      if (texture) {
        return new THREE.MeshLambertMaterial({ map: texture });
      }
    }

    // No material specified or no texture, use solid color
    return new THREE.MeshLambertMaterial({ color });
  },

  /**
   * Creates a rock wall texture pattern
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {number} baseColor - Base color for rocks
   * @returns {THREE.CanvasTexture} Rock wall texture
   */
  _createRockWallTexture: (width = 512, height = 512, baseColor = 0x8B4513) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Convert hex color to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Fill background
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, width, height);
    
    // Add rock pattern
    const numRocks = 20;
    for (let i = 0; i < numRocks; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 20 + Math.random() * 40;
      
      // Create darker rock outline
      ctx.fillStyle = `rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.8, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
      
      // Add lighter highlight
      ctx.fillStyle = `rgb(${Math.min(255, r+20)}, ${Math.min(255, g+20)}, ${Math.min(255, b+20)})`;
      ctx.beginPath();
      ctx.ellipse(x - size * 0.2, y - size * 0.2, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  },

  /**
   * Creates a sisal rope wrap texture pattern
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {number} baseColor - Base color for sisal
   * @returns {THREE.CanvasTexture} Sisal texture
   */
  _createSisalTexture: (width = 512, height = 512, baseColor = 0xD2B48C) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Force natural sisal color (wheat/tan)
    const sisalBeige = { r: 222, g: 200, b: 160 }; // Warm beige/wheat color

    // Fill background with base sisal color
    ctx.fillStyle = `rgb(${sisalBeige.r}, ${sisalBeige.g}, ${sisalBeige.b})`;
    ctx.fillRect(0, 0, width, height);

    // Draw thicker horizontal rope strands
    const ropeSpacing = 12; // Increased from 8 for thicker rope appearance
    for (let y = 0; y < height; y += ropeSpacing) {
      // Shadow/groove between ropes (darker)
      ctx.strokeStyle = `rgb(${sisalBeige.r - 50}, ${sisalBeige.g - 50}, ${sisalBeige.b - 40})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Main rope body (medium)
      ctx.strokeStyle = `rgb(${sisalBeige.r - 20}, ${sisalBeige.g - 20}, ${sisalBeige.b - 15})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, y + 2);
      ctx.lineTo(width, y + 2);
      ctx.stroke();

      // Highlight on top of rope (lighter)
      ctx.strokeStyle = `rgb(${Math.min(255, sisalBeige.r + 20)}, ${Math.min(255, sisalBeige.g + 20)}, ${Math.min(255, sisalBeige.b + 15)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y + 4);
      ctx.lineTo(width, y + 4);
      ctx.stroke();
    }

    // Add fiber texture with more visible strands
    ctx.strokeStyle = `rgba(${sisalBeige.r - 60}, ${sisalBeige.g - 60}, ${sisalBeige.b - 50}, 0.4)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 5 + Math.random() * 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2); // Reduced repeat for thicker appearance
    return texture;
  },

  /**
   * Creates a carpet texture pattern with fluffy appearance
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {number} baseColor - Base color for carpet
   * @returns {THREE.CanvasTexture} Carpet texture
   */
  _createCarpetTexture: (width = 512, height = 512, baseColor = 0x8B7355) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Convert hex color to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;

    // Fill background with slightly darker base
    ctx.fillStyle = `rgb(${Math.max(0, r - 10)}, ${Math.max(0, g - 10)}, ${Math.max(0, b - 10)})`;
    ctx.fillRect(0, 0, width, height);

    // Create fluffy carpet texture with clustered fiber tufts
    const numTufts = 400;
    for (let i = 0; i < numTufts; i++) {
      const tufX = Math.random() * width;
      const tufY = Math.random() * height;
      const tufSize = 3 + Math.random() * 4;
      const brightness = -20 + Math.random() * 40;

      // Create radial gradient for each tuft (fluffy appearance)
      const gradient = ctx.createRadialGradient(tufX, tufY, 0, tufX, tufY, tufSize);
      gradient.addColorStop(0, `rgb(${Math.max(0, Math.min(255, r + brightness + 20))}, ${Math.max(0, Math.min(255, g + brightness + 20))}, ${Math.max(0, Math.min(255, b + brightness + 20))})`);
      gradient.addColorStop(0.5, `rgb(${Math.max(0, Math.min(255, r + brightness))}, ${Math.max(0, Math.min(255, g + brightness))}, ${Math.max(0, Math.min(255, b + brightness))})`);
      gradient.addColorStop(1, `rgba(${Math.max(0, Math.min(255, r + brightness - 10))}, ${Math.max(0, Math.min(255, g + brightness - 10))}, ${Math.max(0, Math.min(255, b + brightness - 10))}, 0.5)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(tufX, tufY, tufSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add additional small fibers for texture depth
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const brightness = -25 + Math.random() * 50;
      const size = 1 + Math.random() * 2;

      ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, r + brightness))}, ${Math.max(0, Math.min(255, g + brightness))}, ${Math.max(0, Math.min(255, b + brightness))}, 0.6)`;
      ctx.fillRect(x, y, size, size);
    }

    // Add very subtle directional brushing for carpet pile direction
    ctx.strokeStyle = `rgba(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)}, 0.08)`;
    ctx.lineWidth = 2;
    for (let y = 0; y < height; y += 8) {
      for (let x = 0; x < width; x += 16) {
        const angle = Math.sin(x * 0.02) * 0.3;
        const len = 8 + Math.random() * 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  },

  /**
   * Creates a fabric texture pattern
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {number} baseColor - Base color for fabric
   * @returns {THREE.CanvasTexture} Fabric texture
   */
  _createFabricTexture: (width = 512, height = 512, baseColor = 0xA0A0A0) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Convert hex color to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;

    // Fill background
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, width, height);

    // Create woven fabric pattern
    const weaveSize = 4;
    for (let y = 0; y < height; y += weaveSize) {
      for (let x = 0; x < width; x += weaveSize) {
        // Checkerboard weave pattern
        const isLight = ((x / weaveSize) + (y / weaveSize)) % 2 === 0;
        const brightness = isLight ? 10 : -10;
        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r + brightness))}, ${Math.max(0, Math.min(255, g + brightness))}, ${Math.max(0, Math.min(255, b + brightness))})`;
        ctx.fillRect(x, y, weaveSize, weaveSize);
      }
    }

    // Add subtle fabric texture noise
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const brightness = -5 + Math.random() * 10;
      ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, r + brightness))}, ${Math.max(0, Math.min(255, g + brightness))}, ${Math.max(0, Math.min(255, b + brightness))}, 0.3)`;
      ctx.fillRect(x, y, 1, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  },

  /**
   * Creates a wood grain texture pattern
   * @param {number} width - Texture width
   * @param {number} height - Texture height
   * @param {number} baseColor - Base color for wood
   * @returns {THREE.CanvasTexture} Wood texture
   */
  _createWoodTexture: (width = 512, height = 512, baseColor = 0x8B4513) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Convert hex color to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;

    // Fill background
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, width, height);

    // Create vertical wood grain with natural variation
    const grainLines = 150;
    for (let i = 0; i < grainLines; i++) {
      const x = (i / grainLines) * width;
      const variation = Math.sin(i * 0.3) * 15 + Math.sin(i * 0.1) * 25;
      const brightness = -25 + Math.random() * 15;

      ctx.strokeStyle = `rgba(${Math.max(0, r + brightness)}, ${Math.max(0, g + brightness)}, ${Math.max(0, b + brightness)}, 0.3)`;
      ctx.lineWidth = 1 + Math.random() * 2;

      ctx.beginPath();
      ctx.moveTo(x + variation, 0);

      // Create wavy vertical line
      for (let y = 0; y < height; y += 10) {
        const wave = Math.sin(y * 0.03) * 8 + Math.sin(y * 0.01) * 15;
        ctx.lineTo(x + variation + wave, y);
      }
      ctx.stroke();
    }

    // Add subtle horizontal grain
    for (let y = 0; y < height; y += 20) {
      const brightness = -10 + Math.random() * 5;
      ctx.strokeStyle = `rgba(${Math.max(0, r + brightness)}, ${Math.max(0, g + brightness)}, ${Math.max(0, b + brightness)}, 0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Add subtle wood knots (smaller and fewer)
    const numKnots = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numKnots; i++) {
      const knotX = Math.random() * width;
      const knotY = Math.random() * height;
      const knotSize = 15 + Math.random() * 25;

      // Draw subtle concentric ovals for knot
      for (let radius = knotSize; radius > 0; radius -= 4) {
        const darkness = (knotSize - radius) / knotSize * 40;
        ctx.strokeStyle = `rgba(${Math.max(0, r - darkness)}, ${Math.max(0, g - darkness)}, ${Math.max(0, b - darkness)}, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(knotX, knotY, radius * 0.8, radius * 0.5, Math.random() * Math.PI * 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  },


  // ========================================
  // GEOMETRY CREATION SYSTEM - SOLID PIECES
  // ========================================
  
  /**
   * Creates Three.js geometry for solid (non-hollow) pieces
   * FIXED: Proper color handling and geometry creation
   * @param {Object} piece - Piece object with dimensions and shape
   * @returns {THREE.Mesh|THREE.Group} Three.js mesh or group object
   */
  createSolidGeometry: (piece) => {
    const startTime = DEBUG_PERFORMANCE ? performance.now() : 0;
    
    // Use piece's assigned color, or get a random one if somehow missing
    const color = piece.color !== undefined && piece.color !== null 
      ? piece.color 
      : CatTreePieces.getRandomColor();  // Changed from getDefaultColor
    
    const SCALE_FACTOR = 0.96; // Slight scaling to prevent z-fighting
    
    // Handle flipped platforms
    let scaledWidth, scaledHeight, scaledDepth;
    if (piece.flipped && piece.variantId && piece.variantId.startsWith('platform-')) {
      scaledWidth = piece.height * SCALE_FACTOR;
      scaledHeight = piece.width * SCALE_FACTOR;
      scaledDepth = piece.depth * SCALE_FACTOR;
      console.log(`🔄 Creating flipped platform geometry with original proportions: ${scaledWidth}" × ${scaledHeight}" × ${scaledDepth}"`);
    } else {
      scaledWidth = piece.width * SCALE_FACTOR;
      scaledHeight = piece.height * SCALE_FACTOR;
      scaledDepth = piece.depth * SCALE_FACTOR;
    }
    
    log(`🔧 Creating solid ${piece.name}: ${piece.width}" x ${piece.height}" x ${piece.depth}" (${piece.shape}) with color 0x${color.toString(16).padStart(6, '0')}`);

    // Create material with texture based on material type or special shapes
    const material = CatTreePieces._createMaterialForPiece(piece);
    let geometry;
    
    try {
      geometry = CatTreePieces._createGeometryForShape(piece.shape, scaledWidth, scaledHeight, scaledDepth, piece);
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isPiece: true, pieceId: piece.id };
      
      // Handle platform flipping
      if (piece.flipped && piece.variantId && piece.variantId.startsWith('platform-')) {
        console.log(`🔄 Creating flipped platform: ${piece.name}`);
        
        const flipGroup = new THREE.Group();
        mesh.rotation.z = Math.PI / 2;
        
        const standingHeight = piece.width * SCALE_FACTOR;
        mesh.position.y = standingHeight / 2;
        
        console.log(`  Positioned flipped platform at y = ${standingHeight / 2} (standing height: ${standingHeight})")`);
        
        flipGroup.add(mesh);
        flipGroup.userData = { isPiece: true, pieceId: piece.id };
        
        if (DEBUG_PERFORMANCE) {
          const endTime = performance.now();
          console.log(`✅ Created flipped platform ${piece.name} in ${(endTime - startTime).toFixed(2)}ms`);
        }
        
        return flipGroup;
      }
      
      if (DEBUG_PERFORMANCE) {
        const endTime = performance.now();
        console.log(`✅ Created solid ${piece.name} in ${(endTime - startTime).toFixed(2)}ms`);
      }
      
      return mesh;
      
    } catch (error) {
      console.error(`❌ Error creating geometry for ${piece.name}:`, error);
      // Fallback to basic box geometry
      geometry = new THREE.BoxGeometry(scaledWidth, scaledHeight, scaledDepth);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isPiece: true, pieceId: piece.id };
      return mesh;
    }
  },

  /**
   * Creates geometry based on shape type with proper parameters
   * @param {string} shape - Shape identifier
   * @param {number} width - Scaled width
   * @param {number} height - Scaled height  
   * @param {number} depth - Scaled depth
   * @param {Object} piece - Original piece object for additional parameters
   * @returns {THREE.Geometry} Three.js geometry object
   */
  _createGeometryForShape: (shape, width, height, depth, piece) => {
    switch (shape) {
      case 'cylinder':
        return new THREE.CylinderGeometry(width/2, width/2, height, 16);
        
      case 'tapered':
        return new THREE.CylinderGeometry(width/4, width/2, height, 16);
        
      case 'cushion':
        const sphereGeom = new THREE.SphereGeometry(width/2, 16, 8);
        sphereGeom.scale(1, height/width, depth/width);
        return sphereGeom;
        
      case 'raised-edge-square':
        // Create base geometry (1 inch thick)
        const baseHeight = 1;
        const cushionHeight = 1;
        const totalHeight = baseHeight + cushionHeight;
        
        // Create a flat square bed with raised edges
        const squareGeom = new THREE.BoxGeometry(width, totalHeight, depth, 32, 16, 32);
        const squarePositions = squareGeom.attributes.position;
        
        const borderWidth = Math.min(width, depth) * 0.2; // Border width 20% of smallest dimension
        
        // Modify vertices for plush border
        for (let i = 0; i < squarePositions.count; i++) {
          const x = squarePositions.getX(i);
          const y = squarePositions.getY(i);
          const z = squarePositions.getZ(i);
          
          // Calculate distance from edges
          const xDist = Math.abs(Math.abs(x) - width/2);
          const zDist = Math.abs(Math.abs(z) - depth/2);
          const edgeDist = Math.min(xDist, zDist);
          
          // If vertex is above the base height
          if (y > 0) {
            // For the cushioned border
            if (edgeDist < borderWidth) {
              // Create plush rounded effect
              const t = edgeDist / borderWidth;
              const cushionCurve = Math.cos(t * Math.PI * 0.5);
              const heightOffset = cushionCurve * cushionHeight;
              
              // Add some random variation for a more plush look
              const variation = Math.sin(x * 10) * Math.cos(z * 10) * 0.1;
              
              // Set new position
              squarePositions.setY(i, baseHeight + heightOffset + variation);
              
              // Round the outer edges
              const pushIn = (1 - t) * 0.2;
              if (xDist < borderWidth * 0.5) {
                const xPush = Math.sign(x) * pushIn;
                squarePositions.setX(i, x - xPush);
              }
              if (zDist < borderWidth * 0.5) {
                const zPush = Math.sign(z) * pushIn;
                squarePositions.setZ(i, z - zPush);
              }
            } else {
              // Flat center area
              squarePositions.setY(i, baseHeight);
            }
          }
        }
        squareGeom.computeVertexNormals();
        squareGeom.translate(0, totalHeight * 0.5, 0);
        return squareGeom;
        
      case 'raised-edge-round':
        // Create base geometry (1 inch thick)
        const roundBaseHeight = 1;
        const roundCushionHeight = 1;
        const roundTotalHeight = roundBaseHeight + roundCushionHeight;
        
        // Create round bed
        const segments = 64;
        const radialSegments = 16;
        const baseRadius = width/2;
        const roundGeom = new THREE.CylinderGeometry(baseRadius, baseRadius, roundTotalHeight, segments, radialSegments, false);
        const roundPositions = roundGeom.attributes.position;
        
        // Modify vertices for plush border
        for (let i = 0; i < roundPositions.count; i++) {
          const x = roundPositions.getX(i);
          const y = roundPositions.getY(i);
          const z = roundPositions.getZ(i);
          
          // Calculate distance from edge
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          const distanceFromEdge = baseRadius - distanceFromCenter;
          const borderThickness = baseRadius * 0.2; // Border 20% of radius
          
          // If vertex is above the base height
          if (y > 0) {
            // For the cushioned border
            if (distanceFromEdge < borderThickness) {
              // Create plush rounded effect
              const t = distanceFromEdge / borderThickness;
              const cushionCurve = Math.cos(t * Math.PI * 0.5);
              const heightOffset = cushionCurve * roundCushionHeight;
              
              // Add some random variation for a more plush look
              const angle = Math.atan2(z, x);
              const variation = Math.sin(angle * 16) * 0.1;
              
              // Set new position
              roundPositions.setY(i, roundBaseHeight + heightOffset + variation);
              
              // Round the outer edge
              if (distanceFromEdge < borderThickness * 0.5) {
                const pushIn = (1 - t) * 0.15;
                const scale = 1 - pushIn;
                roundPositions.setX(i, x * scale);
                roundPositions.setZ(i, z * scale);
              }
            } else {
              // Flat center area
              roundPositions.setY(i, roundBaseHeight);
            }
          }
        }
        roundGeom.computeVertexNormals();
        roundGeom.translate(0, roundTotalHeight * 0.5, 0);
        return roundGeom;
        
      case 'panel':
      case 'wide-panel':
        return new THREE.BoxGeometry(width, height, depth);
        
      case 'triangle-panel':
        const apexPosition = piece.apexPosition || 0.5;
        const triangleShape = new THREE.Shape();
        const apexX = (apexPosition - 0.5) * width;
        triangleShape.moveTo(-width/2, -height/2);
        triangleShape.lineTo(width/2, -height/2);
        triangleShape.lineTo(apexX, height/2);
        triangleShape.lineTo(-width/2, -height/2);
        const extrudeGeom = new THREE.ExtrudeGeometry(triangleShape, { depth, bevelEnabled: false });
        extrudeGeom.translate(0, 0, -depth/2);
        return extrudeGeom;
        
      case 'rock-wall-panel':
        const rockGeom = new THREE.BoxGeometry(width, height, depth);
        return rockGeom;

      case 'lshaped':
        return CatTreePieces._createLShapedGeometry(width, height, depth);
        
      case 'quarter-circle':
        return CatTreePieces._createQuarterCircleGeometry(width, height, depth);
        
      case 'semicircle':
        return CatTreePieces._createSemicircleGeometry(width, height, depth);
        
      case 'triangle':
        return CatTreePieces._createTriangleGeometry(width, height, depth);
        
      case 'hexagon':
        return CatTreePieces._createHexagonGeometry(width, height, depth);
        
      case 'oval':
        return CatTreePieces._createOvalGeometry(width, height, depth);
        
      case 'climbing-rock':
        return CatTreePieces._createClimbingRockGeometry(width, height, depth);

      case 'rockwall-bed':
        return CatTreePieces._createRockwallBedGeometry(width, height, depth);

      default:
        return new THREE.BoxGeometry(width, height, depth);
    }
  },

  /**
 * Creates L-shaped perch geometry (HORIZONTAL)
 */
  _createLShapedGeometry: (width, height, depth) => {
    const shape = new THREE.Shape();
    shape.moveTo(-width/2, -depth/2);
    shape.lineTo(0, -depth/2);
    shape.lineTo(0, 0);
    shape.lineTo(width/2, 0);
    shape.lineTo(width/2, depth/2);
    shape.lineTo(-width/2, depth/2);
    shape.lineTo(-width/2, -depth/2);
  
  // Extrude along Z axis first (creates it vertically)
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  
  // Rotate to make horizontal (90 degrees around X axis)
  geometry.rotateX(-Math.PI / 2);
  // Center it properly
  geometry.translate(0, height/2, 0);
  
  return geometry;
},

  /**
   * Creates quarter-circle platform geometry (HORIZONTAL)
   */
  _createQuarterCircleGeometry: (width, height, depth) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width/2, 0);
    shape.absarc(0, 0, width/2, 0, Math.PI/2, false);
    shape.lineTo(0, 0);
    
    // Extrude along Z axis first
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    
    // Rotate to make horizontal (shape flat on XZ plane, height going up Y)
    geometry.rotateX(-Math.PI / 2);
    // Center it properly
    geometry.translate(0, height/2, 0);
    
    return geometry;
  },

  /**
   * Creates semicircle platform geometry (HORIZONTAL)
   */
  _createSemicircleGeometry: (width, height, depth) => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, width/2, 0, Math.PI, false);
    shape.lineTo(-width/2, 0);
    
    // Extrude along Z axis first
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    
    // Rotate to make horizontal
    geometry.rotateX(-Math.PI / 2);
    // Center it properly - semicircle needs Z adjustment too
    geometry.translate(0, height/2, -depth/2);
    
    return geometry;
  },

  /**
   * Creates triangle platform geometry (HORIZONTAL)
   */
  _createTriangleGeometry: (width, height, depth) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, depth/2);
    shape.lineTo(-width/2, -depth/2);
    shape.lineTo(width/2, -depth/2);
    shape.lineTo(0, depth/2);
    
    // Extrude along Z axis first
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    
    // Rotate to make horizontal
    geometry.rotateX(-Math.PI / 2);
    // Center it properly
    geometry.translate(0, height/2, 0);
    
    return geometry;
  },

  /**
   * Creates hexagon platform geometry (HORIZONTAL)
   */
  _createHexagonGeometry: (width, height, depth) => {
    const shape = new THREE.Shape();
    const radius = width/2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.lineTo(radius, 0);
    
    // Extrude along Z axis first
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    
    // Rotate to make horizontal
    geometry.rotateX(-Math.PI / 2);
    // Center it properly
    geometry.translate(0, height/2, 0);
    
    return geometry;
  },

  /**
   * Creates oval platform geometry (HORIZONTAL)
   */
  _createOvalGeometry: (width, height, depth) => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, width/2, depth/2, 0, Math.PI * 2, false, 0);
    
    // Extrude along Z axis first (creates it vertically)
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    
    // Rotate to make horizontal (90 degrees around X axis)
    geometry.rotateX(-Math.PI / 2);
    // Center it properly
    geometry.translate(0, height/2, 0);
    
    return geometry;
  },

  /**
   * Creates climbing rock geometry with irregular, rock-like shape
   * @param {number} width - Width of the rock
   * @param {number} height - Height of the rock
   * @param {number} depth - Depth of the rock
   * @returns {THREE.Geometry} Rock-shaped geometry
   */
  _createClimbingRockGeometry: (width, height, depth) => {
    // Start with a basic sphere and deform it to look rock-like
    const geometry = new THREE.SphereGeometry(width/2, 12, 8);
    const positions = geometry.attributes.position;

    // Add randomness to vertices to create irregular rock shape
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Apply random variations but keep it roughly spherical
      const variation = 0.3; // Amount of randomness
      const randomX = (Math.random() - 0.5) * variation;
      const randomY = (Math.random() - 0.5) * variation;
      const randomZ = (Math.random() - 0.5) * variation;

      positions.setX(i, x + randomX);
      positions.setY(i, y + randomY);
      positions.setZ(i, z + randomZ);
    }

    // Scale to match the desired dimensions
    geometry.scale(1, height/width, depth/width);

    // Translate to position it correctly (bottom sitting on ground)
    geometry.translate(0, height/2, 0);

    // Recompute normals after deformation
    geometry.computeVertexNormals();

    return geometry;
  },

  /**
   * Creates rockwall bed geometry - rock-like exterior with concave top for bedding
   * @param {number} width - Width of the bed
   * @param {number} height - Height of the bed
   * @param {number} depth - Depth of the bed
   * @returns {THREE.Geometry} Rockwall bed geometry
   */
  _createRockwallBedGeometry: (width, height, depth) => {
    // Start with a detailed sphere base to deform into rock shape
    const geometry = new THREE.SphereGeometry(width/2, 24, 16);
    const positions = geometry.attributes.position;

    // First pass: Add randomness to create irregular rock-like exterior
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // More variation for a very rocky appearance on the sides
      const variation = 0.4;
      const randomX = (Math.random() - 0.5) * variation;
      const randomY = (Math.random() - 0.5) * variation;
      const randomZ = (Math.random() - 0.5) * variation;

      positions.setX(i, x + randomX);
      positions.setY(i, y + randomY);
      positions.setZ(i, z + randomZ);
    }

    // Scale to proportions - flatten it to be more bed-like
    geometry.scale(1, height/width * 0.5, depth/width);

    // Second pass: Create concave depression in top for bedding
    const concaveDepth = height * 0.5; // How deep the well is
    const concaveRadius = Math.min(width, depth) * 0.35; // Radius of the depression

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Only affect top portion (positive Y values)
      if (y > 0) {
        // Calculate distance from center in XZ plane
        const distFromCenter = Math.sqrt(x * x + z * z);
        const normalizedDist = distFromCenter / concaveRadius;

        // Create smooth concave depression in the center
        if (normalizedDist < 1.2) {
          // Use a parabolic curve for smooth, bowl-like depression
          const curve = Math.max(0, 1 - (normalizedDist * normalizedDist * 0.8));
          const depression = concaveDepth * curve;

          // Apply the depression, making the top concave
          positions.setY(i, y - depression);
        }

        // Flatten the outer rim area slightly
        if (normalizedDist > 0.9 && normalizedDist < 1.3) {
          const flattenAmount = 0.3;
          positions.setY(i, y * (1 - flattenAmount));
        }
      }
    }

    // Recompute normals after all deformations
    geometry.computeVertexNormals();

    // Translate to position correctly (bottom on ground)
    geometry.translate(0, height/2, 0);

    return geometry;
  },

  /**
   * Creates a square cushion with raised plush border
   * @param {number} width - Total width of the bed
   * @param {number} height - Total height including border
   * @param {number} depth - Total depth of the bed
   * @returns {THREE.Group} Group containing base and border meshes
   */
  _createRaisedEdgeSquareGeometry: (width, height, depth) => {
    const baseHeight = height * 0.4;
    const borderHeight = height - baseHeight;
    const borderWidth = 2;
    
    // Create the base cushion
    const baseGeometry = new THREE.BoxGeometry(
      width - borderWidth * 2,
      baseHeight,
      depth - borderWidth * 2
    );
    
    // Create the border (4 separate pieces to avoid geometry issues)
    const borderLengthX = width;
    const borderLengthZ = depth - borderWidth * 2;
    
    const sideBorderGeom = new THREE.BoxGeometry(borderWidth, borderHeight, borderLengthZ);
    const frontBorderGeom = new THREE.BoxGeometry(borderLengthX, borderHeight, borderWidth);
    
    // Create a group to hold all pieces
    const group = new THREE.Group();
    
    // Add base cushion
    const baseMesh = new THREE.Mesh(baseGeometry);
    baseMesh.position.y = baseHeight / 2;
    group.add(baseMesh);
    
    // Add border pieces
    const leftBorder = new THREE.Mesh(sideBorderGeom);
    leftBorder.position.set(-width/2 + borderWidth/2, baseHeight + borderHeight/2, 0);
    group.add(leftBorder);
    
    const rightBorder = new THREE.Mesh(sideBorderGeom);
    rightBorder.position.set(width/2 - borderWidth/2, baseHeight + borderHeight/2, 0);
    group.add(rightBorder);
    
    const frontBorder = new THREE.Mesh(frontBorderGeom);
    frontBorder.position.set(0, baseHeight + borderHeight/2, -depth/2 + borderWidth/2);
    group.add(frontBorder);
    
    const backBorder = new THREE.Mesh(frontBorderGeom);
    backBorder.position.set(0, baseHeight + borderHeight/2, depth/2 - borderWidth/2);
    group.add(backBorder);
    
    return group;
  },

  /**
   * Creates a round cushion with raised plush border
   * @param {number} width - Diameter of the bed
   * @param {number} height - Total height including border
   * @param {number} depth - Should equal width for circular bed
   * @returns {THREE.Group} Group containing base and border meshes
   */
  _createRaisedEdgeRoundGeometry: (width, height, depth) => {
    const baseHeight = height * 0.4;
    const borderHeight = height - baseHeight;
    const borderWidth = 2;
    const radius = width/2;
    
    // Create base cushion
    const baseGeometry = new THREE.CylinderGeometry(
      radius - borderWidth,
      radius - borderWidth,
      baseHeight,
      32
    );
    
    // Create border wall
    const borderWallGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      borderHeight,
      32,
      1,
      true
    );
    
    // Create a group to hold all pieces
    const group = new THREE.Group();
    
    // Add base cushion
    const baseMesh = new THREE.Mesh(baseGeometry);
    baseMesh.position.y = baseHeight / 2;
    group.add(baseMesh);
    
    // Add border wall
    const borderMesh = new THREE.Mesh(borderWallGeometry);
    borderMesh.position.y = baseHeight + borderHeight/2;
    group.add(borderMesh);
    
    return group;
  },

  // ========================================
  // HOLLOW GEOMETRY CREATION SYSTEM
  // ========================================
  
  /**
   * Creates Three.js geometry for hollow pieces with wall structure
   * @param {Object} piece - Piece object with dimensions and shape
   * @returns {THREE.Group} Three.js group containing wall meshes
   */
  createHollowGeometry: (piece) => {
    const startTime = DEBUG_PERFORMANCE ? performance.now() : 0;
    log(`🏠 Creating hollow ${piece.name}...`);
    
    let result;
    switch (piece.shape) {
      case 'aframe':
        result = CatTreePieces._createHollowAFrame(piece);
        break;
      case 'cylinder':
        result = CatTreePieces._createHollowCylinder(piece);
        break;
      case 'tunnel':
        result = CatTreePieces._createHollowTunnel(piece);
        break;
      case 'tube-tunnel':
        result = CatTreePieces._createTubeTunnel(piece);
        break;
      case 'tunnel-curve90':
        result = CatTreePieces._createCurved90Tunnel(piece);
        break;
      case 'tunnel-ramp':
        result = CatTreePieces._createRampTunnel(piece);
        break;
      default:
        result = CatTreePieces._createHollowBox(piece);
    }
    
    if (DEBUG_PERFORMANCE) {
      const endTime = performance.now();
      console.log(`✅ Created hollow ${piece.name} in ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return result;
  },

  /**
   * Creates a hollow box structure with individual wall meshes
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createHollowBox: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 0.75;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const [scaledWidth, scaledHeight, scaledDepth, scaledWallThickness] = [
      piece.width * SCALE_FACTOR,
      piece.height * SCALE_FACTOR,
      piece.depth * SCALE_FACTOR,
      wallThickness * SCALE_FACTOR
    ];
    
    // Wall configuration
    const wallConfigs = [
      { pos: [0, 0, -scaledDepth/2 + scaledWallThickness/2], size: [scaledWidth, scaledHeight, scaledWallThickness], name: 'front' },
      { pos: [0, 0, scaledDepth/2 - scaledWallThickness/2], size: [scaledWidth, scaledHeight, scaledWallThickness], name: 'back' },
      { pos: [-scaledWidth/2 + scaledWallThickness/2, 0, 0], size: [scaledWallThickness, scaledHeight, scaledDepth - scaledWallThickness], name: 'left' },
      { pos: [scaledWidth/2 - scaledWallThickness/2, 0, 0], size: [scaledWallThickness, scaledHeight, scaledDepth - scaledWallThickness], name: 'right' },
      { pos: [0, scaledHeight/2 - scaledWallThickness/2, 0], size: [scaledWidth, scaledWallThickness, scaledDepth], name: 'top' },
      { pos: [0, -scaledHeight/2 + scaledWallThickness/2, 0], size: [scaledWidth, scaledWallThickness, scaledDepth], name: 'bottom' }
    ];

    wallConfigs.forEach(({ pos, size, name }) => {
      const geometry = new THREE.BoxGeometry(...size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { 
        isPiece: true, 
        pieceId: piece.id, 
        wallName: name 
      };
      group.add(mesh);
    });

    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  /**
   * Creates a hollow A-frame structure
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createHollowAFrame: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 0.75;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const [scaledWidth, scaledHeight, scaledDepth, scaledWallThickness] = [
      piece.width * SCALE_FACTOR,
      piece.height * SCALE_FACTOR,
      piece.depth * SCALE_FACTOR,
      wallThickness * SCALE_FACTOR
    ];
    
    // Create triangular front and back walls
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(-scaledWidth/2, -scaledHeight/2);
    triangleShape.lineTo(scaledWidth/2, -scaledHeight/2);
    triangleShape.lineTo(0, scaledHeight/2);
    triangleShape.lineTo(-scaledWidth/2, -scaledHeight/2);
    
    // Front wall
    const frontGeom = new THREE.ExtrudeGeometry(triangleShape, { 
      depth: scaledWallThickness, 
      bevelEnabled: false 
    });
    const frontMesh = new THREE.Mesh(frontGeom, material);
    frontMesh.position.z = -scaledDepth/2;
    frontMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'front' };
    group.add(frontMesh);
    
    // Back wall
    const backMesh = new THREE.Mesh(frontGeom.clone(), material);
    backMesh.position.z = scaledDepth/2 - scaledWallThickness;
    backMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'back' };
    group.add(backMesh);
    
    // Floor
    const floorGeom = new THREE.BoxGeometry(scaledWidth, scaledWallThickness, scaledDepth);
    const floorMesh = new THREE.Mesh(floorGeom, material);
    floorMesh.position.y = -scaledHeight/2 + scaledWallThickness/2;
    floorMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'bottom' };
    group.add(floorMesh);
    
    // Sloped left roof
    const roofLength = Math.sqrt((scaledWidth/2) * (scaledWidth/2) + scaledHeight * scaledHeight);
    const leftRoofGeom = new THREE.BoxGeometry(roofLength, scaledWallThickness, scaledDepth);
    const leftRoofMesh = new THREE.Mesh(leftRoofGeom, material);
    const angle = Math.atan2(scaledHeight, scaledWidth/2);
    leftRoofMesh.rotation.z = angle;
    leftRoofMesh.position.set(-scaledWidth/4, 0, 0);
    leftRoofMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'left' };
    group.add(leftRoofMesh);
    
    // Sloped right roof
    const rightRoofMesh = new THREE.Mesh(leftRoofGeom.clone(), material);
    rightRoofMesh.rotation.z = -angle;
    rightRoofMesh.position.set(scaledWidth/4, 0, 0);
    rightRoofMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'right' };
    group.add(rightRoofMesh);
    
    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  /**
   * Creates a hollow cylinder structure
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createHollowCylinder: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 0.75;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const scaledRadius = (piece.width * SCALE_FACTOR) / 2;
    const scaledHeight = piece.height * SCALE_FACTOR;
    const scaledWallThickness = wallThickness * SCALE_FACTOR;
    
    // Create walls using a hollow cylinder approach
    const innerRadius = scaledRadius - scaledWallThickness;
    
    const wallGeom = new THREE.CylinderGeometry(
      scaledRadius, 
      scaledRadius, 
      scaledHeight, 
      16, 
      1, 
      true
    );
    const wallMesh = new THREE.Mesh(wallGeom, material);
    wallMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'wall' };
    group.add(wallMesh);
    
    // Top cap
    const topGeom = new THREE.RingGeometry(innerRadius, scaledRadius, 16);
    const topMesh = new THREE.Mesh(topGeom, material);
    topMesh.rotation.x = -Math.PI / 2;
    topMesh.position.y = scaledHeight / 2;
    topMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'top' };
    group.add(topMesh);
    
    // Bottom cap
    const bottomMesh = new THREE.Mesh(topGeom.clone(), material);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = -scaledHeight / 2;
    bottomMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'bottom' };
    group.add(bottomMesh);
    
    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  /**
   * Creates a hollow rectangular tunnel
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createHollowTunnel: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 0.75;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const [scaledWidth, scaledHeight, scaledDepth, scaledWallThickness] = [
      piece.width * SCALE_FACTOR,
      piece.height * SCALE_FACTOR,
      piece.depth * SCALE_FACTOR,
      wallThickness * SCALE_FACTOR
    ];
    
    // Top wall
    const topGeom = new THREE.BoxGeometry(scaledWidth, scaledWallThickness, scaledDepth);
    const topMesh = new THREE.Mesh(topGeom, material);
    topMesh.position.y = scaledHeight/2 - scaledWallThickness/2;
    topMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'top' };
    group.add(topMesh);
    
    // Bottom wall
    const bottomMesh = new THREE.Mesh(topGeom.clone(), material);
    bottomMesh.position.y = -scaledHeight/2 + scaledWallThickness/2;
    bottomMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'bottom' };
    group.add(bottomMesh);
    
    // Left wall
    const sideGeom = new THREE.BoxGeometry(scaledWidth, scaledHeight - 2*scaledWallThickness, scaledWallThickness);
    const leftMesh = new THREE.Mesh(sideGeom, material);
    leftMesh.position.z = -scaledDepth/2 + scaledWallThickness/2;
    leftMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'left' };
    group.add(leftMesh);
    
    // Right wall
    const rightMesh = new THREE.Mesh(sideGeom.clone(), material);
    rightMesh.position.z = scaledDepth/2 - scaledWallThickness/2;
    rightMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'right' };
    group.add(rightMesh);
    
    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  /**
   * Creates a cylindrical tube tunnel
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createTubeTunnel: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 1.25;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const scaledLength = piece.width * SCALE_FACTOR;
    const scaledOuterRadius = (piece.height * SCALE_FACTOR) / 2;
    const scaledInnerRadius = scaledOuterRadius - wallThickness;
    
    // Create outer cylinder
    const outerGeom = new THREE.CylinderGeometry(
      scaledOuterRadius, 
      scaledOuterRadius, 
      scaledLength, 
      16, 
      1, 
      false // Closed ends
    );
    
    // Create inner cylinder (hollow space)
    const innerGeom = new THREE.CylinderGeometry(
      scaledInnerRadius, 
      scaledInnerRadius, 
      scaledLength + 0.1, // Slightly longer to ensure clean subtraction
      16, 
      1, 
      false
    );
    
    // Create the hollow tube using CSG-like approach with separate geometries
    const tubeGroup = new THREE.Group();
    
    // Create true hollow cylinder - thick wall structure
    // Use THREE.LatheGeometry to create a proper hollow tube
    const points = [];
    // Outer wall
    points.push(new THREE.Vector2(scaledOuterRadius, -scaledLength/2));
    points.push(new THREE.Vector2(scaledOuterRadius, scaledLength/2));
    // Inner wall (going back down)
    points.push(new THREE.Vector2(scaledInnerRadius, scaledLength/2));
    points.push(new THREE.Vector2(scaledInnerRadius, -scaledLength/2));
    // Close the shape
    points.push(new THREE.Vector2(scaledOuterRadius, -scaledLength/2));
    
    const tubeGeometry = new THREE.LatheGeometry(points, 16);
    const tubeMesh = new THREE.Mesh(tubeGeometry, material);
    tubeMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'tube' };
    tubeGroup.add(tubeMesh);
    
    // No end caps needed - the LatheGeometry creates the complete hollow tube structure
    
    // Rotate to horizontal
    tubeGroup.rotation.z = Math.PI / 2;
    group.add(tubeGroup);
    
    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  /**
   * Creates a 90-degree curved tunnel with proper orientation and visibility
   * FIXED: Corrected curve direction, normals, and end cap positioning
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createCurved90Tunnel: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 1.25;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const scaledWidth = piece.width * SCALE_FACTOR;
    const scaledHeight = piece.height * SCALE_FACTOR;
    const scaledDepth = piece.depth * SCALE_FACTOR;
    
    // Calculate proper dimensions for a 90-degree curved tunnel
    const tubeRadius = scaledHeight / 2;
    const innerRadius = tubeRadius - wallThickness;
    const bendRadius = Math.min(scaledWidth, scaledDepth) / 3;
    
    // FIXED: Create proper 90-degree curve with correct orientation
    // Start from positive X, curve down to negative Z (standard orientation)
    const curve = new THREE.EllipseCurve(
      0, 0,           // center
      bendRadius, bendRadius,  // xRadius, yRadius
      Math.PI, Math.PI * 1.5,  // start angle, end angle (270 degrees total)
      false,          // clockwise
      0              // rotation
    );
    
    // Convert to 3D points with proper orientation
    const points = curve.getPoints(20).map(point => 
      new THREE.Vector3(point.x, 0, point.y)
    );
    
    const curve3D = new THREE.CatmullRomCurve3(points);
    
    // Create the tube geometry with consistent cross-section
    const tubeGeometry = new THREE.TubeGeometry(
      curve3D,      // curve
      20,           // segments
      tubeRadius,   // radius
      16,           // radial segments
      false         // closed
    );
    
    // Create the main tunnel wall
    const tunnelMesh = new THREE.Mesh(tubeGeometry, material);
    tunnelMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'tunnel' };
    group.add(tunnelMesh);
    
    // Create proper end caps with holes (ring geometry)
    const capGeometry = new THREE.RingGeometry(innerRadius, tubeRadius, 16);
    
    // Get the actual start and end points of the curve
    const startPoint = curve3D.getPoint(0);
    const endPoint = curve3D.getPoint(1);
    
    // Get the tangent vectors at start and end for proper orientation
    const startTangent = curve3D.getTangent(0).normalize();
    const endTangent = curve3D.getTangent(1).normalize();
    
    // Start cap - positioned at actual curve start
    const startCap = new THREE.Mesh(capGeometry, material);
    startCap.position.copy(startPoint);
    // Orient the cap to face outward from the curve (opposite to tangent direction)
    startCap.lookAt(startPoint.clone().sub(startTangent));
    startCap.userData = { isPiece: true, pieceId: piece.id, wallName: 'startCap' };
    group.add(startCap);
    
    // End cap - positioned at actual curve end
    const endCap = new THREE.Mesh(capGeometry, material);
    endCap.position.copy(endPoint);
    // FIXED: Orient the cap to face outward from the curve (in tangent direction for end cap)
    endCap.lookAt(endPoint.clone().add(endTangent));
    endCap.userData = { isPiece: true, pieceId: piece.id, wallName: 'endCap' };
    group.add(endCap);
    
    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  /**
   * Creates a ramp tunnel (angled tunnel)
   * @param {Object} piece - Piece object
   * @returns {THREE.Group} Group containing wall meshes
   */
  _createRampTunnel: (piece) => {
    const group = new THREE.Group();
    const wallThickness = 0.75;

    // Create material with appropriate texture based on piece's material property
    const material = CatTreePieces._createMaterialForPiece(piece);
    
    const SCALE_FACTOR = 0.96;
    const [scaledWidth, scaledHeight, scaledDepth, scaledWallThickness] = [
      piece.width * SCALE_FACTOR,
      piece.height * SCALE_FACTOR,
      piece.depth * SCALE_FACTOR,
      wallThickness * SCALE_FACTOR
    ];
    
    const tunnelGroup = new THREE.Group();
    
    // Top wall
    const topGeom = new THREE.BoxGeometry(scaledWidth, scaledWallThickness, scaledDepth);
    const topMesh = new THREE.Mesh(topGeom, material);
    topMesh.position.y = scaledHeight/2 - scaledWallThickness/2;
    topMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'top' };
    tunnelGroup.add(topMesh);
    
    // Bottom wall
    const bottomMesh = new THREE.Mesh(topGeom.clone(), material);
    bottomMesh.position.y = -scaledHeight/2 + scaledWallThickness/2;
    bottomMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'bottom' };
    tunnelGroup.add(bottomMesh);
    
    // Left wall
    const sideGeom = new THREE.BoxGeometry(scaledWidth, scaledHeight - 2*scaledWallThickness, scaledWallThickness);
    const leftMesh = new THREE.Mesh(sideGeom, material);
    leftMesh.position.z = -scaledDepth/2 + scaledWallThickness/2;
    leftMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'left' };
    tunnelGroup.add(leftMesh);
    
    // Right wall
    const rightMesh = new THREE.Mesh(sideGeom.clone(), material);
    rightMesh.position.z = scaledDepth/2 - scaledWallThickness/2;
    rightMesh.userData = { isPiece: true, pieceId: piece.id, wallName: 'right' };
    tunnelGroup.add(rightMesh);
    
    // Angle the entire tunnel upward at 30 degrees
    tunnelGroup.rotation.z = Math.PI / 6;
    
    group.add(tunnelGroup);
    group.userData = { isPiece: true, pieceId: piece.id };
    return group;
  },

  // ========================================
  // OPENING MARKER CREATION SYSTEM
  // ========================================
  
  /**
   * Creates visual markers for openings on hollow pieces
   * @param {Object} opening - Opening definition
   * @param {Object} parentPiece - Parent piece the opening is on
   * @returns {THREE.Group} Three.js group containing opening marker
   */
  createOpeningMarker: (opening, parentPiece) => {
    const group = new THREE.Group();
    const face = opening.face || 'front';
    
    const SCALE_FACTOR = 0.96;
    const [parentHalfWidth, parentHalfHeight, parentHalfDepth] = [
      (parentPiece.width * SCALE_FACTOR) / 2,
      (parentPiece.height * SCALE_FACTOR) / 2,
      (parentPiece.depth * SCALE_FACTOR) / 2
    ];
    
    // Face position and rotation calculations
    const positions = {
      front: { pos: [opening.offsetX || 0, opening.offsetY || 0, parentHalfDepth + 0.1], rot: [0, 0, 0] },
      back: { pos: [opening.offsetX || 0, opening.offsetY || 0, -parentHalfDepth - 0.1], rot: [0, Math.PI, 0] },
      left: { pos: [-parentHalfWidth - 0.1, opening.offsetY || 0, opening.offsetZ || 0], rot: [0, Math.PI/2, 0] },
      right: { pos: [parentHalfWidth + 0.1, opening.offsetY || 0, opening.offsetZ || 0], rot: [0, -Math.PI/2, 0] },
      top: { pos: [opening.offsetX || 0, parentHalfHeight + 0.1, opening.offsetZ || 0], rot: [-Math.PI/2, 0, 0] },
      bottom: { pos: [opening.offsetX || 0, -parentHalfHeight - 0.1, opening.offsetZ || 0], rot: [Math.PI/2, 0, 0] }
    };
    
    const { pos, rot } = positions[face];
    
    // Create marker geometry based on opening shape
    let geometry;
    switch (opening.shape) {
      case 'circle':
        geometry = new THREE.CircleGeometry(opening.width/2, 32);
        break;
      case 'arch':
        const archShape = new THREE.Shape();
        archShape.absarc(0, 0, opening.width/2, 0, Math.PI, false);
        archShape.lineTo(-opening.width/2, -opening.height/2);
        archShape.lineTo(opening.width/2, -opening.height/2);
        geometry = new THREE.ShapeGeometry(archShape);
        break;
      default:
        geometry = new THREE.PlaneGeometry(opening.width, opening.height);
    }
    
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00aa00, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.9 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.userData = { 
      isOpening: true, 
      openingId: opening.id, 
      parentPieceId: parentPiece.id 
    };
    
    group.add(mesh);
    group.userData = { 
      isOpening: true, 
      openingId: opening.id, 
      parentPieceId: parentPiece.id 
    };
    
    return group;
  },

  // ========================================
  // VISUAL ENHANCEMENT SYSTEM
  // ========================================
  
  /**
   * Applies selection highlighting to piece meshes
   * @param {THREE.Mesh|THREE.Group} mesh - Mesh or group to highlight
   * @param {boolean} isSelected - Whether piece is selected
   * @param {boolean} isLocked - Whether piece is locked
   * @param {Object} piece - Piece object for color reference
   */
  applySelectionHighlight: (mesh, isSelected, isLocked, piece) => {
    if (!mesh) return;
    
    // Determine target color based on state
    let targetColor;
    if (isSelected) {
      targetColor = SharedUtils.COLORS.SELECTION;
    } else if (isLocked) {
      // Keep original color for locked pieces, add subtle red highlight via emissive
      targetColor = piece && piece.color !== undefined && piece.color !== null ? piece.color : CatTreePieces.getRandomColor();
    } else if (piece && piece.color !== undefined && piece.color !== null) {
      targetColor = piece.color;
    } else {
      // This should rarely happen since pieces should have colors assigned
      targetColor = CatTreePieces.getRandomColor();
    }
    
    // Apply color to all meshes in the object
    mesh.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone material to avoid affecting other instances
        if (!child.material.isCustomMaterial) {
          child.material = child.material.clone();
          child.material.isCustomMaterial = true;
        }
        child.material.color.setHex(targetColor);
        
        // Set emissive color for selection/lock states
        if (child.material.emissive) {
          child.material.emissive.setHex(
            isSelected ? 0x111111 : 
            isLocked ? 0x220000 : // Subtle red glow for locked pieces
            0x000000
          );
        }
      }
    });
  }
};