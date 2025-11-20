# Total Jamms - Spotify Playlist Manager

A modern React web application that connects to Spotify's API to search for music, create playlists, and manage your music collection with ease.

![Total Jamms Screenshot](./docs/screenshot.png)

## 🎵 Features

- **Spotify Integration**: Secure OAuth authentication with Spotify
- **Music Search**: Search Spotify's massive music library
- **Playlist Management**: Create, edit, and delete playlists
- **Smart Save**: Updates existing playlists instead of creating duplicates
- **Real-time Updates**: Automatic playlist refresh after changes
- **Track Management**: Add and remove tracks from playlists
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-token Refresh**: Seamless background token management

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Spotify Developer Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ollieadams23/jamming.git
   cd jamming
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify API**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://127.0.0.1:3000/public/index.html` to Redirect URIs
   - Copy your Client ID to `src/util/spotify.js`

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 How to Use

### For Users

1. **Login**: Click "Log in with Spotify" and authorize the app
2. **Search Music**: Use the search bar on the right to find tracks
3. **Create Playlists**: 
   - Click "+ New Playlist" to start fresh
   - Or click on an existing playlist to edit it
4. **Add Tracks**: Click the "+" button next to search results to add tracks
5. **Remove Tracks**: Click the "-" button next to playlist tracks to remove them
6. **Save Changes**: Click "Save to Spotify" (green tick appears when saved)
7. **Delete Playlists**: Click the delete button next to save (for existing playlists)

### Key UI Elements

- **Left Panel**: Your existing Spotify playlists
- **Right Panel**: Search functionality and playlist editor
- **Loading Indicators**: Shows when data is being fetched
- **Green Tick**: Indicates successful playlist save

## 🔧 Development Setup

### Project Structure
```
jamming/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── App/                 # Main application logic
│   │   ├── Profile/             # User authentication & profile
│   │   ├── Playlist/            # Playlist display & editing
│   │   ├── SearchBar/           # Music search interface
│   │   ├── SearchResults/       # Search results display
│   │   ├── Track/               # Individual track component
│   │   └── TrackList/           # Track list container
│   ├── util/
│   │   └── spotify.js           # Spotify API integration
│   ├── index.css                # Global styles
│   └── index.js                 # App entry point
└── README.md
```

### Key Technologies
- **React 18**: Frontend framework with hooks and class components
- **Spotify Web API**: Music data and playlist management
- **OAuth 2.0 PKCE**: Secure authentication without client secrets
- **CSS3**: Modern styling with flexbox and responsive design
- **Local Storage**: Token persistence and caching

### Development Commands
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production
npm run eject      # Eject from Create React App (not recommended)
```

## 🔐 Authentication Flow

The app uses Spotify's OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication:

1. User clicks login → Redirected to Spotify
2. User authorizes app → Redirected back with authorization code
3. Code exchanged for access token → Token stored locally
4. Token automatically refreshes before expiration
5. API calls use Bearer token authentication

## 🎯 Core Functionality

### Playlist Operations
- **Create**: New playlists are created on Spotify
- **Update**: Existing playlists are modified (tracks added/removed)
- **Delete**: Playlists are removed from user's Spotify account
- **Load**: Click any playlist to load its tracks for editing

### Search & Discovery
- Real-time search through Spotify's catalog
- Results include track name, artist, album
- Preview URLs available (when provided by Spotify)

### State Management
- Centralized state in App component
- Real-time UI updates
- Optimistic UI updates with error handling

## 🛠️ Configuration

### Spotify API Setup
1. Edit `src/util/spotify.js`
2. Update `CLIENT_ID` with your Spotify app's client ID
3. Ensure redirect URI matches your Spotify app settings
4. For production, update `REDIRECT_URI` to your deployed URL

### Environment Variables (Optional)
Create a `.env` file in the root directory:
```env
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
REACT_APP_REDIRECT_URI=your_redirect_uri_here
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Surge.sh
```bash
npm install -g surge
npm run build
cd build
surge
```

### Deploy to Netlify/Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Update Spotify redirect URI to your deployed URL

## 🔍 Troubleshooting

### Common Issues

**Login doesn't work:**
- Check CLIENT_ID in spotify.js
- Verify redirect URI in Spotify app settings
- Clear browser cache and localStorage

**Playlists don't load:**
- Check browser console for errors
- Verify Spotify app permissions include playlist scopes
- Try logging out and back in

**Token expired errors:**
- App should auto-refresh tokens
- If persisting, clear localStorage and re-login

### Debug Mode
Open browser Developer Tools → Console to see detailed logging during authentication and API calls.

## 📝 API Reference

### Spotify Scopes Required
- `user-read-private`: Access user profile information
- `user-read-email`: Access user email
- `playlist-read-private`: Read private playlists
- `playlist-read-collaborative`: Read collaborative playlists
- `playlist-modify-public`: Modify public playlists
- `playlist-modify-private`: Modify private playlists

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Create React App](https://create-react-app.dev/)
- [React Documentation](https://reactjs.org/)

## 📞 Support

For support, email your-email@example.com or create an issue on GitHub.

---

**Made with ❤️ and React**
