import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'notifications.json');

let notifications: any[] = [];

async function loadNotifications() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    if (!data || data.trim() === '') {
      notifications = [];
      await fs.writeFile(DATA_FILE, '[]');
    } else {
      try {
        notifications = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing notifications JSON:', parseError);
        notifications = [];
        await fs.writeFile(DATA_FILE, '[]');
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      notifications = [];
    } else {
      console.error('Error loading notifications:', error);
    }
  }
}

async function saveNotifications() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(notifications, null, 2));
  } catch (error: unknown) {
    console.error('Error saving notifications:', error);
  }
}

async function initializeNotifications() {
  await loadNotifications();
}

initializeNotifications();

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3001');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS(request: Request) {
  const response = NextResponse.json({});
  return addCorsHeaders(response);
}

export async function POST(request: Request) {
  try {
    await loadNotifications();

    let data;
    try {
      data = await request.json();
      if (!data || typeof data !== "object") {
        throw new Error("Invalid JSON body");
      }
    } catch (jsonError) {
      console.error("JSON parse error in /api/notifications POST:", jsonError);
      const response = NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
      return addCorsHeaders(response);
    }

    console.log("Received POST data in /api/notifications:", data);
    console.log("Type of userId:", typeof data.userId, "Type of receiverId:", typeof data.receiverId, "Type of message:", typeof data.message);
    const { userId, receiverId, message } = data;

    if (!message || (!userId && !receiverId)) {
      const response = NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      return addCorsHeaders(response);
    }

    const newNotification = {
      id: Date.now().toString(),
      userId: userId || null,
      receiverId: receiverId || null,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifications.push(newNotification);
    await saveNotifications();

    const response = NextResponse.json({ success: true, data: newNotification });
    return addCorsHeaders(response);
  } catch (error: unknown) {
    console.error('Error in POST /api/notifications:', error);
    const response = NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}

export async function GET(request: Request) {
  try {
    await loadNotifications();

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const receiverId = url.searchParams.get('receiverId');

    if (!userId && !receiverId) {
      const response = NextResponse.json({ success: false, error: 'Missing userId or receiverId' }, { status: 400 });
      return addCorsHeaders(response);
    }

    const filteredNotifications = notifications.filter((notif) => {
      if (userId) return notif.userId === userId;
      if (receiverId) return notif.receiverId === receiverId;
      return false;
    });

    // Sort by createdAt descending
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const response = NextResponse.json({ success: true, data: filteredNotifications });
    return addCorsHeaders(response);
  } catch (error: unknown) {
    console.error('Error in GET /api/notifications:', error);
    const response = NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    return addCorsHeaders(response);
  }
}
