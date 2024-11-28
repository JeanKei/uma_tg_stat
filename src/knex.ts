import { knex as initKnex } from "knex";
import { config } from "dotenv";
import { get } from "env-var";
config();

export const knex = initKnex({
	client: "pg",
	connection: get("POSTGRES_CONNECTION_STRING").asString(),
});
