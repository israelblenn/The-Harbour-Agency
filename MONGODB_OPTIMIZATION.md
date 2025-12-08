# MongoDB Connection Optimization Guide

## Changes Made

### 1. Payload Client Singleton Pattern

- **File**: `src/lib/api/payload-cms.ts`
- **Change**: Implemented singleton pattern to reuse Payload client across function calls
- **Impact**: Reduces connection creation from every function call to once per serverless function lifecycle

### 2. Mongoose Connection Pooling

- **File**: `src/payload.config.ts`
- **Change**: Added connection pooling configuration optimized for M0 cluster
- **Settings**:
  - `maxPoolSize: 5` - Limits concurrent connections
  - `minPoolSize: 1` - Maintains at least 1 connection
  - `maxIdleTimeMS: 30000` - Closes idle connections after 30s
  - `serverSelectionTimeoutMS: 5000` - Fails fast if can't connect
  - `socketTimeoutMS: 45000` - Closes connections after 45s of inactivity

### 3. Page-Level Caching

- **Files**: All page components
- **Change**: Added `export const revalidate = 3600` (1 hour cache)
- **Impact**: Reduces database calls for static content

### 4. API Route Optimization

- **File**: `src/app/api/contact/route.ts`
- **Change**: Implemented singleton pattern for API routes
- **Impact**: Reuses Payload client across API calls

## Environment Variables Required

Ensure these are set in your Vercel environment:

```bash
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
PAYLOAD_SECRET=your-secret-key
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET=your-secret-key
S3_ENDPOINT=https://your-endpoint.com
SEND_FROM_ADDRESS=your-email@domain.com
SEND_TO_ADDRESS=contact@yourdomain.com
REVALIDATE_SECRET=your-revalidation-secret
```

## Monitoring Recommendations

1. **MongoDB Atlas Dashboard**: Monitor active connections
2. **Vercel Analytics**: Track function invocations and cold starts
3. **Payload CMS Logs**: Check for connection errors

## Expected Results

- **Before**: Multiple connections per request (10-20+ connections)
- **After**: 1-5 connections maximum
- **Cache Hit Rate**: 80-90% for static content
- **Connection Reuse**: 90%+ efficiency

## Additional Optimizations (If Still Needed)

1. **Upgrade to M10**: If connection limits still exceeded
2. **Implement Redis Cache**: For frequently accessed data
3. **Database Indexing**: Ensure proper indexes on queried fields
4. **Connection Monitoring**: Set up alerts for connection spikes
