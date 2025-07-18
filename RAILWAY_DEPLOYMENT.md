# Railway Frontend Deployment Guide

## Prerequisites

Before deploying to Railway, ensure you have the following environment variables configured in your Railway project:

### Required Environment Variables

```bash
# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-railway-url.railway.app

# Stripe Configuration (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Deployment Steps

1. **Connect your repository to Railway**
   - Go to Railway dashboard
   - Create a new project
   - Connect your GitHub repository
   - Select the `frontend` directory as the source

2. **Configure Environment Variables**
   - Add all required environment variables in Railway dashboard
   - Ensure `NEXT_PUBLIC_API_URL` points to your backend service

3. **Deploy**
   - Railway will automatically detect the Next.js project
   - The build process will:
     - Install dependencies (`npm install --production=false`)
     - Build the application (`npm run build`)
     - Start the application (`npm start`)

## Recent Fixes Applied

### ✅ Package Lock File Sync Issue
- **Problem**: `npm ci` was failing due to out-of-sync `package-lock.json`
- **Solution**: Updated to use `npm install --production=false` in Nixpacks configuration
- **Status**: Fixed ✅

### ✅ TypeScript Error Fix
- **Problem**: `publicUserData` was possibly undefined in OrganizationMembersCard
- **Solution**: Added optional chaining (`?.`) to handle undefined values
- **Status**: Fixed ✅

### ✅ Security Vulnerabilities
- **Problem**: 3 vulnerabilities detected (2 low, 1 high)
- **Solution**: Ran `npm audit fix` to resolve issues
- **Status**: Fixed ✅

## Troubleshooting

### Build Issues

If the build gets stuck or fails:

1. **Check Node.js version**: Ensure you're using Node.js >=20.11.0
2. **Clear cache**: Try redeploying with cache cleared
3. **Check logs**: Review Railway build logs for specific errors
4. **Package lock issues**: If you see `npm ci` errors, the lock file may be out of sync

### Runtime Issues

1. **Environment variables**: Ensure all `NEXT_PUBLIC_*` variables are set
2. **API connection**: Verify `NEXT_PUBLIC_API_URL` points to your backend
3. **Clerk configuration**: Check that Clerk keys are properly configured

## Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build output
npm start
```

## Health Check

The application includes a health check endpoint at `/` that returns the main page.

## Monitoring

- Railway provides built-in monitoring and logs
- Check the "Deployments" tab for build and runtime logs
- Monitor application metrics in the "Metrics" tab

## Rollback

If deployment fails:
1. Go to Railway dashboard
2. Navigate to "Deployments"
3. Click on the previous successful deployment
4. Select "Redeploy"

## Support

For Railway-specific issues, refer to:
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway) 