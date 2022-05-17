/* Modules */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import toml from "toml";

/* Utilities */
function findInGit(prop) {
    try {
        const output = execSync("git config --get " + prop)
            .toString()
            .trim();
        return output.length == 0 ? null : output;
    } catch (e) {
        return e.stderr.toString().trim();
    }
}

function mergeConfig(one, two) {
    for (const key in two) {
        const [val1, val2] = [one[key], two[key]];
        if (typeof val2 === "object") {
            one[key] = val1 ?? {};
            mergeConfig(val1, val2);
        } else if (!val1) {
            one[key] = val2;
        }
    }
}

/* Get configuration */
export default function (configPath) {
    let config = {};
    if (fs.existsSync(configPath)) {
        config = toml.parse(fs.readFileSync(configPath).toString());
    }

    config.project = config.project ?? {};
    config.project.url = config.project.url ?? findInGit("remote.origin.url");
    config.project.name = config.project.name ?? (config.project.url ? path.parse(new URL(config.project.url).pathname).name : null);
    config.project.outFile = config.project.outFile;

    config.author = config.author ?? {};
    config.author.name = config.author.name ?? findInGit("user.name");

    mergeConfig(config, {
        project: {
            url: null,
            name: "Unnamed",
            outFile: "build/bundle.lua",
        },
        author: {
            name: "Unknown",
        },
    });

    return config;
}
