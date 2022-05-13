import { program as cli } from "commander";
import "./commands/bundle.js";

cli.name("honeybun");
cli.parse(process.argv);