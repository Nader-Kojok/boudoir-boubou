# Header Size Issue Fix

## Problem
The application was experiencing "494: REQUEST_HEADER_TOO_LARGE" errors, particularly on the login page with callback URLs. This error occurs when HTTP request headers exceed the server's size limit (typically 8KB on Vercel).

## Root Cause
NextAuth.js stores session data in JWT tokens within cookies. Large user data, long callback URLs, and accumulated authentication cookies can cause headers to exceed size limits.

## Solution Implemented

### 1. Optimized NextAuth Configuration (`src/lib/auth.ts`)
- **Minimized JWT token data**: Only store essential user information (ID and role)
- **Removed large fields**: Explicitly delete `picture` and `image` from JWT tokens
- **Database-driven session data**: Fetch fresh user data from database instead of storing in tokens
- **Optimized cookie settings**: Added explicit maxAge and reduced callback URL cookie lifetime

### 2. Cookie Management Utilities (`src/lib/cookie-utils.ts`)
- **Header size monitoring**: Check if headers approach size limits
- **Cookie cleanup**: Utility to clear all NextAuth cookies
- **Debug logging**: Log cookie sizes in development mode

### 3. Enhanced Middleware (`src/middleware.ts`)
- **Proactive monitoring**: Check header sizes on each request
- **Automatic recovery**: Clear cookies and redirect to login if headers are too large
- **Development debugging**: Log cookie information for troubleshooting

### 4. User Experience Improvements
- **Error handling**: Display user-friendly message for header size errors
- **Automatic recovery**: Clear problematic cookies and allow re-authentication
- **API endpoint**: `/api/auth/clear-cookies` for manual cookie clearing

### 5. Next.js Configuration (`next.config.ts`)
- **Server optimization**: External packages configuration for Prisma
- **Security headers**: Added standard security headers

## Key Changes

### JWT Token Optimization
```typescript
// Before: Large tokens with user data
token.user = { id, name, email, image, bio, location, ... }

// After: Minimal tokens
token.role = user.role
delete token.picture
delete token.image
```

### Session Data Strategy
```typescript
// Before: All data in JWT
session.user = token.user

// After: Fresh data from database
const user = await prisma.user.findUnique({
  where: { id: token.sub },
  select: { name: true, image: true, phone: true }
})
```

### Cookie Lifecycle Management
```typescript
// Shorter lifetimes for non-essential cookies
callbackUrl: { maxAge: 60 * 60 }, // 1 hour
csrfToken: { maxAge: 60 * 60 },   // 1 hour
sessionToken: { maxAge: 30 * 24 * 60 * 60 }, // 30 days
```

## Monitoring and Debugging

### Development Logging
The application now logs cookie information in development mode:
```
Cookie Debug Info: {
  cookieSize: "2048 bytes",
  headerSizeWarning: false,
  cookies: [{ name: "next-auth.session-token", size: 1024 }]
}
```

### API Endpoint for Debugging
```bash
# Check current cookie size
GET /api/auth/clear-cookies

# Clear all auth cookies
POST /api/auth/clear-cookies
```

## Prevention Strategies

1. **Keep JWT tokens minimal**: Only store essential identifiers
2. **Use database for user data**: Fetch fresh data instead of caching in tokens
3. **Monitor cookie sizes**: Regular checks in development
4. **Short-lived callback URLs**: Reduce callback URL cookie lifetime
5. **Regular cleanup**: Clear unused authentication cookies

## Testing

To test the fix:
1. Clear browser cookies
2. Attempt login with long callback URLs
3. Monitor network tab for header sizes
4. Verify automatic recovery on header size errors

## Future Considerations

- Consider implementing cookie compression for very large applications
- Monitor header sizes in production with analytics
- Implement session storage alternatives for applications with very large user data
- Consider using server-side sessions for applications requiring extensive user data caching