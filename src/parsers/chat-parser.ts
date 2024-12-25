import { ChatMetric } from "../entities/chat-metric";
import { ParserQueryFn } from "../types/parser-query-fn";
import { Parser } from "./parser";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export class ChatParser extends Parser<ChatMetric> {
	async parse(query: ParserQueryFn) {
		const metric = new ChatMetric();

		metric.members = await query(this.parseByLabel(), "участники", true);
		metric.activeMembers = await query(this.parseByLabel(), "активные");
		metric.onlineMembers = await query(
			this.parseByLabel(),
			"участники онлайн"
		);
		metric.messages = await query(this.parseByLabel(), "сообщения");

		const startedAtRaw = await query(() =>
			Array.from(document.querySelectorAll("div"))
				?.filter(e =>
					e?.textContent?.toLocaleLowerCase()?.includes("чат создан")
				)
				?.at(-1)
				?.parentElement?.querySelector("b")
				?.textContent?.replace(/[^\d.]+/g, "")
		);
		metric.startedAt = startedAtRaw
			? dayjs(startedAtRaw ?? "", "DD.MM.YYYY").toDate()
			: null;
		metric.maleMembersPercentage = await query(() =>
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
		metric.dailyMembers = await query(() =>
			Number(
				Array.from(document.querySelectorAll("td"))
					?.filter(e =>
						e?.textContent?.toLocaleLowerCase()?.includes("сегодня")
					)
					?.at(-1)
					?.parentElement?.querySelector("td > b")
					?.textContent?.replace(/[^-\d.]+/g, "")
			)
		);

		return metric;
	}
}
