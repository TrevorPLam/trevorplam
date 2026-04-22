# Security Policy

## Supported Versions

The following versions of this project are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

**Do not** open a public issue for security vulnerabilities. Instead, please use one of the following methods:

1. **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature by clicking "Security" > "Advisories" > "Report a vulnerability" in this repository.
2. **Private Email**: Send an email to the repository maintainer via GitHub's private contact form.

### What to Include

When reporting a vulnerability, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested remediation (if applicable)

### Expected Response Time

We aim to acknowledge security reports within 48 hours and provide a detailed response within 7 days. We will keep you informed of our progress throughout the remediation process.

### Disclosure Process

We follow responsible disclosure practices:

1. We will investigate the reported vulnerability
2. We will develop and test a fix
3. We will coordinate disclosure with you to determine a timeline
4. We will release the fix and publish a security advisory
5. We will credit you in the advisory (if you wish)

## Security Best Practices

This project implements several security measures:

- **Content Security Policy (CSP)**: Enabled with auto-generated script hashes
- **Security Headers**: HSTS, X-Frame-Options, COOP, CORP, Permissions-Policy
- **Dependency Scanning**: CodeQL for static analysis
- **Secret Detection**: TruffleHog in CI pipeline
- **Type Safety**: TypeScript strict mode
- **Linting**: ESLint with security rules

## Receiving Security Updates

To receive security updates for this project:

- Watch this repository on GitHub
- Subscribe to GitHub Security Advisories for this repository
- Monitor the [Security Advisories](https://github.com/trevorplam/trevorplam/security/advisories) page

## Security Policy

This project follows a responsible disclosure policy. We appreciate your help in keeping this project and its users safe.

## Additional Information

For questions about this security policy, please open a discussion in this repository.
