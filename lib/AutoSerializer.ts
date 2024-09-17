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
        const serialized: Serialized = {
            __name__: serializable.__name__,
            id: serializable.id
        };
        for (const [propName, propDescriptor] of Object.entries(getProperties(serializable))) {
            if (propDescriptor.get && propDescriptor.set
                && !/@serializable false/.test(propDescriptor.set.toString())
                && !/@serializable false/.test(propDescriptor.get.toString())
            ) {
                const prop = propName as string & keyof T;
                if (typeof serializable[prop] == "object") {
                    serialized[propName] = objectSerializer(serializable[prop]);
                } else {
                    serialized[propName] = serializable[prop];
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
        if (data.id && typeof data.id === "string") {
            object.$data.id = data.id;
        }
        Object.entries(getProperties(object)).forEach(([propName, propDescriptor]) => {
            if (propDescriptor.get && propDescriptor.set
                && !/@serializable false/.test(propDescriptor.set.toString())
                && !/@serializable false/.test(propDescriptor.get.toString())
            ) {
                if (data[propName] === undefined) return;

                if (!isKeyOf(propName, object)) return;
                const propertyName = propName as keyof T;

                if (typeof data[propName] == "object") {
                    object[propertyName] = objectUnserializer(data[propName]) as any;
                } else {
                    object[propertyName] = data[propName] as any;
                }
            }
        });
        return object;
    }
}