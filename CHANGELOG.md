# Changelog

## [0.1.4] - 2025-01-16

### Parameter Validation Enhancement

- **ParameterValidator Class**: Comprehensive parameter validation engine
  - Range validation for numeric values (min/max)
  - Pattern validation using regular expressions
  - Enum validation for allowed value sets
  - Custom validation rules support
  - Pre-configured validation for common AUTOSAR parameters:
    - MCU clock frequency (1-1000 MHz)
    - CAN baudrate (125000, 250000, 500000, 1000000)
    - PWM frequency (0.1-10000 Hz)
    - ADC resolution (8, 10, 12 bits)
    - OS task priority (0-255)
    - OS stack size (64-65536 bytes)

### Configuration Comparison

- **ConfigComparer Class**: Deep configuration diff engine
  - Compare two complete configurations
  - Detect added, removed, and modified parameters
  - Export comparison results to Markdown or JSON
  - Visual diff display with color coding
  - **ConfigCompareDialog Component**: UI for selecting and comparing configs

### Bulk Operations

- **BulkOperationsPanel Component**: Batch module management
  - Select multiple modules with checkboxes
  - Filter by layer and status
  - Search modules by name
  - Bulk enable/disable operations
  - Visual selection summary

### Mobile Responsiveness

- **useMediaQuery Hook**: React to viewport changes
- **MobileNav Component**: Bottom navigation bar for mobile devices
- **MobileDrawer Component**: Slide-out drawer for mobile navigation
- Touch-friendly UI elements
- Safe area insets support for notched devices

---

## [0.1.3] - 2025-01-16

### Internationalization (i18n)

- **Multi-language Support**: Full i18n implementation with react-i18next
- **Chinese Translation**: Complete Chinese (zh) translation for all UI elements
- **Language Toggle**: Quick language switcher in header (EN/中)
- **Auto-detection**: Automatic language detection from browser settings

### Performance Optimization

- **VirtualList Component**: Efficient rendering of large lists with virtualization
- **ConfigTreeVirtual**: Virtualized tree component for large configurations
- **Lazy Loading**: On-demand rendering of off-screen items
- **Improved Scrolling**: Smooth scrolling with 60fps performance

### Configuration Migration Tool

- **Migration Page**: New /migrate page for importing from other tools
- **Vector DaVinci**: Support for importing .xdm and .arxml files
- **ETAS ISOLAR**: Support for ISOLAR-A/B configurations
- **Elektrobit Tresos**: Support for EB Tresos .xdm files
- **Generic AUTOSAR**: Support for standard ARXML files
- **Drag & Drop**: Easy file upload with drag and drop
- **Migration Report**: Detailed import results and warnings

---

## [0.1.2] - 2025-01-16

### Theme Support

- **Dark Mode**: Full dark mode support with CSS variables
- **Theme Provider**: ThemeProvider component with system preference detection
- **Theme Toggle**: Quick toggle button in header with Ctrl+D shortcut

### Global Search

- **Search Modal**: Global search across all configuration items
- **Search Results**: Search modules, containers, parameters, OS entities
- **Keyboard Navigation**: Arrow keys to navigate, Enter to select
- **Shortcut**: Ctrl+K to open search

### Keyboard Shortcuts

- **Ctrl+K**: Open global search
- **Ctrl+S**: Save configuration
- **Ctrl+D**: Toggle dark/light theme
- **Ctrl+/**: Show keyboard shortcuts help

---

## [0.1.1] - 2025-01-16

### OS Configuration Editor

#### New Features
- **OSEditor Component**: Full-featured OS configuration editor
  - Tasks management: Add, edit, delete tasks with priority, schedule, stack size
  - Events management: Configure event masks for task synchronization
  - Alarms management: Create periodic alarms with actions (Activate Task, Set Event)
  - Resources management: Define resources for mutual exclusion
  - Counters management: Configure system counters with tick rates
  - ISRs management: Setup interrupt service routines with priorities
  - General settings: Scalability class, hooks configuration, status level

#### Technical Improvements
- Added `updateOS` action to configStore for OS configuration updates
- Integrated OS editor into Editor page with tab-based interface
- Real-time validation of OS configuration changes

---

## [0.1.0] - 2025-01-16

### Initial Release

#### Core Configuration System
- **Hierarchical Configuration**: Layered architecture supporting MCAL, ECUAL, Service, RTE, OS, and ASW layers
- **Module Tree**: Collapsible tree view for navigating configuration hierarchy
- **Configuration Wizard**: Step-by-step wizard for configuring 9 preset modules (MCU, CAN, NVM, COM, GPT, PWM, ADC, Port, DIO)
- **Validation Engine**: Dependency validation and configuration consistency checking

#### Configuration Status Management
- **Status Tracking**: Four-state configuration status (unconfigured/configuring/configured/partial)
- **Progress Panel**: Visual progress indicators with per-layer statistics
- **Alert System**: Warnings for unconfigured modules
- **Report Export**: Markdown format configuration reports

#### Import/Export Support
- **yuleASR Import**: Import configurations from yuleASR JSON format
- **ARXML Import**: Import AutoSAR ECUC module configurations from ARXML files
- **yuleASR Export**: Export configurations to yuleASR format

#### User Interface
- **Dashboard**: Configuration management with overview statistics
- **Editor**: Full-featured configuration editor with hierarchical tree
- **Templates**: Preset configuration templates for quick starts
- **Git Sync**: Version control integration interface
- **Settings**: User preferences and system configuration
- **Dependency Graph**: Visual module relationship visualization

#### Technical Features
- React + TypeScript + Vite stack
- Zustand state management
- Tailwind CSS styling
- GitHub Pages deployment
- Responsive design

### Modules Supported

#### MCAL (Microcontroller Drivers)
- MCU - Microcontroller Unit configuration
- Port - Port pin configuration
- DIO - Digital Input/Output
- GPT - General Purpose Timer
- PWM - Pulse Width Modulation
- ADC - Analog to Digital Converter

#### ECUAL (ECU Abstraction Layer)
- CAN - CAN communication
- Ethernet - Ethernet stack

#### Service Layer
- NVM - Non-volatile memory
- COM - Communication stack
- DCM - Diagnostic communication
- CAN TP - CAN transport protocol

#### OS
- OSEK/AUTOSAR OS configuration
- Tasks, Events, Alarms, Resources, Counters, ISRs

---

## Version History

- v0.1.0 (2025-01-16) - Initial release with core configuration features
