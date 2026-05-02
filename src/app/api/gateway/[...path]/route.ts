import { NextRequest, NextResponse } from "next/server";

/**
 * API Gateway Proxy Handler
 * ทำหน้าที่เป็นคนกลางในการรับ Request จาก Browser 
 * แล้วแนบ API Key ก่อนส่งไปหา Backend จริง
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
    let targetBaseUrl = "";
    let finalPathSegments: string[] = [];

    const prefix = path[0];
    const SERVICE_MAP: Record<string, string | undefined> = {
      gpilot: process.env.API_URL,
      safegrow: process.env.API_URL,
      ppvp: process.env.API_URL,
      goldenboy: process.env.API_URL,
      hqultimate: process.env.API_URL,
      ror: process.env.API_URL_STKPRO,
      sub: process.env.API_URL_SUB,
      main: process.env.API_URL_MAIN || process.env.API_URL,
    };


    if (SERVICE_MAP[prefix]) {
      targetBaseUrl = SERVICE_MAP[prefix]!;
      
      const remainingPath = path.slice(1);
      
      // บริการที่ไม่ต้องการ prefix account-id (เช่น sub, ror)
      const skipPrefixServices = ['sub', 'ror'];
      
      // Backend ใหม่ต้องการ: /api/v1/{account_id}/...
      // ถ้าต้นทางมาเป็น /api/gateway/gpilot/api/v1/history
      // ต้องส่งไปเป็น http://backend/api/v1/gpilot/history
      if (remainingPath[0] === 'api' && remainingPath[1] === 'v1' && !skipPrefixServices.includes(prefix)) {
        const afterV1 = remainingPath.slice(2);
        finalPathSegments = ["api", "v1", prefix, ...afterV1];
      } else {
        // กรณีทั่วไปหรือ path อื่นๆ ให้ส่งตามปกติโดยตัด prefix ออก
        finalPathSegments = remainingPath;
      }
    } else {
      // กรณี Legacy หรือไม่มี Prefix ให้ยิงไป Backend-Main เป็น Default
      targetBaseUrl = process.env.API_URL_MAIN || process.env.API_URL || "http://103.91.191.171:8000";
      finalPathSegments = [...path];
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
    
    // คัดลอก headers ที่จำเป็นจากต้นทาง
    const headersToForward = ["accept", "user-agent"];
    if (!prefix.includes('ror')) {
      headersToForward.push("authorization");
    }
    
    headersToForward.forEach(h => {
      const val = request.headers.get(h);
      if (val) headers.set(h, val);
    });


    headers.set("Content-Type", "application/json");


    // Forward Request ไปที่ Backend
    console.log(`[Proxy] ${request.method} ${request.url} -> ${targetUrl}`);
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
