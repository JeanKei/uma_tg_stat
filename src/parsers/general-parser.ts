import { GeneralMetric } from "../entities/general-metric";
import { ParserQueryFn } from "../types/parser-query-fn";
import { Parser } from "./parser";

export class GeneralParser extends Parser<GeneralMetric> {
	async parse(query: ParserQueryFn) {
		const metric = new GeneralMetric();
		metric.title = await query<string>(() =>
			document.querySelector("div > h1")?.textContent?.trim()
		);

		const geoAndLanguage = await query<string | null>(() =>
			Array.from<HTMLBaseElement>(
				document.querySelectorAll("div:has(> h5)")
			)
				.filter(e => e?.textContent?.includes("язык"))
				.at(0)
				?.textContent?.split("\n")
				?.slice(-2)
				?.map(e => e.replace(/ {2,}/g, "").trim())
				?.join(" ")
				?.trim()
		);

		metric.geo = geoAndLanguage?.split(/, ?/g)?.slice(0, -1)?.join(", ");
		metric.language = geoAndLanguage?.split(/, ?/g)?.at(-1);
		metric.category = await query<string | null>(() =>
			Array.from<HTMLBaseElement>(
				document.querySelectorAll("div:has(> h5)")
			)
				.filter(e => e?.innerText?.includes("Категория"))
				.at(0)
				?.textContent?.split("\n")
				?.slice(-2)
				?.map(e => e.replace(/ {2,}/g, "").trim())
				?.join(" ")
				?.trim()
		);
		metric.avatarUrl = await query<string>(
			() =>
				Array.from<HTMLImageElement>(
					document.querySelectorAll(".img-thumbnail.rounded-circle")
				).at(-1)?.src
		);
		metric.isVerified = await query<boolean>(
			() => document.querySelector(".tg-verified-icon") !== null
		);

		return metric;
	}
}
