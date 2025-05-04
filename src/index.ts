import { Observable, Observer, observable } from '@rolster/commons';

export type Reducer<T> = (value: T) => T;
export type Selector<T, V> = (value: T) => V;

class State<T extends LiteralObject> {
  private observable: Observable<T>;

  constructor(private _value: T) {
    this.observable = observable(this._value);
  }

  public get value(): Readonly<T> {
    return this.observable.state;
  }

  public reset(): void {
    this.reduce(() => this._value);
  }

  public reduce(reducer: Reducer<T>): boolean {
    try {
      this.observable.next(reducer(this.observable.state));

      return true;
    } catch {
      return false;
    }
  }

  public select<V>(selector: Selector<T, V>): V {
    return selector(this.observable.state);
  }

  public subscribe(observer: Observer<T>): Unsubscription {
    return this.observable.subscribe(observer);
  }

  public listen(observer: Observer<T>): Unsubscription {
    return this.observable.listen(observer);
  }
}

export abstract class AbstractStore<T extends LiteralObject> {
  abstract state: Readonly<T>;

  abstract subscribe(subscriber: Observer<T>): Unsubscription;

  abstract listen(subscriber: Observer<T>): Unsubscription;

  abstract reset(): void;
}

export class Store<T extends LiteralObject> implements AbstractStore<T> {
  private _state: State<T>;

  constructor(value: T) {
    this._state = new State(value);
  }

  public get state(): Readonly<T> {
    return this._state.value;
  }

  public subscribe(subscriber: Observer<T>): Unsubscription {
    return this._state.subscribe(subscriber);
  }

  public listen(subscriber: Observer<T>): Unsubscription {
    return this._state.listen(subscriber);
  }

  public reset(): void {
    this._state.reset();
  }

  protected reduce(reducer: Reducer<T>): boolean {
    return this._state.reduce(reducer);
  }

  protected select<V>(selector: Selector<T, V>): V {
    return this._state.select(selector);
  }
}
