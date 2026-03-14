import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const prisma = getPrisma();

    const dataToUpdate: any = {
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      phone: body.phone,
      shiftStart: body.shiftStart,
      shiftEnd: body.shiftEnd,
      isBlocked: body.isBlocked,
    };

    // If password is provided, re-hash and update
    if (body.password && body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(body.password, salt);
    }

    const updatedManager = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
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
      }
    });

    return NextResponse.json(updatedManager);
  } catch (error: any) {
    console.error("Error updating manager:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update manager" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const prisma = getPrisma();
    
    // Soft delete to preserve audit history and sales data
    await prisma.user.update({
      where: { id: params.id },
      data: { isDeleted: true, isBlocked: true },
    });
    
    return NextResponse.json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error("Error deleting manager:", error);
    return NextResponse.json({ error: "Failed to delete manager" }, { status: 500 });
  }
}