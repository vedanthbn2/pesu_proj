"use client";

import React, { useEffect, useState } from "react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NewNotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userJSON = localStorage.getItem("user");
        const user = userJSON ? JSON.parse(userJSON) : null;
        if (!user) {
          setNotifications([]);
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/notifications?userId=${user.id}`);
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="p-8">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="p-8">No notifications found.</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <ul className="space-y-4">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-4 border rounded ${
              notification.read ? "bg-gray-100" : "bg-white font-semibold"
            }`}
          >
            <p>{notification.message}</p>
            <small className="text-gray-500">
              {new Date(notification.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewNotificationPage;
