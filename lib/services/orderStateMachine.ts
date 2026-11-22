import type {
  OrderStatus,
  PaymentMode,
  AdvancePaymentStatus,
  BalanceCollectionStatus,
  ShipmentStatus,
  FirestoreOrder,
} from '@/types/firestore/order';

export class OrderStateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderStateMachineError';
  }
}

export class OrderStateMachine {
  /**
   * Validates whether a proposed transition is allowed based on decoupled quad-status rules
   */
  static validateTransition(
    currentOrder: Pick<
      FirestoreOrder,
      'orderStatus' | 'paymentMode' | 'advancePaymentStatus' | 'balanceCollectionStatus' | 'shipmentStatus'
    >,
    target: {
      orderStatus?: OrderStatus;
      advancePaymentStatus?: AdvancePaymentStatus;
      balanceCollectionStatus?: BalanceCollectionStatus;
      shipmentStatus?: ShipmentStatus;
    }
  ): void {
    const paymentMode = currentOrder.paymentMode;
    const effectiveAdvanceStatus = target.advancePaymentStatus ?? currentOrder.advancePaymentStatus;
    const targetOrderStatus = target.orderStatus ?? currentOrder.orderStatus;
    const targetShipmentStatus = target.shipmentStatus ?? currentOrder.shipmentStatus;

    // -------------------------------------------------------------------------
    // RULE 1: PARTIAL COD ENFORCEMENT GATE (Task 10.3)
    // For Partial COD orders, advance payment MUST be captured before order can
    // be marked 'confirmed', 'processing', or eligible for fulfillment/manifest.
    // -------------------------------------------------------------------------
    if (paymentMode === 'partial_cod') {
      const isTryingToConfirmOrFulfill =
        targetOrderStatus === 'confirmed' ||
        targetOrderStatus === 'processing' ||
        targetOrderStatus === 'completed' ||
        targetShipmentStatus === 'manifest_generated' ||
        targetShipmentStatus === 'pickup_scheduled' ||
        targetShipmentStatus === 'in_transit';

      if (isTryingToConfirmOrFulfill && effectiveAdvanceStatus !== 'captured') {
        throw new OrderStateMachineError(
          `[Partial COD Gate] Cannot advance order to "${targetOrderStatus}" or shipment to "${targetShipmentStatus}" because online advance payment is "${effectiveAdvanceStatus}" (must be "captured").`
        );
      }
    }

    // -------------------------------------------------------------------------
    // RULE 2: Terminal State Protections
    // -------------------------------------------------------------------------
    if (currentOrder.orderStatus === 'cancelled' && target.orderStatus && target.orderStatus !== 'cancelled') {
      throw new OrderStateMachineError('Cannot modify or transition a cancelled order.');
    }

    // -------------------------------------------------------------------------
    // RULE 3: Order Status Progression
    // -------------------------------------------------------------------------
    if (target.orderStatus && target.orderStatus !== currentOrder.orderStatus) {
      const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
        pending_payment: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['completed', 'cancelled'],
        completed: ['returned', 'partially_returned'],
        cancelled: [],
        returned: [],
        partially_returned: ['returned'],
      };

      const validNext = allowedOrderTransitions[currentOrder.orderStatus] || [];
      if (!validNext.includes(target.orderStatus)) {
        throw new OrderStateMachineError(
          `Invalid order status transition from "${currentOrder.orderStatus}" to "${target.orderStatus}".`
        );
      }
    }

    // -------------------------------------------------------------------------
    // RULE 4: Shipment Status Progression
    // -------------------------------------------------------------------------
    if (target.shipmentStatus && target.shipmentStatus !== currentOrder.shipmentStatus) {
      const allowedShipmentTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
        unfulfilled: ['manifest_generated'],
        manifest_generated: ['pickup_scheduled', 'unfulfilled'],
        pickup_scheduled: ['in_transit', 'manifest_generated'],
        in_transit: ['out_for_delivery', 'ndr_pending', 'rto_initiated'],
        out_for_delivery: ['delivered', 'ndr_pending', 'rto_initiated'],
        delivered: [],
        ndr_pending: ['out_for_delivery', 'rto_initiated'],
        rto_initiated: ['rto_delivered'],
        rto_delivered: [],
      };

      const validNextShipment = allowedShipmentTransitions[currentOrder.shipmentStatus] || [];
      if (!validNextShipment.includes(target.shipmentStatus)) {
        throw new OrderStateMachineError(
          `Invalid shipment status transition from "${currentOrder.shipmentStatus}" to "${target.shipmentStatus}".`
        );
      }
    }

    // -------------------------------------------------------------------------
    // RULE 5: Balance Collection Status Compatibility
    // -------------------------------------------------------------------------
    if (paymentMode === 'prepaid' && target.balanceCollectionStatus && target.balanceCollectionStatus !== 'not_applicable') {
      throw new OrderStateMachineError('Full prepaid orders must have balanceCollectionStatus "not_applicable".');
    }
  }
}
