import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CalculationHistory } from './entities/CalculationHistory';
import path from 'path';
import fs from 'fs';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  const dbPath = process.env.DATABASE_PATH || './data/calculator.db';
  const absolutePath = path.isAbsolute(dbPath)
    ? dbPath
    : path.join(process.cwd(), dbPath);

  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: absolutePath,
    entities: [CalculationHistory],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  return dataSource;
}
