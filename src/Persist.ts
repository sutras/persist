type PersistType = "local" | "session";

export class Persist {
  name: string;
  prefix: string;
  type: PersistType;
  storage: Storage;
  cache: Record<string, { ttl: number; value: any }> = {};

  constructor(
    name: string,
    options: {
      type?: PersistType;
    } = {}
  ) {
    const { type = "local" } = options;
    this.name = name;
    this.prefix = name + "#";
    this.type = type;
    this.storage = this.getStorage(type);
    this.cache = this.getCache();
  }

  private getStorage(type: PersistType) {
    switch (type) {
      case "local":
        return localStorage;
      case "session":
        return sessionStorage;
    }
  }

  private getCache() {
    const cache: Record<string, { ttl: number; value: any }> = {};

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const value = this.storage.getItem(key);
        if (value) {
          try {
            const result = JSON.parse(value);
            if (
              result &&
              typeof result === "object" &&
              !Array.isArray(result) &&
              (result.ttl === 0 || result.ttl > Date.now())
            ) {
              cache[key] = result;
            } else {
              throw 0;
            }
          } catch {
            this.storage.removeItem(key);
          }
        }
      }
    }

    return cache;
  }

  private save(fullKey?: string) {
    if (fullKey) {
      if (this.cache.hasOwnProperty(fullKey)) {
        this.storage.setItem(fullKey, JSON.stringify(this.cache[fullKey]));
      } else {
        this.storage.removeItem(fullKey);
      }
    } else {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          if (!this.cache.hasOwnProperty(key)) {
            this.storage.removeItem(key);
            i--;
          }
        }
      }

      Object.keys(this.cache).forEach((key) => {
        this.storage.setItem(key, JSON.stringify(this.cache[key]));
      });
    }
  }

  get(key: string): any {
    const item = this.cache[this.prefix + key];
    if (item) {
      if (item.ttl > 0 && item.ttl < Date.now()) {
        this.remove(key);
      } else {
        return item.value;
      }
    }
  }

  set(key: string, value: any, ttl = 0) {
    const fullKey = this.prefix + key;
    this.cache[fullKey] = {
      ttl: ttl > 0 ? ttl * 1000 + Date.now() : 0,
      value,
    };
    this.save(fullKey);
  }

  remove(key: string) {
    const fullKey = this.prefix + key;
    if (this.cache.hasOwnProperty(fullKey)) {
      delete this.cache[fullKey];
      this.save(fullKey);
    }
  }

  clear() {
    this.cache = {};
    this.save();
  }
}
