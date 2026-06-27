## ADDED Requirements

### Requirement: Shared canvas state
The application SHALL synchronize canvas state across connected clients in real time.

#### Scenario: Two clients draw
- **WHEN** client A draws a shape
- **THEN** client B SHALL see the shape appear within a short synchronization window

#### Scenario: Two clients edit
- **WHEN** client A moves or deletes a shape
- **THEN** client B SHALL see the same move or deletion

### Requirement: Yjs state structure
The shared state SHALL be stored in a `Y.Array` of serializable canvas element objects.

#### Scenario: Add element to shared array
- **WHEN** a new element is created locally
- **THEN** it SHALL be appended to the Yjs array and propagated to peers

### Requirement: WebSocket provider
The application SHALL use a WebSocket provider to connect the Yjs document between clients.

#### Scenario: Connect to room
- **WHEN** the application loads
- **THEN** it SHALL connect to a configured WebSocket endpoint and join a shared room

### Requirement: Live remote cursors
The application SHALL display the cursor positions of other connected users on the canvas.

#### Scenario: Remote cursor moves
- **WHEN** another user moves their mouse over the canvas
- **THEN** a cursor indicator with that user's name and color SHALL be rendered at the corresponding canvas position

#### Scenario: User joins
- **WHEN** a new user connects to the collaboration room
- **THEN** their cursor metadata (name and color) SHALL be shared via Yjs awareness
