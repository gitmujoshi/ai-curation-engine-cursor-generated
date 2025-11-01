# AI Curation Engine Management Interface

A comprehensive React/Next.js application for managing AI content curation rules and child profile management by parents.

## ✅ Real BAML Integration

**This project now includes a real BoundaryML (BAML) integration** - implemented using the actual BAML SDK from their official GitHub repository. The integration includes:

1. **Real BAML Language**: Uses actual `.baml` files with proper BAML syntax
2. **Generated Python Client**: Uses `baml-cli` to generate real Python client code
3. **Local LLM Support**: Configured for Ollama/Llama 3.2 local inference
4. **Complete Logging**: Full BAML Collector integration for detailed AI activity tracking

For more details, see the [BAML Integration Documentation](../../../../docs/guides/BAML_README.md).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development servers (backend + frontend)
npm run dev:full

# Or start individually:
npm run backend  # Backend on port 3001
npm run dev      # Frontend on port 3000
```

## 🏗️ Project Structure

```
curation-engine-ui/
├── components/           # Reusable React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard widgets
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── common/          # Common UI components
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── onboarding/     # User onboarding
├── backend/             # Express.js backend
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── services/       # Business logic
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── store/               # Zustand state management
└── styles/              # CSS/styling files
```

## 🎯 Key Features

### For Parents
- **Child Profile Management**: Create and manage multiple child profiles
- **Age-Appropriate Settings**: Configure content filtering based on child's age
- **Content Rules**: Set custom content filtering rules
- **Activity Monitoring**: View child's content consumption patterns
- **Safety Reports**: Weekly safety and content reports

### For Administrators
- **Algorithm Management**: Configure and deploy content curation algorithms
- **Compliance Monitoring**: Track regulatory compliance across jurisdictions
- **Performance Analytics**: Monitor system performance and accuracy
- **User Management**: Manage user accounts and permissions

### Core Functionality
- **User Onboarding**: Guided setup with age verification
- **Rule Configuration**: Visual rule builder for content filtering
- **Real-time Monitoring**: Live dashboard with system metrics
- **Multi-language Support**: Internationalization ready
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with app router
- **Material-UI (MUI)**: Component library
- **TypeScript**: Type-safe development
- **Zustand**: State management
- **React Query**: Data fetching and caching
- **Framer Motion**: Animations
- **Recharts**: Data visualization

### Backend
- **Express.js**: Node.js web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication
- **Joi**: Request validation
- **Winston**: Logging
- **Rate Limiting**: API protection

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/curation-engine
JWT_SECRET=your-super-secret-jwt-key

# External APIs (replace with real services)
CONTENT_ANALYSIS_API_URL=http://localhost:3002
REAL_CONTENT_API_KEY=your-real-api-key-here

# For real BoundaryML integration (when available)
BOUNDARYML_API_KEY=your-boundaryml-api-key
BOUNDARYML_API_URL=https://api.boundaryml.com

# Age Verification Service
AGE_VERIFICATION_API_URL=http://localhost:3003
AGE_VERIFICATION_API_KEY=your-age-verification-key

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Feature Flags
ENABLE_REAL_CONTENT_ANALYSIS=false
ENABLE_MOCK_DATA=true
```

## 📱 User Interface Screens

### 1. User Onboarding
- Welcome screen with feature overview
- Age verification with ZKP integration
- Profile creation (parent/child)
- Initial safety preferences setup

### 2. Parent Dashboard
- Child profiles overview
- Content activity summary
- Safety alerts and notifications
- Quick actions panel

### 3. Child Profile Management
- Create/edit child profiles
- Age-specific settings
- Content preferences
- Screen time controls

### 4. Curation Rules Builder
- Visual rule editor
- Predefined templates
- Custom rule creation
- Rule testing interface

### 5. Analytics & Reports
- Content consumption patterns
- Safety metrics
- Compliance reports
- Performance insights

## 🔒 Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Joi schema validation
- **Rate Limiting**: API endpoint protection
- **CORS**: Cross-origin request security
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with salt rounds

## 🌍 Compliance Support

- **GDPR**: Data minimization and consent management
- **COPPA**: Under-13 parental consent workflows
- **DPDPA**: India-specific under-18 consent requirements
- **Audit Trails**: Comprehensive logging for compliance

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Deployment

### Development
```bash
npm run dev:full
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Note**: This is a functional prototype. For production use, ensure proper security audits, performance testing, and compliance validation.
