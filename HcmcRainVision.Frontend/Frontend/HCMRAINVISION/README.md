# HCMC Rain Detection & Visualization System

A real-time rain detection and visualization web application for Ho Chi Minh City, displaying rain coverage across the city using traffic camera-based AI detection.

## 🌟 Features

- **Interactive Map**: View camera locations on an interactive map with rain level indicators
- **Real-time Visualization**: See rain status across different districts in HCMC
- **Time Navigation**: Navigate through historical rain data with a time slider (2 hours, 5-minute intervals)
- **Search & Filter**: 
  - Search cameras by name or address
  - Filter by district
  - Filter by rain status (all/rain/no-rain)
- **Camera Details**: View detailed information about each camera including:
  - Camera location and address
  - Current rain status
  - Video feed placeholder
  - Recent history
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS v4** - Styling
- **Leaflet** + **React-Leaflet** - Interactive maps
- **OpenStreetMap** - Map tiles

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CameraDetailPanel.tsx
│   ├── CameraList.tsx
│   ├── Header.tsx
│   ├── Legend.tsx
│   ├── MapView.tsx
│   └── TimeSlider.tsx
├── constants/          # Application constants
│   └── index.ts
├── data/               # Mock data and data utilities
│   └── mockRainData.ts
├── pages/              # Page components
│   └── Home.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/HcmcRainVision.Frontend.git
cd HcmcRainVision.Frontend/Frontend/HCMRAINVISION
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📦 Deployment

This project is configured for automatic deployment to GitHub Pages. See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

### Quick Deploy Steps

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings (Source: GitHub Actions)
3. The workflow will automatically build and deploy on push to `main` branch

**Live URL**: `https://YOUR_USERNAME.github.io/HcmcRainVision.Frontend/`

## 🎨 Features Overview

### Map View
- Interactive map centered on Ho Chi Minh City
- Color-coded markers:
  - 🔴 Red: Heavy rain
  - 🟡 Yellow: Light rain
  - ⚪ Gray: No rain
- Click markers to view camera details
- Hover effects and popups

### Camera List
- Sidebar with all cameras
- Real-time filtering
- Search functionality
- Collapsible on desktop
- Full-screen overlay on mobile

### Time Slider
- Navigate through last 2 hours
- 5-minute intervals (25 steps)
- Previous/Next controls
- "Latest" button to jump to current time

### Camera Detail Panel
- Bottom sheet (mobile) / Sidebar (desktop)
- Camera information
- Rain status with icons
- Video feed placeholder
- Recent history

## 🔧 Configuration

### Constants

Edit `src/constants/index.ts` to modify:
- Map center coordinates
- Time range settings
- Camera count
- Rain level probabilities

### Mock Data

The application currently uses mock data. To integrate with a real API:
1. Replace functions in `src/data/mockRainData.ts`
2. Update API endpoints
3. Adjust data structures if needed

## 📝 Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting configured
- **JSDoc**: Function documentation
- **Component-based**: Modular React components
- **Constants**: Centralized configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet for map functionality
- TailwindCSS for styling utilities

---

**Note**: This is currently a frontend-only application with mock data. Backend API integration is planned for future releases.
