import { ChannelMetric } from "../entities/channel-metric";
import { ParserQueryFn } from "../types/parser-query-fn";
import { Parser } from "./parser";

export class ChannelParser extends Parser<ChannelMetric> {
	async parse(query: ParserQueryFn) {
		const metric = new ChannelMetric();

		metric.subscribers = await query(this.parseByLabel(), "подписчики");
		metric.dailySubscribers = await query(this.parseByLabel(), "подписки");
		metric.quoteIndex = await query(
			this.parseByLabel(),
			"индекс цитирования"
		);
		metric.avgPostReach = await query(this.parseByLabel(), "средний охват");
		metric.avgAdPostReach = await query(
			this.parseByLabel(),
			"средний рекламный"
		);
		metric.posts = await query(this.parseByLabel(), "публикации", true);
		metric.storiesViews = await query(this.parseByLabel(), "stories");

		metric.erPercentage = await query(this.parseByLabel(), "вовлеченность");
		metric.maleAuditoryPercentage = await query(() =>
			Number(
				Array.from(document.querySelectorAll("div"))
					?.filter(e =>
						e?.textContent?.toLocaleLowerCase()?.includes("мужчины")
					)
					?.at(-1)
					?.parentElement?.querySelector("b")
					?.textContent?.replace(/[^\d.]+/g, "")
			)
		);
		metric.readPercentage = await query(
			this.parseByLabel(),
			"подписчиков читают посты канала"
		);
		metric.dailyReadPercentage = await query(
			this.parseByLabel(),
			"после публикации"
		);

		return metric;
	}
}
