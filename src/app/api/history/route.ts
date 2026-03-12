import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { CalculationHistory } from '@/lib/entities/CalculationHistory';

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(CalculationHistory);
    const items = await repo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { expression, result } = body;

    if (!expression || !result) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(CalculationHistory);

    const item = repo.create({
      expression: String(expression),
      result: String(result),
    });

    await repo.save(item);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/history error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(CalculationHistory);
    await repo.clear();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/history error:', error);
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 });
  }
}
