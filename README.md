# @lava.ts/serializable

## Name
Lava.ts Serializable

## Description
Typescript classes for data serialization

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation

```
npm install @lava.ts/serializable
```

## Usage

```ts
import { SerializableClass } from "@lava.ts/serializable/lib/SerializableClass";
import { AutoSerializer } from "@lava.ts/serializable/lib/AutoSerializer";
import { addSerializer } from "@lava.ts/serializable/lib/serializers";

export class MyDataClass extends SerializableClass {
    __name__ = "my-data-class"; // name for serializable class

    declare $data: { // raw data
        position: number,
        type: string,
    };

    constructor(params: Record<string, unknown>) {
        super({
            position: 0,
            type: "default",
            ...params,
        }); // contructor apply parameters to setters
    }

    get position() { // computed getter
        return this.$data.position;
    }

    set position(position) { // computed setter
        this.$data.position = position;
    }

    get type() {
        return this.$data.type;
    }

    set type(type) {
        this.$data.type = type;
    }

    // directive to mark field as not serializable
    get triple() {
        "@serializable false";

        return this.position * 3;
    }

    set triple(triple) {
        this.position = triple / 3;
    }

}

// AutoSerializer serializes all fields with a getter and a setter
// expect if directive `"@serializable false"` has been set
const autoserializer = new AutoSerializer("my-data-class", MyDataClass);

addSerializer(autoserializer);

export default MyDataClass;

```

## Support
Submit issue on github or gitlab

## Roadmap
- Project Manager with Structures
- History manager for undo/redo
- Integration with Vue.js reactivity

## Contributing
Not open for contribution at the moment. Currently building the first steps of the librairy

## Authors and acknowledgment
- [Wanadev](https://wanadev.com)

## License
BSD-3-Clause

## Project status
Currently building the first steps of the librairy
