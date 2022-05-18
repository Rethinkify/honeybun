/* Modules */
import { parse } from "luaparse";

/* Minify */
function onAstParse(ast) {}

function getCode(token, funcs) {
    if (token.type === "Identifier") {
        return token.name;
    } else if (token.type === "StringLiteral") {
        return token.raw;
    } else if (token.type === "NumericLiteral") {
        return token.raw;
    } else if (token.type === "LocalStatement") {
        const { variables: vars, init } = token;
        let code = "local ";
        let decl = "",
            data = "";

        for (let i = 0; i < vars.length; i++) {
            decl += getCode(vars[i]) + ",";
            data += getCode(init[i]) + ",";
        }

        code += `${decl.slice(0, -1)}=${data.slice(0, -1)}`;
        if (init[init.length - 1].type !== "StringLiteral") {
            code += ";";
        }

        return code;
    }
}

export default function (source) {
    let min = "";

    const ast = parse(source, {
        comments: false,
    }).body;

    for (const t of ast) {
        min += getCode(t);
    }

    return min;
}
