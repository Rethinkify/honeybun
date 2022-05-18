/* Metadata */
export const info = "Minify a Lua source file";

export const params = [
    {
        name: "source",
        required: true,
        info: "The source file",
    },
];

export const options = [

];

/* Modules */
import minify from "../modules/lua/minify.js";
import fs from "fs";

/* Callback */
export function callback({ source: file }, options, cmd) {
    const source = fs.readFileSync(file).toString();
    console.log(minify(source));
}