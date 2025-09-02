# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

This is a client-side React application that runs entirely in the browser using CDN libraries. No build process is required.

**To run the application:**
- Open `index.html` in any modern web browser for the production version
- Open `index-debug.html` for the debug version with enhanced console logging

## Code Architecture

### Core Application Structure
The application follows a modular architecture with clear separation of concerns:

- **app.js** - Main application component (`CatTreeBuilder`) that orchestrates the entire UI
- **sharedUtilities.js** - Core utilities, constants, and shared functions (must load first)
- **canvas3d.js** - Three.js-based 3D rendering engine with mouse interaction
- **catTreePieces.js** - Piece geometry creation, materials, and visual styling
- **structuralAnalysis.js** - Engineering calculations for stress analysis and weight distribution

### Component Organization
Components are located in `js/components/` and handle specific UI concerns:

- **hierarchicalPieceLibrary.js** - Toolbox with categorized piece selection
- **customizationPanel.js** - Comprehensive piece property editor (dimensions, materials, colors, openings, tilting)
- **partsListManagement.js** - Right sidebar for managing pieces, groups, and openings
- **pieceEditingControls.js** - Movement controls and piece manipulation
- **saveDesignModal.js** - File save/export functionality
- **stressTestPanel.js** - Structural integrity visualization

### State Management
Central state management is handled through:
- **usePieceManagement.js** - Custom hook managing all design data (pieces, groups, openings)

## Key Technical Details

### Coordinate System
- Uses Three.js coordinate system with ground plane at Y=0
- Measurements in inches for precision
- Grid system shows 6" fine lines and 24" major lines
- Origin (0,0) marked with green cross

### Piece Positioning
- Standard pieces: Position represents center point, sits on ground
- Panel pieces: **Critical** - Use bottom pivot with YXZ rotation order for tilting
- All pieces support rotation, custom colors, and materials

### Dependencies (CDN-loaded)
- Three.js r128 - 3D rendering
- React 18 - UI framework  
- Babel Standalone - JSX transformation
- Tailwind CSS - Styling

### File Loading Order
**CRITICAL**: Files must load in this exact order due to dependencies:
1. sharedUtilities.js (provides SharedUtils global)
2. catTreePieces.js, structuralAnalysis.js
3. canvas3d.js
4. All components (hierarchicalPieceLibrary.js, customizationPanel.js, partsListManagement.js, etc.)
5. usePieceManagement.js hook
6. app.js (main application)

## Key Features

### 3D Canvas Interaction
- Left-click: Select/drag pieces
- Right-click + drag: Pan camera view
- Left-click + drag empty space: Rotate camera
- Mouse wheel: Zoom in/out
- Hover: Visual feedback for interactive elements

### Stress Visualization System
When enabled, the structural analysis system:
- Calculates weight distribution across all pieces
- Shows stress levels through color coding (green=safe → red=critical)
- Uses material properties for engineering calculations
- Updates in real-time as design changes

### Design Management
- Save/load designs as JSON files
- Real-time cost calculations
- Piece grouping and locking
- Opening management for hollow pieces
- Grid snapping with configurable increments
- Comprehensive piece customization (dimensions, materials, colors, tilting, apex positioning)

## Working with the Code

### Adding New Piece Types
1. Add variant definition to `catTreePieces.js` categories
2. Implement geometry creation in `createSolidGeometry()` or `createHollowGeometry()`
3. Update material and cost calculations

### Modifying 3D Rendering
- Geometry creation: `catTreePieces.js`
- Scene management: `canvas3d.js`
- Performance optimizations use memoization and cleanup utilities

### State Updates
- All design state flows through `usePieceManagement` hook
- Use provided actions rather than direct state manipulation
- Component re-renders are optimized through React.memo and change detection

## Common Development Commands

**Testing structural analysis:**
```javascript
// In browser console
const pieces = [/* piece array */];
const supportMap = StructuralAnalysis.analyzeSupportStructure(pieces);
console.log('Support analysis:', supportMap);
```

**Debugging Three.js performance:**
- Enable `DEBUG_PERFORMANCE = true` in canvas3d.js
- Monitor console for FPS and update statistics
- Check mesh cleanup with `cleanupScene()` calls

The application is designed for extensibility - new piece types, materials, and features can be added by following the established patterns in each module.