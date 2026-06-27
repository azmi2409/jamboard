## ADDED Requirements

### Requirement: Infinite canvas navigation
The canvas SHALL support panning and zooming so the user can navigate an unbounded drawing area.

#### Scenario: Pan with middle-click drag
- **WHEN** the user holds the middle mouse button and moves the mouse
- **THEN** the viewport SHALL translate to follow the drag

#### Scenario: Pan with spacebar drag
- **WHEN** the user holds the spacebar and drags with the primary mouse button
- **THEN** the viewport SHALL translate to follow the drag

#### Scenario: Zoom with scroll wheel
- **WHEN** the user scrolls the mouse wheel over the canvas
- **THEN** the viewport SHALL zoom in or out around the cursor position

### Requirement: Drawing tools
The canvas SHALL provide the tools: Select, Rectangle, Ellipse, Arrow, Line, Freehand Draw, and Text.

#### Scenario: Activate a tool
- **WHEN** the user clicks a tool in the toolbar or presses its assigned shortcut
- **THEN** the active tool SHALL change and subsequent canvas interactions SHALL use that tool

#### Scenario: Draw a rectangle
- **WHEN** the user selects the Rectangle tool and drags on the canvas
- **THEN** a rectangle SHALL be created from the drag start point to the drag end point

#### Scenario: Draw an ellipse
- **WHEN** the user selects the Ellipse tool and drags on the canvas
- **THEN** an ellipse SHALL be created inscribed in the dragged bounding box

#### Scenario: Draw an arrow
- **WHEN** the user selects the Arrow tool and drags on the canvas
- **THEN** a line with an arrowhead SHALL be created from the drag start point to the drag end point

#### Scenario: Draw a straight line
- **WHEN** the user selects the Line tool and drags on the canvas
- **THEN** a straight line SHALL be created between the drag start and end points

#### Scenario: Draw freehand
- **WHEN** the user selects the Freehand Draw tool and drags on the canvas
- **THEN** a freehand path SHALL be created following the dragged points

#### Scenario: Add text
- **WHEN** the user selects the Text tool and clicks on the canvas
- **THEN** a text input SHALL appear at the click location and, on confirm, a text element SHALL be created

### Requirement: Rendering performance
The canvas SHALL render elements in an optimized loop to maintain interactive performance.

#### Scenario: Render loop
- **WHEN** the canvas state or viewport changes
- **THEN** the canvas SHALL redraw using `requestAnimationFrame` without unnecessary full-screen clears beyond the render cycle

#### Scenario: Hand-drawn aesthetic
- **WHEN** a geometric shape is rendered
- **THEN** `roughjs` SHALL be used to produce a hand-drawn sketch appearance
