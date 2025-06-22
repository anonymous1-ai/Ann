# SaaS Backend System Documentation

## Overview

This is a complete SaaS backend system for distributing a Python .exe AI tool with authentication, Razorpay payments, license validation, and API call limits.

## System Architecture

### Database Schema

#### Users Table
- `id` - Primary key
- `email` - Unique user email
- `name` - User's full name
- `password` - Hashed password (bcrypt)
- `plan` - Subscription plan (free, pro, advanced)
- `api_calls_left` - Remaining API calls
- `total_calls` - Total API calls made
- `license_key` - Unique license key (UUID format)
- `expiry_date` - License expiration date
- `razorpay_customer_id` - Razorpay customer ID
- `hardware_hash` - Device binding hash
- `created_at` - Account creation date
- `updated_at` - Last update timestamp

#### Subscriptions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `plan` - Subscription plan
- `status` - Subscription status (active, cancelled, expired)
- `razorpay_subscription_id` - Razorpay subscription ID
- `razorpay_payment_id` - Payment transaction ID
- `amount` - Payment amount in INR
- `currency` - Currency (INR)
- `start_date` - Subscription start date
- `end_date` - Subscription end date
- `created_at` - Record creation date
- `updated_at` - Last update timestamp

#### License Validations Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `license_key` - License key used
- `hardware_hash` - Hardware hash submitted
- `success` - Validation success status
- `api_calls_left` - Remaining calls at validation
- `ip_address` - Client IP address
- `user_agent` - Client user agent
- `created_at` - Validation timestamp

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "plan": "free",
      "apiCallsLeft": 0
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "plan": "pro",
      "apiCallsLeft": 95
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me
Get current user information (requires JWT token).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "plan": "pro",
    "apiCallsLeft": 95,
    "expiryDate": "2024-07-22T00:00:00.000Z"
  }
}
```

### License Validation Endpoint (Used by .exe Tool)

#### POST /api/validate-license
Validate license key and hardware hash.

**Request:**
```json
{
  "licenseKey": "LIC-ABCD1234EFGH5678",
  "hardwareHash": "sha256_hardware_hash"
}
```

**Success Response:**
```json
{
  "valid": true,
  "apiCallsLeft": 94,
  "daysRemaining": 25
}
```

**Error Response:**
```json
{
  "valid": false,
  "message": "Invalid license key"
}
```

### Payment Endpoints

#### POST /api/create-order
Create Razorpay payment order (requires JWT token).

**Request:**
```json
{
  "plan": "pro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_1234567890",
    "amount": 80000,
    "currency": "INR",
    "plan": "pro"
  }
}
```

#### POST /api/verify-payment
Verify payment and activate subscription (requires JWT token).

**Request:**
```json
{
  "orderId": "order_1234567890",
  "paymentId": "pay_1234567890",
  "signature": "razorpay_signature",
  "plan": "pro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "apiCallsLeft": 100,
    "expiryDate": "2024-07-22T00:00:00.000Z",
    "licenseKey": "LIC-ABCD1234EFGH5678"
  }
}
```

### Dashboard Endpoints

#### GET /api/user-dashboard
Get user dashboard statistics (requires JWT token).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCalls": 5,
    "apiCallsLeft": 95,
    "plan": "pro",
    "expiryDate": "2024-07-22T00:00:00.000Z",
    "recentUsage": [
      {
        "id": 1,
        "endpoint": "ai-process",
        "creditsUsed": 1,
        "createdAt": "2024-06-22T10:30:00.000Z"
      }
    ]
  }
}
```

#### POST /api/generate-license
Generate license key for paid plans (requires JWT token).

**Response:**
```json
{
  "success": true,
  "data": {
    "licenseKey": "LIC-ABCD1234EFGH5678"
  }
}
```

### Utility Endpoints

#### GET /api/download
Get download link for the AI tool.

**Response:**
```json
{
  "success": true,
  "message": "Download link would be provided here",
  "downloadUrl": "/downloads/ai-tool.exe"
}
```

#### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "SaaS backend is running"
}
```

## Pricing Plans

### Free Plan
- **Price:** ₹0
- **API Calls:** 0 (tool download only)
- **Duration:** Forever
- **Features:** Download access, tool remains inactive

### Pro Plan
- **Price:** ₹800/month
- **API Calls:** 100 per month
- **Duration:** 30 days
- **Features:** Full tool activation, license validation, email support

### Advanced Plan
- **Price:** ₹2000/year
- **API Calls:** 300 per month (3600 total)
- **Duration:** 365 days
- **Features:** All Pro features + priority support, advanced analytics

## Security Features

### JWT Authentication
- 24-hour token expiration
- Secure token storage in localStorage
- Protected routes requiring valid tokens

### License Validation
- Hardware hash binding for device security
- Rate limiting (100 requests per 15 minutes)
- Comprehensive logging of all validation attempts
- IP address and user agent tracking

### Password Security
- bcrypt hashing with salt rounds
- Secure password storage
- No plaintext password exposure

## Rate Limiting

### License Validation Endpoint
- **Window:** 15 minutes
- **Limit:** 100 requests per IP
- **Response:** 429 Too Many Requests

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Error Codes
- **400:** Bad Request (invalid input data)
- **401:** Unauthorized (missing or invalid token)
- **403:** Forbidden (token expired)
- **404:** Not Found (resource not found)
- **429:** Too Many Requests (rate limit exceeded)
- **500:** Internal Server Error

## Python Client Integration

The `python_client_example.py` file demonstrates how to integrate the license validation system into your Python .exe tool:

### Key Features
- Hardware hash generation for device binding
- Network request handling with proper error management
- License validation before each API call
- User-friendly activation process

### Usage in Your .exe Tool
1. Import the `LicenseValidator` class
2. Generate hardware hash on first run
3. Validate license key with the SaaS backend
4. Check license status before each AI operation
5. Handle validation failures gracefully

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=your_postgresql_database_url

# JWT Authentication
JWT_SECRET=your_secure_jwt_secret_key

# Razorpay (when implementing real payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Deployment Checklist

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy Express.js server
5. Configure SSL/TLS certificates
6. Set up domain and DNS

### Frontend Deployment
1. Build React application
2. Configure API endpoints
3. Deploy static assets
4. Set up CDN (optional)

### Security Hardening
1. Enable HTTPS everywhere
2. Configure CORS properly
3. Set up proper rate limiting
4. Implement logging and monitoring
5. Regular security updates

## Testing

### API Testing Examples

Test license validation:
```bash
curl -X POST http://localhost:5000/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"test-key","hardwareHash":"test-hash"}'
```

Test health endpoint:
```bash
curl -X GET http://localhost:5000/api/health
```

### Integration Testing
1. User registration and login flow
2. Payment simulation and plan activation
3. License key generation and validation
4. API call tracking and limits
5. Subscription expiration handling

## Support and Maintenance

### Monitoring
- API response times and error rates
- License validation success/failure rates
- Payment processing status
- Database performance metrics

### Backup Strategy
- Daily database backups
- License key recovery procedures
- User data protection compliance

### Updates and Maintenance
- Regular security patches
- API version management
- Backward compatibility considerations
- User notification for breaking changes

## Conclusion

This SaaS backend system provides a complete solution for:
- User authentication and management
- Subscription-based payments
- Secure license validation
- API usage tracking and limits
- Comprehensive logging and analytics

The system is designed to be scalable, secure, and easy to maintain while providing a smooth user experience for both web dashboard and .exe tool integration.