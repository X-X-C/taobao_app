import BaseEntity from "./abstract/BaseEntity";

export default class ErrorLog extends BaseEntity {
    constructor(prototype: object = {}) {
        super();
        Object.assign(this, prototype);
    }

    message: any = "";
    data: object = {};
}



