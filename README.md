# 🚴 Pubbs - Smart Bike Sharing Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=for-the-badge&logo=firebase)

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/status-Production%20Ready-success?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

A comprehensive, production-ready bike-sharing web application built with Next.js 15, featuring real-time bike tracking, IoT lock control, subscription management, and seamless payment integration. Supports both GSM and BLE-enabled smart locks with direct Web Bluetooth API integration.

[Live Demo](https://pubbs.vercel.app) • [Documentation](#-table-of-contents) • [Quick Start](#-getting-started) • [API Docs](API_REFERENCE.md)

</div>

---

## � Documentation Guide

### 📖 Quick Navigation

Choose the guide that fits your needs:

| Guide | Purpose | Best For |
|-------|---------|----------|
| **👉 This README** | Complete technical overview | Understanding the full project |
| **[🚀 QUICK_START.md](QUICK_START.md)** | Get running in 5 minutes | New developers setting up |
| **[🚢 DEPLOYMENT.md](DEPLOYMENT.md)** | Production deployment | DevOps & deployment managers |
| **[🔌 API_REFERENCE.md](API_REFERENCE.md)** | API endpoints & examples | Backend developers & integrators |
| **[📝 CHANGELOG.md](CHANGELOG.md)** | Version history & changes | Tracking project evolution |
| **[🎯 PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Executive summary | Project managers & stakeholders |

### 🎯 I want to...

- **Start developing** → [QUICK_START.md](QUICK_START.md)
- **Deploy to production** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **Integrate the API** → [API_REFERENCE.md](API_REFERENCE.md)
- **Understand architecture** → Continue reading this README
- **See what changed** → [CHANGELOG.md](CHANGELOG.md)
- **Get project status** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## �📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [Core Functionality](#-core-functionality)
- [API Documentation](#-api-documentation)
- [IoT Integration](#-iot-integration)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## ✨ Features

### 🚴 Bike Operations
- **Real-time bike tracking** with Google Maps integration
- **QR code scanning** for instant bike unlock
- **Multiple lock types support**:
  - GSM-based locks (QTGSM, QTGSMAUTO)
  - BLE-based locks (NRBLE, NRBLEAUTO, QTBLE, QTBLEE)
- **Direct IoT control** via Web Bluetooth API
- **Lock status monitoring** with Firebase Realtime Database
- **Bike availability filtering** by station and status

### 🔐 Authentication System
- **Multi-step signup**: Register → Phone → OTP → Welcome
- **Phone verification** with OTP (MSG91 integration)
- **Forgot password** recovery flow
- **Session management** with context API
- **Form validation** using React Hook Form + Zod
- **Mobile-responsive** authentication pages

### 💳 Subscription & Payments
- **Flexible subscription plans** (Daily, Weekly, Monthly, Yearly)
- **Razorpay payment gateway** integration
- **Subscription status tracking**
- **Auto-renewal management**
- **Payment history** and receipts
- **Coupon/discount system**

### 📊 User Dashboard
- **Active ride management** with real-time tracking
- **Trip history** and analytics
- **Ride controls**: Hold, Continue, End
- **Distance and time tracking**
- **Station-based bike discovery**
- **Geofencing** with boundary visualization
- **Background service** for ride state persistence

### 👨‍💼 Admin Panel
- **System metrics** dashboard
- **User management**
- **Bike fleet monitoring**
- **Lock control system**
- **Revenue analytics**
- **Alert management**
- **Real-time operation logs**

### 🎨 User Experience
- **Progressive Web App (PWA)** with offline support
- **Install prompt** for mobile devices
- **Smooth animations** with Framer Motion
- **Toast notifications** (Sonner)
- **Loading states** and skeleton screens
- **Error boundaries** with graceful degradation
- **Responsive design** (mobile-first)

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.5.2** - React framework with App Router & Turbopack
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.x** - Utility-first styling
- **shadcn/ui** - Component library (Radix UI)
- **Framer Motion** - Animations
- **Lucide React** - Icon system

### Maps & Location
- **Google Maps API** (@vis.gl/react-google-maps)
- **Geofencing** - Custom boundary validation
- **Real-time tracking** - Firebase location updates

### Backend & Database
- **Firebase Realtime Database** - Real-time bike/lock data
- **Firebase Admin SDK** - Server-side operations
- **Next.js API Routes** - Backend endpoints

### IoT & Hardware
- **Web Bluetooth API** - Direct BLE lock control
- **Nordic UART Service** - BLE communication protocol
- **GSM/GPRS** - Remote lock control via Firebase
- **16-byte command protocol** - IoT lock communication

### Payments & Services
- **Razorpay** - Payment processing
- **MSG91** - OTP SMS service
- **Vercel Analytics** - Usage tracking

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **html2canvas** - Receipt generation
- **jsPDF** - PDF export
- **qr-scanner** - QR code reading

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm**, **yarn**, **pnpm**, or **bun**
- **Firebase project** with Realtime Database
- **Google Maps API key**
- **Razorpay account** (for payments)
- **MSG91 account** (for OTP)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Pawandasila/pubbs.git
cd pubbs
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# MSG91
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_otp_template_id
MSG91_SENDER_ID=your_sender_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open in browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

### Lint and Type Check
```bash
npm run lint
npm run type-check
```

---

## 🏛️ Architecture

### Project Structure
```
d:\pubbs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── layout.tsx
│   │   ├── (main)/            # Protected app routes
│   │   │   ├── minDashboard/  # User dashboard
│   │   │   │   ├── _components/
│   │   │   │   │   ├── useDashboard.ts     # Main dashboard hook
│   │   │   │   │   └── ReadyToRideModal.tsx # Bike unlock flow
│   │   │   │   ├── bikes/     # Bike management
│   │   │   │   └── tracking/  # Real-time tracking
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── locks/         # Lock control system
│   │   │   └── layout.tsx
│   │   ├── (welcome)/         # Onboarding
│   │   └── api/               # API routes
│   │       ├── bike-operation/
│   │       ├── bikes/
│   │       ├── booking/
│   │       ├── login/
│   │       ├── register/
│   │       ├── razorpay/
│   │       ├── send-otp/
│   │       ├── subscriptions/
│   │       └── ...
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── AnalyticsChart.tsx
│   │   │   └── MetricsGrid.tsx
│   │   ├── bikes/             # Bike components
│   │   │   ├── BikeCard.tsx
│   │   │   └── BikesGrid.tsx
│   │   ├── common/            # Shared components
│   │   │   ├── BackgroundServiceManager.tsx
│   │   │   ├── PWAInstallPrompt.tsx
│   │   │   ├── QRScannerModal.tsx
│   │   │   └── VisGoogleMap.tsx
│   │   ├── locks/             # Lock control
│   │   │   └── LockControlPanel.tsx
│   │   ├── navigation/        # Navigation
│   │   ├── rides/             # Ride components
│   │   ├── subscription/      # Subscription UI
│   │   └── ui/                # shadcn components
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── OperatorContext.tsx # Multi-operator support
│   ├── hooks/
│   │   ├── useAdminDashboard.ts
│   │   ├── useBikes.ts        # Bike management
│   │   ├── useGeofencing.ts   # Geofence validation
│   │   ├── useLockControl.ts  # IoT lock operations
│   │   ├── useRealTimeTracking.ts
│   │   ├── useRides.ts        # Ride history
│   │   ├── useStations.ts     # Station management
│   │   └── useSubscription.ts # Payment & plans
│   ├── lib/
│   │   ├── firebase.ts        # Firebase client
│   │   ├── firebase-admin.ts  # Firebase admin
│   │   ├── msg91.ts           # SMS service
│   │   ├── booking-utils.ts   # Booking helpers
│   │   ├── pwa.ts             # PWA utilities
│   │   └── validations/       # Zod schemas
│   ├── services/
│   │   └── auth.ts            # Auth service
│   └── types/
│       ├── admin.type.ts
│       ├── ride.type.ts
│       ├── subscription.type.ts
│       └── user.type.ts
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── assets/
├── components.json            # shadcn config
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── tsconfig.json              # TypeScript config
```

---

## 🎯 Core Functionality

### 1. Authentication Flow
```
Register → Phone Verification → OTP → Welcome → Dashboard
```
- **Routes**: `/register`, `/register/phone-verification`, `/register/otp-verification`
- **Components**: `RegisterForm`, `PhoneVerificationForm`, `OtpVerificationForm`
- **API**: `/api/register`, `/api/send-otp`, `/api/verify-otp`

### 2. Bike Unlock Process
```
Scan QR → Validate Subscription → Check Bike → Unlock → Start Ride
```
**Supported Lock Types**:
- `QTGSM` / `QTGSMAUTO` - GSM-based (Firebase control)
- `NRBLE` / `NRBLEAUTO` - Nordic BLE locks
- `QTBLE` / `QTBLEE` - Bluetooth locks

**Unlock Flow**:
1. User scans QR code (bike ID)
2. System validates active subscription
3. Checks bike availability and location
4. Sends operation code `1` (unlock request)
5. Polls for operation code `10` (unlock confirmed)
6. Creates trip record with booking ID
7. Starts ride timer

**Files**: 
- `ReadyToRideModal.tsx` - Unlock UI logic
- `useDashboard.ts` - Dashboard state management
- `useLockControl.ts` - Lock operations

### 3. Ride Management
**Operations**:
- **Start Ride**: Operation `0 → 1 → 10` (locked → unlock request → unlocked)
- **Hold Ride**: Operation `10 → 2 → 20` (unlocked → hold request → held)
- **Continue Ride**: Operation `20 → 3 → 30` (held → continue request → riding)
- **End Ride**: Operation `30 → 0` (riding → ended/locked)

**State Persistence**:
- localStorage for ride timers
- Firebase for bike status
- Background service for state restoration

### 4. Web Bluetooth Integration
**Protocol**: 16-byte command packets
```typescript
[appId (4 bytes)][communicationKey (4 bytes)][command (2 bytes)][data (2 bytes)][checksum (4 bytes)]
```

**Services**:
- Nordic UART Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- TX Characteristic: `6e400002-...` (write)
- RX Characteristic: `6e400003-...` (notify)

**Commands**:
- `[1, 1]` - Request communication key
- `[1, 2]` - Unlock command

**Implementation**: `ReadyToRideModal.tsx` lines 265-420

### 5. Subscription System
**Plans**:
- Daily: ₹10
- Weekly: ₹50
- Monthly: ₹150
- Yearly: ₹1500

**Flow**:
```
Select Plan → Razorpay Checkout → Payment Success → Activate Subscription
```

**API**: `/api/subscriptions/create`, `/api/razorpay/verify`

---

## 🔌 API Documentation

### Authentication
```typescript
POST /api/register
Body: { fullName, email, password, phoneNumber }
Response: { success, userId, message }

POST /api/login
Body: { email, password }
Response: { success, user, message }

POST /api/send-otp
Body: { phoneNumber }
Response: { success, message }

POST /api/verify-otp
Body: { phoneNumber, otp }
Response: { success, verified }
```

### Bike Operations
```typescript
GET /api/bikes?bikeId=BIKE001&operator=PubbsTesting
Response: { success, bike: { id, status, operation, battery, location } }

POST /api/bike-operation
Body: { bikeId, operator, operation, status, battery, ridetime }
Response: { success, message }

GET /api/bikes/available?stationId=STATION01&operator=PubbsTesting
Response: { success, bikes: Array<Bike> }
```

### Booking & Rides
```typescript
POST /api/create-trip
Body: { userId, bikeId, operator, startLocation, bookingId }
Response: { success, tripId, message }

GET /api/user-ride?userId=USER123&operator=PubbsTesting
Response: { success, activeRide: { bookingId, bikeId, startTime } }

POST /api/booking/end
Body: { bookingId, userId, bikeId, operator, endLocation }
Response: { success, tripDetails }
```

### Subscriptions
```typescript
POST /api/subscriptions/create
Body: { userId, planType, amount, duration }
Response: { success, orderId, razorpayOrderId }

POST /api/razorpay/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
Response: { success, subscription }
```

### Stations
```typescript
GET /api/stations?operator=PubbsTesting
Response: { success, stations: Array<Station> }
```

---

## 🔧 IoT Integration

### Lock Communication Protocol

#### GSM Locks (QTGSM, QTGSMAUTO)
**Communication**: Firebase Realtime Database
**Path**: `{operator}/Bicycle/{bikeId}`

**Operation Codes**:
| Code | Status | Description |
|------|--------|-------------|
| `0` | `idle` | Locked, available for rent |
| `1` | `busy` | Unlock request sent |
| `10` | `busy` | Unlocked, confirmed |
| `2` | `hold` | Hold request sent |
| `20` | `hold` | Ride on hold |
| `3` | `busy` | Continue request sent |
| `30` | `busy` | Ride resumed |

**Example Firebase Structure**:
```json
{
  "PubbsTesting": {
    "Bicycle": {
      "BIKE001": {
        "operation": "10",
        "status": "busy",
        "battery": "87",
        "ridetime": "480",
        "location": {
          "latitude": 22.3149,
          "longitude": 87.3105
        }
      }
    }
  }
}
```

#### BLE Locks (NRBLE, QTBLE, etc.)
**Communication**: Web Bluetooth API (GATT)
**Protocol**: Nordic UART Service

**Byte Structure**:
```
[0-3]: appId (345678 encoded)
[4-7]: communicationKey
[8-9]: command
[10-11]: data
[12-15]: checksum (CRC32)
```

**Implementation**:
```typescript
// Request communication key
const keyCommand = prepareBluetoothBytes([1,2,3,4], 345678, [1,1], [0,0]);
await writeCharacteristic.writeValue(new Uint8Array(keyCommand));

// Send unlock command
const unlockCommand = prepareBluetoothBytes(receivedKey, 345678, [1,2], [0,0]);
await writeCharacteristic.writeValue(new Uint8Array(unlockCommand));
```

### Error Handling
**All IoT errors use graceful degradation**:
- No `throw` statements in user-facing code
- Toast notifications for user feedback
- Console logging for debugging (with emoji prefixes)
- Automatic modal closure with timeout

**Bluetooth-specific**:
| Error | Handling |
|-------|----------|
| `NotFoundError` | "Bluetooth disabled" toast |
| `NotAllowedError` | "Permission denied" toast |
| `User cancelled` | Silent exit (no error) |
| `SecurityError` | "HTTPS required" toast |
| `GATT/Service error` | "Bike unreachable" toast |

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... (add all env vars)
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_source=github&utm_campaign=pubbs)

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment
```bash
npm run build
# Upload .next, public, package.json, next.config.ts
# Run: npm install --production && npm start
```

---

## 🔒 Environment Variables

Create `.env.local` with the following:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# MSG91
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 🛠️ Development

### Key Scripts
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
```

### Testing Lock Operations
1. **GSM Locks**: Use Firebase Console to monitor real-time changes
2. **BLE Locks**: Enable Web Bluetooth in Chrome flags (`chrome://flags`)
3. **QR Codes**: Generate bike IDs (e.g., "BIKE001") or JSON station data

### Debugging
- Console logs use emoji prefixes: ✅ (success), ❌ (error), 🔓 (unlock), 📱 (BLE)
- Check Network tab for API calls
- Use Firebase Realtime Database debugger
- Enable React DevTools for component state

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules
- Use Prettier for formatting
- Add JSDoc comments for complex functions
- Write meaningful commit messages

---

## 🆘 Getting Help

### 📚 Documentation Resources

| Need Help With... | Check This Document |
|-------------------|---------------------|
| Setting up locally | [QUICK_START.md](QUICK_START.md) → "5-Minute Setup" |
| Deployment issues | [DEPLOYMENT.md](DEPLOYMENT.md) → "Troubleshooting" |
| API integration | [API_REFERENCE.md](API_REFERENCE.md) → Complete reference |
| Understanding features | This README → [Features](#-features) |
| Recent changes | [CHANGELOG.md](CHANGELOG.md) |
| Project overview | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |

### 🐛 Found a Bug?

1. Check [QUICK_START.md](QUICK_START.md) → "Common Issues"
2. Search [existing issues](https://github.com/Pawandasila/pubbs/issues)
3. Open a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Console logs (with emoji prefixes: ✅, ❌, 🔓, 📱)

### 💡 Have a Question?

- **Technical:** Open a [GitHub Discussion](https://github.com/Pawandasila/pubbs/discussions)
- **Security:** Email security@pubbs.com
- **General:** Open an issue with `question` label

### 📞 Support Contacts

- **GitHub Issues:** [github.com/Pawandasila/pubbs/issues](https://github.com/Pawandasila/pubbs/issues)
- **Documentation:** All guides in root directory
- **API Help:** See [API_REFERENCE.md](API_REFERENCE.md)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **[Next.js Team](https://nextjs.org/)** - Amazing React framework
- **[shadcn](https://ui.shadcn.com/)** - Beautiful UI components
- **[Firebase](https://firebase.google.com/)** - Real-time database
- **[Vercel](https://vercel.com/)** - Hosting platform
- **[Nordic Semiconductor](https://www.nordicsemi.com/)** - BLE UART protocol
- **Open Source Community** - For the amazing tools and libraries

---

<div align="center">

**📚 Complete Documentation Suite**

[Quick Start](QUICK_START.md) • [Deployment](DEPLOYMENT.md) • [API Reference](API_REFERENCE.md) • [Changelog](CHANGELOG.md) • [Summary](PROJECT_SUMMARY.md)

---

**Made with ❤️ by the Pubbs Team**

⭐ Star us on GitHub | 🐛 Report Issues | 💡 Suggest Features

</div>


