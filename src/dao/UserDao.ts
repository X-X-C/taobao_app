import BaseDao from "./abstract/BaseDao";

export default class UserDao<T extends object> extends BaseDao<T> {
    constructor(context) {
        super(context, "users");
    }
}