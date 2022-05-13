import { program as cli } from "commander";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";
import gitInfo from "./../modules/gitInfo.js";
import luamin from "lua-format";
import { time } from "console";

const cmd = cli.command("bundle");
cmd.description("Bundles a source directory of Lua files into one standalone source file.");
cmd.argument("<source>", "source directory path");
cmd.argument("[output]", "output file path", "build/bundle.lua");
cmd.option("-d --debug", "skip minification of source files", false);
cmd.option("-e --entry <string>", "the entry source file path", "init");

function getNameInfo(fullName) {
    const split = fullName.split(".");
    return { ext: split.pop(), name: split.join(".") };
}

function getSourceFiles(dir, list, top) {
    list = list ?? [];
    top = top ?? dir;
    for (let fullName of fs.readdirSync(dir)) {
        const at = path.join(dir, fullName);
        const stat = fs.lstatSync(at);
        if (stat.isDirectory()) {
            getSourceFiles(at, list, top);
        }
        else if (!stat.isFile()) continue;

        const nameInfo = getNameInfo(fullName);
        if (nameInfo.ext != "lua") continue;

        const moduleName = at.substring(top.length + 1, at.length - 4);
        const source = fs.readFileSync(at).toString();
        list.push({ name: moduleName, source: source });
    }

    return list;
}

/* Constants */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/* Escaping */
function asciiEncode(str) {
    let enc = "";
    for (let i = 0; i < str.length; i++) {
        enc += "\\" + str.charCodeAt(i);
    }
    return enc;
}

const minifySettings = { RenameVariables: true };
const requireHook = luamin.Minify(fs.readFileSync(path.join(__dirname, "../static/requireHook.lua")).toString(), minifySettings);

cmd.action(async (source, output, args) => {
    let projectName;
    const gitUrl = await gitInfo("remote.origin.url");
    if (gitUrl == "") projectName = "Bundle";
    else projectName = path.parse(new URL(gitUrl).pathname).name;

    const author = await gitInfo("user.name") ?? "Unknown";
    const timestamp = moment().format("MM/DD/yyyy HH:mm:ss");

    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
        console.log("Build directory does not exist. Making directory...");
        fs.mkdirSync(outputDir);
    }
    else if (!fs.lstatSync(outputDir).isDirectory()) cli.error("Build directory is not a directory.");

    let outSource = "";
    outSource += `-- Project: ${projectName}\n`;
    outSource += `-- Author:  ${author}\n`;
    outSource += `-- Built:   ${timestamp}\n\n`;
    outSource += requireHook + "\n";

    const sourceFiles = getSourceFiles(source);
    for (const file of sourceFiles) {
        if (args.debug) file.source = luamin.Minify(file.source, minifySettings);
        outSource += `register("${file.name}", "${asciiEncode(file.source)}")\n`;
    }

    outSource += `require("${args.entry}")`;
    fs.writeFileSync(output, outSource);
});