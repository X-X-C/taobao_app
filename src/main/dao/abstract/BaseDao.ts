import Dao from "./Dao";

export default abstract class BaseDao extends Dao {

    protected constructor(public context: any, public table: string) {
        super(context, table);
        try {
            this.db = context.cloud.db.collection(table);
        } catch (e) {
            this.db = "获取数据库连接失败";
        }
    }

    protected db;

    async delete(filter: object) {
        return await this.db.deleteMany(filter);
    }

    async insert(beans: Array<object> | object) {
        if (Array.isArray(beans) === false) {
            return await this.db.insertOne(beans);
        } else {
            return await this.db.insertMany(beans);
        }
    }

    async find(filter: object = {}, options: object = {}) {
        return await this.db.find(filter, options);
    }

    async update(filter: object, options: object) {
        return await this.db.updateMany(filter, options);
    }

    async count(filter: object) {
        return await this.db.count(filter);
    };

    async aggregate(pipe: object[]) {
        return await this.db.aggregate(pipe);
    };

}