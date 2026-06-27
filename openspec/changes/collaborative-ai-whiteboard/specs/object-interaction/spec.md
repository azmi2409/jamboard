## ADDED Requirements

### Requirement: Select elements
The user SHALL be able to select one or more canvas elements.

#### Scenario: Single select
- **WHEN** the user clicks on an element with the Select tool active
- **THEN** that element SHALL become selected and a selection outline with resize handles SHALL appear

#### Scenario: Click empty canvas
- **WHEN** the user clicks on an empty area of the canvas with the Select tool active
- **THEN** any existing selection SHALL be cleared

### Requirement: Move elements
The user SHALL be able to move selected elements by dragging them.

#### Scenario: Drag selected element
- **WHEN** the user presses on a selected element and drags
- **THEN** the element SHALL translate by the drag delta and its new position SHALL be reflected in the canvas state

### Requirement: Resize elements
The user SHALL be able to resize selected elements using resize handles.

#### Scenario: Drag resize handle
- **WHEN** the user drags a resize handle on the selection outline
- **THEN** the element's width, height, and position SHALL update according to the handle being dragged

### Requirement: Delete elements
The user SHALL be able to delete selected elements.

#### Scenario: Press Delete key
- **WHEN** the user presses the Delete or Backspace key while one or more elements are selected
- **THEN** the selected elements SHALL be removed from the canvas state

### Requirement: Hit testing
The application SHALL accurately determine which element is under the pointer.

#### Scenario: Hit test on shape
- **WHEN** the user clicks inside or on the stroke of a rendered shape
- **THEN** the corresponding element SHALL be selected
