"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getEmail,
  getfullname,
  isAuthenticated,
  getUser,
} from "../../sign-in/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Brand {
  brand: string;
  models: string[];
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface BookingData {
  userId: string;
  userEmail: string;
  recycleItem: string;
  recycleItemPrice?: number;
  pickupDate: string;
  pickupTime: string;
  fullName: string;
  category?: string;
  address: string;
  phone: number;
  location?: Location;
  deviceCondition?: string;
  accessories?: string[];
  deviceImageUrl?: string;
  preferredContactNumber?: string;
  alternateContactNumber?: string;
  specialInstructions?: string;
  declarationChecked?: boolean;
  status?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverName?: string;
  model?: string;
}

const Refrigerator: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [modelInput, setModelInput] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [deviceCondition, setDeviceCondition] = useState("");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [deviceImage, setDeviceImage] = useState<File | null>(null);
  const [preferredContactNumber, setPreferredContactNumber] = useState("");
  const [alternateContactNumber, setAlternateContactNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [declarationChecked, setDeclarationChecked] = useState(false);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const addressString = "Lat: " + latitude.toFixed(5) + ", Lon: " + longitude.toFixed(5);
          setAddress(addressString);
          setIsGettingLocation(false);
        },
        function (error) {
          console.error("Error getting location:", error);
          toast.error("Could not get your location", { autoClose: 3000 });
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser", { autoClose: 3000 });
      setIsGettingLocation(false);
    }
  };

  const handleBrandChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = event.target.value;
    setSelectedBrand(brand);
  };

  useEffect(() => {
    const fetchBrandsAndModels = () => {
      const brandsData: Brand[] = [
        {
          brand: "Samsung",
          models: ["RT28M3022S8 Double Door Refrigerator", "RT42M553ES8 Top Freezer Refrigerator", "RS74T5F01B4 Side-by-Side Refrigerator", "RT65K7058BS Frost-Free Double Door Refrigerator", "RR20T182XR8/NL Single Door Refrigerator"],
        },
        {
          brand: "LG",
          models: ["GL-I292RPZL Double Door Refrigerator", "GL-T292RPZY Double Door Frost-Free Refrigerator", "GC-B247SLUV Side-by-Side Refrigerator", "GL-B201AHPY Single Door Refrigerator", "GL-D201ASOX Single Door Refrigerator"],
        },
        {
          brand: "Whirlpool",
          models: ["IF INV CNV 278 ELT Double Door Refrigerator", "NEO IF 278 ELT Double Door Refrigerator", "FP 263D Protton Roy Triple Door Refrigerator", "WDE 205 CLS 3S Single Door Refrigerator", "WDE 205 ROY 3S Single Door Refrigerator"],
        },
        {
          brand: "Haier",
          models: ["HRF 618SS Side-by-Side Refrigerator", "HRB-2764PBG-E Double Door Refrigerator", "HED-20FDS Single Door Refrigerator", "HRD-2204BS-R 5 Star Single Door Refrigerator", "HRF-619KS Side-by-Side Refrigerator"],
        },
        {
          brand: "Godrej",
          models: ["RT EON 311 PD 3.4 Double Door Refrigerator", "RD EDGEPRO 225 C 33 TAFQ Single Door Refrigerator", "RF GF 2362PTH 236 L Double Door Refrigerator", "RT EON 241 P 3.4 Double Door Refrigerator", "RD EDGESX 185 CT 2.2 Single Door Refrigerator"],
        },
        {
          brand: "Panasonic",
          models: ["NR-BG311VSS3 Double Door Refrigerator", "NR-BR347VSX1 Double Door Refrigerator", "NR-A195STWRT Single Door Refrigerator", "NR-BS60MSX1 Side-by-Side Refrigerator", "NR-A195RSTL Single Door Refrigerator"],
        },
        {
          brand: "Bosch",
          models: ["KDN43VS30I Double Door Refrigerator", "KDN56XI30I Side-by-Side Refrigerator", "KDN30VS30I Double Door Refrigerator", "KAN56V40AU Side-by-Side Refrigerator", "KDN46XI30I Double Door Refrigerator"],
        },
        {
          brand: "SAMSUNG",
          models: ["RS73R5561M9 689 L Frost Free Side-by-Side Refrigerator", "RT28T3483S8 253 L 3 Star Double Door Refrigerator", "RR21T2G2X9U 198 L 5 Star Single Door Refrigerator", "RT30T3743S9 275 L 3 Star Double Door Refrigerator", "RR22T272YS8 212 L 3 Star Single Door Refrigerator"],
        },
         {
          brand: "Other",
          models: ["RT28M3022S8 Double Door Refrigerator", "RT42M553ES8 Top Freezer Refrigerator", "RS74T5F01B4 Side-by-Side Refrigerator", "RT65K7058BS Frost-Free Double Door Refrigerator", "RR20T182XR8/NL Single Door Refrigerator"],
        },
      ];

      setBrands(brandsData);
    };
    fetchBrandsAndModels();
  }, []);

  const email = getEmail();
  const fullname = getfullname() || getUser()?.fullname || "";
  const user = getUser();
  const userId = user ? user.id : "";
  const userRole = user ? user.role : "user";

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      if (!authStatus) {
        router.push("/sign-in?message=signin to recycle");
        toast.error("Please login to book a facility", { autoClose: 3000 });
      }
    };

    checkAuth();
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSubmit = async () => {
    const model = selectedBrand + " " + modelInput;

    if (isLoggedIn) {
      if (
        model &&
        pickupDate &&
        pickupTime &&
        fullname &&
        preferredContactNumber &&
        address &&
        deviceCondition &&
        declarationChecked &&
        email &&
        userId
      ) {
        let imageUrl = "";
        if (deviceImage) {
          const formData = new FormData();
          formData.append("file", deviceImage);
          try {
            const uploadResponse = await fetch("/api/uploadImage", {
              method: "POST",
              body: formData,
            });
            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
              imageUrl = uploadData.url;
            } else {
              toast.error("Image upload failed");
            }
          } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Image upload error");
          }
        }

        const newBooking: BookingData = {
          userId: userId,
          userEmail: email,
          recycleItem: model,
          pickupDate,
          pickupTime,
          fullName: fullname,
          category: "refrigerator",
          address,
          phone: Number(preferredContactNumber),
          location: location,
          deviceCondition,
          accessories: undefined,
          deviceImageUrl: imageUrl,
          preferredContactNumber,
          alternateContactNumber,
          specialInstructions,
          declarationChecked,
          status: "pending",
          receiverEmail: "",
          receiverPhone: "",
          receiverName: "",
          model: model,
        };

        setBookingData([...bookingData, newBooking]);
        setIsLoading(true);

        try {
          const response = await fetch("/api/recyclingRequests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": userId,
              "x-user-role": userRole,
            },
            body: JSON.stringify(newBooking),
          });

          const responseData = await response.json();

          if (response.ok) {
            toast.success("Submitted successfully!", { autoClose: 3000 });
            setSelectedBrand("");
            setModelInput("");
            setPickupDate("");
            setPickupTime("");
            setAddress("");
            setDeviceCondition("");
            setAccessories([]);
            setDeviceImage(null);
            setPreferredContactNumber("");
            setAlternateContactNumber("");
            setSpecialInstructions("");
            setDeclarationChecked(false);
            router.push("/my-requests");
          } else {
            toast.error("Error: " + (responseData.error || "Failed to submit data"), {
              autoClose: 5000,
            });
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Error submitting data.", { autoClose: 3000 });
        } finally {
          setIsLoading(false);
        }
      } else {
        const missingFields = [];
        if (!model) missingFields.push("brand and model");
        if (!pickupDate) missingFields.push("pickup date");
        if (!pickupTime) missingFields.push("pickup time");
        if (!fullname) missingFields.push("full name");
        if (!preferredContactNumber) missingFields.push("preferred contact number");
        if (!address) missingFields.push("address");
        if (!deviceCondition) missingFields.push("device condition");
        if (!declarationChecked) missingFields.push("declaration confirmation");
        if (!email) missingFields.push("email");
        if (!userId) missingFields.push("user ID");

        toast.error("Please fill in: " + missingFields.join(", "), { autoClose: 5000 });
      }
    } else {
      router.push("/sign-in?message=signin to recycle");
      toast.error("Please Login to book a facility", { autoClose: 3000 });
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="loader" />
        <div className="loading-text">Submitting...</div>
      </div>
    );
  }

  const currentDate = new Date().toISOString().split("T")[0];

  return (
    <div className="container mx-auto p-8">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-6 p-6 text-center">Refrigerator Recycling Request Form</h1>
      <form
        className="grid grid-cols-1 md:grid-cols-2 mx-8 md:mx-0 gap-4 justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Device Details Section */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-medium mb-4 text-gray-600">Device Details:</h2>
        </div>

        <div className="mb-4">
          <label htmlFor="brand" className="block text-2xl font-medium text-gray-600">
            Brand
          </label>
          <select
            id="brand"
            className="w-full p-2 sign-field rounded-md placeholder:font-light placeholder:text-gray-500"
            value={selectedBrand}
            onChange={handleBrandChange}
            required
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.brand} value={brand.brand}>
                {brand.brand}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4" style={{ height: '1cm' }}>
          <label className="block text-gray-700 mb-2" htmlFor="model">
            Model
          </label>
          <input
            type="text"
            id="model"
            className="w-full p-2 border rounded bg-white"
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            placeholder="Enter Model"
            required
          />
        </div>

        <div className="mb-4" style={{ height: '1cm' }}>
          <label className="block text-gray-700 mb-2" htmlFor="deviceCondition">
            Device Condition
          </label>
          <select
            id="deviceCondition"
            className="w-full p-2 border rounded bg-white"
            value={deviceCondition}
            onChange={(e) => setDeviceCondition(e.target.value)}
            required
          >
            <option value="">Select Condition</option>
            
            <option value="Working but damaged">Working but damaged</option>
            <option value="Not working">Not working</option>
          </select>
        </div>

        {/* Pickup & Contact Details Section */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Pickup & Contact Details:</h2>
        </div>

        <div className="mb-4" style={{ height: '1cm' }}>
          <label className="block text-gray-700 mb-2" htmlFor="pickupDate">
            Pickup Date
          </label>
          <input
            type="date"
            id="pickupDate"
            className="w-full p-2 border rounded bg-white"
            min={currentDate}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-4" style={{ height: '1cm' }}>
          <label className="block text-gray-700 mb-2" htmlFor="pickupTime">
            Pickup Time
          </label>
          <input
            type="time"
            id="pickupTime"
            className="w-full p-2 border rounded bg-white"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="preferredContactNumber">
            Preferred Contact Number
          </label>
          <input
            type="tel"
            id="preferredContactNumber"
            className="w-full p-2 border rounded bg-white"
            value={preferredContactNumber}
            onChange={(e) => setPreferredContactNumber(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="alternateContactNumber">
            Alternate Contact Number (Optional)
          </label>
          <input
            type="tel"
            id="alternateContactNumber"
            className="w-full p-2 border rounded bg-white"
            value={alternateContactNumber}
            onChange={(e) => setAlternateContactNumber(e.target.value)}
          />
        </div>

        <div className="mb-4" style={{ height: '1cm' }}>
          <label className="block text-gray-700 mb-2" htmlFor="address">
            Pickup Address
          </label>
          <textarea
            id="address"
            className="w-full p-2 border rounded mb-2 bg-white"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          {location && (
            <div className="mt-2 text-sm text-green-600">
              Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Declaration Section */}
        <div className="md:col-span-2 mb-4" style={{ height: '1cm' }}>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              required
              className="mr-2"
            />
            I confirm that this device is owned by me and I have the right to recycle it.
          </label>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-center">
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition"
          >
            Submit Recycling Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default Refrigerator;
