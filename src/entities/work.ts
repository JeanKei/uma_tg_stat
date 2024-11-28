import { Knex } from "knex";

export interface Work {
	id: number;

	offset: number;

	is_active: boolean;

	finished_at?: Date;

	started_at: Date;
}

export const buildWorkSchema = async (knex: Knex) => {
	if (!(await knex.schema.hasTable("works"))) {
		await knex.schema.createTableIfNotExists("works", table => {
			table.increments("id").notNullable().primary();
			table.boolean("is_active").defaultTo(true).notNullable();
			table.bigint("offset").defaultTo(0).notNullable();
			table.timestamp("finished_at", { useTz: true });
			table
				.timestamp("started_at", { useTz: true })
				.defaultTo(knex.fn.now());
		});
	}
};
