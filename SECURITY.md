# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of TikTok Clone seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities. This could put all users at risk.

### 2. Report Privately

Send an email to: **security@your-domain.com** (or create a private security advisory on GitHub)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Wait for Response

We aim to respond within 48 hours with:
- Confirmation of the issue
- Timeline for fix
- Estimated release date

### 4. Responsible Disclosure

Please give us reasonable time to fix the issue before public disclosure. We typically need:
- Critical issues: 7 days
- High severity: 30 days
- Medium/Low: 90 days

## Security Best Practices

### Environment Variables

- Never commit `.env` files
- Use strong, unique secrets in production
- Rotate secrets regularly
- Use secret management tools (AWS Secrets Manager, etc.)

### Database

- Use parameterized queries (TypeORM handles this)
- Limit database permissions
- Regular backups
- Encrypt sensitive data

### Authentication

- Use strong password requirements
- Implement rate limiting
- Use HttpOnly cookies for tokens
- Implement proper session management
- Enable 2FA (future feature)

### API Security

- Validate all input
- Use HTTPS in production
- Implement CORS properly
- Rate limit endpoints
- Use API keys for third-party integrations

### Docker Security

- Run containers as non-root user
- Scan images for vulnerabilities
- Keep base images updated
- Use specific image versions (not latest)

### Dependencies

- Regularly update dependencies
- Use `npm audit` to check vulnerabilities
- Review dependency licenses
- Use Dependabot for automated updates

## Security Checklist for Contributors

When contributing code:

- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] SQL injection protection (use ORM)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Proper error handling (don't expose internals)
- [ ] Authentication/Authorization checks
- [ ] Rate limiting considered
- [ ] Sensitive data encrypted
- [ ] Security tests added

## Known Security Measures

This project implements:

- ✅ JWT with access and refresh tokens
- ✅ HttpOnly, Secure, SameSite cookies
- ✅ bcrypt password hashing (10 rounds)
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (TypeORM)
- ✅ XSS protection (Helmet)
- ✅ CORS configuration
- ✅ Non-root Docker containers
- ✅ Environment variable secrets

## Security Updates

Security updates are released as patch versions (e.g., 1.0.1) and are documented in the CHANGELOG.md.

Subscribe to releases to get notified of security updates.

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be acknowledged (with permission) in:
- Release notes
- Security advisories
- Hall of Fame (future)

## Contact

For security concerns:
- Email: security@your-domain.com
- GitHub Security Advisory: [Create Private Advisory](https://github.com/betuanminh22032003/tiktok_nestjs/security/advisories/new)

Thank you for helping keep TikTok Clone secure! 🔒
