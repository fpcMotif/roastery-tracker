import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";

export type Beans = FunctionReturnType<typeof api.beans.list>;
export type SyncStatus = FunctionReturnType<typeof api.beans.status>;
