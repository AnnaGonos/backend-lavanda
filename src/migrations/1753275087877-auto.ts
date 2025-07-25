import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1753275087877 implements MigrationInterface {
    name = 'Auto1753275087877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "totalAmount"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "totalAmount" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "price" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "discount" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "discount" integer`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "totalAmount"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "totalAmount" integer NOT NULL`);
    }

}
