# CornerGO POS

> High-performance desktop point-of-sale system built with Electron and Node.js

[![Electron](https://img.shields.io/badge/Electron-Latest-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

## 📋 Overview

CornerGO POS is a high-performance desktop point-of-sale application designed for retail environments. Built with Electron, it processes **400+ daily transactions** with **sub-second response times** through an optimized asynchronous queue architecture.

**Production Results:**

- ✅ **90% improvement** in checkout time (10s → 1s)
- ✅ **<1s response time** for transaction processing
- ✅ **7+ years** of production uptime
- ✅ **400+ daily transactions** processed reliably
- ✅ Fiscal compliance with Chilean tax authority (SII)

## ✨ Key Features

### ⚡ High-Performance Transaction Processing

- Sub-second response time for sales operations
- Asynchronous queue worker for background tasks
- Non-blocking UI for seamless user experience
- Optimized transaction flow with minimal latency
- Reliable queue management with retry logic

### 🖨️ Hardware Integration

- Custom EPSON POS printer integration (no official SDK)
- Transbank payment terminal integration
- Direct hardware communication protocols
- Error handling and automatic reconnection
- Receipt printing with customizable templates

### 💳 Payment Processing

- Transbank payment terminal support
- Multiple payment methods (cash, debit, credit)
- Transaction logging and verification
- Refund and cancellation handling
- Payment reconciliation

### 🧾 Invoice Management

- Automatic invoice generation
- Fiscal compliance with SII (Chilean tax authority)
- Hourly polling for supplier invoice synchronization
- Electronic invoice integration
- Invoice printing and storage

### 📦 Inventory Integration

- Real-time stock updates
- Product lookup and scanning
- Price management
- Low-stock alerts
- Batch operations support

### 🔄 Background Processing

- Asynchronous queue architecture
- Background invoice processing
- Automatic SII synchronization
- Task prioritization and scheduling
- Graceful failure handling

### 🔒 Security Features

- User authentication and session management
- Role-based access control
- Transaction logging and audit trails
- Secure local data storage
- Network security protocols

## 🛠️ Tech Stack

### Desktop Application

- **Framework:** Electron (Latest)
- **Runtime:** Node.js 18+
- **Backend:** Express.js 4.x
- **Database:** MongoDB 6.x
- **Architecture:** Asynchronous Queue Workers

### Hardware Integration

- **POS Printer:** EPSON (Custom Integration)
- **Payment Terminal:** Transbank (Custom Protocol)
- **Communication:** Serial/USB protocols

### External Services

- **Tax Authority:** SII (Chilean Tax Authority) API
- **Synchronization:** Hourly polling mechanism
- **Invoice Processing:** Background workers

### Development Tools

- **Package Manager:** npm/yarn
- **Node Version:** 18+ or 20+
- **Build Tools:** electron-builder
- **Process Management:** PM2 (optional)

## 📁 Project Structure

```
cornergo-pos-public/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.js       # Main entry point
│   │   ├── queue/         # Background queue workers
│   │   └── hardware/      # Hardware integration modules
│   │       ├── printer.js # EPSON printer integration
│   │       └── transbank.js # Payment terminal
│   ├── renderer/          # Electron renderer process
│   │   ├── components/    # UI components
│   │   ├── views/         # Application views
│   │   └── assets/        # Static assets
│   ├── api/               # Express API routes
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Business logic
│   │   └── middleware/    # Express middleware
│   ├── models/            # MongoDB models
│   │   ├── Sale.js        # Sales transactions
│   │   ├── Product.js     # Product catalog
│   │   └── Invoice.js     # Invoice records
│   └── services/          # Business services
│       ├── sii.js         # SII synchronization
│       └── queue.js       # Queue management
├── config/                # Configuration files
├── dist/                  # Build output
├── package.json           # Project dependencies
└── README.md             # This file
```

## 🏗️ Architecture

### Asynchronous Queue System

- Background workers for heavy operations
- Non-blocking transaction processing
- Priority-based task scheduling
- Automatic retry mechanism for failed tasks
- Queue persistence for reliability

### Hardware Communication

- Direct serial/USB communication protocols
- Custom integration without official SDKs
- Error handling and device recovery
- Automatic reconnection logic
- Device status monitoring

### Data Synchronization

- Hourly polling to SII for invoice updates
- Real-time inventory synchronization
- Conflict resolution strategies
- Offline mode with queue persistence
- Automatic sync when connection restored

### Transaction Flow

```
User Action → UI (Electron) → Local Validation → Queue Worker
                                                      ↓
Invoice Print ← Hardware ← Transaction Complete ← Database
                                                      ↓
Background Sync ← Queue Worker → SII API → Tax Authority
```

## 🔐 Security Features

- ✅ Local authentication with encrypted credentials
- ✅ Role-based access control (RBAC)
- ✅ Transaction audit logging
- ✅ Secure hardware communication
- ✅ Encrypted sensitive data storage
- ✅ Session management and timeouts
- ✅ Input validation and sanitization

## 📊 Performance Optimizations

- ⚡ Asynchronous queue architecture for non-blocking operations
- ⚡ Local MongoDB for fast data access
- ⚡ Optimized hardware communication protocols
- ⚡ Memory-efficient electron configuration
- ⚡ Lazy loading of heavy components
- ⚡ Connection pooling for database operations
- ⚡ Caching strategies for frequently accessed data

## 🎯 Production Highlights

### Performance Metrics

- **Transaction Speed:** <1 second average response time
- **Daily Volume:** 400+ transactions processed
- **Uptime:** 7+ years in continuous production
- **Checkout Time:** 90% improvement (10s → 1s)
- **Error Rate:** <0.1% transaction failures

### Reliability

- Automatic error recovery
- Queue persistence during crashes
- Hardware auto-reconnection
- Offline operation capability
- Data integrity verification

### Fiscal Compliance

- SII electronic invoice integration
- Automatic synchronization (hourly)
- Complete audit trail
- Tax reporting compliance
- Invoice validation and verification

## 📄 License

Private and Proprietary - All rights reserved.

## 👨‍💻 Author

**Franco Hormazabal**

- Email: francohormazabal@gmail.com
- GitHub: [@francohs](https://github.com/francohs)
- LinkedIn: [franco-hormazabal](https://linkedin.com/in/franco-hormazabal)

## 🙏 Acknowledgments

Built with:

- [Electron](https://www.electronjs.org/) - Build cross-platform desktop apps
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Fast, unopinionated web framework
- [MongoDB](https://www.mongodb.com/) - Document database
- Custom hardware integrations for EPSON and Transbank

---

<div align="center">

**Built with ❤️ by Franco Hormazabal**

_Production-proven system with 7+ years of uptime and 400+ daily transactions_

</div>
