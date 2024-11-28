import { Knex } from "knex";
import { TgStatParser } from "./tgstat-parser";
import { Metric } from "./entities/metric";
import { RawMetric } from "./types/raw-metric";
import { Work } from "./entities/work";

export class MetricsDistributor {
	constructor(
		private readonly knex: Knex,
		private readonly tgStatParser: TgStatParser
	) {}

	private async fetchMetrics(limit: number, offset: number) {
		const channels = await this.knex<{ url: string }>("add")
			.select("url")
			.limit(limit)
			.offset(offset);

		for (const { url } of channels) {
			if (url.startsWith("+")) {
				continue;
			}

			let parseResult: RawMetric;
			try {
				parseResult = await this.tgStatParser.parse(url);
			} catch (err) {
				console.error(err);
				continue;
			}
			if (!parseResult) {
				continue;
			}

			const {
				averagePostReach,
				errPercentage,
				participantsCount,
				quoteIndex,
			} = parseResult;

			const isRecordExist = await this.knex<Metric>("metrics")
				.select("username")
				.where("username", url);

			const nullifyNaN = (int: number) =>
				Number.isNaN(int) ? null : int;
			const params: Partial<Metric> = {
				avg_post_reach: nullifyNaN(averagePostReach),
				participants_count: nullifyNaN(participantsCount),
				err_percentage: ~~nullifyNaN(errPercentage),
				quote_index: ~~nullifyNaN(quoteIndex),
			};

			if (isRecordExist?.length) {
				console.log(`[db] ${url} metrics updated`);
				await this.knex<Metric>("metrics")
					.update(params)
					.where("username", url);
			} else {
				console.log(`[db] ${url} metrics registered`);
				await this.knex<Metric>("metrics").insert({
					...params,
					username: url,
				});
			}
		}

		return channels.length;
	}

	async start() {
		console.log(`[metric] metrics distributor started`);

		let [work] = await this.knex<Work>("works")
			.select("*")
			.where("is_active", true);
		// eslint-disable-next-line no-constant-condition
		while (true) {
			if (!work?.is_active) {
				work = await this.knex<Work>("works").insert({});
			}

			const count = await this.fetchMetrics(50, work.offset);
			work.offset += 50;

			if (!count) {
				work.finished_at = new Date();
				work.is_active = false;
			}
			await this.knex<Work>("works")
				.update({
					is_active: work.is_active || false,
					offset: work.offset || null,
					finished_at: work.finished_at || null,
				})
				.where("id", work.id);
		}
	}
}
