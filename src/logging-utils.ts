export function logParseResults<T>(
	metric: T,
	text: string,
	omittedKeys: (keyof T)[] = []
) {
	const entires = Object.entries(metric).filter(
		([key]) => !omittedKeys.includes(key as keyof T)
	);

	const isNotEmpty = (value: unknown) =>
		typeof value === "number"
			? !Number.isNaN(value)
			: typeof value === "string"
				? value.trim().length
				: value !== undefined && value !== null;

	const emptyParams = entires.filter(([_, value]) => !isNotEmpty(value));

	console.log(
		[
			text,
			entires
				.filter(([_, value]) => isNotEmpty(value))
				.map(([key, value]) => ` - ${key}: ${value}`)
				.join("\n"),
		]
			.concat(
				emptyParams.length
					? [
							"Missing Params:",
							emptyParams.map(([key]) => key).join(", "),
						]
					: []
			)
			.join("\n")
	);
}
