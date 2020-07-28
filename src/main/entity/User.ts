import BaseEntity from "./abstract/BaseEntity";

export default class User extends BaseEntity {
    constructor(prototype: object = {}) {
        super();
        Object.assign(this, prototype);
    }

    nick: string;
    mixNick: string;
    openId: string;
    activityId: string
    creatTime: string;
}
