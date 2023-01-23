import { load } from "dotenv";

const config = { ...Deno.env.toObject(), ...(await load()) };

export { config }
