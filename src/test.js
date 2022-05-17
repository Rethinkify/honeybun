/* Modules */
import { execSync } from "child_process";
import { exit } from "process";

/* Test code */
const bundlePath = process.argv[2];
try {
    const stdout = execSync("luajit " + bundlePath);
    if (!stdout.includes("Hello, World!")) {
        console.error("Test failed (2): " + stdout);
        exit(2);
    }
    console.log("Test passed");
} catch (e) {
    console.error("Test failed (1): " + e.stderr);
    exit(1);
}
