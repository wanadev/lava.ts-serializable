import { getProperties } from "./class-helper";
import { clone, serialize, unserialize } from "./serializers";

export function serializable(method: any, serializable = true) {
    method.serializable = serializable;
    return method;
}

export class SerializableClass implements Record<string, unknown> {
    [prop: string]: unknown

    $data: Record<string, unknown> = {};
    __name__: string = "LavaSerializableClass"

    constructor(params?: Record<string, unknown>) {
        Object.defineProperty(this, "$data", {
            enumerable: false,
        });
        this.apply(params)
    }

    get id() {
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
    apply(data?: Record<string, unknown>) {
        if (!data) {
            return;
        }
        if (data.id) {
            this.$data.id = data.id;
        }
        const descriptors = getProperties(this);
        for (const prop in descriptors) {
            if (descriptors[prop].get && descriptors[prop].set) {
                if (data[prop] !== undefined) {
                    this[prop] = data[prop];
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
