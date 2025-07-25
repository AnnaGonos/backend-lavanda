import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1753275541541 implements MigrationInterface {
    name = 'Auto1753275541541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD "amount" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "amount"`);
    }

}
