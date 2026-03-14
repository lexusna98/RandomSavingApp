import { NextResponse } from 'next/server';
import { prisma } from '@/db/client';
import { randomAvailableNumber } from '@/lib/random';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const body = await req.json();

  const { year, drawDate } = body;

  const currentYear = new Date().getFullYear();

  const today = new Date().toISOString().slice(0, 10);

  const startOfCurrentYear = `${currentYear}-01-01`;

  if (!Number.isInteger(year) || year !== currentYear) {
    return NextResponse.json(
      {
        message: 'Chỉ hỗ trợ quay số trong năm hiện tại.',
      },
      { status: 400 },
    );
  }

  if (typeof drawDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(drawDate)) {
    return NextResponse.json(
      {
        message: 'Định dạng ngày quay không hợp lệ.',
      },
      { status: 400 },
    );
  }

  const drawYear = Number(drawDate.slice(0, 4));

  if (drawYear !== currentYear) {
    return NextResponse.json(
      {
        message: 'Không thể quay số cho năm trước.',
      },
      { status: 400 },
    );
  }

  if (drawDate > today) {
    return NextResponse.json(
      {
        message: 'Không thể quay số cho ngày trong tương lai.',
      },
      { status: 400 },
    );
  }

  if (drawDate < startOfCurrentYear) {
    return NextResponse.json(
      {
        message: 'Ngày quay không nằm trong năm hiện tại.',
      },
      { status: 400 },
    );
  }

  // reset data from previous years
  await prisma.draw.deleteMany({
    where: {
      year: { lt: currentYear },
    },
  });

  const existed = await prisma.draw.findFirst({
    where: {
      year,
      drawDate,
    },
  });

  if (existed) {
    return NextResponse.json(
      {
        message: 'Ngày này đã quay số rồi.',
      },
      { status: 409 },
    );
  }

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
