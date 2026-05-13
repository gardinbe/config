#!/usr/bin/env node
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Command } from "commander";
//#region src/cli/index.ts
const require = createRequire(import.meta.url);
const bins = {
	oxfmt: "bin/oxfmt",
	oxlint: "bin/oxlint",
	stylelint: "bin/stylelint.mjs"
};
const packageJson = require("../../package.json");
const program = new Command();
const hasConfigArg = (args) => args.some((arg, index) => arg === "-c" || arg === "--config" || arg.startsWith("--config=") || args[index - 1] === "-c" || args[index - 1] === "--config");
const binPath = (tool) => {
	const packageJsonUrl = pathToFileURL(require.resolve(`${tool}/package.json`));
	return fileURLToPath(new URL(bins[tool], packageJsonUrl));
};
const configPath = (tool) => fileURLToPath(new URL(`../${tool}/config.mjs`, import.meta.url));
const run = (tool, args) => {
	const toolArgs = hasConfigArg(args) ? [...args] : [
		"--config",
		configPath(tool),
		...args
	];
	const child = spawn(process.execPath, [binPath(tool), ...toolArgs], { stdio: "inherit" });
	return new Promise((resolve, reject) => {
		child.on("error", reject);
		child.on("close", (code) => {
			resolve(code ?? 1);
		});
	});
};
const runAll = async (steps) => {
	for (const [tool, args] of steps) {
		const code = await run(tool, args);
		if (code !== 0) return code;
	}
	return 0;
};
const passthrough = (name, description, action) => {
	program.command(name).description(description).allowUnknownOption().allowExcessArguments().argument("[args...]").action(async (args) => {
		process.exitCode = await action(args);
	});
};
program.name("gardinbe").description("Shared linting and formatting commands.").version(packageJson.version);
passthrough("lint", "Run oxlint with @gardinbe/config defaults.", (args) => run("oxlint", args));
passthrough("format", "Run oxfmt with @gardinbe/config defaults.", (args) => run("oxfmt", args));
passthrough("stylelint", "Run stylelint with @gardinbe/config defaults.", (args) => run("stylelint", ["'**/*.{ts,css}'", ...args]));
passthrough("check", "Run oxlint, then oxfmt --check.", (args) => runAll([["oxlint", args], ["oxfmt", ["--check", ...args]]]));
passthrough("fix", "Run oxlint --fix, then oxfmt.", (args) => runAll([["oxlint", ["--fix", ...args]], ["oxfmt", args]]));
await program.parseAsync();
//#endregion
export {};
