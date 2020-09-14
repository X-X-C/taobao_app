import BaseDao from "./abstract/BaseDao";

export default class SpmDao extends BaseDao {
    constructor(context) {
        super(context, "spms");
    }
}