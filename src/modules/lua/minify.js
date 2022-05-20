/* Modules */
import { parse, ast as LuaAst } from "luaparse";

/* Util */
function getLiteral(t) {
    switch (t.type.split("Literal").shift()) {
        case "String": {
            return t.raw;
        }
        case "Numeric": {
            return t.raw;
        }
        default: {
            console.log("Unknown literal: ", JSON.stringify(t));
            return "";
        }
    }
}

function getExpr(t) {
    switch (t.type.split("Expression").shift()) {
        case "Call": {
            return `${getCode(t.base)}(${t.arguments.map(getCode).join(",")})`;
        }
        case "Binary": {
            return getCode(t.left) + t.operator + getCode(t.right);
        }
        default: {
            console.log("Unknown expression: ", JSON.stringify(t));
            return "";
        }
    }
}

function getStatement(t) {
    switch (t.type.split("Statement").shift()) {
        case "Assignment": {
            return `${t.left.name} = ${getExpr(t.right)}`;
        }
        case "Local": {
            let decl = "",
                data = "";

            for (let i = 0; i < t.variables.length; i++) {
                decl += getCode(t.variables[i]) + ",";
                data += getCode(t.init[i]) + ",";
            }

            const code = `local ${decl.slice(0, -1)}=${data.slice(0, -1)}`;
            if (t.init[t.init.length - 1].type !== "StringLiteral") {
                return code + ";";
            }

            return code;
        }
        case "Call": {
            return getCode(t.expression);
        }
        default: {
            console.log("Unknown statement: ", JSON.stringify(t));
            return "";
        }
    }
}

function getCode(t) {
    if (t.type === "Identifier") {
        return t.name;
    } else if (t.type.endsWith("Literal")) {
        return getLiteral(t);
    } else if (t.type.endsWith("Expression")) {
        return getExpr(t);
    } else if (t.type.endsWith("Statement")) {
        return getStatement(t);
    }

    console.log("Unknown token: ", JSON.stringify(t));
    return "";
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
