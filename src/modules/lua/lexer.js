// prettier-ignore
const keywords = [
    "and",   "break", "do",       "else",     "elseif", "end",
    "false", "for",   "function", "if",       "in",     "local",
    "nil",   "not",   "or",       "repeat",   "return", "then",
    "true",  "until", "while",    "continue",
];

// prettier-ignore
const tokens = [
    "..", "...", "==", ">=", "<=", "~=",
    "<number>", "<name>", "<string>", "<eof>",
];

class LexicalContext {
    constructor(src) {
        this.src = src;
        this.tokens = [];
        this.pos = 0;
        this.line = 1;
        this.col = 1;
    }
    peek(forward) {
        return this.src[this.pos + (forward ?? 0)];
    }
    nextChar() {
        return this.src[this.pos++];
    }
    pushToken(t) {
        t.ctx = this;
        this.tokens.push(t);
    }
}

class Token {
    constructor(context) {
        this.type = "";
        this.raw = "";
        this.line = 0;
        this.column = 0;
        this.ctx = context ?? null;
    }
}

export default function llex(src) {
    const ctx = new LexicalContext(src);
    for (let c = ctx.peek(); c !== undefined; c = ctx.nextChar()) {
        const t = new Token();
        if (c === " " || c === "\t" || c === "\n" || c === "\r") {
            t.type = "Whitespace";
            t.raw = c;
            continue;
        }
        else if (c === "\"") {
            let value = "";
            t.type = "String";

            while ((c = ctx.nextChar()) !== "\"") {
                if (c === undefined) {
                    throw new Error(`Unterminated string at line ${ctx.line}`);
                }
                else if (c === "\\") {
                    const next = ctx.peek(1);
                    if (next === "n") {
                        value += "\n";
                        continue;
                    }
                    else if (next === "r") {
                        value += "\r";
                        continue;
                    }
                    else if (next === "t") {
                        value += "\t";
                        continue;
                    }
                    else if (next === "\\") {
                        value += "\\";
                        continue;
                    }
                    else if (next === "\"") {
                        value += "\"";
                        continue;
                    }
                }
            }
        }
        ctx.pushToken(t);
    }
}
