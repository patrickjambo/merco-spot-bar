import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const prisma = getPrisma();
    
    // Build update payload
    const updateData: any = {
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      phone: body.phone,
      role: body.role,
      shiftStart: body.shiftStart,
      shiftEnd: body.shiftEnd,
      isBlocked: body.isBlocked,
    };

    // Only update password if a new one is provided
    if (body.password && body.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        isBlocked: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const prisma = getPrisma();
    
    // Soft delete to preserve sales history
    await prisma.user.update({
      where: { id: params.id },
      data: { 
        isDeleted: true,
        isBlocked: true
      },
    });
    
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
