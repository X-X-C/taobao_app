export default class ErrorLog {
    constructor(prototype: object = {}) {
        Object.assign(this, prototype);
    }

    message: any = "";
    data: object = {};
}



