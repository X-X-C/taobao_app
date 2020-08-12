export default class User {
    constructor(prototype: object = {}) {
        Object.assign(this, prototype);
    }

    nick: string;
    mixNick: string;
    openId: string;
    activityId: string
    creatTime: string;
}
