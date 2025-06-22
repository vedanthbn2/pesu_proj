"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

function fixImageSrc(src?: string | null): string {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("/")) {
    return src;
  }
  return "/" + src;
}

interface PickupRequest {
  _id: string;
  id?: string;
  userId: string;
  userEmail: string;
  fullName?: string; // added fullName to interface
  recycleItem: string;
  recycleItemFromForm?: string; // added to hold category from form
  category?: string; // added category field
  preferredContactNumber?: string; // added preferred contact number
  alternateContactNumber?: string; // added alternate contact number
  pickupDate: string;
  pickupTime: string;
  deviceCondition?: string;
  status: string;
  assignedReceiver: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverName: string;
  address?: string;
  createdAt: Date;
  collectionNotes?: string;
  collectionProof?: string; // base64 image string
  specialInstructions?: string;
  userIdToShow?: string; // added to hold user id for display if needed
}

const PickupRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<PickupRequest | null>(null);
  const [showSubmittedDetails, setShowSubmittedDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  // Helper function to get popup state key for localStorage/sessionStorage
  const getPopupStorageKey = (id: string) => `ewasteReceivedPopup_${id}`;

  // Debugging logs for collectionNotes and collectionProof
  React.useEffect(() => {
    if (selectedRequest) {
      console.log("Selected Request collectionNotes:", selectedRequest.collectionNotes);
      console.log("Selected Request collectionProof:", selectedRequest.collectionProof);
    }
  }, [selectedRequest]);

  useEffect(() => {
    // On mount, check if there is a last submitted request in sessionStorage
    const storedRequest = sessionStorage.getItem("lastSubmittedRequest");
    if (storedRequest) {
      try {
        const parsedRequest = JSON.parse(storedRequest);
        setLastSubmittedRequest(parsedRequest);
        setShowSubmittedDetails(true);
      } catch (e) {
        console.error("Failed to parse lastSubmittedRequest from sessionStorage", e);
        sessionStorage.removeItem("lastSubmittedRequest");
      }
    }
  }, []);

  // Show popup if selectedRequest has ewaste received popup stored
  useEffect(() => {
    if (selectedRequest) {
      const popupKey = getPopupStorageKey(selectedRequest._id);
      const popupState = localStorage.getItem(popupKey);
      if (popupState === "true") {
        setShowPopup(true);
      } else {
        setShowPopup(false);
      }
    } else {
      setShowPopup(false);
    }
  }, [selectedRequest]);

  // Function to close popup and clear stored state
  const closePopup = () => {
    if (selectedRequest) {
      const popupKey = getPopupStorageKey(selectedRequest._id);
      localStorage.removeItem(popupKey);
    }
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      if (!user) {
        router.push("/sign-in?message=signin to view pickup requests");
        return;
      }
      try {
        const response = await axios.get("/api/recyclingRequests", {
          headers: {
            "x-user-id": user.id,
            "x-user-role": user.role,
          },
        });
        console.log("User id from localStorage:", user?.id);
        console.log("Fetched requests:", response.data);

        // Fetch users list to map user names
        const usersResponse = await axios.get("/api/users/listUsers");
        const usersData = usersResponse.data.data || [];

        // Filter requests assigned to this receiver
        const assignedRequests = response.data.data.filter(
          (req: any) => {
            const assignedReceiver = req.assignedReceiver;
            const assignedId = typeof assignedReceiver === 'string' ? assignedReceiver : assignedReceiver?.id;
            console.log(`Checking request ${req._id} assignedReceiver:`, assignedReceiver, 'assignedId:', assignedId);
            return assignedId === user.id;
          }
        );

        // Map assignedRequests to include fullName from usersData and include collectionNotes and collectionProof
        const assignedRequestsWithNames = assignedRequests.map((req: any) => {
          const userObj = usersData.find((u: any) => u._id === req.userId);
          return {
            ...req,
            fullName: userObj ? userObj.name : "Unknown",
            collectionNotes: req.collectionNotes || "",
            collectionProof: req.collectionProof || "",
          };
        });

        if (assignedRequestsWithNames.length > 0) {
          console.log("Sample request object with names:", assignedRequestsWithNames[0]);
        }
        console.log("Filtered assigned requests with names:", assignedRequestsWithNames);
        setRequests(assignedRequestsWithNames);
      } catch (error) {
        console.error("Error fetching pickup requests:", error);
      } finally {
        setLoading(false);
      }
    };

  // Refetch requests after submitting collection proof to get updated data
  const refetchRequests = async () => {
    const userJSON = localStorage.getItem("user");
    const user = userJSON ? JSON.parse(userJSON) : null;
    if (!user) {
      router.push("/sign-in?message=signin to view pickup requests");
      return;
    }
    try {
      const response = await axios.get("/api/recyclingRequests", {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role,
        },
      });
      const usersResponse = await axios.get("/api/users/listUsers");
      const usersData = usersResponse.data.data || [];
      const assignedRequests = response.data.data.filter(
        (req: any) => {
          const assignedReceiver = req.assignedReceiver;
          const assignedId = typeof assignedReceiver === 'string' ? assignedReceiver : assignedReceiver?.id;
          return assignedId === user.id;
        }
      );
      const assignedRequestsWithNames = assignedRequests.map((req: any) => {
        const userObj = usersData.find((u: any) => u._id === req.userId);
        return {
          ...req,
          fullName: userObj ? userObj.name : "Unknown",
          collectionNotes: req.collectionNotes || "",
          collectionProof: req.collectionProof || "",
        };
      });
      setRequests(assignedRequestsWithNames);
    } catch (error) {
      console.error("Error refetching pickup requests:", error);
    }
  };

    fetchRequests();
  }, [router]);

  const handleNoteChange = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({ ...prev, [id]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCollectionProof = async (id: string) => {
    // Helper function to validate MongoDB ObjectId
    const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

    try {
      const updates = {
        status: "received",
      };

      // Use _id consistently for PATCH request
      const requestToUpdate = requests.find((req) => req._id === id);
      const patchId = requestToUpdate?._id || id;

      if (!isValidObjectId(patchId)) {
        alert("Invalid request ID. Cannot submit collection proof.");
        return;
      }

      console.log("Submitting collection proof for request ID:", patchId);

      // Get user info from localStorage here
      const userJSON = localStorage.getItem("user");
      const user = userJSON ? JSON.parse(userJSON) : null;
      if (!user) {
        alert("User not authenticated.");
        return;
      }

      const response = await fetch("/api/recyclingRequests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-role": user.role,
        },
        body: JSON.stringify({ id: patchId, updates }),
      });

      const result = await response.json();
      if (result.success) {
        // Instead of alert, set lastSubmittedRequest and show modal
        if (requestToUpdate) {
          // Update the requestToUpdate object with new status
          const updatedRequest = {
            ...requestToUpdate,
            status: "received",
          };
          setLastSubmittedRequest(updatedRequest);
          sessionStorage.setItem("lastSubmittedRequest", JSON.stringify(updatedRequest));
          // Update selectedRequest state to updatedRequest to reflect changes in modal
          setSelectedRequest(updatedRequest);
          // Also update requests state to reflect changes in the list
          setRequests((prev) =>
            prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
          );
        } else {
          // If requestToUpdate is undefined, create a minimal object with required fields and dummy values for missing required fields
          const minimalRequest: PickupRequest = {
            _id: patchId,
            id: undefined,
            userId: "",
            userEmail: "",
            recycleItem: "",
            pickupDate: "",
            pickupTime: "",
            deviceCondition: "",
            status: updates.status,
            assignedReceiver: "",
            receiverEmail: "",
            receiverPhone: "",
            receiverName: "",
            createdAt: new Date(),
          };
          setLastSubmittedRequest(minimalRequest);
          sessionStorage.setItem("lastSubmittedRequest", JSON.stringify(minimalRequest));
          setSelectedRequest(minimalRequest);
        }
        setShowSubmittedDetails(true);

        // Set popup state in localStorage to persist popup after reload/login
        const popupKey = getPopupStorageKey(id);
        localStorage.setItem(popupKey, "true");
        setShowPopup(true);

        // Clear notes and images for this request
        setNotes((prev) => {
          const newNotes = { ...prev };
          delete newNotes[id];
          return newNotes;
        });
        setImages((prev) => {
          const newImages = { ...prev };
          delete newImages[id];
          return newImages;
        });
        // Do not clear selectedRequest here to keep modal open with updated data
      } else {
        alert("Failed to submit collection proof: " + result.error);
      }
    } catch (error) {
      alert("Error submitting collection proof: " + error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading your pickup tasks...</div>;
  }  

  if (requests.length === 0) {
    return <div className="p-8">No pickup tasks assigned to you.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Receiver Dashboard</h1>
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">S.No</th>
            <th className="py-3 px-4 text-left">User Name</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-left">Phone Number</th>
            <th className="py-3 px-4 text-left">Address</th>
            <th className="py-3 px-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {requests.map((req, index) => (
          <tr
            key={req._id}
            className="cursor-pointer hover:bg-gray-100"
            style={{ height: '1cm' }}
            onClick={() => setSelectedRequest(req)}
          >
            <td className="py-3 px-4">{index + 1}</td>
            <td className="py-3 px-4">{req.fullName || 'Unknown'}</td>
            <td className="py-3 px-4">{req.category || (req.recycleItem.toLowerCase() === 'unknown' ? (req.recycleItemFromForm || 'Unknown') : req.recycleItem)}</td>
            <td className="py-3 px-4">{req.preferredContactNumber || (req.receiverPhone && req.receiverPhone !== "0000000000" ? req.receiverPhone : "N/A")}</td>
            <td className="py-3 px-4">{req.address || 'N/A'}</td>
            <td className="py-3 px-4">{req.status}</td>
          </tr>
          ))}
        </tbody>
      </table>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedRequest(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Pickup Request Details</h2>
            <div className="mb-2"><strong>Name:</strong> {selectedRequest.fullName || "N/A"}</div>
            <div className="mb-2"><strong>Phone:</strong> {selectedRequest.preferredContactNumber || "N/A"}</div>
            <div className="mb-2"><strong>Category:</strong> {selectedRequest.category || "N/A"}</div>
            <div className="mb-2"><strong>Model:</strong> {selectedRequest.recycleItem || "N/A"}</div>
            <div className="mb-2"><strong>Device Condition:</strong> {selectedRequest.deviceCondition || "N/A"}</div>
            <div className="mb-2">
            </div>
            <div className="mb-2"><strong>Pickup Date:</strong> {selectedRequest.pickupDate || "N/A"}</div>
            <div className="mb-2"><strong>Pickup Time:</strong> {selectedRequest.pickupTime || "N/A"}</div>
            <div className="mb-2"><strong>Pickup Address:</strong> {selectedRequest.address || "N/A"}</div>
            <div className="mb-2"><strong>Preferred Contact Number:</strong> {selectedRequest.preferredContactNumber || "N/A"}</div>
            <div className="mb-2"><strong>Alternate Contact Number:</strong> {selectedRequest.alternateContactNumber || "N/A"}</div>
            <div className="mb-4 text-lg"><strong>Special Pickup Instructions:</strong> {selectedRequest.specialInstructions || "None"}</div>
            {/* Removed Collection Notes and Collection Proof display */}
            {selectedRequest.status !== "collected" && selectedRequest.status !== "received" && selectedRequest.status !== "received by recycler" && (
              <button
                onClick={() => submitCollectionProof(selectedRequest._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
              >
                E Waste Received
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popup for E Waste Received */}
      {showPopup && selectedRequest && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 flex items-center space-x-4">
          <span>E waste received</span>
          <button
            onClick={closePopup}
            className="bg-green-800 hover:bg-green-900 px-2 py-1 rounded"
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupRequestsPage;
