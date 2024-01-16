import { type NextRequest,NextResponse } from "next/server.js";

export async function GET(req: NextRequest) {
    return NextResponse.json({ hello: true })
}
