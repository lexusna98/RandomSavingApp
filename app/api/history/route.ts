import { NextResponse } from 'next/server';
import { prisma } from '@/db/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get('year'));

  const page = Number(searchParams.get('page') || 1);

  const pageSize = Number(searchParams.get('pageSize') || 10);

  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    prisma.draw.findMany({
      where: { year },
      orderBy: { drawnAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.draw.count({
      where: { year },
    }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
  });
}
