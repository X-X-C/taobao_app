class A {

    constructor(pro) {
        Object.assign(this, pro)
    }

    id: 999;
    bs: B[]
}

class B {
    name: "xxx"
    age: "999"
}


let obj = {
    id: 432143214,
    bs: [
        {
            name: "fdsfsda"
        }
    ]
}

let a = new A(obj
);
console.log(a)