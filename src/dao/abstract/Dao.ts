export default abstract class Dao {
    protected constructor(protected context: any, protected table: string) {

    }

    abstract async find(filter: any, options: any): Promise<any[]>;

    abstract async update(filter: any, options: any): Promise<number>;

    abstract async delete(filter: any): Promise<number>;

    abstract async insertOne(bean: any): Promise<string>;

    abstract async insertMany(beans: any[]): Promise<string[]>;

    abstract async count(filter: any): Promise<number>;

    abstract async aggregate(filter: any[]): Promise<any[]>;
}
