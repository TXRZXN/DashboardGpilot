import { NextRequest, NextResponse } from "next/server";

/**
 * API Gateway Proxy Handler
 * ทำหน้าที่เป็นคนกลางในการรับ Request จาก Browser 
 * แล้วแนบ API Key ก่่อนส่งไปหา Backend จริง
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

async function handleRequest(
  request: NextRequest,
  { path }: { path: string[] }
) {
  try {
    const backendUrl = process.env.API_URL || "http://localhost:8000";
    const apiKey = process.env.API_KEY || "";
    
    // สร้าง Search Params จาก URL ที่ส่งมา
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // ประกอบ Full URL สำหรับ Backend
    const fullPath = path.join("/");
    const targetUrl = `${backendUrl}/${fullPath}${queryString ? `?${queryString}` : ""}`;

    // เตรียม Headers (ซ่อน X-API-Key จากหน้าบ้าน)
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (apiKey) {
      headers.set("X-API-Key", apiKey);
    }

    // Forward Request ไปที่ Backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method === "POST" ? await request.text() : undefined,
      cache: "no-store",
    });

    // รับข้อมูลจาก Backend และส่งกลับไปหา Browser
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Gateway Proxy Error:", error);
    return NextResponse.json(
      { success: false, error: "Gateway Proxy Error", detail: String(error) },
      { status: 500 }
    );
  }
}
