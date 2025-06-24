"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IonIcon } from "@ionic/react";
import { menuOutline, closeOutline, location, mailOutline } from "ionicons/icons";
import logo from "../../assets/ELocate-s.png";
import { getUser, handleLogout } from "../sign-in/auth";

interface NavItemProps {
  label: string;
  isAdmin: boolean;
}

const NavItem = ({ label, isAdmin }: NavItemProps) => {
  // Map label to correct href path based on user role
  let href = "/";
  if (isAdmin) {
    switch (label) {
      case "Customers":
        href = "/admin/customers";
        break;
      case "Employees":
        href = "/admin/employees";
        break;
      case "User Feedback/Queries":
        href = "/admin/user-feedback-queries";
        break;
      case "E-Waste Requests":
        href = "/admin/pickup-requested";
        break;
      default:
        href = "/";
    }
  } else {
    switch (label) {
      case "Home":
        href = "/";
        break;
      case "My Requests":
        href = "/my-requests";
        break;
      case "Receiver Dashboard":
        href = "/pickup-requests";  // Updated to actual receiver dashboard page showing approved tasks
        break;
      case "Message":
        href = "/receiver/messages";
        break;
      default:
        href = `/${label.toLowerCase()}`;
    }
  }

  return (
    <li className="navbar-link">
      <Link href={href}>{label}</Link>
    </li>
  );
};

const Header = () => {
  const [user, setUser] = useState<null | { role?: string; username?: string; email?: string; id?: string }>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const pathname = usePathname();

  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  // const [locations, setLocation] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleToggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  useEffect(() => {
    document.documentElement.classList.remove("no-js");

    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.eyJ1Ijoic2h1ZW5jZSIsImEiOiJjbG9wcmt3czMwYnZsMmtvNnpmNTRqdnl6In0.vLBhYMBZBl2kaOh1Fh44Bw`
          )
            .then((response) => response.json())
            .then((data) => {
              const city = data.features[0].context.find((context: { id: string | string[] }) =>
                context.id.includes("place")
              ).text;
              const state = data.features[0].context.find((context: { id: string | string[] }) =>
                context.id.includes("region")
              ).text;
              setLocation(`${city}, ${state}`);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        },
        (error) => {
          console.error(error);
        },
        options
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsHeaderActive(true);
      } else {
        setIsHeaderActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Load user from localStorage on mount and on pathname change
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
    setIsUserLoaded(true);
  }, [pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || (!user.id && !user.role)) return;
      try {
        let url = "/api/notifications?";
        if (user.role === "receiver") {
          url += `receiverId=${user.id}`;
        } else {
          url += `userId=${user.id}`;
        }
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data);
          const unread = result.data.filter((notif: any) => !notif.read).length;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifications();
  }, [user]);

  // Removed notification fetching useEffect as notifications are removed


  if (!isUserLoaded) {
    // Optionally render nothing or a loading indicator while user is loading
    return null;
  }

  const toggleNavbar = () => {
    setIsNavbarActive(!isNavbarActive);
  };

  return (
    <header className={`header ${isHeaderActive ? "active" : ""}`} data-header>
      <div className="container shadow-md">
        <Link href="/">
          {/* Removed logo image and replaced with text "e-waste" */}
          <span className="text-3xl font-bold text-emerald-600 ml-4 md:ml-16 py-8">e-waste</span>
        </Link>

        <nav className={`navbar ${isNavbarActive ? "active" : ""}`} data-navbar>
          <div className="wrapper">
            <Link href="/" className="logo">
              E-waste
            </Link>
            <button className="nav-close-btn" aria-label="close menu" data-nav-toggler onClick={toggleNavbar}>
              <IonIcon icon={closeOutline} className={`close-icon ${isNavbarActive ? "" : "hidden"}`}></IonIcon>
            </button>
          </div>

          <ul className="navbar-list">
            {user?.role === "admin" ? (
              <>
                <NavItem label="Customers" isAdmin={true} />
                <NavItem label="Employees" isAdmin={true} />
                <NavItem label="User Feedback/Queries" isAdmin={true} />
                <NavItem label="E-Waste Requests" isAdmin={true} />
              </>
            ) : user?.role === "receiver" ? (
              <>
                <NavItem label="Home" isAdmin={false} />
                <NavItem label="Receiver Dashboard" isAdmin={false} />
              </>
            ) : (
              <>
                <NavItem label="Home" isAdmin={false} />
                <NavItem label="About" isAdmin={false} />
                <NavItem label="Recycle" isAdmin={false} />
                <NavItem label="My Requests" isAdmin={false} />
                <NavItem label="Contactus" isAdmin={false} />
                {/* <NavItem label="Rules" isAdmin={false} /> */}
              </>
            )}
          </ul>
        </nav>

        <h1 className="font-montserrat font-bold text-xl ml-12 md:ml-4 md:text-2xl text-emerald-600 flex items-center gap-[1vh]">
          {/* <IonIcon icon={location} aria-hidden="true" role="img"></IonIcon>
          {locations || "Loading..."} */}
        </h1>

        {user ? (
          <div className="relative flex items-center gap-4">
          {/* Removed message logo button as per request */}
            <button className="relative md:mr-4 text-xl" onClick={handleToggleNotification} aria-label="Toggle notifications">
              <IonIcon icon={mailOutline} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md w-80 max-h-96 overflow-auto z-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    aria-label="Close notifications"
                    onClick={handleToggleNotification}
                    className="text-gray-600 hover:text-gray-900 font-bold text-xl leading-none"
                  >
                    &times;
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-gray-500">No notifications</p>
                ) : (
                  <ul className="space-y-2">
                    {notifications.map((notif) => (
                      <li key={notif.id} className={`p-2 rounded ${notif.read ? "bg-gray-100" : "bg-white font-semibold"}`}>
                        <p>{notif.message}</p>
                        <small className="text-gray-400">{new Date(notif.createdAt).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button className="md:mr-8 text-sm md:text-xl font-semibold" onClick={handleToggleDropdown}>
              {user.username
                ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
                : user.email
                ? user.email ?? "User"
                : "User"}
            </button>
            {isDropdownOpen && (
              <div className="absolute top-12 right-0 projects p-4  shadow-md divide-y rounded-lg w-44 mt-2">
                <Link href="/profile" className="hover:text-emerald-500">
                  Profile
                </Link>
                <button className="hover:text-emerald-500" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/sign-in" className="btn-md btn-outline md:mr-4">
              SignIn
            </Link>
          </>
        )}
        <button className="nav-open-btn" aria-label="open menu" data-nav-toggler onClick={toggleNavbar}>
          <IonIcon icon={menuOutline} aria-hidden="true" role="img"></IonIcon>
        </button>

        <div className={`overlay ${isNavbarActive ? "active" : ""}`} data-nav-toggler data-overlay onClick={toggleNavbar}></div>
      </div>
    </header>
  );
};

export default Header;
