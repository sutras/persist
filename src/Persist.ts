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
              !Array.isArray(result)
            ) {
              cache[key] = result;
            }
          } catch {}
        }
      }
    }

    return cache;
  }

  private save() {
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
    this.cache[this.prefix + key] = {
      ttl: ttl > 0 ? ttl * 1000 + Date.now() : 0,
      value,
    };
    this.save();
  }

  remove(key: string) {
    const fullKey = this.prefix + key;
    if (this.cache.hasOwnProperty(fullKey)) {
      delete this.cache[fullKey];
      this.save();
    }
  }

  clear() {
    this.cache = {};
    this.save();
  }
}
