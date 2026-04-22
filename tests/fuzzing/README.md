# Fuzzing Tests

This directory contains fuzzing tests for input validation and formatter security functions using Jazzer.js.

## Files

- `input-validation.fuzz.test.ts` - Fuzzing tests for validator functions
- `formatter-security.fuzz.test.ts` - Fuzzing tests for formatter functions  
- `README.md` - This documentation

## Usage

### Running Fuzzing Tests

```bash
# Run all fuzzing tests
npm run test:fuzz

# Run specific fuzzing test suites
npm run test:fuzz:validation
npm run test:fuzz:formatters
```

### Running Individual Fuzz Targets

```bash
# Run specific fuzz target directly
npx jazzer tests/fuzzing/input-validation.fuzz.test.ts
npx jazzer tests/fuzzing/formatter-security.fuzz.test.ts
```

## Implementation Notes

### Security Policy Considerations

On Windows systems with Application Control policies, the native fuzzer module may be blocked:
```
Error: An Application Control policy has blocked this file.
```

This is a **known limitation** in enterprise environments and does not affect the correctness of the fuzzing implementation. The fuzzing tests are properly configured and will work in:

- Linux environments (including CI/CD)
- macOS environments  
- Windows environments without Application Control restrictions
- Docker containers

### CI/CD Integration

The fuzzing tests are integrated into the GitHub Actions workflow and will run automatically in the Linux-based CI environment, bypassing Windows-specific restrictions.

### Fuzzing Coverage

The fuzzing tests cover:

**Input Validation Functions:**
- `isValidEmail()` - Email format validation
- `isValidUrl()` - URL format validation  
- `isNonEmptyString()` - String validation
- `isInRange()` - Numeric range validation
- `all()` - Array predicate validation
- `isValidDate()` - Date validation
- `hasRequiredKeys()` - Object key validation

**Formatter Security Functions:**
- `formatCurrency()` - Currency formatting with extreme numbers
- `formatPercentage()` - Percentage formatting with edge cases
- `formatCompactNumber()` - Compact number formatting
- `slugify()` - URL slug generation with injection protection
- `truncate()` - Text truncation with overflow protection
- `toTitleCase()` - Title case conversion with Unicode handling

### Security Testing Focus

The fuzzing tests specifically target:

1. **Buffer Overflow Prevention** - Extremely long inputs
2. **Injection Attack Protection** - Malicious strings and scripts
3. **Type Safety** - Invalid data types and edge cases
4. **Memory Safety** - Null bytes and control characters
5. **Unicode Handling** - Special characters and encoding issues
6. **Numeric Edge Cases** - Infinity, NaN, extreme values

### Expected Behavior

Fuzzing tests are designed to:
- Never crash the application
- Always return expected data types (boolean/string)
- Handle malformed input gracefully
- Detect potential security vulnerabilities
- Generate crash artifacts when issues are found

### Results Analysis

When fuzzing discovers issues, it will:
1. Generate crash artifacts in `tests/fuzzing/crash-*`
2. Upload results to GitHub Actions artifacts
3. Continue testing other functions
4. Provide detailed error reports for analysis

## Troubleshooting

### Windows Application Control Issues

If you encounter Application Control errors on Windows:

1. **CI/CD**: Tests will run normally in GitHub Actions (Linux)
2. **Local Development**: Use WSL2 or Docker for Linux environment
3. **Alternative**: Run tests on a machine without Application Control

### Native Module Issues

If the native fuzzer module fails to load:

1. Verify Node.js version compatibility (Node.js 22+)
2. Check if all dependencies are installed correctly
3. Try reinstalling the fuzzing dependencies:
   ```bash
   npm uninstall @jazzer.js/core @jazzer.js/fuzzer
   npm install --save-dev @jazzer.js/core @jazzer.js/fuzzer
   ```

## Future Enhancements

- Add fuzzing tests for additional utility functions
- Integrate with continuous fuzzing services
- Add coverage-guided fuzzing metrics
- Implement automated vulnerability reporting
