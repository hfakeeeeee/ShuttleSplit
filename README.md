# ShuttleSplit - Badminton Court Fee Calculator

A modern, luxurious web application for calculating and managing badminton court fees among players. Perfect for badminton clubs and groups who need to split costs fairly.

## Firebase Setup

This application uses Firebase for backend services including Firestore database and Authentication. Follow these steps to set up your Firebase project:

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "ShuttleSplit")
4. (Optional) Enable Google Analytics if desired
5. Click **"Create project"** and wait for it to complete

### Step 2: Enable Firestore Database

1. In your Firebase project, navigate to **Build** → **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose a starting mode:
   - **Production mode**: More secure (recommended for production)
   - **Test mode**: Less secure but easier for development (change rules later)
4. Select a Firestore location (choose closest to your users, cannot be changed later)
5. Click **"Enable"**

### Step 3: Set Up Firestore Security Rules

After enabling Firestore, set up security rules to protect your data:

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to players collection
    match /players/{playerId} {
      allow read, write: if true;  // Adjust based on your auth requirements
    }
    
    // Allow read/write to sessions collection
    match /sessions/{sessionId} {
      allow read, write: if true;  // Adjust based on your auth requirements
    }
    
    // Allow read/write to plannedSessions collection
    match /plannedSessions/{sessionId} {
      allow read, write: if true;  // Adjust based on your auth requirements
    }
    
    // Allow read/write to meta/settings document
    match /meta/settings {
      allow read, write: if true;  // Adjust based on your auth requirements
    }
    
    // For authenticated users only (optional):
    // allow read, write: if request.auth != null;
  }
}
```

3. Click **"Publish"**

**Note:** The rules above allow unrestricted access. For production, consider restricting access based on authentication:
```javascript
allow read, write: if request.auth != null;
```

### Step 4: Enable Firebase Authentication (Optional)

If you want to use the authentication features:

1. Navigate to **Build** → **Authentication** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable authentication providers you want to use:
   - **Email/Password**: Enable this for basic email authentication
   - **Google**: Enable for Google sign-in (requires additional setup)
   - Other providers as needed
5. Click **"Save"**

### Step 5: Get Firebase Configuration

1. In your Firebase project, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** `</>` to add a web app
5. Register your app with a nickname (e.g., "ShuttleSplit Web")
6. (Optional) Set up Firebase Hosting if desired
7. Click **"Register app"**
8. Copy the Firebase configuration values from the `firebaseConfig` object

### Step 6: Create Environment File

Create a `.env` file in the project root directory with your Firebase configuration:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Admin Configuration
REACT_APP_ADMIN_PASSWORD=your_admin_password
```

**Important:** 
- Never commit the `.env` file to version control
- The `.env` file should be listed in `.gitignore`
- Restart the development server after changing environment variables

### Step 7: Initialize Firestore Collections

The application will automatically create collections when you first add data, but you can manually create them:

1. In Firestore Database, click **"Start collection"**
2. Create the following collections:
   - `players` - Store player information
   - `sessions` - Store session data
   - `plannedSessions` - Store planned future sessions
   - `meta` - For app-wide settings (create a document called `settings`)

## Data Model

The application uses the following Firestore structure:

### Collection: `players`
- **Document ID**: Numeric player ID as string (e.g., "1", "2", "3")
- **Fields**:
  - `id` (number): Player ID
  - `name` (string): Player name
  - `hasPaid` (boolean): Payment status

### Collection: `sessions`
- **Document ID**: Numeric session ID as string (e.g., "1", "2", "3")
- **Fields**:
  - `id` (number): Session ID
  - `name` (string): Session name
  - `date` (string, optional): Session date
  - `participants` (array of numbers): Player IDs who participated
  - `additionalFee` (number, optional): Extra fee for this session
  - `waterFee` (number, optional): Water fee for this session

### Collection: `plannedSessions`
- **Document ID**: Auto-generated by Firestore
- **Fields**:
  - `name` (string): Session name
  - `date` (string): Planned session date
  - `participants` (array of numbers): Registered player IDs
  - `walkInGuests` (number): Number of walk-in guests
  - `createdAt` (timestamp): Creation timestamp
  - `additionalFee` (number, optional): Extra fee for this session
  - `waterFee` (number, optional): Water fee for this session

### Document: `meta/settings`
- **Fields**:
  - `bankName` (string): Bank name for payments
  - `accountNumber` (string): Bank account number
  - `accountHolder` (string): Account holder name
  - `momoNumber` (string): MoMo phone number
  - `momoQRImage` (string): Base64 encoded QR image or URL
  - `courtFee` (number): Default court fee per session
  - `shuttlecockPrice` (number): Price per shuttlecock
  - `shuttlecockCount` (number): Number of shuttlecocks used per session

## Firebase Troubleshooting

### Common Issues:

1. **"Permission denied" errors**: Check your Firestore security rules
2. **"Firebase not initialized"**: Verify your `.env` file has correct values and restart the dev server
3. **Authentication errors**: Make sure Email/Password authentication is enabled in Firebase Console
4. **CORS errors**: This usually happens in development; Firebase hosting resolves this in production

## Development
Install dependencies:

```
npm install
```

Run:

```
npm start
```

## Features

### 🏸 Player Management
- Easy add/remove player functionality
- Grid-based player view with inline name editing
- Payment tracking with paid/unpaid status indicators in the Summary tab
- Maximum 13 regular registered players for optimal court usage

### 💰 Fee Calculation
- **Court Fee**: Basic court rental cost per session
- **Shuttle Fee**: Shuttlecock cost × number of shuttlecocks used
- **Water Fee**: Water/refreshment costs per session (can vary per session)
- **Additional Fees**: Any extra costs per session (equipment, facilities, etc.)
- Automatic cost distribution among session participants
- Fair pricing with per-session fee allocation

### 📊 Session Management
- Multiple session support
- Individual session cost breakdown
- Real-time calculation updates
- Session-by-session cost tracking
- **Session Planning**: Pre-register planned sessions with dates
- **Walk-in Guest Support**: Track non-registered players per session
- Participant selection for each session

### 💳 Payment Integration
- **QR Code Generation**: Automatic QR code for easy payment transfers
- **Bank Details**: Configurable payment information (bank account and MoMo)
- **Total Summary**: Complete cost breakdown per player
- **Payment Information**: Detailed payment instructions with QR codes

### 🎨 Modern Interface
- **Theme Support**: Light and dark mode toggle with persistent preferences
- **Luxurious Design**: Modern gradient backgrounds and glass-morphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations and hover effects
- **Professional Typography**: Clean, modern font choices
- **Intuitive UX**: Easy-to-use interface with clear tab navigation

### 🔐 Security & Authentication
- **Firebase Authentication**: Secure user login/logout system
- **Settings Lock**: Password-protected configuration changes
- **Admin Password**: Environment-based admin access control

### ☁️ Cloud Integration
- **Firebase/Firestore**: Real-time cloud database for all data
- **Automatic Sync**: Data synchronized across devices
- **Persistent Storage**: Cloud-based data storage with local fallback
- **Real-time Updates**: Instant updates across all connected clients

### 🔧 Additional Features
- **Keyboard Shortcuts**: 
  - Ctrl+S to save
  - Escape to close modals
  - Ctrl+1/2/3 for quick tab switching
- **Collapsible Sections**: Expandable/collapsible UI sections for better organization
- **Export Capabilities**: QR code generation for payments
- **Date Management**: Calendar-based session date selection

## How It Works

1. **Authentication**: Log in with Firebase authentication (if enabled)
2. **Setup Session Details**: Enter court fee, shuttlecock price & quantity, water fee, and any additional costs
3. **Add Players**: Add players (up to 13 regular players) and manage them in the grid view
4. **Plan Sessions**: Use the Register tab to pre-plan sessions with specific dates
5. **Select Participants**: For each session, choose which players attended and add walk-in guests if any
6. **View Summary**: See individual cost breakdown for each player in the Summary tab
7. **Generate QR Code**: Get payment QR codes with bank/MoMo details for easy payment collection
8. **Track Payments**: Mark players as paid/unpaid to monitor payment status

## Pricing Logic

- **Per-Session Distribution**: Each session's total cost is calculated individually
- **Participant-Based**: Costs are only allocated to players who participated in each specific session
- **Walk-in Support**: Non-registered walk-in guests are counted in cost distribution
- **Session Variations**: Water fees and additional fees can vary per session
- **Fair Split**: Total session cost divided equally among all participants (registered + walk-ins)
- **Payment Tracking**: Track payment status for each player (paid/unpaid) in the Summary tab

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development for better code quality
- **Firebase**: Backend-as-a-Service platform
  - **Firestore**: Real-time NoSQL cloud database
  - **Authentication**: Secure user authentication system
- **QR Code Library**: Payment QR code generation
- **React Scripts**: Build tooling and development server
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and custom properties
- **Font Awesome**: Professional icon set (via CDN)

## File Structure

```
ShuttleSplit/
├── public/                 # Public assets
│   ├── index.html         # HTML entry point
│   ├── manifest.json      # PWA manifest
│   └── images/            # Image assets
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── AuthContext.tsx          # Authentication provider
│   │   ├── ThemeProvider.tsx        # Theme context provider
│   │   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   │   ├── Header.tsx               # App header
│   │   ├── Footer.tsx               # App footer
│   │   ├── Tabs.tsx                 # Tab navigation
│   │   ├── SummaryTab.tsx           # Summary & Payment tab
│   │   ├── RegisterTab.tsx          # Session planning tab
│   │   ├── SettingsTab.tsx          # Settings & Configuration tab
│   │   ├── PlayersManagement.tsx    # Player grid management
│   │   ├── SessionsManagement.tsx   # Session list management
│   │   ├── Summary.tsx              # Payment summary component
│   │   ├── SettingsModal.tsx        # Bank settings modal
│   │   ├── SessionSettings.tsx      # Session cost settings
│   │   ├── SessionParticipantsModal.tsx  # Participant selection
│   │   ├── CollapsibleSection.tsx   # Collapsible UI component
│   │   ├── Notification.tsx         # Toast notifications
│   │   └── CodeVaultTab.tsx         # System diagnostics (hidden)
│   ├── services/          # Service layer
│   │   └── firestore.ts   # Firestore database operations
│   ├── firebase.ts        # Firebase configuration
│   ├── hooks.ts           # Custom React hooks
│   ├── utils.ts           # Utility functions
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   ├── App.css            # App styles
│   └── index.tsx          # React entry point
├── .env                   # Environment variables (Firebase config)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Documentation
```

## Usage

1. **Setup Firebase**: Configure your Firebase project and add credentials to `.env`
2. **Install Dependencies**: Run `npm install`
3. **Start Development Server**: Run `npm start`
4. **Login** (if authentication is enabled): Use your Firebase credentials
5. **Configure Settings**: Set up session costs in the "Settings & Configuration" tab
6. **Unlock Settings** (if locked): Use the admin password to unlock configuration changes
7. **Add Players**: Add players using the "Add Player" button (max 13)
8. **Plan Sessions**: Go to "Register" tab and create planned sessions with dates
9. **Select Participants**: For each session, choose which players participated
10. **Configure Payment Details**: Set up bank/MoMo details in settings (gear icon)
11. **View Summary**: Check the "Summary & Payment" tab for cost breakdown and QR codes
12. **Track Payments**: Mark players as paid/unpaid in the summary
13. **Toggle Theme**: Use the theme toggle button for dark/light mode

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

(Modern browsers with ES6+ support and CSS Grid/Flexbox)

## Data Storage

The application uses a hybrid storage approach:

### Primary: Firebase/Firestore (Cloud)
- Player information
- Session data (both planned and actual sessions)
- App-wide settings
- Real-time synchronization across devices
- Persistent cloud storage

### Fallback: Local Storage (Browser)
- Theme preferences (`shuttleSplit_theme`)
- Temporary data cache
- Offline functionality support

## Customization

### Theme Customization
The application supports light and dark themes with automatic persistence. Users can toggle between themes using the theme toggle button in the header.

### CSS Variables
The CSS uses custom properties (CSS variables) for easy theme customization. Modify the `:root` and `[data-theme="dark"]` sections in CSS files to change colors.

### Firebase Configuration
Update the `.env` file with your Firebase project credentials to connect to your own Firebase instance.

### Admin Password
Set `REACT_APP_ADMIN_PASSWORD` in `.env` to customize the settings lock password.

### Currency Format
The application is configured for Vietnamese Dong (₫). To change currency, modify the `formatCurrency` function in [src/utils.ts](src/utils.ts).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**ShuttleSplit** - Making badminton cost sharing simple and fair! 🏸

## Deployment (GitHub Pages)

- **Prerequisites**: A GitHub repository with this project pushed to `main`.
- **Branch**: The site will be published from the `gh-pages` branch.

### One-time setup
- Ensure `homepage` is set and `gh-pages` is installed (already configured in `package.json`).
- A SPA fallback `public/404.html` is present (already added).
- GitHub Actions workflow `.github/workflows/deploy.yml` is included (already added).

### Manual deploy from local
- Run:

```bash
npm install
npm run deploy
```

This builds the project and pushes `build/` to the `gh-pages` branch.

### Automatic deploys (recommended)
- Push to `main`. The workflow builds and deploys automatically.
- Check deployment under the Actions tab.

### Enable GitHub Pages
- In your repository settings:
  - Pages → Source: Select `Deploy from a branch`
  - Branch: `gh-pages` / folder `/ (root)`

### Site URL
- Your site will be available at `https://<your-username>.github.io/<your-repo>/`.