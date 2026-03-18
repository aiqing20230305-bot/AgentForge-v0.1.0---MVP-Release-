# Plugin Submission Guide

## Overview

This guide walks you through the process of submitting your plugin to the AgentForge Marketplace. Following these guidelines ensures a smooth review process and faster approval.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Submission Checklist](#submission-checklist)
- [Submission Process](#submission-process)
- [Review Process](#review-process)
- [Publication](#publication)
- [Updates & Maintenance](#updates--maintenance)
- [Rejection & Appeals](#rejection--appeals)

## Prerequisites

### Before You Submit

Ensure you have:

1. **Completed Plugin Development**
   - Plugin is fully functional
   - All features tested
   - Documentation complete
   - No known critical bugs

2. **AgentForge Account**
   - Registered developer account
   - Email verified
   - Profile completed

3. **Required Files**
   - `manifest.json` with complete metadata
   - Built plugin bundle
   - README.md with usage instructions
   - LICENSE file
   - CHANGELOG.md (for updates)

4. **Testing**
   - Unit tests passing
   - Integration tests complete
   - Manual testing done
   - Performance benchmarks acceptable

5. **Documentation**
   - Installation instructions
   - Configuration guide
   - API documentation
   - Usage examples
   - Screenshots/videos

## Submission Checklist

### Technical Requirements

- [ ] Plugin ID follows naming convention (lowercase, alphanumeric, hyphens)
- [ ] Semantic versioning (e.g., 1.0.0)
- [ ] Compatible with AgentForge 1.4.0+
- [ ] Bundle size < 10MB
- [ ] No hardcoded credentials
- [ ] All external dependencies declared
- [ ] Proper error handling
- [ ] No console errors/warnings

### Quality Requirements

- [ ] Code follows TypeScript/JavaScript best practices
- [ ] No security vulnerabilities
- [ ] Proper permission requests
- [ ] Graceful degradation
- [ ] Responsive UI (if applicable)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Internationalization support (optional but recommended)

### Documentation Requirements

- [ ] Clear plugin description
- [ ] Installation instructions
- [ ] Configuration guide
- [ ] Usage examples
- [ ] API documentation (if exposing APIs)
- [ ] Screenshots (at least 2)
- [ ] Demo video (recommended)
- [ ] Support contact information

### Legal Requirements

- [ ] Valid open-source license (MIT, Apache 2.0, GPL, etc.)
- [ ] No copyright violations
- [ ] No trademark infringement
- [ ] Privacy policy (if collecting data)
- [ ] Terms of service (if applicable)

## Submission Process

### Step 1: Prepare Your Plugin

#### 1.1 Build Production Bundle

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Verify build
npm run verify
```

#### 1.2 Create Package

```bash
# Generate plugin package
npm run package

# Output: dist/my-plugin-1.0.0.zip
```

#### 1.3 Validate Package

```bash
# Validate manifest
agentforge-plugin validate

# Check bundle size
ls -lh dist/my-plugin-1.0.0.zip

# Test installation locally
agentforge-plugin test-install dist/my-plugin-1.0.0.zip
```

### Step 2: Prepare Documentation

#### 2.1 Update README.md

```markdown
# My Awesome Plugin

Brief description of what your plugin does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

Install from AgentForge Marketplace or:

\`\`\`bash
agentforge plugin install my-plugin
\`\`\`

## Configuration

\`\`\`json
{
  "apiKey": "your-api-key",
  "enabled": true
}
\`\`\`

## Usage

### Basic Usage

\`\`\`typescript
// Example code
\`\`\`

### Advanced Usage

\`\`\`typescript
// Advanced example
\`\`\`

## Support

- Email: support@example.com
- GitHub: https://github.com/user/plugin
- Discord: https://discord.gg/...

## License

MIT
```

#### 2.2 Create CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - 2026-03-17

### Added
- Initial release
- Feature A
- Feature B

### Fixed
- Bug fix 1

### Changed
- Improvement 1
```

#### 2.3 Add Screenshots

Prepare at least 2 high-quality screenshots:
- Screenshot 1: Main interface
- Screenshot 2: Configuration panel
- Screenshot 3: Key feature in action (optional)

Requirements:
- Format: PNG or JPG
- Size: 1280x720 or 1920x1080
- Max file size: 2MB each
- No watermarks

### Step 3: Submit Plugin

#### 3.1 Via CLI (Recommended)

```bash
# Login to AgentForge
agentforge-plugin login

# Submit plugin
agentforge-plugin submit

# Follow interactive prompts
? Plugin package: dist/my-plugin-1.0.0.zip
? Category: integration
? Screenshots: screenshots/1.png, screenshots/2.png
? Demo video URL: https://youtube.com/watch?v=...
? Support email: support@example.com
? Submit for review? Yes

✓ Plugin submitted successfully!
✓ Submission ID: sub_abc123
✓ Track status: https://marketplace.agentforge.dev/submissions/sub_abc123
```

#### 3.2 Via Web Dashboard

1. Go to https://marketplace.agentforge.dev/submit
2. Fill in plugin details:
   - Upload plugin package (.zip)
   - Enter plugin metadata
   - Select category
   - Add screenshots
   - Add demo video URL (optional)
   - Enter support contact
3. Review submission
4. Click "Submit for Review"

### Step 4: Wait for Review

You'll receive email notifications at each stage:
1. **Submission Received** (immediate)
2. **Under Review** (1-3 days)
3. **Approved/Rejected** (3-7 days)

Track status in your dashboard:
https://marketplace.agentforge.dev/dashboard/submissions

## Review Process

### Review Timeline

| Stage | Duration | Description |
|-------|----------|-------------|
| Automated Checks | 5 minutes | Manifest validation, security scan |
| Security Review | 1-2 days | Manual security audit |
| Code Review | 1-2 days | Code quality check |
| Functional Testing | 1-2 days | Feature testing |
| Final Approval | 1 day | Admin approval |

**Total**: 3-7 business days

### What We Review

#### 1. Automated Checks
- Manifest validation
- Dependency security scan
- Bundle size check
- License verification
- Malware scan

#### 2. Security Review
- Permission usage justification
- Data handling practices
- API security
- Code injection vulnerabilities
- XSS/CSRF protection

#### 3. Code Review
- Code quality
- Best practices
- Error handling
- Performance
- Documentation

#### 4. Functional Testing
- Feature completeness
- User experience
- Edge cases
- Error scenarios
- Compatibility

### Review Criteria

Your plugin is evaluated on:

1. **Functionality** (30%)
   - Works as described
   - No critical bugs
   - Good user experience

2. **Security** (30%)
   - No vulnerabilities
   - Proper permission usage
   - Secure data handling

3. **Code Quality** (20%)
   - Clean, maintainable code
   - Proper error handling
   - Performance optimized

4. **Documentation** (20%)
   - Clear instructions
   - Complete API docs
   - Good examples

**Minimum Score**: 70/100 to approve

## Publication

### After Approval

Once approved, you'll receive:
1. Approval email
2. Plugin URL: `https://marketplace.agentforge.dev/plugins/my-plugin`
3. Installation instructions
4. Marketing assets (badge, share links)

### Going Live

Your plugin will be:
- Published to marketplace
- Searchable by users
- Installable via CLI/UI
- Listed in category
- Featured (if selected)

### Promotion

We'll help promote your plugin:
- Blog post (featured plugins)
- Social media mention
- Newsletter inclusion
- Community spotlight

### Marketing Assets

```markdown
<!-- Badge -->
![AgentForge Plugin](https://img.shields.io/badge/AgentForge-Plugin-blue)

<!-- Install button -->
[Install Plugin](https://marketplace.agentforge.dev/install/my-plugin)

<!-- Share links -->
Twitter: Share your plugin on Twitter
Discord: Announce in community
Dev.to: Write a tutorial
```

## Updates & Maintenance

### Publishing Updates

#### 1. Version Update

```bash
# Update version in manifest.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

#### 2. Update CHANGELOG.md

```markdown
## [1.1.0] - 2026-04-01

### Added
- New feature X
- New feature Y

### Fixed
- Bug fix A
- Bug fix B

### Changed
- Improved performance
```

#### 3. Submit Update

```bash
# Build and submit
npm run build
agentforge-plugin publish

# Or use version flag
agentforge-plugin publish --version 1.1.0
```

### Update Review

- **Patch updates** (bug fixes): Expedited review (1-2 days)
- **Minor updates** (new features): Standard review (3-5 days)
- **Major updates** (breaking changes): Full review (5-7 days)

### Deprecation

To deprecate your plugin:

```bash
agentforge-plugin deprecate my-plugin \
  --reason "Replaced by new-plugin" \
  --redirect new-plugin
```

Users will be notified and redirected to the new plugin.

## Rejection & Appeals

### Common Rejection Reasons

1. **Security Issues**
   - Vulnerabilities found
   - Unsafe permission usage
   - Data leakage

2. **Quality Issues**
   - Critical bugs
   - Poor user experience
   - Incomplete features

3. **Documentation Issues**
   - Missing instructions
   - Unclear documentation
   - No examples

4. **Policy Violations**
   - Spam/malware
   - Copyright infringement
   - Misleading claims

### After Rejection

You'll receive:
1. Rejection email with reasons
2. Detailed feedback
3. Improvement suggestions
4. Re-submission instructions

### Re-submission

1. **Fix Issues**
   - Address all feedback
   - Test thoroughly
   - Update documentation

2. **Re-submit**
   ```bash
   agentforge-plugin submit --resubmit sub_abc123
   ```

3. **Expedited Review**
   - Re-submissions are prioritized
   - Reviewed within 2-3 days

### Appeal Process

If you disagree with rejection:

1. **Email Appeal**
   - Send to: appeals@agentforge.dev
   - Include: Submission ID, reasoning
   - Provide: Evidence, clarifications

2. **Review Committee**
   - Independent review
   - Response within 5 days

3. **Final Decision**
   - Committee decision is final
   - Option to re-submit with changes

## Best Practices

### Do's

✅ Test thoroughly before submission
✅ Write clear documentation
✅ Respond promptly to review feedback
✅ Keep plugin updated
✅ Engage with users
✅ Follow community guidelines
✅ Use semantic versioning
✅ Provide good support

### Don'ts

❌ Submit untested plugins
❌ Hide functionality
❌ Request unnecessary permissions
❌ Copy existing plugins
❌ Spam with updates
❌ Ignore user feedback
❌ Make breaking changes without major version bump

## Support

### Submission Support

- Email: submissions@agentforge.dev
- Discord: #plugin-submissions
- Forum: https://community.agentforge.dev/c/plugins

### Developer Resources

- Documentation: https://docs.agentforge.dev/plugins
- Examples: https://github.com/agentforge/plugin-examples
- CLI Tool: https://github.com/agentforge/plugin-cli
- Developer Forum: https://community.agentforge.dev/c/dev

## FAQ

### Q: How long does review take?
A: 3-7 business days for new submissions, 1-3 days for updates.

### Q: Can I submit closed-source plugins?
A: Yes, but open-source plugins are preferred and get priority.

### Q: Is there a submission fee?
A: No, submission is free. We only take a revenue share for paid plugins (20%).

### Q: Can I update my plugin after approval?
A: Yes, you can publish updates anytime. Updates go through expedited review.

### Q: What happens if my plugin is rejected?
A: You'll get detailed feedback and can re-submit after fixing issues.

### Q: Can I submit multiple plugins?
A: Yes, there's no limit on the number of plugins you can submit.

### Q: How do I monetize my plugin?
A: You can set a price or use freemium model. We handle payments and take 20% fee.

### Q: Can I transfer plugin ownership?
A: Yes, contact support@agentforge.dev for ownership transfer.

---

**Good luck with your submission! 🚀**

We're excited to see what you build!

For questions, reach out:
- Email: plugins@agentforge.dev
- Discord: https://discord.gg/agentforge
- Forum: https://community.agentforge.dev
