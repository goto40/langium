/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

/**
 * A stream is a read-only sequence of values. While the contents of an array can be accessed
 * both sequentially and randomly (via index), a stream allows only sequential access.
 *
 * The advantage of this is that a stream can be evaluated lazily, so it does not require
 * to store intermediate values. This can boost performance when a large sequence is
 * processed via filtering, mapping etc. and accessed at most once. However, lazy
 * evaluation means that all processing is repeated when you access the sequence multiple
 * times; in such a case, it may be better to store the resulting sequence into an array.
 */
export interface Stream<T> extends Iterable<T> {

    /**
     * Returns an iterator for this stream. This is the same as calling the `Symbol.iterator` function property.
     */
    iterator(): Iterator<T, undefined>;

    /**
     * Determines whether this stream contains no elements.
     */
    isEmpty(): boolean;

    /**
     * Collects all elements of this stream into an array.
     */
    toArray(): T[];

    /**
     * Returns a string representation of a stream.
     */
    toString(): string;

    /**
     * Combines two streams by returning a new stream that yields all elements of this stream and the other stream.
     *
     * @param other Stream to be concatenated with this one.
     */
    concat<T2>(other: Iterable<T2>): Stream<T | T2>;

    /**
     * Adds all elements of the stream into a string, separated by the specified separator string.
     *
     * @param separator A string used to separate one element of the stream from the next in the resulting string.
     *        If omitted, the steam elements are separated with a comma.
     */
    join(separator?: string): string

    /**
     * Returns the index of the first occurrence of a value in the stream, or -1 if it is not present.
     *
     * @param searchElement The value to locate in the array.
     * @param fromIndex The stream index at which to begin the search. If fromIndex is omitted, the search
     *        starts at index 0.
     */
    indexOf(searchElement: T, fromIndex?: number): number;

    /**
     * Determines whether all members of the stream satisfy the specified test.
     *
     * @param predicate This method calls the predicate function for each element in the stream until the
     *        predicate returns a value which is coercible to the Boolean value `false`, or until the end
     *        of the stream.
     */
    every<S extends T>(predicate: (value: T) => value is S): this is Stream<S>;
    every(predicate: (value: T) => unknown): boolean;

    /**
     * Determines whether any member of the stream satisfies the specified test.
     *
     * @param predicate This method calls the predicate function for each element in the stream until the
     *        predicate returns a value which is coercible to the Boolean value `true`, or until the end
     *        of the stream.
     */
    some(predicate: (value: T) => unknown): boolean;

    /**
     * Performs the specified action for each element in the stream.
     *
     * @param callbackfn Function called once for each element in the stream.
     */
    forEach(callbackfn: (value: T, index: number) => void): void;

    /**
     * Returns a stream that yields the results of calling the specified callback function on each element
     * of the stream. The function is called when the resulting stream elements are actually accessed, so
     * accessing the resulting stream multiple times means the function is also called multiple times for
     * each element of the stream.
     *
     * @param callbackfn Lazily evaluated function mapping stream elements.
     */
    map<U>(callbackfn: (value: T) => U): Stream<U>;

    /**
     * Returns the elements of the stream that meet the condition specified in a callback function.
     * The function is called when the resulting stream elements are actually accessed, so accessing the
     * resulting stream multiple times means the function is also called multiple times for each element
     * of the stream.
     *
     * @param predicate Lazily evaluated function checking a condition on stream elements.
     */
    filter<S extends T>(predicate: (value: T) => value is S): Stream<S>;
    filter(predicate: (value: T) => unknown): Stream<T>;

    /**
     * Calls the specified callback function for all elements in the stream. The return value of the
     * callback function is the accumulated result, and is provided as an argument in the next call to
     * the callback function.
     *
     * @param callbackfn This method calls the function once for each element in the stream, providing
     *        the previous and current values of the reduction.
     * @param initialValue If specified, `initialValue` is used as the initial value to start the
     *        accumulation. The first call to the function provides this value as an argument instead
     *        of a stream value.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T) => T): T | undefined;
    reduce<U = T>(callbackfn: (previousValue: U, currentValue: T) => U, initialValue: U): U;

    /**
     * Calls the specified callback function for all elements in the stream, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     *
     * @param callbackfn This method calls the function once for each element in the stream, providing
     *        the previous and current values of the reduction.
     * @param initialValue If specified, `initialValue` is used as the initial value to start the
     *        accumulation. The first call to the function provides this value as an argument instead
     *        of an array value.
     */
    reduceRight(callbackfn: (previousValue: T, currentValue: T) => T): T | undefined;
    reduceRight<U = T>(callbackfn: (previousValue: U, currentValue: T) => U, initialValue: U): U;

    /**
     * Returns the value of the first element in the stream that meets the condition, or `undefined`
     * if there is no such element.
     *
     * @param predicate This method calls `predicate` once for each element of the stream, in ascending
     *        order, until it finds one where `predicate` returns a value which is coercible to the
     *        Boolean value `true`.
     */
    find<S extends T>(predicate: (value: T) => value is S): S | undefined;
    find(predicate: (value: T) => unknown): T | undefined;

    /**
     * Returns the index of the first element in the stream that meets the condition, or `-1`
     * if there is no such element.
     *
     * @param predicate This method calls `predicate` once for each element of the stream, in ascending
     *        order, until it finds one where `predicate` returns a value which is coercible to the
     *        Boolean value `true`.
     */
    findIndex(predicate: (value: T) => unknown): number;

    /**
     * Determines whether the stream includes a certain element, returning `true` or `false` as appropriate.
     *
     * @param searchElement The element to search for.
     */
    includes(searchElement: T): boolean;

    /**
     * Calls a defined callback function on each element of the stream and then flattens the result into
     * a new stream. This is identical to a `map` followed by `flat` with depth 1.
     *
     * @param callback Lazily evaluated function mapping stream elements.
     */
    flatMap<U>(callbackfn: (value: T) => U | Iterable<U>): Stream<U>;

    /**
     * Returns a new stream with all sub-stream or sub-array elements concatenated into it recursively up
     * to the specified depth.
     *
     * @param depth The maximum recursion depth. Defaults to 1.
     */
    flat(depth?: number): Stream<T>;

    /**
     * Returns the first element in the stream, or `undefined` if the stream is empty.
     */
    head(): T | undefined;

    /**
     * Returns a stream that skips the first `skipCount` elements from this stream.
     *
     * @param skipCount The number of elements to skip. If this is larger than the number of elements in
     *        the stream, an empty stream is returned. Defaults to 1.
     */
    tail(skipCount?: number): Stream<T>;

    /**
     * Returns a stream containing only the distinct elements from this stream. Equality is determined
     * with the same rules as a standard `Set`.
     *
     * @param by A function returning the key used to check equality with a previous stream element.
     *        If omitted, the stream elements themselves are used for comparison.
     */
    distinct<Key = T>(by?: (element: T) => Key): Stream<T>;

}

/**
 * The default implementation of `Stream` works with two input functions:
 *  - The first function creates the initial state of an iteration.
 *  - The second function gets the current state as argument and returns an `IteratorResult`.
 */
export class StreamImpl<S, T> implements Stream<T> {
    protected readonly startFn: () => S;
    protected readonly nextFn: (state: S) => IteratorResult<T>;

    constructor(startFn: () => S, nextFn: (state: S) => IteratorResult<T, undefined>) {
        this.startFn = startFn;
        this.nextFn = nextFn;
    }

    iterator(): Iterator<T, undefined> {
        const iterator = {
            state: this.startFn(),
            next: () => this.nextFn(iterator.state),
            [Symbol.iterator]: () => iterator
        };
        return iterator;
    }

    [Symbol.iterator](): Iterator<T> {
        return this.iterator();
    }

    isEmpty(): boolean {
        const iterator = this.iterator();
        return !!iterator.next().done;
    }

    toArray(): T[] {
        const result: T[] = [];
        const iterator = this.iterator();
        let next: IteratorResult<T>;
        do {
            next = iterator.next();
            if (next.value !== undefined) {
                result.push(next.value);
            }
        } while (!next.done);
        return result;
    }

    toString(): string {
        return this.join();
    }

    concat<T2>(other: Iterable<T2>): Stream<T | T2> {
        const iterator = other[Symbol.iterator]();
        return new StreamImpl<{ first: S, firstDone: boolean }, T | T2>(
            () => ({ first: this.startFn(), firstDone: false }),
            state => {
                let result: IteratorResult<T | T2>;
                if (!state.firstDone) {
                    do {
                        result = this.nextFn(state.first);
                        if (!result.done) {
                            return result;
                        }
                    } while (!result.done);
                    state.firstDone = true;
                }
                do {
                    result = iterator.next();
                    if (!result.done) {
                        return result;
                    }
                } while (!result.done);
                return DONE_RESULT;
            }
        );
    }

    join(separator = ','): string {
        const iterator = this.iterator();
        let value = '';
        let result: IteratorResult<T>;
        let addSeparator = false;
        do {
            result = iterator.next();
            if (!result.done) {
                if (addSeparator) {
                    value += separator;
                }
                value += toString(result.value);
            }
            addSeparator = true;
        } while (!result.done);
        return value;
    }

    indexOf(searchElement: T, fromIndex = 0): number {
        const iterator = this.iterator();
        let index = 0;
        let next = iterator.next();
        while (!next.done) {
            if (index >= fromIndex && next.value === searchElement) {
                return index;
            }
            next = iterator.next();
            index++;
        }
        return -1;
    }

    every(predicate: (value: T) => unknown): boolean {
        const iterator = this.iterator();
        let next = iterator.next();
        while (!next.done) {
            if (!predicate(next.value)) {
                return false;
            }
            next = iterator.next();
        }
        return true;
    }

    some(predicate: (value: T) => unknown): boolean {
        const iterator = this.iterator();
        let next = iterator.next();
        while (!next.done) {
            if (predicate(next.value)) {
                return true;
            }
            next = iterator.next();
        }
        return false;
    }

    forEach(callbackfn: (value: T, index: number) => void): void {
        const iterator = this.iterator();
        let index = 0;
        let next = iterator.next();
        while (!next.done) {
            callbackfn(next.value, index);
            next = iterator.next();
            index++;
        }
    }

    map<U>(callbackfn: (value: T) => U): Stream<U> {
        return new StreamImpl<S, U>(
            this.startFn,
            (state) => {
                const { done, value } = this.nextFn(state);
                if (done) {
                    return DONE_RESULT;
                } else {
                    return { done: false, value: callbackfn(value) };
                }
            }
        );
    }

    filter(predicate: (value: T) => unknown): Stream<T> {
        return new StreamImpl<S, T>(
            this.startFn,
            state => {
                let result: IteratorResult<T>;
                do {
                    result = this.nextFn(state);
                    if (!result.done && predicate(result.value)) {
                        return result;
                    }
                } while (!result.done);
                return DONE_RESULT;
            }
        );
    }

    reduce<U>(callbackfn: (previousValue: U | T, currentValue: T) => U, initialValue?: U): U | T | undefined {
        const iterator = this.iterator();
        let previousValue: U | T | undefined = initialValue;
        let next = iterator.next();
        while (!next.done) {
            if (previousValue === undefined) {
                previousValue = next.value;
            } else {
                previousValue = callbackfn(previousValue, next.value);
            }
            next = iterator.next();
        }
        return previousValue;
    }

    reduceRight<U>(callbackfn: (previousValue: U | T, currentValue: T) => U, initialValue?: U): U | T | undefined {
        return this.recursiveReduce(this.iterator(), callbackfn, initialValue);
    }

    protected recursiveReduce<U>(iterator: Iterator<T>, callbackfn: (previousValue: U | T, currentValue: T) => U, initialValue?: U): U | T | undefined {
        const next = iterator.next();
        if (next.done) {
            return initialValue;
        }
        const previousValue = this.recursiveReduce(iterator, callbackfn, initialValue);
        if (previousValue === undefined) {
            return next.value;
        }
        return callbackfn(previousValue, next.value);
    }

    find(predicate: (value: T) => unknown): T | undefined {
        const iterator = this.iterator();
        let next = iterator.next();
        while (!next.done) {
            if (predicate(next.value)) {
                return next.value;
            }
            next = iterator.next();
        }
        return undefined;
    }

    findIndex(predicate: (value: T) => unknown): number {
        const iterator = this.iterator();
        let index = 0;
        let next = iterator.next();
        while (!next.done) {
            if (predicate(next.value)) {
                return index;
            }
            next = iterator.next();
            index++;
        }
        return -1;
    }

    includes(searchElement: T): boolean {
        const iterator = this.iterator();
        let next = iterator.next();
        while (!next.done) {
            if (next.value === searchElement) {
                return true;
            }
            next = iterator.next();
        }
        return false;
    }

    flatMap<U>(callbackfn: (value: T) => U | Iterable<U>): Stream<U> {
        type FlatMapState = { this: S, iterator?: Iterator<U, undefined> }
        return new StreamImpl<FlatMapState, U>(
            () => ({ this: this.startFn() }),
            (state) => {
                do {
                    if (state.iterator) {
                        const next = state.iterator.next();
                        if (next.done) {
                            state.iterator = undefined;
                        } else {
                            return next;
                        }
                    }
                    const { done, value } = this.nextFn(state.this);
                    if (!done) {
                        const mapped = callbackfn(value);
                        if (isIterable(mapped)) {
                            state.iterator = mapped[Symbol.iterator]();
                        } else {
                            return { done: false, value: mapped };
                        }
                    }
                } while (state.iterator);
                return DONE_RESULT;
            }
        );
    }

    flat(depth = 1): Stream<T> {
        if (depth <= 0) {
            return this;
        }
        const stream = depth > 1 ? this.flat(depth - 1) as StreamImpl<S, T> : this;
        type FlatMapState = { this: S, iterator?: Iterator<T, undefined> }
        return new StreamImpl<FlatMapState, T>(
            () => ({ this: stream.startFn() }),
            (state) => {
                do {
                    if (state.iterator) {
                        const next = state.iterator.next();
                        if (next.done) {
                            state.iterator = undefined;
                        } else {
                            return next;
                        }
                    }
                    const { done, value } = stream.nextFn(state.this);
                    if (!done) {
                        if (isIterable(value)) {
                            state.iterator = value[Symbol.iterator]() as Iterator<T>;
                        } else {
                            return { done: false, value };
                        }
                    }
                } while (state.iterator);
                return DONE_RESULT;
            }
        );
    }

    head(): T | undefined {
        const iterator = this.iterator();
        const result = iterator.next();
        if (result.done) {
            return undefined;
        }
        return result.value;
    }

    tail(skipCount = 1): Stream<T> {
        return new StreamImpl<S, T>(
            () => {
                const state = this.startFn();
                for (let i = 0; i < skipCount; i++) {
                    const next = this.nextFn(state);
                    if (next.done) {
                        return state;
                    }
                }
                return state;
            },
            this.nextFn
        );
    }

    distinct<Key = T>(by?: (element: T) => Key): Stream<T> {
        const set = new Set<T | Key>();
        return this.filter(e => {
            const value = by ? by(e) : e;
            if (set.has(value)) {
                return false;
            } else {
                set.add(value);
                return true;
            }
        });
    }
}

function toString(item: unknown): string {
    if (typeof item === 'string') {
        return item as string;
    }
    if (typeof item === 'undefined') {
        return 'undefined';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (item as any).toString === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (item as any).toString();
    }
    return Object.prototype.toString.call(item);
}

function isIterable<T>(obj: unknown): obj is Iterable<T> {
    return typeof (obj as Iterable<T>)[Symbol.iterator] === 'function';
}

/**
 * An empty stream of any type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_STREAM: Stream<any> = new StreamImpl<undefined, any>(() => undefined, () => DONE_RESULT);

/**
 * Use this `IteratorResult` when implementing a `StreamImpl` to indicate that there are no more elements in the stream.
 */
export const DONE_RESULT: IteratorReturnResult<undefined> = Object.freeze({ done: true, value: undefined });

/**
 * Create a stream from an iterable or array-like.
 */
export function stream<T>(collection: Iterable<T> | ArrayLike<T>): Stream<T> {
    if (collection instanceof StreamImpl) {
        return collection;
    }
    if (isIterable(collection)) {
        return new StreamImpl<Iterator<T>, T>(
            () => collection[Symbol.iterator](),
            (iterator) => iterator.next()
        );
    }
    if (typeof collection.length === 'number') {
        return new StreamImpl<{ index: number }, T>(
            () => ({ index: 0 }),
            (state) => {
                if (state.index < collection.length) {
                    return { done: false, value: collection[state.index++] };
                } else {
                    return DONE_RESULT;
                }
            }
        );
    }
    return EMPTY_STREAM;
}

/**
 * A tree iterator adds the ability to prune the current iteration.
 */
export interface TreeIterator<T> extends Iterator<T> {
    /**
     * Skip the whole subtree below the last returned element. The iteration continues as if that
     * element had no children.
     */
    prune(): void
}

/**
 * A tree stream is used to stream the elements of a tree, for example an AST or CST.
 */
export interface TreeStream<T> extends Stream<T> {
    iterator(): TreeIterator<T>
}

/**
 * The default implementation of `TreeStream` takes a root element and a function that computes the
 * children of its argument. The root is not included in the stream.
 */
export class TreeStreamImpl<T>
    extends StreamImpl<{ iterators: Array<Iterator<T>>, pruned: boolean }, T>
    implements TreeStream<T> {

    constructor(root: T, children: (node: T) => Iterable<T>) {
        super(
            () => ({
                iterators: [children(root)[Symbol.iterator]()],
                pruned: false
            }),
            state => {
                if (state.pruned) {
                    state.iterators.pop();
                    state.pruned = false;
                }
                while (state.iterators.length > 0) {
                    const iterator = state.iterators[state.iterators.length - 1];
                    const next = iterator.next();
                    if (next.done) {
                        state.iterators.pop();
                    } else {
                        state.iterators.push(children(next.value)[Symbol.iterator]());
                        return next;
                    }
                }
                return DONE_RESULT;
            }
        );
    }

    iterator(): TreeIterator<T> {
        const iterator = {
            state: this.startFn(),
            next: () => this.nextFn(iterator.state),
            prune: () => {
                iterator.state.pruned = true;
            },
            [Symbol.iterator]: () => iterator
        };
        return iterator;
    }
}
