interface taskConfigType {
    [key: string]: {
        name: string,
        reward: number,
        type: "normal" | "other"
    };
}
