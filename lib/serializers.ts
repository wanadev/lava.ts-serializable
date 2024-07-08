export interface Serializable {
    __name__?: string
}

export interface Serialized {
    __name__?: string
    [prop: string]: unknown
}

export type Class<T> = { new(...args: any): T };

export interface Serializer<T extends Serializable, S extends Serialized> {
    name: string
    class: Class<T>
    serialize(object: T): S,
    unserialize(value: S): T
}

export const serializers: { [name: string]: Serializer<Serializable, Serialized> } = {}

export type Serializers = Map<string, Serializer<Serializable, Serialized>>;

export function addSerializer(serializer: Serializer<Serializable, Serialized>) {
    serializers[serializer.name] = serializer;
}

export function getSerializerFromObject(object: any) {
    if (object && object.__name__ && serializers[object.__name__]) {
        return serializers[object.__name__];
    }
    for (const serializer of Object.values(serializers)) {
        if (serializer.class && object instanceof serializer.class) {
            return serializer;
        }
    }
    return null;
}

function cloneDeepWith<T>(object: T, customizer: (value: any) => any): T {
    const customClone = customizer(object);
    if (customClone !== undefined) return customClone;

    if (typeof object !== "object") {
        return object;
    }
    if (Array.isArray(object)) {
        return object.map(item => cloneDeepWith(item, customizer)) as T;
    }
    const clone: T = { ...object };
    for (const prop in object) {
        clone[prop] = cloneDeepWith(object[prop], customizer);
    }
    return clone;
}

export function objectSerializer(object: unknown) {
    return cloneDeepWith(object, function (value) {
        if (typeof value != "object") {
            return;
        }
        const serializer = getSerializerFromObject(value);
        if (!serializer) {
            return;
        }
        const result = serializer.serialize(value);
        if (!result.__name__) {
            result.__name__ = serializer.name;
        }
        return result;
    });
}

export function objectUnserializer(object: unknown) {
    return cloneDeepWith(object, function (value) {
        if (typeof value != "object" || value === null) {
            return;
        }
        if (!value.__name__) {
            return;
        }
        const serializer = getSerializerFromObject(value);
        if (!serializer) {
            return;
        }
        return serializer.unserialize(value);
    });
}

export function serialize(object: Serializable) {
    const serializer = getSerializerFromObject(object);
    if (!serializer) throw new Error("MissingSerializer");

    return serializer.serialize(object);
}

export function unserialize(data: Serialized) {
    const serializer = getSerializerFromObject(data);
    if (!serializer) throw new Error("MissingSerializer");

    return serializer.unserialize(data);
}

export function clone<T extends Serializable>(object: T): T {
    const data = serialize(object);
    delete data.id;  // Do not clone the id!
    // @ts-ignore
    return unserialize(data);
}