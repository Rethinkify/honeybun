/* Metadata */
export const info = "Run a test command";
export const params = [
    {
        name: "source",
        required: false,
        info: "The source file.",
    },
];
export const options = [
    {
        name: "debug",
        alias: "d"
    },
];

/* Callback */
export function callback(params, options, cmd) {
    console.log(params, options);
}