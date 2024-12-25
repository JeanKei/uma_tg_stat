import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("general_metrics")
export class GeneralMetric {
	@PrimaryColumn()
	username: string;

	@Column({ nullable: true })
	title?: string;

	@Column({ nullable: true })
	isVerified?: boolean;

	@Column({ nullable: true })
	geo?: string;

	@Column({ nullable: true })
	language?: string;

	@Column({ nullable: true })
	category?: string;

	@Column({ nullable: true })
	avatarUrl?: string;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt: Date;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt: Date;
}
