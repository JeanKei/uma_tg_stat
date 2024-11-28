import { get } from "env-var";
import { config } from "dotenv";
import { TgStatParser } from "./src/tgstat-parser";
import { MetricsDistributor } from "./src/metricts-distributor";
import { knex } from "./src/knex";
import { buildMetricSchema } from "./src/entities/metric";
import { buildWorkSchema } from "./src/entities/work";
config();

export async function run() {
	await buildMetricSchema(knex);
	await buildWorkSchema(knex);
	const tgStatParser = new TgStatParser(get("PROXY").asArray(", "));

	const metricsDistributor = new MetricsDistributor(knex, tgStatParser);
	await metricsDistributor.start();
}

run().catch(console.error);
