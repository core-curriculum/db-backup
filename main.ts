import { createClient } from "supabase";
import { config } from "./lib/config.ts";

const { SUPABASE_URL, SUPABASE_KEY } = config;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const accumulateCsv = async (
  step: number,
  getFn: (start: number, end: number) => Promise<string[]>,
): Promise<string[]> => {
  const result: string[] = [];
  let header = "";
  let pos = 0;
  while (true) {
    try {
      const [_header, ...body] = await getFn(pos, pos + step);
      if (!header) header = _header;
      if (!body || body.length === 0 || body.join("") === "") {
        return [header, ...result];
      }
      result.push(...body);
    } catch (e) {
      console.error(e);
    }
    pos = pos + step + 1;
  }
};

const getDataCsv = async (table: string, step = 500) => {
  const getFunc = async (start: number, end: number) => {
    const { data, error } = await supabase
      .from(table)
      .select()
      .range(start, end)
      .csv();

    if (error || !data) {
      throw error ?? new Error(`Error getting ex_data ${error}`);
    }
    return data.split("\n");
  };
  return await accumulateCsv(step, getFunc);
};

const dbToCsv = async (name: string) => {
  const data = await getDataCsv(name);
  const csv = data.join("\n");
  await Deno.writeTextFile(`./output/${name}.csv`, csv);
};

await dbToCsv("ex_data");
await dbToCsv("item_list");
Deno.exit();
