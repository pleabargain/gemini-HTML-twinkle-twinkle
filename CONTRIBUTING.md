# Contributing to the Responsive Animated Piano Keyboard

Thank you for your interest in contributing to the Responsive Animated Piano Keyboard project! This document provides guidelines and instructions for contributing to the project.

## Development Workflow

### Important: Always Create a Development Branch

**Before making any changes to production code, always create a development branch.**

```bash
# First, ensure you're on the main branch and it's up to date
git checkout main
git pull origin main

# Create a new development branch with a descriptive name
git checkout -b dev-feature-name
```

This practice helps maintain a stable main branch and allows for proper code review before changes are merged into production.

### Workflow Steps

1. **Create a Development Branch**: As mentioned above, always create a development branch before making changes.
2. **Make Your Changes**: Implement your feature or fix on the development branch.
3. **Test Your Changes**: Ensure your changes work as expected and don't introduce new issues.
4. **Commit Your Changes**: Use clear, descriptive commit messages.
5. **Push Your Branch**: Push your development branch to the remote repository.
6. **Create a Pull Request**: Submit a pull request to merge your changes into the main branch.
7. **Code Review**: Wait for code review and address any feedback.
8. **Merge**: Once approved, your changes will be merged into the main branch.

## Coding Standards

- Follow the existing code style and organization.
- Use descriptive variable and function names.
- Group related functions into logical sections with clear comments.
- Maintain separation of concerns between UI, audio, and MIDI handling.
- Implement proper error handling with clear user feedback.
- Optimize performance by minimizing DOM operations during playback and cleaning up audio nodes.

## Testing

- Test your changes in multiple browsers (Chrome/Edge recommended for full Web MIDI support).
- Test on different screen sizes to ensure responsive design.
- Test with and without MIDI devices if your changes affect MIDI functionality.
- Verify that audio playback works correctly if your changes affect sound generation.

## Documentation

- Update documentation to reflect your changes.
- Add comments to explain complex code sections.
- Update the README.md file if necessary.

## Pull Request Process

1. Ensure your code follows the coding standards.
2. Update documentation as necessary.
3. The pull request will be reviewed by project maintainers.
4. Address any feedback or requested changes.
5. Once approved, your pull request will be merged into the main branch.

## Questions?

If you have any questions or need help with the contribution process, please open an issue in the repository.

Thank you for contributing to the Responsive Animated Piano Keyboard project!
