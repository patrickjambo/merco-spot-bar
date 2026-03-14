import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const prisma = getPrisma();
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
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
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    
    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username },
    });
    
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password || "password123", salt);

    const newUser = await prisma.user.create({
      data: {
        fullName: body.fullName,
        username: body.username,
        email: body.email,
        phone: body.phone,
        passwordHash: hashedPassword,
        role: body.role || "manager",
        shiftStart: body.shiftStart,
        shiftEnd: body.shiftEnd,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
