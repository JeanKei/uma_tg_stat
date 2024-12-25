import { get } from "env-var";
import { config } from "dotenv";
import { TgStatParser } from "./src/tgstat-parser";
import { MetricsDistributor } from "./src/metricts-distributor";
import { dataSource } from "./src/typeorm";
config();

export async function run() {
	await dataSource.initialize();
	const tgStatParser = new TgStatParser(get("PROXY").asArray(", "));

	const metricsDistributor = new MetricsDistributor(
		dataSource.createEntityManager(),
		tgStatParser
	);
	await metricsDistributor.start();
}

run().catch(console.error);
