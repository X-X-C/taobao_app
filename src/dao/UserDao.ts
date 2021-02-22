import BaseDao from "../../base/dao/abstract/BaseDao";

export default class UserDao<T extends object> extends BaseDao<T> {
    constructor(context) {
        super(context);
        this.initTb("users");
    }
}
