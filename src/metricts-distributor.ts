import { TgStatParser } from "./tgstat-parser";
import { EntityManager } from "typeorm";
import { ParserResult } from "./types/parser-result";
import { GeneralMetric } from "./entities/general-metric";
import { ChatMetric } from "./entities/chat-metric";
import { ChannelMetric } from "./entities/channel-metric";
import { Progress } from "./entities/progress";

export class MetricsDistributor {
	constructor(
		private readonly entityManager: EntityManager,
		private readonly tgStatParser: TgStatParser
	) {}

	private async fetchMetrics(limit: number, skip: number) {
		const links = (await this.entityManager.query(`
			SELECT url
			FROM add
			LIMIT ${limit}
			OFFSET ${skip}
		`)) as { url: string }[];

		let updated = 0;
		for (const { url } of links) {
			if (url.startsWith("+")) {
				continue;
			}

			let parseResult: ParserResult;
			try {
				parseResult = await this.tgStatParser.parse(url);
			} catch (err) {
				console.error(err);
				continue;
			}
			if (!parseResult) {
				continue;
			}

			try {
				if (parseResult.general) {
					await this.entityManager.save(
						GeneralMetric,
						parseResult.general
					);
				}
				if ("chat" in parseResult && parseResult.chat) {
					await this.entityManager.save(ChatMetric, parseResult.chat);
				}
				if ("channel" in parseResult && parseResult.channel) {
					await this.entityManager.save(
						ChannelMetric,
						parseResult.channel
					);
				}
			} catch (err) {
				console.error(`[distributor] database update failed`, err);
				continue;
			}

			updated++;
		}

		return { count: links.length, updated };
	}

	async start() {
		console.log(`[distributor] metrics distributor started`);

		const progressRep = this.entityManager.getRepository(Progress);

		let progress =
			(await progressRep.findOneBy({ isActive: true })) || new Progress();
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { count, updated } = await this.fetchMetrics(
				50,
				progress.current || 0
			);

			progress.updated = (progress.updated || 0) + updated;
			progress.current = (progress.current || 0) + 50;
			if (!count) {
				progress.isActive = false;
				await progressRep.save(progress);
				progress = new Progress();
			}
			await progressRep.save(progress);
		}
	}
}
