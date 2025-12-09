# 🚀 Quick Start Guide - Pubbs Bike Sharing

## 5-Minute Setup

### 1. Install Dependencies
```bash
git clone https://github.com/Pawandasila/pubbs.git
cd pubbs
npm install
```

### 2. Minimum Required Environment Variables
Create `.env.local`:
```env
# Firebase (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Google Maps (Get from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 3. Run Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

---

## 🎯 Core Features Checklist

### User Flow
- [ ] Register account → Phone verification → OTP
- [ ] Login to dashboard
- [ ] Buy subscription (Razorpay)
- [ ] Scan QR code to unlock bike
- [ ] Start ride → Hold → Continue → End

### Admin Flow
- [ ] Access `/admin` dashboard
- [ ] Monitor active rides
- [ ] Control locks from `/locks` page
- [ ] View system metrics

---

## 🔑 Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/(main)/minDashboard/page.tsx` | Main user dashboard |
| `src/app/(main)/minDashboard/_components/useDashboard.ts` | Dashboard logic (1264 lines) |
| `src/app/(main)/minDashboard/_components/ReadyToRideModal.tsx` | Bike unlock modal |
| `src/hooks/useLockControl.ts` | IoT lock operations |
| `src/hooks/useBikes.ts` | Bike data management |
| `src/hooks/useSubscription.ts` | Payment & subscription |
| `src/lib/firebase.ts` | Firebase client config |
| `src/contexts/AuthContext.tsx` | User authentication |

---

## 🧪 Testing

### Test Bike Unlock (Without Hardware)
1. Set bike data in Firebase:
```json
{
  "PubbsTesting": {
    "Bicycle": {
      "TEST001": {
        "operation": "0",
        "status": "idle",
        "battery": "87",
        "type": "QTGSM",
        "location": {
          "latitude": 22.3149,
          "longitude": 87.3105
        }
      }
    }
  }
}
```

2. Scan QR with bike ID: `TEST001`
3. Watch Firebase for operation changes: `0 → 1 → 10`

### Test Web Bluetooth (BLE Locks)
1. Enable Web Bluetooth: `chrome://flags/#enable-web-bluetooth`
2. Use bike type: `QTBLE`, `NRBLE`, etc.
3. Browser will prompt for device pairing

---

## 🐛 Common Issues

### Firebase Connection Error
**Error**: `PERMISSION_DENIED`
**Fix**: Update Firebase rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Bluetooth Not Working
**Error**: `Web Bluetooth API globally disabled`
**Fix**: 
- Use HTTPS (not HTTP)
- Enable in `chrome://flags`
- Check browser support (Chrome, Edge, Opera)

### Razorpay Checkout Fails
**Error**: Payment modal doesn't open
**Fix**: Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly

---

## 📱 Mobile Testing

### Install as PWA
1. Open app in mobile Chrome/Safari
2. Tap "Install" or "Add to Home Screen"
3. App works offline with cached data

### QR Code Scanning
- Camera permission required
- Use real QR codes or generate test ones
- Format: Plain text bike ID (e.g., "BIKE001")

---

## 🔄 Development Workflow

### Add New Bike Type
1. Update `ReadyToRideModal.tsx`:
```typescript
const bikeType = bike.type || "QTGSM";

if (bikeType === "YOURTYPE") {
  // Your unlock logic
}
```

2. Add to lock types enum in Firebase

### Add New API Route
```typescript
// src/app/api/your-route/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  // Your logic
  return Response.json({ success: true });
}
```

### Add New Hook
```typescript
// src/hooks/useYourHook.ts
import { useState, useCallback } from 'react';

export const useYourHook = () => {
  const [state, setState] = useState();
  
  return { state, setState };
};
```

---

## 📚 Resources

- **Full Documentation**: See `README.md`
- **Firebase Setup**: https://firebase.google.com/docs
- **Web Bluetooth Guide**: https://web.dev/bluetooth/
- **Razorpay Docs**: https://razorpay.com/docs/
- **Next.js Guide**: https://nextjs.org/docs

---

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Look at console logs (with emoji prefixes)
3. Check Firebase Realtime Database debugger
4. Review API responses in Network tab
5. Open GitHub issue with error details

---

**Happy Coding! 🚴‍♂️**
