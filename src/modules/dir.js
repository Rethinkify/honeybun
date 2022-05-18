import path from "path";
import { fileURLToPath } from "url";

export default path.dirname(path.join(fileURLToPath(import.meta.url), "../"));
