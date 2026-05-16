# Changelog

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
