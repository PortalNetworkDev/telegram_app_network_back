import { MySQLRowDataPacket } from "@fastify/mysql";
import { QueryResult, FieldPacket } from "mysql2";

export interface Result {
  rows: MySQLRowDataPacket[];
  fields: FieldPacket[];
}

export interface DataBase {
  insert: (
    query: string,
    values?: any[]
  ) => Promise<Result | null>;

  select: (
    query: string,
    values?: any[]
  ) => Promise<Result | null>;

  update: (
    query: string,
    values?: any[]
  ) => Promise<Result | null>;
  
  query: (
    query: string,
    values?: any[]
  ) => Promise<Result | null>;
}
