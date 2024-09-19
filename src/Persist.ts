type PersistType = "local" | "session";

export class Persist {
  name: string;
  type: PersistType;
  storage: Storage;
  cache: Record<string, { ttl: number; value: any }> = {};

  constructor(name: string, type: PersistType = "local") {
    this.name = name;
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
    try {
      const cache = this.storage.getItem(this.name);
      if (!cache) {
        return {};
      }
      const result = JSON.parse(cache);
      if (result && typeof result === "object" && !Array.isArray(result)) {
        return result;
      }
      return {};
    } catch {
      return {};
    }
  }

  private save() {
    this.storage.setItem(this.name, JSON.stringify(this.cache));
  }

  get(key: string): any {
    const item = this.cache[key];
    if (item) {
      if (item.ttl > 0 && item.ttl < Date.now()) {
        this.remove(key);
      } else {
        return item.value;
      }
    }
  }

  set(key: string, value: any, ttl = 0) {
    this.cache[key] = {
      ttl: ttl > 0 ? ttl * 1000 + Date.now() : 0,
      value,
    };
    this.save();
  }

  remove(key: string) {
    if (key in this.cache) {
      delete this.cache[key];
      this.save();
    }
  }

  clear() {
    this.cache = {};
    this.save();
  }
}
