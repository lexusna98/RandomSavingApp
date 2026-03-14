import { NextResponse } from 'next/server';
import { prisma } from '@/db/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get('year'));

  if (!Number.isInteger(year)) {
    return NextResponse.json(
      {
        message: 'Year không hợp lệ.',
      },
      { status: 400 },
    );
  }

  const all = searchParams.get('all') === '1';

  const toDate = searchParams.get('toDate');

  const where = {
    year,
    ...(toDate ? { drawDate: { lte: toDate } } : {}),
  };

  if (all) {
    const data = await prisma.draw.findMany({
      where,
      orderBy: [{ drawDate: 'desc' }, { drawnAt: 'desc' }],
    });

    return NextResponse.json({
      data,
      total: data.length,
      page: 1,
      pageSize: data.length,
    });
  }

  const page = Number(searchParams.get('page') || 1);

  const pageSize = Number(searchParams.get('pageSize') || 10);

  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    prisma.draw.findMany({
      where,
      orderBy: { drawDate: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.draw.count({
      where,
    }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
  });
}
