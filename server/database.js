import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JSONDB {
  constructor() {
    this.cache = {};
  }

  _getFilePath(collection) {
    return path.join(DATA_DIR, `${collection}.json`);
  }

  _loadCollection(collection) {
    if (this.cache[collection]) {
      return this.cache[collection];
    }
    const filePath = this._getFilePath(collection);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      this.cache[collection] = [];
      return [];
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      this.cache[collection] = JSON.parse(data || '[]');
      return this.cache[collection];
    } catch (e) {
      console.error(`Error reading collection ${collection}:`, e);
      this.cache[collection] = [];
      return [];
    }
  }

  _saveCollection(collection) {
    const filePath = this._getFilePath(collection);
    const data = this.cache[collection] || [];
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error(`Error saving collection ${collection}:`, e);
    }
  }

  find(collection, filterFunc = () => true) {
    const list = this._loadCollection(collection);
    return list.filter(filterFunc);
  }

  findOne(collection, filterFunc) {
    const list = this._loadCollection(collection);
    return list.find(filterFunc) || null;
  }

  insert(collection, doc) {
    const list = this._loadCollection(collection);
    const newDoc = {
      id: doc.id || Math.random().toString(36).substring(2, 11),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString()
    };
    list.push(newDoc);
    this._saveCollection(collection);
    return newDoc;
  }

  update(collection, filterFunc, updateData) {
    const list = this._loadCollection(collection);
    let updatedCount = 0;
    const updatedDocs = [];

    const newList = list.map(doc => {
      if (filterFunc(doc)) {
        updatedCount++;
        const updatedDoc = {
          ...doc,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        updatedDocs.push(updatedDoc);
        return updatedDoc;
      }
      return doc;
    });

    if (updatedCount > 0) {
      this.cache[collection] = newList;
      this._saveCollection(collection);
    }
    return updatedDocs;
  }

  delete(collection, filterFunc) {
    const list = this._loadCollection(collection);
    const beforeCount = list.length;
    const newList = list.filter(doc => !filterFunc(doc));
    const deletedCount = beforeCount - newList.length;

    if (deletedCount > 0) {
      this.cache[collection] = newList;
      this._saveCollection(collection);
    }
    return deletedCount;
  }
}

const db = new JSONDB();
export default db;
