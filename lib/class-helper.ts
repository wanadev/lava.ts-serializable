type PropertyDescriptors<T> = { [P in keyof T]: TypedPropertyDescriptor<T[P]>; } & { [x: string]: PropertyDescriptor; }

export function getProperties<T>(object: T): PropertyDescriptors<T> {
    const prototypes = [];
    let prototype = Object.getPrototypeOf(object);
    while (prototype !== Object.prototype) {
        prototypes.unshift(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }
    return prototypes.reduce((acc, prototype) => {
        return {
            ...acc,
            ...Object.getOwnPropertyDescriptors(prototype),
        };
    }, {} as PropertyDescriptors<T>)
}

export function isKeyOf<T extends object>(key: string | number | symbol, obj: T): key is keyof T {
    return key in obj;
}