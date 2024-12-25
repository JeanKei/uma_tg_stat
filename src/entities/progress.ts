import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { NumericColumnTransformer } from "../typeorm/numeric-column.transformer";

@Entity("progress")
export class Progress {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: "bigint",
		default: 0,
		transformer: new NumericColumnTransformer(),
	})
	current: number;

	@Column({
		type: "bigint",
		default: 0,
		transformer: new NumericColumnTransformer(),
	})
	updated: number;

	@Column({ default: true })
	isActive: boolean;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt: Date;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt: Date;
}
