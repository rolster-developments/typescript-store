import { deepFreeze } from '@rolster/helpers-advanced';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';

type UnSubscription = () => void;

class State<T extends LiteralObject> {
  private subject: BehaviorSubject<T>;

  constructor(private value: T) {
    this.subject = new BehaviorSubject(deepFreeze(this.value));
  }

  public getCurrent(): T {
    return this.subject.value;
  }

  public reset(): void {
    this.reduce(() => this.value);
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

export abstract class AbstractStore<T extends LiteralObject> {
  abstract currentState: T;

  abstract reset(): void;

  abstract subscribe(subscriber: (value: T) => void): UnSubscription;
}

export class Store<T extends LiteralObject> implements AbstractStore<T> {
  private state: State<T>;

  constructor(value: T) {
    this.state = new State(value);
  }

  public get currentState(): T {
    return this.state.getCurrent();
  }

  public reset(): void {
    this.state.reset();
  }

  public subscribe(subscriber: (value: T) => void): UnSubscription {
    const subscription = this.state.subscribe(subscriber);

    return () => subscription.unsubscribe();
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
