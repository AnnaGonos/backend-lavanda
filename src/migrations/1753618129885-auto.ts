import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1753618129885 implements MigrationInterface {
    name = 'Auto1753618129885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('created', 'confirmed', 'assembled', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum" USING "status"::"text"::"public"."order_status_enum"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'created'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum_old" AS ENUM('created', 'processing', 'paid', 'shipped', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'created'`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`);
    }

}
