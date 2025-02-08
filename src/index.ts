import { freeze } from '@rolster/commons';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';

class State<T extends LiteralObject> {
  private subject: BehaviorSubject<T>;

  constructor(private value: T) {
    this.subject = new BehaviorSubject(freeze(this.value));
  }

  public getCurrent(): Readonly<T> {
    return this.subject.value;
  }

  public reset(): void {
    this.reduce(() => this.value);
  }

  public reduce(reducer: (value: T) => T): boolean {
    try {
      this.subject.next(freeze(reducer(this.subject.value)));

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
  abstract state: Readonly<T>;

  abstract reset(): void;

  abstract subscribe(subscriber: (value: T) => void): Unsubscription;
}

export class Store<T extends LiteralObject> implements AbstractStore<T> {
  private _state: State<T>;

  constructor(value: T) {
    this._state = new State(value);
  }

  public get state(): Readonly<T> {
    return this._state.getCurrent();
  }

  public reset(): void {
    this._state.reset();
  }

  public subscribe(subscriber: (value: T) => void): Unsubscription {
    const subscription = this._state.subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  }

  protected reduce(reducer: (value: T) => T): boolean {
    return this._state.reduce(reducer);
  }

  protected select<V>(selector: (value: T) => V): V {
    return this._state.select(selector);
  }

  protected observe<V>(observer: (value: T) => V): Observable<V> {
    return this._state.observe().pipe(map((state) => observer(state)));
  }
}
