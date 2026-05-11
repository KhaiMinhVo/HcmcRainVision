import { Alert } from "../types";

export const mockAlerts: Alert[] = [
  {
    id: "alert1",
    title: "Heavy Rain Warning",
    message:
      "Heavy rainfall detected in District 1. Expected to continue for 2 hours.",
    area: "District 1",
    severity: "high",
    weatherStatus: "heavy",
    type: "warning",
    timestamp: new Date(Date.now() - 10 * 60000),
    isRead: false,
  },
  {
    id: "alert2",
    title: "Flooding Risk",
    message: "Potential flooding in Thu Duc area due to continuous heavy rain.",
    area: "Thu Duc City",
    severity: "high",
    weatherStatus: "heavy",
    type: "warning",
    timestamp: new Date(Date.now() - 25 * 60000),
    isRead: false,
  },
  {
    id: "alert3",
    title: "Moderate Rain",
    message: "Moderate Rain expected in District 3 for the next hour.",
    area: "District 3",
    severity: "medium",
    weatherStatus: "medium",
    type: "alert",
    timestamp: new Date(Date.now() - 45 * 60000),
    isRead: true,
  },
  {
    id: "alert4",
    title: "Camera Offline",
    message: "Camera CAM-003 at Điện Biên Phủ has gone offline.",
    area: "District 3",
    severity: "low",
    weatherStatus: "none",
    type: "system",
    timestamp: new Date(Date.now() - 2 * 3600000),
    isRead: true,
  },
  {
    id: "alert5",
    title: "Rain Subsiding",
    message: "Rain intensity decreasing in District 7.",
    area: "District 7",
    severity: "low",
    weatherStatus: "light",
    type: "info",
    timestamp: new Date(Date.now() - 3 * 3600000),
    isRead: true,
  },
];

export const getUnreadCount = (): number =>
  mockAlerts.filter((a) => !a.isRead).length;
