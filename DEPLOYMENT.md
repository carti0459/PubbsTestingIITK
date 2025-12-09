# 📋 Deployment Checklist - Pubbs Bike Sharing

## Pre-Deployment

### ✅ Code Quality
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] ESLint warnings addressed (`npm run lint`)
- [ ] No console.error() in production code
- [ ] All throw statements replaced with graceful error handling
- [ ] Environment variables documented

### ✅ Testing
- [ ] Authentication flow works (register, login, OTP)
- [ ] Subscription purchase completes successfully
- [ ] QR code scanning unlocks bikes
- [ ] Ride operations tested (start, hold, continue, end)
- [ ] Admin dashboard accessible and functional
- [ ] PWA installs correctly on mobile
- [ ] Offline mode works (cached pages)

### ✅ Configuration
- [ ] Firebase rules configured for production
- [ ] Google Maps API key has proper restrictions
- [ ] Razorpay keys switched to live mode
- [ ] MSG91 production credentials set
- [ ] CORS policies configured
- [ ] Rate limiting implemented

---

## Environment Setup

### Production Environment Variables

```env
# Firebase Production
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-prod-db.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=prod_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-prod-project
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@your-prod-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Maps Production
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=prod_maps_key_with_restrictions

# Razorpay Live
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=live_secret_key

# MSG91 Production
MSG91_AUTH_KEY=prod_auth_key
MSG91_TEMPLATE_ID=prod_template_id
MSG91_SENDER_ID=prod_sender

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Firebase Setup

### 1. Security Rules
```json
{
  "rules": {
    "PubbsTesting": {
      ".read": "auth != null",
      ".write": "auth != null",
      
      "Bicycle": {
        "$bikeId": {
          ".read": true,
          ".write": "auth != null"
        }
      },
      
      "UserRides": {
        "$userId": {
          ".read": "auth != null && auth.uid == $userId",
          ".write": "auth != null && auth.uid == $userId"
        }
      },
      
      "Subscriptions": {
        "$userId": {
          ".read": "auth != null && auth.uid == $userId",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

### 2. Indexes
Add to Firebase Console → Realtime Database → Rules:
```json
{
  "indexOn": ["status", "operation", "userId", "timestamp"]
}
```

### 3. Backup Strategy
- [ ] Enable daily automated backups
- [ ] Set up backup retention policy (30 days)
- [ ] Test restore procedure

---

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login & Link Project
```bash
vercel login
vercel link
```

### 3. Set Environment Variables
```bash
# Add each variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# ... (repeat for all variables)
```

Or use Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Select "Production" environment

### 4. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 5. Custom Domain (Optional)
```bash
vercel domains add yourdomain.com
```

---

## Google Maps Configuration

### API Restrictions
1. Go to Google Cloud Console → Credentials
2. Edit API Key
3. Set HTTP referrers:
   ```
   https://yourdomain.com/*
   https://*.vercel.app/*
   ```
4. Enable only required APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API

---

## Razorpay Setup

### 1. Switch to Live Mode
- Get live API keys from Razorpay Dashboard
- Update webhook URL: `https://yourdomain.com/api/razorpay/webhook`

### 2. Test Payments
- [ ] Test with real card (₹1 test)
- [ ] Verify webhook receives payment success
- [ ] Check subscription activation in Firebase

### 3. KYC Compliance
- [ ] Complete Razorpay KYC
- [ ] Activate live account
- [ ] Set up settlement account

---

## Performance Optimization

### ✅ Build Optimization
- [ ] Analyze bundle size: `npm run build`
- [ ] Check Lighthouse scores (target: 90+)
- [ ] Enable Vercel Analytics
- [ ] Optimize images (WebP format)
- [ ] Enable Next.js Image Optimization

### ✅ Caching Strategy
```typescript
// next.config.ts
{
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'firebasestorage.googleapis.com'
    }]
  },
  headers: async () => [{
    source: '/assets/:path*',
    headers: [{
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable'
    }]
  }]
}
```

---

## Monitoring & Alerts

### 1. Error Tracking
- [ ] Set up Sentry (optional)
- [ ] Configure error boundaries
- [ ] Add user feedback widget

### 2. Analytics
- [ ] Enable Vercel Analytics
- [ ] Set up Google Analytics (optional)
- [ ] Track key metrics:
  - Subscription conversions
  - Ride completions
  - QR scan success rate

### 3. Uptime Monitoring
- [ ] Set up UptimeRobot (free)
- [ ] Monitor critical endpoints:
  - `/api/bikes`
  - `/api/login`
  - `/api/subscriptions/create`

---

## Security Checklist

### ✅ Authentication
- [ ] Phone verification mandatory
- [ ] OTP expiry implemented (5 minutes)
- [ ] Rate limiting on auth endpoints
- [ ] Secure session management

### ✅ API Security
- [ ] All API routes validate auth
- [ ] Input sanitization implemented
- [ ] SQL injection prevention (N/A - using Firebase)
- [ ] XSS protection enabled
- [ ] CSRF tokens for sensitive operations

### ✅ Data Protection
- [ ] Sensitive data encrypted
- [ ] Payment info never stored locally
- [ ] User data access restricted by Firebase rules
- [ ] HTTPS enforced everywhere

---

## Post-Deployment

### Immediate (Day 1)
- [ ] Verify all pages load correctly
- [ ] Test complete user flow (register → ride → payment)
- [ ] Check Firebase connection
- [ ] Verify payment gateway
- [ ] Test PWA installation
- [ ] Monitor error logs

### Week 1
- [ ] Review analytics data
- [ ] Check for any error spikes
- [ ] Verify backup system working
- [ ] Monitor server costs
- [ ] Gather user feedback

### Month 1
- [ ] Performance review (Lighthouse)
- [ ] Security audit
- [ ] Cost optimization
- [ ] Feature usage analysis
- [ ] Plan next iteration

---

## Rollback Plan

### If Deployment Fails
```bash
# Revert to previous deployment
vercel rollback

# Check specific deployment
vercel inspect <deployment-url>

# Re-deploy specific version
vercel --prod --force
```

### Database Rollback
1. Access Firebase Console
2. Go to Realtime Database → Backups
3. Select backup date
4. Restore to new database instance
5. Update `FIREBASE_DATABASE_URL` in Vercel

---

## Support Contacts

### Critical Issues
- **Firebase Support**: https://firebase.google.com/support
- **Vercel Support**: https://vercel.com/support
- **Razorpay Support**: support@razorpay.com
- **Google Maps**: https://developers.google.com/maps/support

### Internal Team
- **DevOps**: devops@yourdomain.com
- **Backend**: backend@yourdomain.com
- **On-Call**: +91-XXXXXXXXXX

---

## Success Criteria

### Deployment is successful when:
- ✅ Website loads in < 3 seconds
- ✅ All authentication flows work
- ✅ QR scanning unlocks bikes
- ✅ Payments process successfully
- ✅ Firebase real-time updates work
- ✅ PWA installs on mobile
- ✅ No critical errors in logs
- ✅ Lighthouse score > 85

---

## 🎉 Deployment Complete!

### Next Steps:
1. Announce launch
2. Monitor for 24 hours continuously
3. Collect user feedback
4. Plan iteration #2

**Project wrapped up successfully! 🚴‍♂️**
