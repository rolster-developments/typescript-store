import { deepFreeze } from '@rolster/helpers-advanced';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';

type State = Record<string, any>;

class StateHandler<T extends State> {
  private subject: BehaviorSubject<T>;

  constructor(private initialValue: T) {
    this.subject = new BehaviorSubject(deepFreeze(this.initialValue));
  }

  public getCurrent(): T {
    return this.subject.value;
  }

  public reset(): void {
    this.reduce(() => this.initialValue);
  }

  public reduce(reducer: (value: T) => T): boolean {
    try {
      this.subject.next(deepFreeze(reducer(this.subject.value)));

      return true;
    } catch {
      return false;
    }
  }

  public select<V>(selector: (value: T) => V): V {
    return selector(this.subject.value);
  }

  public observe(): Observable<T> {
    return this.subject.asObservable();
  }

  public subscribe(subscriber: (value: T) => void): Subscription {
    return this.observe().subscribe(subscriber);
  }
}

export abstract class AbstractStore<T extends State> {
  abstract getCurrent(): T;

  abstract reset(): void;

  abstract subscribe(subscriber: (value: T) => void): Subscription;
}

export class Store<T extends State> implements AbstractStore<T> {
  private state: StateHandler<T>;

  constructor(value: T) {
    this.state = new StateHandler(value);
  }

  public getCurrent(): T {
    return this.state.getCurrent();
  }

  public reset(): void {
    this.state.reset();
  }

  public subscribe(subscriber: (value: T) => void): Subscription {
    return this.state.subscribe(subscriber);
  }

  protected reduce(reducer: (value: T) => T): boolean {
    return this.state.reduce(reducer);
  }

  protected select<V>(selector: (value: T) => V): V {
    return this.state.select(selector);
  }

  protected observe<V>(observer: (value: T) => V): Observable<V> {
    return this.state.observe().pipe(map((state) => observer(state)));
  }
}
