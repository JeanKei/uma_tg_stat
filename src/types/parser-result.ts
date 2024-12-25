import { ChannelMetric } from "../entities/channel-metric";
import { ChatMetric } from "../entities/chat-metric";
import { GeneralMetric } from "../entities/general-metric";

export type ParserResult =
	| { general?: GeneralMetric; chat?: ChatMetric }
	| { general?: GeneralMetric; channel?: ChannelMetric }
	| null;
