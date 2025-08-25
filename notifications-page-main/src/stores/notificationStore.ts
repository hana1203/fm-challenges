import { Data } from "../types/data.js";
import { ReadState } from "../types/state.js";

export class NotificationStore {
  private readState: ReadState = {};
  private subscribers: Array<() => void> = [];

  constructor(initialData: Data[]) {
    this.initializeState(initialData);
  }
  private initializeState(data: Data[]) {
    data.forEach((item) => (this.readState[item.id] = item.seen));
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  getReadState(): ReadState {
    return { ...this.readState };
  }

  getUnreadCount(): number {
    return Object.values(this.readState).filter((val) => val == false).length;
  }

  markAsRead(id: string) {
    if (!(id in this.readState) || this.readState[id] == true) return;
    this.readState[id] = true;
    this.notifySubscribers();
  }

  markAllAsRead() {
    Object.keys(this.readState).forEach((key) => {
      this.readState[key] = true;
    });
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }
}
