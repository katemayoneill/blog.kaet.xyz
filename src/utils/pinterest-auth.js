// src/utils/pinterest-auth.js

class PinterestTokenManager {
    constructor() {
        this.accessToken = import.meta.env.PINTEREST_ACCESS_TOKEN;
        this.refreshToken = import.meta.env.PINTEREST_REFRESH_TOKEN;
        this.clientId = import.meta.env.PINTEREST_CLIENT_ID;
        this.clientSecret = import.meta.env.PINTEREST_CLIENT_SECRET;
        this.tokenExpiry = null;
        
        // If we have environment variables, assume token expires in 23 hours (to be safe)
        if (this.accessToken) {
            this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours from now
        }
    }

    async getValidToken() {
        // If we don't have a refresh token, just return the access token
        if (!this.refreshToken) {
            console.warn('No refresh token available, using existing access token');
            return this.accessToken;
        }

        // If token is still valid (more than 1 hour remaining), use it
        if (this.accessToken && this.tokenExpiry && (this.tokenExpiry - Date.now()) > (60 * 60 * 1000)) {
            return this.accessToken;
        }

        // Try to refresh the token
        console.log('Token expired or expiring soon, attempting refresh...');
        return await this.refreshAccessToken();
    }

    async refreshAccessToken() {
        if (!this.refreshToken || !this.clientId || !this.clientSecret) {
            console.error('Missing required credentials for token refresh');
            return this.accessToken; // Return old token as fallback
        }

        try {
            console.log('Refreshing Pinterest access token...');
            
            // Use basic auth (same method that works for initial token exchange)
            const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            
            const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: this.refreshToken,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            // Update tokens
            this.accessToken = data.access_token;
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
            }
            
            // Set expiry (use what Pinterest returns, or default to 24 hours)
            const expiresIn = data.expires_in || (24 * 60 * 60); // Default 24 hours
            this.tokenExpiry = Date.now() + (expiresIn * 1000);
            
            console.log('✅ Pinterest token refreshed successfully');
            console.log(`New token expires in ${Math.round(expiresIn / 3600)} hours`);
            
            return this.accessToken;

        } catch (error) {
            console.error('❌ Failed to refresh Pinterest token:', error.message);
            console.log('Falling back to existing access token');
            return this.accessToken; // Return old token as fallback
        }
    }

    // Method to test if current token works
    async testToken(token = null) {
        const testToken = token || this.accessToken;
        if (!testToken) return false;

        try {
            const response = await fetch('https://api.pinterest.com/v5/user_account', {
                headers: {
                    'Authorization': `Bearer ${testToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const pinterestAuth = new PinterestTokenManager();