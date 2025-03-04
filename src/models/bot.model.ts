import { IOrder } from './order.model';

export interface IBot {
    order: IOrder | null;
}
