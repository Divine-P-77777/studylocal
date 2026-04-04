import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Fix: The Auth0 server-side client should ONLY be instantiated on the server
export const auth0 = (typeof window === 'undefined') 
    ? new Auth0Client({
        domain: process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '').replace('/', ''),
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        secret: process.env.AUTH0_SECRET,
        appBaseUrl: process.env.AUTH0_BASE_URL || process.env.APP_BASE_URL || 'http://localhost:3000'
    })
    : null as unknown as Auth0Client;
