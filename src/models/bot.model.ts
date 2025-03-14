import { IOrder } from './order.model';

export enum BotType {
    Normal = 1,
    Fast = 2,
}

export interface IBot {
    order: IOrder | null;
    type: BotType;
    processingTime: number;
}
