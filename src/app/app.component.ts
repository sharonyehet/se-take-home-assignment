import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { filter, Subject, take } from 'rxjs';
import { ZeroPadPipe } from '../helpers/zero-pad.pipe';
import { IBot } from '../models/bot.model';
import { CustomerMembership } from '../models/membership.enum';
import { OrderStatus } from '../models/order.enum';
import { IOrder } from '../models/order.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [CommonModule, ZeroPadPipe],
    styleUrl: './app.component.scss',
})
export class AppComponent {
    CustomerMembership = CustomerMembership;
    private ORDER_PROCESSING_TIME_IN_MS = 10000;

    title = 'se-take-home-assignment';
    pendingVIPOrders: IOrder[] = [];
    pendingNormalOrders: IOrder[] = [];
    completeOrders: IOrder[] = [];
    bots: IBot[] = [];

    private latestOrderId = 0;
    private unprocessOrders = new Subject<IOrder>();

    onNewOrderClick(membership: CustomerMembership): void {
        const order = this.constructNewOrder(membership);
        switch (membership) {
            case CustomerMembership.Normal:
                this.pendingNormalOrders.push(order);
                break;
            case CustomerMembership.VIP:
                this.pendingVIPOrders.push(order);
                break;
        }
        this.processOrder(); // Immediately process order if bots available
    }

    onAddBotClick(): void {
        this.bots.push({
            order: null,
        });
        this.processOrder(); // Immediately process any pending order with new bot
    }

    onReduceBotClick(): void {
        const newestBot = this.bots.pop();

        if (!newestBot?.order) return;

        const order = newestBot.order;
        this.unprocessOrders.next(order); // un-process the order and back to queue at 1st position
    }

    private constructNewOrder(membership: CustomerMembership): IOrder {
        this.latestOrderId++;
        return {
            id: this.latestOrderId,
            customerMembership: membership,
            status: OrderStatus.Pending,
            remainingProcessingTime: this.ORDER_PROCESSING_TIME_IN_MS,
        };
    }

    private processOrder(): void {
        // Return if no bot available, otherwise process pending order
        const botInIDLE = this.bots.find((bot) => !bot.order);

        if (!botInIDLE) return;

        // Process vip order first, followed by normal order, return if no pending orders
        const pendingOrder =
            this.pendingVIPOrders.shift() ||
            this.pendingNormalOrders.shift() ||
            null;

        if (!pendingOrder) return;
        pendingOrder.status = OrderStatus.Processing;
        botInIDLE.order = pendingOrder;

        // 10s of processing time, complete order then process next pending order
        var remainingTime = pendingOrder.remainingProcessingTime;
        const COUNTDOWN_INTERVAL_IN_MS = 1000;

        const countdown = setInterval(() => {
            if (remainingTime === 0) {
                debugger;
                this.completeOrder(botInIDLE);
                this.processOrder();
                clearInterval(countdown);
            } else {
                debugger;
                remainingTime -= COUNTDOWN_INTERVAL_IN_MS;
                pendingOrder.remainingProcessingTime = remainingTime;
            }
        }, COUNTDOWN_INTERVAL_IN_MS);

        // get notified when any bot is being removed, to un-process current order
        this.unprocessOrderSubscription(countdown, pendingOrder.id);
    }

    private completeOrder(bot: IBot): void {
        if (!bot.order) return;

        bot.order.status = OrderStatus.Complete;
        this.completeOrders.push(bot.order);

        bot.order = null;
    }

    private unprocessOrderSubscription(timeoutId: any, orderId: number): void {
        this.unprocessOrders
            .pipe(
                // filter emitted values to handle only the affected order
                filter((order) => order.id === orderId),
                // unsubscribe after first emit as unprocess is done at this point
                take(1)
            )
            .subscribe((order) => {
                order.status = OrderStatus.Pending;
                order.remainingProcessingTime =
                    this.ORDER_PROCESSING_TIME_IN_MS;

                switch (order.customerMembership) {
                    case CustomerMembership.Normal:
                        this.pendingNormalOrders.unshift(order);
                        break;
                    case CustomerMembership.VIP:
                        this.pendingVIPOrders.unshift(order);
                        break;
                }

                // cancel the processing of affected order & continue with any pending orders
                clearInterval(timeoutId);
                this.processOrder();
            });
    }
}
