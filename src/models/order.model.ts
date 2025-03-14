import { CustomerMembership } from './membership.enum';
import { OrderStatus } from './order.enum';

export interface IOrder {
    id: number;
    customerMembership: CustomerMembership;
    status: OrderStatus;
    remainingProcessingTime: number;
}
