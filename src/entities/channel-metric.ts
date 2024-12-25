import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity("channels_metrics")
export class ChannelMetric {
	@PrimaryColumn()
	username: string;

	@Column({ nullable: true })
	subscribers?: number;

	@Column({ nullable: true })
	dailySubscribers?: number;

	@Column({ type: "float", nullable: true })
	quoteIndex?: number;

	@Column({ nullable: true })
	avgPostReach?: number;

	@Column({ nullable: true })
	avgAdPostReach?: number;

	@Column({ nullable: true })
	storiesViews?: number;

	@Column({ nullable: true })
	posts?: number;

	@Column({ type: "float", nullable: true })
	readPercentage?: number;

	@Column({ type: "float", nullable: true })
	dailyReadPercentage?: number;

	@Column({ type: "float", nullable: true })
	erPercentage?: number;

	@Column({ type: "float", nullable: true })
	maleAuditoryPercentage?: number;

	@UpdateDateColumn({ type: "timestamptz" })
	updatedAt: Date;

	@CreateDateColumn({ type: "timestamptz" })
	createdAt: Date;
}
