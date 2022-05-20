/* Modules */
import { program as cli } from "commander";
import fs from "fs";
import { pathToFileURL } from "url"; // Fuck you Microsoft
import path from "path";
import sourceDir from "./modules/dir.js";

/* Setup */
for (let cmdModule of fs.readdirSync(path.join(sourceDir, "commands"))) { // i apologize for this messy code - to future me from me
    const {
        info: description,
        params,
        options,
        callback,
    } = await import(pathToFileURL(path.join(sourceDir, "commands", cmdModule)));
    const cmd = cli.command(path.parse(cmdModule).name);

    if (description) {
        cmd.description(description);
    }

    const paramNameMap = [];
    if (params) {
        let i = 0;
        for (const { name, info, required, default: fallback } of params) {
            paramNameMap[i++] = name;
            if (required) {
                cmd.argument(`<${name}>`, info, fallback);
                continue;
            }
            cmd.argument(`[${name}]`, info, fallback);
        }
    }

    if (options) {
        for (const { name: _name, alias, info, default: fallback } of options) {
            const name = alias ? `-${alias}, --${_name}` : `--${_name}`;
            cmd.option(name, info, fallback);
        }
    }

    if (callback) {
        cmd.action((...varargs) => {
            const args = {};
            const cmd = varargs.pop(),
                options = varargs.pop();
            for (let i = 0; i < varargs.length; i++) {
                args[paramNameMap[i]] = varargs[i];
            }
            callback(args, options, cmd);
        });
    }
}

cli.name("honeybun");
cli.parse(process.argv);
