# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Testing Infrastructure**: Comprehensive test suite with Vitest and React Testing Library
  - 29 unit tests covering diff utilities and validation logic
  - Test coverage reporting with `npm run test:coverage`
  - Interactive test UI with `npm run test:ui`
- **Security Enhancements**:
  - PDF magic byte validation (%PDF header verification)
  - File size limits (500MB maximum) with clear error messages
  - Path traversal protection in CLI (using fs.realpathSync)
  - Symlink attack prevention
  - File type verification for CLI operations
- **Code Quality Improvements**:
  - ESLint accessibility plugin (jsx-a11y) for better a11y
  - Improved error handling with detailed error messages
  - JSDoc comments on public utility functions
  - Bundle size analyzer (rollup-plugin-visualizer)
  - Pre-commit hooks with husky and lint-staged
- **Documentation**:
  - CHANGELOG.md for tracking version history
  - Comprehensive JSDoc comments for utility functions

### Changed
- Enhanced error reporting in React callbacks to capture and log error details
- Improved accessibility with ARIA labels on file upload inputs

### Security
- Fixed: Weak file validation - now validates PDF magic bytes
- Fixed: Missing file size limits - now enforces 500MB max
- Fixed: Path traversal vulnerability in CLI - now uses real paths
- Fixed: Missing symlink protection - now resolves symlinks before processing

## [1.0.4] - Previous Release

### Features
- CLI support via `npx pdf-diff`
- Multiple view modes (side-by-side, unified, additions, removals, changes-only)
- Export to PDF functionality
- Interactive CLI mode
- HTML/PDF report generation
- Dark/Light/System theme support
- Privacy-first design with 100% client-side processing

[Unreleased]: https://github.com/jamesmontemagno/pdf-diff/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/jamesmontemagno/pdf-diff/releases/tag/v1.0.4
