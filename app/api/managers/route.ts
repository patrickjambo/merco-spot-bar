import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const prisma = getPrisma();
    const managers = await prisma.user.findMany({
      where: {
        role: "manager",
        isDeleted: false
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        shiftStart: true,
        shiftEnd: true,
        phone: true,
        isBlocked: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(managers);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json({ error: "Failed to fetch managers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password || "123456", salt);

    const newManager = await prisma.user.create({
      data: {
        fullName: body.fullName,
        username: body.username,
        email: body.email,
        phone: body.phone,
        passwordHash,
        role: "manager",
        shiftStart: body.shiftStart,
        shiftEnd: body.shiftEnd,
        isBlocked: body.isBlocked || false,
      },
      select: {
        id: true, // Don't return password hash
        fullName: true,
        username: true,
      }
    });
    
    return NextResponse.json(newManager, { status: 201 });
  } catch (error: any) {
    console.error("Error creating manager:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create manager" }, { status: 500 });
  }
}