interface taskConfigType {
    [key: string]: {
        name: string,
        reward: number,
        type: "normal" | "other"
    };
}

interface spmExt {
    ext?: any,
    extParams?: any
}
