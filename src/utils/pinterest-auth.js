// src/utils/pinterest-auth.js

class PinterestTokenManager {
    constructor() {
        this.accessToken = import.meta.env.PINTEREST_ACCESS_TOKEN;
        this.refreshToken = import.meta.env.PINTEREST_REFRESH_TOKEN;
        this.clientId = import.meta.env.PINTEREST_CLIENT_ID;
        this.clientSecret = import.meta.env.PINTEREST_CLIENT_SECRET;
        
        // Calculate approximate expiry (assume tokens are fresh when deployed)
        // In production, you'd track this more precisely
        this.tokenExpiry = null;
        
        // If we have environment variables, assume token expires in 25 days (to be safe)
        if (this.accessToken) {
            this.tokenExpiry = Date.now() + (25 * 24 * 60 * 60 * 1000); // 25 days from now
        }
    }

    async getValidToken() {
        // If we don't have a refresh token, just return the access token
        if (!this.refreshToken) {
            console.warn('No refresh token available, using existing access token');
            return this.accessToken;
        }

        // For Amplify: Don't try to refresh automatically since we can't update env vars
        // Just return the current token and log warnings if it might be expiring
        if (this.tokenExpiry && (this.tokenExpiry - Date.now()) < (7 * 24 * 60 * 60 * 1000)) {
            console.warn('Pinterest token may be expiring soon. GitHub Actions should refresh it automatically.');
        }

        return this.accessToken;
    }

    // This method is now mainly for local development and testing
    async refreshAccessToken() {
        if (!this.refreshToken || !this.clientId || !this.clientSecret) {
            console.error('Missing required credentials for token refresh');
            return this.accessToken;
        }

        try {
            console.log('Refreshing Pinterest access token...');
            
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
            
            // In Amplify, we can't update environment variables automatically
            // So just update in-memory values for this session
            this.accessToken = data.access_token;
            if (data.refresh_token) {
                this.refreshToken = data.refresh_token;
            }
            
            const expiresIn = data.expires_in || (24 * 60 * 60);
            this.tokenExpiry = Date.now() + (expiresIn * 1000);
            
            console.log('✅ Pinterest token refreshed successfully (in-memory only)');
            console.log('⚠️  Remember to update Amplify environment variables with new tokens');
            
            return this.accessToken;

        } catch (error) {
            console.error('❌ Failed to refresh Pinterest token:', error.message);
            return this.accessToken;
        }
    }

    // Method to test if current token works
    async testToken(token = null) {
        const testToken = token || this.accessToken;
        if (!testToken) return false;

        try {
            const response = await fetch('https://api.pinterest.com/v5/boards?page_size=1', {
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