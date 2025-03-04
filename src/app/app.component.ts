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
        this.processOrder();
    }

    onAddBotClick(): void {
        this.bots.push({
            order: null,
        });
        this.processOrder();
    }

    onReduceBotClick(): void {
        const newestBot = this.bots.pop();

        if (!newestBot?.order) return;

        const order = newestBot.order;
        this.unprocessOrders.next(order);
    }

    private constructNewOrder(membership: CustomerMembership): IOrder {
        this.latestOrderId++;
        return {
            id: this.latestOrderId,
            customerMembership: membership,
            status: OrderStatus.Pending,
        };
    }

    private processOrder(): void {
        const botInIDLE = this.bots.find((bot) => !bot.order);

        if (!botInIDLE) return;

        const pendingOrder =
            this.pendingVIPOrders.shift() ||
            this.pendingNormalOrders.shift() ||
            null;

        if (!pendingOrder) return;
        pendingOrder.status = OrderStatus.Processing;
        botInIDLE.order = pendingOrder;

        const timeout = setTimeout(() => {
            this.completeOrder(botInIDLE);
            this.processOrder();
        }, 10000);

        this.unprocessOrderSubscription(timeout, pendingOrder.id);
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
                filter((order) => order.id === orderId),
                take(1)
            )
            .subscribe((order) => {
                order.status = OrderStatus.Pending;

                switch (order.customerMembership) {
                    case CustomerMembership.Normal:
                        this.pendingNormalOrders.unshift(order);
                        console.log(this.pendingNormalOrders);
                        break;
                    case CustomerMembership.VIP:
                        this.pendingVIPOrders.unshift(order);
                        break;
                }

                clearTimeout(timeoutId);
                this.processOrder();
            });
    }
}
