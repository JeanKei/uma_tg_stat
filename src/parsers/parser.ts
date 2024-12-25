import { ParserQueryFn } from "../types/parser-query-fn";

export abstract class Parser<T> {
	protected parseByLabel() {
		return (label: string, strict = false) => {
			const element = Array.from<HTMLElement>(
				document.querySelectorAll("div")
			)
				?.filter(e =>
					strict
						? e?.textContent?.replace(/\s*/g, "") === label
						: e?.textContent?.toLocaleLowerCase()?.includes(label)
				)
				?.at(-1);

			for (
				let parent = element;
				parent !== null;
				parent = parent.parentElement
			) {
				const textElement = parent?.querySelector("h2");

				if (textElement !== null) {
					return Number(
						textElement?.textContent?.replace(/[^-\d.]+/g, "")
					);
				}
			}

			return null;
		};
	}

	abstract parse(query: ParserQueryFn): Promise<T>;
}
