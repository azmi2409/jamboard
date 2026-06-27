## ADDED Requirements

### Requirement: Prompt interface
The application SHALL provide a prompt input interface for AI generation.

#### Scenario: Open prompt with keyboard shortcut
- **WHEN** the user presses Cmd+K (macOS) or Ctrl+K (Windows/Linux)
- **THEN** a floating prompt bar SHALL appear

#### Scenario: Open prompt with UI button
- **WHEN** the user clicks the AI generation button in the toolbar
- **THEN** a floating prompt bar SHALL appear

#### Scenario: Close prompt
- **WHEN** the user presses Escape or clicks outside the prompt bar
- **THEN** the prompt bar SHALL close

### Requirement: Mock AI generation service
The application SHALL include a swappable mock AI generation service.

#### Scenario: Submit prompt
- **WHEN** the user submits a prompt
- **THEN** the mock service SHALL return a promise that resolves to one or more canvas elements after a short delay

#### Scenario: Swappable implementation
- **WHEN** a developer replaces the mock function with a real API call
- **THEN** the rest of the application SHALL continue to work without changes beyond the service module

### Requirement: Generation placement
The generated output SHALL be rendered on the canvas at the current viewport location.

#### Scenario: Place at viewport center
- **WHEN** a generation completes
- **THEN** the resulting elements SHALL be inserted into the canvas state centered at the current viewport center

#### Scenario: Loading indicator
- **WHEN** a prompt is submitted
- **THEN** a loading indicator SHALL appear at the target location until generation completes

### Requirement: Generated elements are editable
Generated elements SHALL behave like native canvas elements.

#### Scenario: Select generated element
- **WHEN** the user clicks a generated element
- **THEN** it SHALL become selected

#### Scenario: Move generated element
- **WHEN** the user drags a generated element
- **THEN** it SHALL move

#### Scenario: Resize generated element
- **WHEN** the user drags a resize handle on a generated element
- **THEN** it SHALL resize
