import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("chats_metrics")
export class ChatMetric {
	@PrimaryColumn()
	username: string;

	@Column({ nullable: true })
	members?: number;

	@Column({ nullable: true })
	dailyMembers?: number;

	@Column({ nullable: true })
	activeMembers?: number;

	@Column({ nullable: true })
	onlineMembers?: number;

	@Column({ type: "float", nullable: true })
	maleMembersPercentage?: number;

	@Column({ nullable: true })
	messages?: number;

	@Column({ type: "timestamp without time zone", nullable: true })
	startedAt: Date;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt: Date;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt: Date;
}
