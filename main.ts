import { createClient } from 'supabase'
import { load } from "dotenv";

const { SUPABASE_URL, SUPABASE_KEY } = { ...Deno.env.toObject(), ...(await load()) } as Record<string, string>;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const accumulateCsv = async (step: number, getFn: (start: number, end: number) => Promise<string[]>): Promise<string[]> => {
  const result: string[] = [];
  let header = "";
  let pos = 0;
  while (true) {
    const [_header, ...body] = await getFn(pos, pos + step);
    pos = pos + step + 1;
    if (!header) header = _header;
    if (!body || body.length === 0 || body.join("") === "") return [header, ...result];
    result.push(...body);
  }
}

const getDataCsv = async (table: string, step = 500) => {
  const getFunc = async (start: number, end: number) => {
    const { data, error } = await supabase
      .from(table)
      .select()
      .range(start, end)
      .csv()

    if (error || !data) throw error ?? new Error(`Error getting ex_data ${error}`);
    return data.split("\n");
  }
  return await accumulateCsv(step, getFunc)
}

const dbToCsv = async (name: string) => {
  const data = await getDataCsv(name);
  const csv = data.join("\n");
  await Deno.writeTextFile(`./output/${name}.csv`, csv)
}

await dbToCsv("ex_data")
await dbToCsv("item_list")

