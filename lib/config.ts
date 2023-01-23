import { load } from "dotenv";

type Config = {
  SUPABASE_URL: string,
  SUPABASE_KEY: string
}

const config = { ...Deno.env.toObject(), ...(await load()) } as Config;

export { config }
