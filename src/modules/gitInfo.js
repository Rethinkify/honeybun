import { exec as _exec } from "child_process";
import { promisify } from "util";
const exec = promisify(_exec);

export default async function(prop) {
    const info = (await exec("git config --get " + prop)).stdout.trim();
    return (info == "") ? null : info;
}