/* Metadata */
export const info = "Preprocess a Lua source file or folder";

export const params = [
    {
        name: "source",
        required: true,
        info: "The main source file or folder",
    },
];

export const options = [

];

/* Modules */
import { parse } from "luaparse";
import fs from "fs";

/* Callback */
export function callback({ source: file }, options, cmd) {
    const source = fs.readFileSync(file).toString();
    const ast = parse(source, {
        locations: true
    });
    console.log(ast.body[1].loc);
}