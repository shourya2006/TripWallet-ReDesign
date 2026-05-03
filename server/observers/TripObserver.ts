import EventBus from '../events/EventBus';
import NotificationFactory from '../factories/NotificationFactory';
import { Types } from 'mongoose';

export class TripObserver {
  constructor() {
    this.register();
  }

  private register() {
    const eventBus = EventBus.getInstance();
    
    eventBus.on('trip.created', async (data: { tripId: string | Types.ObjectId, senderId: string | Types.ObjectId, participants: string[] }) => {
      console.log(`[TripObserver] Received trip.created event for trip ${data.tripId}`);
      try {
        for (const recipientId of data.participants) {
          await NotificationFactory.create('TRIP_INVITE', recipientId, data.senderId, data.tripId);
        }
      } catch (error) {
        console.error('[TripObserver] Failed to process trip.created event:', error);
      }
    });
  }
}
