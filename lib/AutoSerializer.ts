import type SerializableClass from "./SerializableClass";
import { getProperties, isKeyOf } from "./class-helper";
import { objectSerializer, type Class, type Serialized, objectUnserializer } from "./serializers";

export class AutoSerializer<T extends SerializableClass> {

    public class: Class<T>
    public name: string

    constructor(name: string, aClass: Class<T>) {
        this.name = name;
        this.class = aClass;
    }

    serialize(serializable: T) {
        var serialized: Serialized = {
            __name__: serializable.__name__,
            id: serializable.id
        };
        for (const [propName, propDescriptor] of Object.entries(getProperties(serializable))) {
            if (propDescriptor.get && propDescriptor.set
                && !/@serializable false/.test(propDescriptor.set.toString())
                && !/@serializable false/.test(propDescriptor.get.toString())
            ) {
                if (typeof serializable[propName] == "object") {
                    serialized[propName] = objectSerializer(serializable[propName]);
                } else {
                    serialized[propName] = serializable[propName];
                }
            }
        }
        return serialized;
    }

    unserialize(data: Serialized): T {
        if (data.__name__ !== this.name) {
            throw new TypeError("WrongClassUnserialization");
        }
        const object = new (this.class)();
        if (data.id) {
            object.$data.id = data.id;
        }
        for (const [propName, propDescriptor] of Object.entries(getProperties(object))) {
            if (propDescriptor.get && propDescriptor.set
                && !/@serializable false/.test(propDescriptor.set.toString())
                && !/@serializable false/.test(propDescriptor.get.toString())
            ) {
                if (data[propName] === undefined) continue;

                if (!isKeyOf(propName, object)) continue;
                const propertyName = propName as keyof T;

                if (typeof data[propName] == "object") {
                    object[propertyName] = objectUnserializer(data[propName]) as any;
                } else {
                    object[propertyName] = data[propName] as any;
                }
            }
        }
        return object;
    }
}