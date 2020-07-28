import BaseDao from "./abstract/BaseDao";

export default class UserDao extends BaseDao {
    constructor(context) {
        super(context, "users");
    }
}