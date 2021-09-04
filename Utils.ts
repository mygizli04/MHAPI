export function objectForEach<Type>(obj: {[key: string]: Type}, callback: (obj: {[key: string]: Type}, value: Type, index: string) => any) {
    Object.entries(obj).forEach(entry => {
        callback(obj, entry[1], entry[0])
    })
}

export function objectIndexOf<Type>(obj: {[key: string]: Type}, value: Type): string | undefined {
    let result: string | undefined = undefined;
    objectForEach(obj, (obj, compare, index) => {
        if (value === compare) result = index;
    })
    return result;
}