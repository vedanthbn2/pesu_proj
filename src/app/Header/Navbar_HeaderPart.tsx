"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IonIcon } from "@ionic/react";
import { menuOutline, closeOutline, location } from "ionicons/icons";
import logo from "../../assets/ELocate-s.png";
import { getUser, handleLogout } from "../sign-in/auth";

const NavItem = ({ label, isAdmin }: { label: string; isAdmin: boolean }) => {
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
        href = "/pickup-requests"; // Updated to actual receiver dashboard page showing approved tasks
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
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [isHeaderActive, setIsHeaderActive] = useState(false);
  const [locations, setLocation] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  const user = getUser();

  const toggleNavbar = () => {
    setIsNavbarActive(!isNavbarActive);
  };

  return (
    <header className={`header ${isHeaderActive ? "active" : ""}`} data-header>
      <div className="container shadow-md">
        <Link href="/">
          <Image src={logo} alt="ELocate" width={100} height={100} className="logo ml-4 logo md:ml-16 " />
        </Link>

        <nav className={`navbar ${isNavbarActive ? "active" : ""}`} data-navbar>
          <div className="wrapper">
            <Link href="/" className="logo">
              ELocate
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
            ) : (
              <>
                <NavItem label="Home" isAdmin={false} />
                <NavItem label="About" isAdmin={false} />
                <NavItem label="Recycle" isAdmin={false} />
                <NavItem label="My Requests" isAdmin={false} />
                <NavItem label="Contactus" isAdmin={false} />
                <NavItem label="Rules" isAdmin={false} />
              </>
            )}
          </ul>
        </nav>

        <h1 className="font-montserrat font-bold text-xl ml-12 md:ml-4 md:text-2xl text-emerald-600 flex items-center gap-[1vh]">
          <IonIcon icon={location} aria-hidden="true" role="img"></IonIcon>
          {locations || "Loading..."}
        </h1>

        {user ? (
          <div className="relative">
            <button className="md:mr-8 text-sm md:text-xl font-semibold" onClick={handleToggleDropdown}>
              {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
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

