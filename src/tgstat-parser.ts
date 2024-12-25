import puppeteer from "puppeteer-extra";
import { Server } from "proxy-chain";
import { Page } from "puppeteer";
import { GeneralParser } from "./parsers/general-parser";
import { logParseResults } from "./logging-utils";
import { ChannelParser } from "./parsers/channel-parser";
import { ChatParser } from "./parsers/chat-parser";
import { ParserResult } from "./types/parser-result";

export class TgStatParser {
	private readonly generalParser = new GeneralParser();
	private readonly chatParser = new ChatParser();
	private readonly channelParser = new ChannelParser();

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
		page.goto(`https://tgstat.ru/channel/${link}/stat`).catch(() => {});
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
			)) as ParserResult;
		}

		console.log(`[parser] ${link}: page loaded`);
		console.log(`[parser] ${link}: parsing general info...`);
		const general = await this.generalParser.parse(
			page.evaluate.bind(page)
		);
		logParseResults(general, `[parser] ${link}: general info parsed`, [
			"username",
			"createdAt",
			"updatedAt",
		]);
		general.username = link;

		const isChat = page.url().startsWith("https://tgstat.ru/chat");

		if (isChat) {
			console.log(`[parser] ${link}: parsing chat info...`);
			const chat = await this.chatParser.parse(page.evaluate.bind(page));
			logParseResults(chat, `[parser] ${link}: chat info parsed`, [
				"username",
				"createdAt",
				"updatedAt",
			]);
			chat.username = link;

			return { general, chat };
		} else {
			console.log(`[parser] ${link}: parsing channel info...`);
			const channel = await this.channelParser.parse(
				page.evaluate.bind(page)
			);
			logParseResults(channel, `[parser] ${link}: channel info parsed`, [
				"username",
				"createdAt",
				"updatedAt",
			]);
			channel.username = link;

			return { general, channel };
		}
	}

	async parse(link: string) {
		console.log(`[parser] ${link}: start parsing stats`);
		const page = await (await this.browser).newPage();

		try {
			return await this.handlePage(page, link.trim());
		} catch (err) {
			console.error(`[parser] caught error`, err);
			return null;
		} finally {
			await page.close();
		}
	}
}
