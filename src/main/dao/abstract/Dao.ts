export default abstract class Dao {
    //淘宝小程序专属
    protected constructor(protected context: object, protected table: string) {

    }

    abstract async find(filter, options);

    abstract async update(filter, options);

    abstract async delete(filter);

    abstract async insert(beans);

    abstract async count(filter);

    abstract async aggregate(filter);
}