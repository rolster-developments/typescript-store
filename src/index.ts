import { Observable, Observer, freeze, observable } from '@rolster/commons';

export type Reducer<T> = (value: Readonly<T>) => T;
export type Selector<T, V> = (value: Readonly<T>) => V;

class State<T extends LiteralObject> {
  private observable: Observable<T>;

  private _initial: T;

  constructor(value: T) {
    this.observable = observable(value);
    this._initial = freeze(value);
  }

  public get value(): Readonly<T> {
    return this.observable.value;
  }

  public reset(): void {
    this.observable.next(this._initial);
  }

  public reduce(reducer: Reducer<T>): void {
    this.observable.next(reducer(this.observable.value));
  }

  public select<V>(selector: Selector<T, V>): V {
    return selector(this.observable.value);
  }

  public subscribe(observer: Observer<T>): Unsubscription {
    return this.observable.subscribe(observer);
  }

  public listen(observer: Observer<T>): Unsubscription {
    return this.observable.listen(observer);
  }
}

export abstract class AbstractStore<T extends LiteralObject> {
  abstract value: Readonly<T>;

  abstract subscribe(subscriber: Observer<T>): Unsubscription;

  abstract listen(subscriber: Observer<T>): Unsubscription;

  abstract reset(): void;
}

export class Store<T extends LiteralObject> implements AbstractStore<T> {
  private state: State<T>;

  constructor(value: T) {
    this.state = new State(value);
  }

  public get value(): Readonly<T> {
    return this.state.value;
  }

  public setValue(value: Partial<T>): void {
    this.state.reduce((state) => ({ ...state, ...value }));
  }

  public subscribe(subscriber: Observer<T>): Unsubscription {
    return this.state.subscribe(subscriber);
  }

  public listen(subscriber: Observer<T>): Unsubscription {
    return this.state.listen(subscriber);
  }

  public reset(): void {
    this.state.reset();
  }

  protected reduce(reducer: Reducer<T>): void {
    this.state.reduce(reducer);
  }

  protected select<V>(selector: Selector<T, V>): V {
    return this.state.select(selector);
  }
}
