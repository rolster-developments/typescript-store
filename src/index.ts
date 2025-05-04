import {
  Observable,
  Observer,
  clone,
  freeze,
  observable
} from '@rolster/commons';

export type Reducer<T> = (value: T) => T;
export type Selector<T, V> = (value: T) => V;

class State<T extends LiteralObject> {
  private observable: Observable<T>;

  private _value: T;

  private _valueInitial: T;

  constructor(value: T) {
    this.observable = observable(value);
    this._value = clone(value);
    this._valueInitial = freeze(value);
  }

  public get value(): Readonly<T> {
    return this.observable.state;
  }

  public reset(): void {
    this.observable.next(this._valueInitial);
    this._value = clone(this._valueInitial);
  }

  public reduce(reducer: Reducer<T>): boolean {
    try {
      const value = reducer(this._value);

      this._value = clone(value);

      this.observable.next(reducer(value));

      return true;
    } catch {
      return false;
    }
  }

  public select<V>(selector: Selector<T, V>): V {
    return selector(clone(this._value));
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
