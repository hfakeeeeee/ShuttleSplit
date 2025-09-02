# ShuttleSplit - Badminton Court Fee Calculator

A modern, luxurious web application for calculating and managing badminton court fees among players. Perfect for badminton clubs and groups who need to split costs fairly.

## Features

### 🏸 Player Management
- **Fixed Registration Players**: Regular members with standard pricing
- **Transient Players**: Temporary players who pay an additional 10,000₫ per session
- Easy add/remove player functionality
- Player type categorization

### 💰 Fee Calculation
- **Court Fee**: Basic court rental cost per session
- **Shuttle Fee**: Shuttlecock cost × number of shuttlecocks used
- **Water Fee**: Water/refreshment costs per session
- **Additional Fees**: Any extra costs (equipment, facilities, etc.)
- Automatic cost distribution among all players
- Fair pricing with transient surcharge handling

### 📊 Session Management
- Multiple session support
- Individual session cost breakdown
- Real-time calculation updates
- Session-by-session cost tracking

### 💳 Payment Integration
- **QR Code Generation**: Automatic QR code for easy payment transfers
- **Bank Details**: Configurable payment information
- **Total Summary**: Complete cost breakdown per player
- **Payment Information**: Detailed payment instructions

### 🎨 Modern Interface
- **Luxurious Design**: Modern gradient backgrounds and glass-morphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Interactive Elements**: Smooth animations and hover effects
- **Professional Typography**: Clean, modern font choices
- **Intuitive UX**: Easy-to-use interface with clear navigation

### 🔧 Additional Features
- **Local Storage**: Automatic data persistence
- **Real-time Updates**: Instant calculation refresh
- **Export Capabilities**: QR code generation for payments
- **Settings Management**: Configurable bank details
- **Keyboard Shortcuts**: Ctrl+S to save, Escape to close modals

## How It Works

1. **Setup Session Details**: Enter court fee, shuttlecock price & quantity, water fee, and any additional costs
2. **Add Players**: Add fixed registration players and transient players
3. **Create Sessions**: Add multiple playing sessions
4. **View Summary**: See individual cost breakdown for each player
5. **Generate QR Code**: Get payment QR code with bank details

## Pricing Logic

- **Base Cost**: Total session cost divided equally among all players
- **Transient Surcharge**: Transient players pay an additional 10,000₫ per session
- **Fixed Player Adjustment**: Fixed players pay slightly less when transient players are present
- **Fair Distribution**: Ensures fair cost sharing while maintaining the transient surcharge

## Technology Stack

- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Advanced styling with CSS Grid, Flexbox, and custom properties
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **QR Code Library**: QR code generation for payment integration
- **Font Awesome**: Professional icon set
- **Google Fonts**: Inter font family for modern typography

## File Structure

```
ShuttleSplit/
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## Usage

1. Open `index.html` in any modern web browser
2. Set up your session costs in the "Session Settings" section
3. Add players using the "Add Player" button
4. Create sessions using the "Add Session" button
5. Configure bank details in settings (gear icon)
6. View the summary and use the QR code for payments

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Local Storage

The application automatically saves all data to browser local storage:
- Player information
- Session data
- Bank settings
- Calculation preferences

## Customization

### Colors and Themes
The CSS uses custom properties (CSS variables) for easy theme customization. Modify the `:root` section in `styles.css` to change colors.

### Currency Format
The application is configured for Vietnamese Dong (₫). To change currency, modify the `formatCurrency` method in `script.js`.

### Transient Surcharge
The 10,000₫ surcharge for transient players can be modified in the `calculatePlayerCosts` method.

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