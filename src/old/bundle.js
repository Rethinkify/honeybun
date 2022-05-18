/* Modules */
import { program as cli } from "commander";
import fs from "fs";
import path from "path";
import moment from "moment";
import getConfig from "./../modules/config.js";
import luamin from "lua-format";
import escape from "./../modules/escape.js";
import { __srcname } from "./../modules/dir.js";

/* Command Setup */
const cmd = cli.command("bundle");
cmd.description("Bundles a source directory of Lua files into one standalone source file.");
cmd.argument("<source>", "source directory path");
cmd.option("-d --debug", "skip minification of source files", false);
cmd.option("-e --entry <string>", "the entry source file path", "init");

/* Utility */
function getSourceFiles(dir, list, top) {
    list = list ?? [];
    top = top ?? dir;

    for (let fullName of fs.readdirSync(dir)) {
        const at = path.join(dir, fullName);

        const stat = fs.lstatSync(at);
        if (stat.isDirectory()) {
            getSourceFiles(at, list, top);
            continue;
        } else if (!stat.isFile()) {
            continue;
        } else if (path.parse(fullName).ext != ".lua") {
            continue;
        }

        const moduleName = at.substring(top.length + 1, at.length - 4);
        const source = fs.readFileSync(at).toString();
        list.push({ name: moduleName, source: source });
    }

    return list;
}

/* Source Constants */
const minifySettings = { RenameVariables: true };
const requireHook = luamin.Minify(fs.readFileSync(path.join(__srcname, "static/requireHook.lua")).toString(), minifySettings);

/* Command Execution */
cmd.action(async (source, args) => {
    // Source directory
    if (!fs.existsSync(source)) {
        cli.error("Source directory does not exist.");
    } else if (!fs.lstatSync(source).isDirectory()) {
        cli.error("Source directory is not a directory.");
    }

    // Load configuration
    const config = getConfig(path.join(source, "honeybun.toml"));

    // Output directory
    let outputDir = path.dirname(config.project.outFile);
    if (!fs.existsSync(outputDir)) {
        console.log("Build directory does not exist. Making directory...");
        fs.mkdirSync(outputDir);
    }

    // Output source
    let outSrc =
        `-- Project: ${config.project.name}\n` +
        `-- Author:  ${config.author.name}\n` +
        `-- Built:   ${moment().format("MM/DD/yyyy HH:mm:ss")}\n\n` +
        requireHook +
        "\n";

    // Get source files and setup module names
    const sourceFiles = getSourceFiles(source);
    for (const file of sourceFiles) {
        if (!args.debug) {
            file.source = luamin.Minify(file.source, minifySettings);
        }
        outSrc += `register("${file.name.replace("\\", "/")}", "${escape(file.source)}")\n`;
    }

    // Setup entry call then write output file
    outSrc += `require("${args.entry}")\n`;
    fs.writeFileSync(config.project.outFile, outSrc);
});
