## ADDED Requirements

### Requirement: Debounced persistence
The application SHALL automatically persist the serialized canvas state to IndexedDB after a period of inactivity.

#### Scenario: Change triggers debounce
- **WHEN** the canvas state changes
- **THEN** a debounced save SHALL be scheduled and SHALL write the serialized state to IndexedDB after the debounce interval

#### Scenario: Multiple rapid changes collapse
- **WHEN** multiple state changes occur within the debounce interval
- **THEN** only one save SHALL be executed after the interval elapses

### Requirement: Hydration on load
The application SHALL restore the canvas from a previously saved IndexedDB snapshot on initial load.

#### Scenario: Existing saved state
- **WHEN** the application loads and a saved snapshot exists in IndexedDB
- **THEN** the canvas state SHALL be restored from that snapshot

#### Scenario: No saved state
- **WHEN** the application loads and no saved snapshot exists
- **THEN** the canvas SHALL start empty

### Requirement: Serialization format
The saved state SHALL be a serializable representation of the canvas element array.

#### Scenario: Serialize elements
- **WHEN** the auto-save runs
- **THEN** the current array of canvas elements SHALL be serialized to JSON and stored
