import { useDI } from "./di";

export function useDB(): AppDataSource {
  return useDI().db;
}
