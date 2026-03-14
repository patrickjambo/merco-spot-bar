import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { newPassword } = await req.json();
    
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const prisma = getPrisma();
    
    // Update super admin password
    const admin = await prisma.user.findFirst({ where: { role: 'superadmin' } });
    if (!admin) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash }
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
