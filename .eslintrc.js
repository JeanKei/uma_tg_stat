/** @type {import('eslint').Linter.Config} */

module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "unused-imports"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
	],
	ignorePatterns: ["dist/*"],
	env: {
		node: true,
		es2021: true,
	},
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
	},
	rules: {
		"no-mixed-spaces-and-tabs": "off",
		"no-irregular-whitespace": ["error", { skipTemplates: true }],
		"no-empty-function": [
			"error",
			{ allow: ["arrowFunctions", "constructors"] },
		],
		"@typescript-eslint/no-empty-function": [
			"error",
			{ allow: ["arrowFunctions", "constructors"] },
		],
		"prefer-const": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"no-prototype-builtins": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/no-floating-promises": "error",
		"@typescript-eslint/no-misused-promises": [
			"error",
			{
				checksConditionals: true,
				checksVoidReturn: true,
			},
		],
		"unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{ "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
		]
	},
};
