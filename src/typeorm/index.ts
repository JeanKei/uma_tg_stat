import { config } from "dotenv";
import { get } from "env-var";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { entities } from "../entities";
config();

export const dataSource = new DataSource({
	type: "postgres",
	namingStrategy: new SnakeNamingStrategy(),
	url: get("POSTGRES_CONNECTION_STRING").required().asString(),
	entities,
	synchronize: true,
});
