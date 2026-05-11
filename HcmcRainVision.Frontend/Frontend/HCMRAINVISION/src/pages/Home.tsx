/**
 * Home Page – cameras and weather from API (GET /api/camera, GET /api/weather/latest)
 */
import { useState, useMemo } from 'react';
import MapView from '../components/MapView';
import TimeSlider from '../components/TimeSlider';
import Legend from '../components/Legend';
import Header from '../components/Header';
import CameraList from '../components/CameraList';
import CameraDetailPanel from '../components/CameraDetailPanel';
import FavoritesSection from '../components/FavoritesSection';
import CheckRouteDrawer from '../components/CheckRouteDrawer';
import HomeLoadingSkeleton from '../components/HomeLoadingSkeleton';
import { Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useCamerasAndWeather } from '../hooks/useCamerasAndWeather';
import type { RainDataPoint, RainFilter } from '../types';
import { RAIN_LEVEL_CONFIG } from '../constants';

const SINGLE_TIMESTAMP = 'latest';

export default function Home() {
  const { cameras, rainData: currentRainData, heatmapPoints, districts, loading, error, refetch } = useCamerasAndWeather();
  const timestamps = useMemo(() => [SINGLE_TIMESTAMP], []);

  const [currentTimestamp, setCurrentTimestamp] = useState<string>(SINGLE_TIMESTAMP);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [rainFilter, setRainFilter] = useState<RainFilter>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [checkRouteOpen, setCheckRouteOpen] = useState(false);

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          camera.name.toLowerCase().includes(query) ||
          camera.address.toLowerCase().includes(query) ||
          camera.ward.toLowerCase().includes(query) ||
          camera.district.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (districtFilter !== 'all' && camera.district !== districtFilter) return false;
      if (rainFilter !== 'all') {
        const rainPoint = currentRainData.find((p) => p.id === camera.id);
        const hasRain = rainPoint?.rainLevel != null && rainPoint.rainLevel > RAIN_LEVEL_CONFIG.NO_RAIN;
        if (rainFilter === 'rain' && !hasRain) return false;
        if (rainFilter === 'no-rain' && hasRain) return false;
      }
      return true;
    });
  }, [cameras, searchQuery, districtFilter, rainFilter, currentRainData]);

  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return cameras.find((c) => c.id === selectedCameraId) ?? null;
  }, [selectedCameraId, cameras]);

  const selectedCameraRainData = useMemo((): RainDataPoint | null => {
    if (!selectedCameraId) return null;
    return currentRainData.find((p) => p.id === selectedCameraId) ?? null;
  }, [selectedCameraId, currentRainData]);

  const camerasWithRain = useMemo(() => {
    return currentRainData.filter((p) => p.rainLevel > RAIN_LEVEL_CONFIG.NO_RAIN).length;
  }, [currentRainData]);

  const { isAuthenticated } = useAuth();

  const handleCameraSelect = (cameraId: string) => {
    setSelectedCameraId(cameraId);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
  };

  if (loading && cameras.length === 0) {
    return <HomeLoadingSkeleton />;
  }

  if (error && cameras.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-4 [background-image:radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.1)_1px,transparent_0)] [background-size:20px_20px]">
        <p className="max-w-md text-center text-red-600 animate-fade-in">{error}</p>
        <Button type="button" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onSearchChange={setSearchQuery}
        onDistrictFilterChange={setDistrictFilter}
        onRainFilterChange={setRainFilter}
        districts={districts}
        totalCameras={cameras.length}
        camerasWithRain={camerasWithRain}
        onOpenCheckRoute={() => setCheckRouteOpen(true)}
      />

      <main className="flex-1 flex overflow-hidden">
        <div className={`hidden sm:flex sm:flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-0' : 'w-80 lg:w-96'
        }`}>
          {isAuthenticated && !isSidebarCollapsed && (
            <FavoritesSection onCameraSelect={handleCameraSelect} />
          )}
          <div className="flex-1 min-h-0 flex flex-col">
            <CameraList
              cameras={filteredCameras}
              rainData={currentRainData}
              selectedCameraId={selectedCameraId}
              onCameraSelect={handleCameraSelect}
              searchQuery={searchQuery}
              districtFilter={districtFilter}
              rainFilter={rainFilter}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            <MapView
              rainData={currentRainData}
              cameras={filteredCameras}
              selectedCameraId={selectedCameraId}
              onCameraClick={handleCameraSelect}
              heatmapPoints={heatmapPoints}
              showHeatmap={showHeatmap}
            />
            <Legend showHeatmap={showHeatmap} onToggleHeatmap={setShowHeatmap} />
          </div>
          <TimeSlider
            currentTimestamp={currentTimestamp}
            timestamps={timestamps}
            onTimestampChange={setCurrentTimestamp}
          />
        </div>
      </main>

      <CameraDetailPanel
        camera={selectedCamera}
        cameraId={selectedCameraId}
        rainData={selectedCameraRainData}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
      />

      <CheckRouteDrawer isOpen={checkRouteOpen} onClose={() => setCheckRouteOpen(false)} />

      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="fixed bottom-20 right-4 sm:hidden z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle camera list"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {!isSidebarCollapsed && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={() => setIsSidebarCollapsed(true)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-40 sm:hidden shadow-2xl flex flex-col">
            {isAuthenticated && (
              <FavoritesSection
                onCameraSelect={(id) => {
                  handleCameraSelect(id);
                  setIsSidebarCollapsed(true);
                }}
              />
            )}
            <div className="flex-1 min-h-0">
              <CameraList
                cameras={filteredCameras}
                rainData={currentRainData}
                selectedCameraId={selectedCameraId}
                onCameraSelect={(id) => {
                  handleCameraSelect(id);
                  setIsSidebarCollapsed(true);
                }}
                searchQuery={searchQuery}
                districtFilter={districtFilter}
                rainFilter={rainFilter}
                isCollapsed={false}
                onToggleCollapse={() => setIsSidebarCollapsed(true)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
