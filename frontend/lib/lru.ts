export class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<K, V>();
    }

    get(key: K): V | undefined {
        if (!this.cache.has(key)) {
            return undefined;
        }
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key: K, value: V): { evictedKey: K; evictedValue: V } | undefined {
        let evicted;
        if (this.cache.has(key)) {
            // just update the value and move to end
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // evict the least recently used item (first item in map)
            const firstKey = this.cache.keys().next().value;
            const firstValue = this.cache.get(firstKey)!;
            evicted = { evictedKey: firstKey, evictedValue: firstValue };
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
        return evicted;
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    delete(key: K) {
        this.cache.delete(key);
    }
} 