import {obj} from "../../utils/Type";

export default abstract class Dao {
    protected constructor(protected context: obj, protected table: string) {

    }

    abstract async find(filter: obj, options: obj): Promise<object[]>;

    abstract async update(filter: obj, options: obj): Promise<number>;

    abstract async delete(filter: obj): Promise<number>;

    abstract async insertOne(bean: obj): Promise<string>;

    abstract async insertMany(beans: obj[]): Promise<string[]>;

    abstract async count(filter: obj): Promise<number>;

    abstract async aggregate(filter: obj[]): Promise<object[]>;
}
