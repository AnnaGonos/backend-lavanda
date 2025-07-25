import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*.ts'],
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

AppDataSource.initialize()
  .then(() => {
    console.log('AppDataSource has been initialized');
  })
  .catch((err) => {
    console.error('Error during AppDataSource initialization', err);
  })

export default AppDataSource;
