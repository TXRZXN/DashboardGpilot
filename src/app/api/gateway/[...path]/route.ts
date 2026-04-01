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
    // 1. ติจารณาส่วนหัวของ Path เพื่อเลือก Backend
    let targetBaseUrl = "";
    let targetApiKey = "";
    let finalPathSegments = [...path];

    if (path[0] === "sub") {
      // ยิงไป Backend-Sub
      targetBaseUrl = process.env.API_URL_SUB || "http://localhost:8001";
      targetApiKey = process.env.INTERNAL_API_KEY || "";
      finalPathSegments = path.slice(1);
    } else if (path[0] === "main") {
      // ยิงไป Backend-Main (Explicit)
      targetBaseUrl = process.env.API_URL_MAIN || process.env.API_URL || "http://localhost:8000";
      targetApiKey = process.env.INTERNAL_API_KEY || "";
      finalPathSegments = path.slice(1);
    } else {
      // กรณี Legacy หรือไม่มี Prefix ให้ยิงไป Backend-Main เป็น Default
      targetBaseUrl = process.env.API_URL_MAIN || process.env.API_URL || "http://localhost:8000";
      targetApiKey = process.env.INTERNAL_API_KEY || "";
    }
    
    // สร้าง Search Params จาก URL ที่ส่งมา
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // ประกอบ Full URL สำหรับ Backend
    const fullPath = finalPathSegments.join("/");
    const querySuffix = queryString ? `?${queryString}` : "";
    const targetUrl = `${targetBaseUrl}/${fullPath}${querySuffix}`;

    // เตรียม Headers
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (targetApiKey) {
      headers.set("X-API-Key", targetApiKey);
    }

    // Forward Request ไปที่ Backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== "GET" && request.method !== "DELETE" ? await request.text() : undefined,
      cache: "no-store",
    });

    // ตรวจสอบ Content Type เพื่อจัดการ Response ให้ถูกต้อง
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status, statusText: response.statusText });
    }
  } catch (error) {
    // ❌ ไม่ใช้ console.error ตาม Global Rules — Error จะถูก return ใน response แทน
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GATEWAY_PROXY_ERROR",
          message: "Gateway Proxy Error",
          details: [{ message: String(error) }],
        },
      },
      { status: 502 }
    );
  }
}
