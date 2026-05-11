/**
 * Header Component
 * Top navigation: title, filters, stats; when logged in: greeting + notification bell
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CloudRain,
  Menu,
  X,
  Search,
  ChevronDown,
  Route,
  Shield,
  User,
  LogOut,
  Video,
} from 'lucide-react';
import type { RainFilter } from '../types';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { cn } from './ui/cn';

interface HeaderProps {
  onSearchChange: (search: string) => void;
  onDistrictFilterChange: (district: string) => void;
  onRainFilterChange: (rainFilter: RainFilter) => void;
  districts: string[];
  totalCameras: number;
  camerasWithRain: number;
  onOpenCheckRoute?: () => void;
}

const navBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]';

export default function Header({
  onSearchChange,
  onDistrictFilterChange,
  onRainFilterChange,
  districts,
  totalCameras,
  camerasWithRain,
  onOpenCheckRoute,
}: HeaderProps) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [rainFilter, setRainFilter] = useState<RainFilter>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDistrictFilter(value);
    onDistrictFilterChange(value);
  };

  const handleRainFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RainFilter;
    setRainFilter(value);
    onRainFilterChange(value);
  };

  const selectClass =
    'block w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm shadow-sm transition-all duration-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto w-full max-w-7xl">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25">
                <CloudRain className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="truncate bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-3xl">
                  HCMC Rain Detection System
                </h1>
                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                  Live micro-weather rain visualization across Ho Chi Minh City
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden items-center gap-2 lg:flex">
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-right shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
                  <Video className="h-3.5 w-3.5" aria-hidden />
                  Total
                </div>
                <div className="text-lg font-semibold tabular-nums text-gray-900">{totalCameras}</div>
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50/90 px-3 py-2 text-right shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-end gap-1.5 text-xs text-red-600/90">
                  <CloudRain className="h-3.5 w-3.5" aria-hidden />
                  With rain
                </div>
                <div className="text-lg font-semibold tabular-nums text-red-600">{camerasWithRain}</div>
              </div>
            </div>

            {/* Check route + Auth */}
            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              {onOpenCheckRoute && (
                <button
                  type="button"
                  onClick={onOpenCheckRoute}
                  className={cn(navBtn, 'hidden text-gray-700 hover:bg-gray-100 sm:inline-flex')}
                >
                  <Route className="h-4 w-4" aria-hidden />
                  <span className="hidden md:inline">Kiểm tra đường đi</span>
                  <span className="md:hidden">Đường đi</span>
                </button>
              )}
              {isAuthenticated && user ? (
                <>
                  <span className="hidden max-w-[10rem] truncate text-sm text-gray-700 lg:inline">
                    Xin chào, <span className="font-semibold text-gray-900">{user.name}</span>
                  </span>
                  <NotificationDropdown />
                  {user.role != null && String(user.role).toLowerCase() === 'admin' && (
                    <Link
                      to="/admin"
                      className={cn(navBtn, 'hidden text-sky-700 hover:bg-sky-50 sm:inline-flex')}
                    >
                      <Shield className="h-4 w-4" aria-hidden />
                      <span className="hidden lg:inline">Trang Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className={cn(navBtn, 'hidden text-gray-700 hover:bg-gray-100 sm:inline-flex')}
                  >
                    <User className="h-4 w-4" aria-hidden />
                    <span className="hidden lg:inline">Hồ sơ</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className={cn(navBtn, 'hidden text-gray-600 hover:bg-gray-100 sm:inline-flex')}
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    <span className="hidden lg:inline">Thoát</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ from: { pathname: location.pathname } }}
                    className={cn(navBtn, 'text-gray-700 hover:bg-gray-100')}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    className={cn(
                      navBtn,
                      'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm hover:from-sky-600 hover:to-blue-700',
                    )}
                  >
                    Đăng ký
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 lg:hidden"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div
          className={cn(
            'border-t border-gray-100 px-4 pb-4 pt-2 sm:px-6 lg:px-8',
            isMobileMenuOpen ? 'block animate-slide-down' : 'hidden lg:block',
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden />
                </div>
                <input
                  type="text"
                  placeholder="Search by camera name or address..."
                  value={search}
                  onChange={handleSearchChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm leading-5 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>
            <div className="relative sm:w-48">
              <select
                value={districtFilter}
                onChange={handleDistrictChange}
                className={selectClass}
              >
                <option value="all">All Districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
            </div>
            <div className="relative sm:w-40">
              <select
                value={rainFilter}
                onChange={handleRainFilterChange}
                className={selectClass}
              >
                <option value="all">All Status</option>
                <option value="rain">With Rain</option>
                <option value="no-rain">No Rain</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 lg:hidden">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold tabular-nums text-gray-900">{totalCameras}</span>
              <span className="text-gray-600">Rain:</span>
              <span className="font-semibold tabular-nums text-red-600">{camerasWithRain}</span>
            </div>
            {onOpenCheckRoute && (
              <button
                type="button"
                onClick={() => {
                  onOpenCheckRoute();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(navBtn, 'w-full justify-center border border-gray-200 bg-gray-50 text-gray-800 sm:hidden')}
              >
                <Route className="h-4 w-4" aria-hidden />
                Kiểm tra đường đi
              </button>
            )}
            {isAuthenticated && user && (
              <div className="flex flex-wrap gap-2 sm:hidden">
                {user.role != null && String(user.role).toLowerCase() === 'admin' && (
                  <Link
                    to="/admin"
                    className={cn(navBtn, 'flex-1 border border-sky-200 bg-sky-50 text-sky-800')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 shrink-0" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={cn(navBtn, 'flex-1 border border-gray-200 bg-white text-gray-800')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 shrink-0" />
                  Hồ sơ
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(navBtn, 'flex-1 border border-gray-200 bg-white text-gray-800')}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Thoát
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
