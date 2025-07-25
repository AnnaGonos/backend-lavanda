import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1753273860236 implements MigrationInterface {
    name = 'Auto1753273860236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "orderNumber" character varying(12) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "UQ_4e9f8dd16ec084bca97b3262edb" UNIQUE ("orderNumber")`);
        await queryRunner.query(`ALTER TABLE "order_item" ALTER COLUMN "quantity" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" ALTER COLUMN "quantity" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "UQ_4e9f8dd16ec084bca97b3262edb"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "orderNumber"`);
    }

}
