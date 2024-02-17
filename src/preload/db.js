const fs = require('node:fs')
const sqlite3 = require('sqlite3')

export default class DB {
  constructor(rootDirectory) {
    let fileExists = !fs.existsSync(rootDirectory + '\\musicb.db')
    if (fileExists) {
      fs.writeFileSync(rootDirectory + '\\musicb.db', '')
    }
    /**
     * 数据库对象
     * @type {Database}
     */
    this.db = new sqlite3.Database(rootDirectory + '\\musicb.db', (err) => {
      if (!err && fileExists) {
        this.initTables()
      }
    })
  }

  getDB() {
    return this.db
  }

  allSync(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
  runSync(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this)
        }
      })
    })
  }

  execSync(sql) {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  initTables() {
    this.db.exec(
      `
      PRAGMA foreign_keys = false;
      PRAGMA encoding = "UTF-8";
      DROP TABLE IF EXISTS "歌单列表";
     CREATE TABLE "歌单列表" (
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "列表名" TEXT,
        CONSTRAINT "歌单名" UNIQUE ("列表名" ASC)
      );
      INSERT INTO "歌单列表" (id,'列表名') VALUES ('1','默认歌单');

      DROP TABLE IF EXISTS "歌曲";
      CREATE TABLE "歌曲" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "标题" TEXT NOT NULL,
        "封面" TEXT NOT NULL,
        "时长" integer NOT NULL,
        "UP主" TEXT NOT NULL,
        "bvid" text NOT NULL,
        "cid" text NOT NULL,
        "aid" TEXT NOT NULL,
        "所属歌单" integer NOT NULL,
        "开始时间" integer NOT NULL,
        "结束时间" integer NOT NULL,
        CONSTRAINT "曲对歌单" FOREIGN KEY ("所属歌单") REFERENCES "歌单列表" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
      DROP TABLE IF EXISTS "配置";
      CREATE TABLE "配置" (
        "B站用户名" TEXT,
        "cookie" TEXT
      );
      CREATE INDEX "歌单索引"
      ON "歌曲" (
        "所属歌单" DESC
      );
      PRAGMA foreign_keys = true;`
    )
  }
}
