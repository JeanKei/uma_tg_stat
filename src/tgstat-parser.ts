import puppeteer from "puppeteer-extra";
import { Server } from "proxy-chain";
import { RawMetric } from "./types/raw-metric";
import { Page } from "puppeteer";

export class TgStatParser {
	private readonly browser = puppeteer
		.use(require("puppeteer-extra-plugin-stealth")())
		.launch({
			headless: "shell",
			acceptInsecureCerts: true,
			args: ["--no-sandbox", `--proxy-server=http://localhost:8089`],
		});

	constructor(proxies: string[]) {
		const server = new Server({
			port: 8089,
			host: "localhost",
			prepareRequestFunction: () => {
				return {
					upstreamProxyUrl: proxies.at(
						~~(Math.random() * proxies.length)
					),
				};
			},
		});

		server.listen().catch(console.error);
	}

	private async handlePage(page: Page, link: string, attempt = 1) {
		page.goto(`https://tgstat.ru/channel/${link}/stat`)
			.then(body => {
				if (body.status() !== 200) {
					throw new Error("Not found");
				}
			})
			.catch(() => {});
		try {
			await page.waitForSelector(
				"#sticky-center-column > div > div > div:nth-child(1) > div > h2",
				{ timeout: attempt * 5_000 }
			);
		} catch (err) {
			const isUnknownPage = await page.evaluate(
				() =>
					document.querySelector(
						"body > div.wrapper > div > div.content.p-0.col > div.container-fluid.px-2.px-md-3 > div > div > div > div > div.card.cta-box.bg-danger.text-white.mx-n3.mt-n3 > div > div.mt-3 > p"
					) !== null
			);
			if (isUnknownPage) {
				throw new Error("Not found");
			}
			if (attempt > 5) {
				throw err;
			}

			console.log(
				`[parser] ${link} timeout caught: repeat attempt: ${attempt + 1}`
			);
			return (await this.handlePage.bind(this)(
				page,
				link,
				attempt + 1
			)) as RawMetric;
		}

		console.log(`[parser] ${link}: page loaded`);

		const participantsCount = await page.evaluate(() => {
			return Number(
				Array.from(document.querySelectorAll("div"))
					.filter(e => /подписчики/i.test(e.innerText))
					.at(-1)
					.parentElement.querySelector("h2")
					.innerText?.replace(/[^\d]+/g, "")
			);
		});
		if (Number.isNaN(participantsCount)) {
			console.log(
				`[parser] ${link}: couldn't parse participantsCount: ${participantsCount}`
			);
		}

		const averagePostReach = await page.evaluate(() => {
			return Number(
				Array.from(document.querySelectorAll("div"))
					.filter(e => /средний охват/i.test(e.innerText))
					.at(-1)
					.parentElement?.parentElement?.querySelector("h2")
					?.innerText?.replace(/[^\d]+/g, "")
			);
		});
		if (Number.isNaN(averagePostReach)) {
			console.log(
				`[parser] ${link}: couldn't parse averagePostReach: ${averagePostReach}`
			);
		}

		const errPercentage = await page.evaluate(() => {
			return Number(
				Array.from(document.querySelectorAll("div"))
					.filter(e => /вовлеченность/i.test(e.innerText))
					.at(-1)
					.parentElement?.parentElement?.querySelector("h2 span")
					?.textContent?.replace(/[^\d.]+/g, "")
			);
		});
		if (Number.isNaN(errPercentage)) {
			console.log(
				`[parser] ${link}: couldn't parse errPercentage: ${errPercentage}`
			);
		}

		const quoteIndexPercentage = await page.evaluate(() => {
			return Number(
				Array.from(document.querySelectorAll("div"))
					.filter(e => /индекс цитирования/i.test(e.innerText))
					.at(-1)
					.parentElement?.parentElement?.querySelector("h2")
					?.textContent?.replace(/[^\d.]+/g, "")
			);
		});
		if (Number.isNaN(quoteIndexPercentage)) {
			console.log(
				`[parser] ${link}: couldn't parse quoteIndexPercentage: ${quoteIndexPercentage}`
			);
		}

		await page.close();

		console.log(
			`[parser] ${link}: parsing finished, ${participantsCount} ${averagePostReach} ${errPercentage} ${quoteIndexPercentage}`
		);
		return {
			participantsCount,
			averagePostReach,
			errPercentage,
			quoteIndex: quoteIndexPercentage,
		} as RawMetric;
	}

	async parse(link: string) {
		console.log(`[parser] ${link}: start parsing stats`);
		const page = await (await this.browser).newPage();

		try {
			return await this.handlePage(page, link.trim());
		} catch (err) {
			await page.close();
			return null;
		}
	}
}
