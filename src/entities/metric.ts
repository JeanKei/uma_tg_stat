import { Knex } from "knex";

export interface Metric {
	username: string;

	err_percentage?: number;

	quote_index?: number;

	avg_post_reach?: number;

	participants_count?: number;

	updated_at: string;

	created_at: string;
}

export const buildMetricSchema = async (knex: Knex) => {
	await knex.raw(`
        CREATE OR REPLACE FUNCTION refresh_updated_at()   
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;   
        END;
        $$ language 'plpgsql';
    `);

	if (!(await knex.schema.hasTable("metrics"))) {
		await knex.schema.createTableIfNotExists("metrics", table => {
			table.string("username", 256).notNullable().primary();
			table.tinyint("err_percentage").unsigned();
			table.tinyint("quote_index").unsigned();
			table.bigint("participants_count").unsigned();
			table.bigint("avg_post_reach").unsigned();
			table
				.timestamp("updated_at", { useTz: true })
				.defaultTo(knex.fn.now());
			table
				.timestamp("created_at", { useTz: true })
				.defaultTo(knex.fn.now());

			table
				.foreign("username")
				.references("url_parse")
				.inTable("add")
				.onDelete("CASCADE");
		});
	}

	await knex.raw(`
        CREATE OR REPLACE TRIGGER metrics_updated_at 
        BEFORE UPDATE ON metrics
        FOR EACH ROW
        EXECUTE FUNCTION refresh_updated_at()
    `);
};
