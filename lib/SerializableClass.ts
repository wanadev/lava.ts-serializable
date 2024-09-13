import { getProperties } from "./class-helper";
import { clone, serialize } from "./serializers";

export function serializable(method: any, serializable = true) {
    method.serializable = serializable;
    return method;
}

export interface SerializableClassData {
    id: string;
    [prop: string]: unknown;
}

export interface SerializableProperties {
    id: string;
    [prop: string]: unknown;
}

export class SerializableClass {
    $data: SerializableClassData;
    __name__: string = "LavaSerializableClass"

    constructor(params?: Partial<SerializableProperties>) {
        this.$data = {} as SerializableClassData; // type will be complete after initialize
        Object.defineProperty(this, "$data", {
            enumerable: false,
        });
        this.initialize(params)
    }

    protected initialize(params?: Partial<SerializableProperties>) {
        this.apply(params);
    }

    get $class() {
        return this.constructor;
    }

    get id(): string {
        if (!this.$data.id) {
            this.$data.id = globalThis.crypto.randomUUID();
        }
        return this.$data.id;
    }

    /**
     * Apply given data to the current instance.
     *
     * @param data - The data to apply.
     */
    apply(data?: Partial<SerializableProperties>) {
        if (!data) {
            return;
        }
        if (typeof data.id === "string") {
            this.$data.id = data.id;
        }
        const descriptors = getProperties(this);
        for (const prop in descriptors) {
            if (descriptors[prop].get && descriptors[prop].set) {
                if (data[prop] !== undefined) {
                    this[prop as keyof this] = data[prop] as any;
                }
            }
        }
    }

    clone() {
        return clone(this);
    }

    serialize() {
        return serialize(this);
    }

}

export default SerializableClass
