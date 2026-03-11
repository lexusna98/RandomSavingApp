import { NextResponse } from 'next/server';
import { prisma } from '@/db/client';
import { randomAvailableNumber } from '@/lib/random';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const body = await req.json();

  const { year, drawDate } = body;

  const currentYear = new Date().getFullYear();

  // reset data from previous years
  await prisma.draw.deleteMany({
    where: {
      year: { lt: currentYear },
    },
  });

  const history = await prisma.draw.findMany({
    where: { year },
    select: { number: true },
  });

  const usedNumbers = history.map((r) => r.number);

  const number = randomAvailableNumber(year, usedNumbers);

  const record = {
    id: uuidv4(),
    year,
    number,
    drawDate,
    drawnAt: new Date().toISOString(),
  };

  await prisma.draw.create({
    data: record,
  });

  return NextResponse.json({
    result: record,
  });
}
