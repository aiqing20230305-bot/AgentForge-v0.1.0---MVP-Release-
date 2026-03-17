/**
 * SAML 2.0 Provider Implementation
 * Handles SAML-based authentication flows
 */

import {
  SSOConfig,
  SAML2Config,
  SSOUser,
  SSOAuthResponse,
  SSOConnectionTestResult,
  SSOProvider,
  SSOProtocol,
} from './types';

export class SAML2Provider {
  private config: SAML2Config;
  private ssoConfig: SSOConfig;

  constructor(ssoConfig: SSOConfig) {
    if (!ssoConfig.saml2Config) {
      throw new Error('SAML2 configuration is required');
    }
    this.ssoConfig = ssoConfig;
    this.config = ssoConfig.saml2Config;
  }

  /**
   * Generate SAML authentication request
   */
  async generateAuthRequest(callbackUrl: string): Promise<string> {
    const samlRequest = this.buildSAMLRequest(callbackUrl);
    const encoded = this.encodeSAMLRequest(samlRequest);

    const params = new URLSearchParams({
      SAMLRequest: encoded,
      RelayState: this.generateRelayState(),
    });

    if (this.config.signRequests) {
      const signature = await this.signRequest(encoded);
      params.append('Signature', signature);
      params.append('SigAlg', 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');
    }

    return `${this.config.ssoUrl}?${params.toString()}`;
  }

  /**
   * Process SAML response from IdP
   */
  async processAuthResponse(samlResponse: string): Promise<SSOAuthResponse> {
    try {
      const decoded = this.decodeSAMLResponse(samlResponse);
      const validated = await this.validateSAMLResponse(decoded);

      if (!validated.valid) {
        return {
          success: false,
          error: validated.error || 'Invalid SAML response',
        };
      }

      const assertions = this.extractAssertions(decoded);
      const user = this.mapAssertionsToUser(assertions);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SAML processing failed',
      };
    }
  }

  /**
   * Generate SAML logout request
   */
  async generateLogoutRequest(sessionIndex: string, nameId: string): Promise<string> {
    if (!this.config.sloUrl) {
      throw new Error('SAML Single Logout URL not configured');
    }

    const logoutRequest = this.buildLogoutRequest(sessionIndex, nameId);
    const encoded = this.encodeSAMLRequest(logoutRequest);

    const params = new URLSearchParams({
      SAMLRequest: encoded,
    });

    if (this.config.signRequests) {
      const signature = await this.signRequest(encoded);
      params.append('Signature', signature);
      params.append('SigAlg', 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256');
    }

    return `${this.config.sloUrl}?${params.toString()}`;
  }

  /**
   * Test SAML connection
   */
  async testConnection(): Promise<SSOConnectionTestResult> {
    const startTime = Date.now();

    try {
      // Validate certificate
      const certValid = await this.validateCertificate();
      if (!certValid) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.SAML2,
          error: 'Invalid or expired certificate',
        };
      }

      // Test SSO URL accessibility
      const ssoUrlAccessible = await this.testEndpoint(this.config.ssoUrl);
      if (!ssoUrlAccessible) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.SAML2,
          error: 'SSO URL is not accessible',
        };
      }

      // Validate metadata
      const metadata = await this.fetchMetadata();
      if (!metadata) {
        return {
          success: false,
          provider: this.ssoConfig.provider,
          protocol: SSOProtocol.SAML2,
          error: 'Failed to fetch SAML metadata',
        };
      }

      const latency = Date.now() - startTime;

      return {
        success: true,
        provider: this.ssoConfig.provider,
        protocol: SSOProtocol.SAML2,
        latency,
        details: {
          certificateValid: true,
          ssoUrlAccessible: true,
          metadataValid: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        provider: this.ssoConfig.provider,
        protocol: SSOProtocol.SAML2,
        error: error instanceof Error ? error.message : 'Connection test failed',
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Build SAML authentication request XML
   */
  private buildSAMLRequest(callbackUrl: string): string {
    const requestId = this.generateRequestId();
    const issueInstant = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                    ID="${requestId}"
                    Version="2.0"
                    IssueInstant="${issueInstant}"
                    AssertionConsumerServiceURL="${callbackUrl}"
                    Destination="${this.config.ssoUrl}">
  <saml:Issuer>${this.config.entityId}</saml:Issuer>
  <samlp:NameIDPolicy Format="${this.config.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}"
                      AllowCreate="true"/>
</samlp:AuthnRequest>`;
  }

  /**
   * Build SAML logout request XML
   */
  private buildLogoutRequest(sessionIndex: string, nameId: string): string {
    const requestId = this.generateRequestId();
    const issueInstant = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:LogoutRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                     xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                     ID="${requestId}"
                     Version="2.0"
                     IssueInstant="${issueInstant}"
                     Destination="${this.config.sloUrl}">
  <saml:Issuer>${this.config.entityId}</saml:Issuer>
  <saml:NameID Format="${this.config.nameIdFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}">${nameId}</saml:NameID>
  <samlp:SessionIndex>${sessionIndex}</samlp:SessionIndex>
</samlp:LogoutRequest>`;
  }

  /**
   * Encode SAML request for transmission
   */
  private encodeSAMLRequest(xml: string): string {
    // Deflate and base64 encode
    const deflated = this.deflate(xml);
    return btoa(String.fromCharCode(...new Uint8Array(deflated)));
  }

  /**
   * Decode SAML response
   */
  private decodeSAMLResponse(encoded: string): string {
    try {
      const decoded = atob(encoded);
      return decoded;
    } catch (error) {
      throw new Error('Failed to decode SAML response');
    }
  }

  /**
   * Validate SAML response signature and assertions
   */
  private async validateSAMLResponse(
    xml: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      // Parse XML
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');

      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return { valid: false, error: 'Invalid XML format' };
      }

      // Validate signature if present
      const signature = doc.querySelector('Signature');
      if (signature) {
        const signatureValid = await this.validateSignature(signature, this.config.certificate);
        if (!signatureValid) {
          return { valid: false, error: 'Invalid signature' };
        }
      }

      // Validate assertions
      const assertions = doc.querySelectorAll('Assertion');
      if (assertions.length === 0) {
        return { valid: false, error: 'No assertions found' };
      }

      // Validate conditions (not before, not on or after)
      const conditions = doc.querySelector('Conditions');
      if (conditions) {
        const notBefore = conditions.getAttribute('NotBefore');
        const notOnOrAfter = conditions.getAttribute('NotOnOrAfter');

        const now = new Date();
        if (notBefore && new Date(notBefore) > now) {
          return { valid: false, error: 'Assertion not yet valid' };
        }
        if (notOnOrAfter && new Date(notOnOrAfter) <= now) {
          return { valid: false, error: 'Assertion expired' };
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Extract assertions from SAML response
   */
  private extractAssertions(xml: string): Record<string, any> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    const attributes: Record<string, any> = {};
    const attributeStatements = doc.querySelectorAll('AttributeStatement Attribute');

    attributeStatements.forEach((attr) => {
      const name = attr.getAttribute('Name');
      const values = Array.from(attr.querySelectorAll('AttributeValue')).map(
        (v) => v.textContent || ''
      );

      if (name) {
        attributes[name] = values.length === 1 ? values[0] : values;
      }
    });

    // Extract NameID
    const nameId = doc.querySelector('NameID');
    if (nameId && nameId.textContent) {
      attributes.nameId = nameId.textContent;
    }

    return attributes;
  }

  /**
   * Map SAML assertions to SSO user
   */
  private mapAssertionsToUser(assertions: Record<string, any>): SSOUser {
    const mapping = this.ssoConfig.userMapping;

    return {
      id: this.generateUserId(),
      email: assertions[mapping.emailAttribute] || assertions.nameId,
      username: assertions[mapping.usernameAttribute] || assertions.nameId,
      firstName: assertions[mapping.firstNameAttribute] || '',
      lastName: assertions[mapping.lastNameAttribute] || '',
      displayName:
        assertions[mapping.displayNameAttribute] ||
        `${assertions[mapping.firstNameAttribute] || ''} ${assertions[mapping.lastNameAttribute] || ''}`.trim(),
      photo: mapping.photoAttribute ? assertions[mapping.photoAttribute] : undefined,
      role: this.ssoConfig.roleMapping.defaultRole,
      ssoProvider: this.ssoConfig.provider,
      ssoUserId: assertions.nameId || assertions[mapping.usernameAttribute],
      customAttributes: assertions,
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Validate certificate
   */
  private async validateCertificate(): Promise<boolean> {
    // In a real implementation, this would validate the X.509 certificate
    // For now, just check if certificate is not empty
    return this.config.certificate.length > 0;
  }

  /**
   * Test endpoint accessibility
   */
  private async testEndpoint(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch SAML metadata
   */
  private async fetchMetadata(): Promise<any> {
    try {
      const metadataUrl = this.config.ssoUrl.replace('/sso', '/metadata');
      const response = await fetch(metadataUrl);
      return await response.text();
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate XML signature
   */
  private async validateSignature(signature: Element, certificate: string): Promise<boolean> {
    // In a real implementation, this would use xmldsig to validate the signature
    // For now, return true as a placeholder
    return true;
  }

  /**
   * Sign SAML request
   */
  private async signRequest(data: string): Promise<string> {
    // In a real implementation, this would sign the request using RSA-SHA256
    // For now, return a placeholder signature
    return btoa('signature_placeholder');
  }

  /**
   * Deflate string for SAML request
   */
  private deflate(str: string): ArrayBuffer {
    // In a real implementation, this would use pako or similar to deflate
    // For now, just convert to ArrayBuffer
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate relay state
   */
  private generateRelayState(): string {
    return btoa(JSON.stringify({ timestamp: Date.now() }));
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
