import { NextRequest, NextResponse } from "next/server";
import { users } from "@/lib/users";

export async function GET(request: NextRequest) {

  return NextResponse.json({ users });
}

