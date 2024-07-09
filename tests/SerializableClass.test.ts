import { describe, test, expect } from "vitest";
import { SerializableClass } from "../lib/SerializableClass";
import { addSerializer, unserialize, clone } from "../lib/serializers";
import { AutoSerializer } from "../lib/AutoSerializer";

describe("SerializableClass", function () {

    class TestClass extends SerializableClass {
        __name__ = "TestClass"
        meth1() { }
        prop1 = 1
        get prop2() {
            return 2;
        }
        get prop3() {
            return this.$data.prop3;
        }
        set prop3(v) {
            this.$data.prop3 = v;
        }
        get prop4() {
            return this.$data.prop4;
        }

        set prop4(v) {
            "@serializable false";
            this.$data.prop4 = v;
        }
    }

    const autoserializer = new AutoSerializer("TestClass", TestClass);

    addSerializer(autoserializer);

    test("can deserialize values passed to the constructor", function () {
        const test = new TestClass({
            foo: "bar",
            prop1: 42,
            prop2: 43,
            prop3: 44,
            prop4: 45
        });

        expect(test.prop1).to.equal(1);
        expect(test.prop3).to.equal(44);
        expect(test.prop4).to.equal(45);
    });

    test("Autoserializer serialize", function () {
        const test = new TestClass({
            foo: "bar",
            prop1: 42,
            prop2: 43,
            prop3: 44,
            prop4: 45
        });

        const serialized = autoserializer.serialize(test);

        expect(serialized).to.eql({
            __name__: "TestClass",
            id: test.id,
            prop3: 44
        });
    });

    test("Autoserializer unserialize", function () {
        expect(() => {
            autoserializer.unserialize({
                id: "testid",
                noprop: "bar",
                prop1: 111,
                prop2: 222,
                prop3: 333,
                prop4: 444
            });
        }).toThrow(/WrongClassUnserialization/);

        const test = autoserializer.unserialize({
            __name__: "TestClass",
            id: "testid",
            noprop: "bar",
            prop1: 111,
            prop2: 222,
            prop3: 333,
            prop4: 444
        });

        expect(test.id).to.equal("testid");
        expect(test.noprop).toBeUndefined();
        expect(test.prop1).to.equal(1);
        expect(test.prop2).to.equal(2);
        expect(test.prop3).to.equal(333);
        expect(test.prop4).toBeUndefined();
    });

    test("can unserialize any class derivated from SerializableClass (addSerializer/unserialize/serialize)", function () {
        class TestClass2 extends TestClass {
            __name__ = "TestClass2"
        };
        const data = {
            __name__: "TestClass2",
            id: "testid",
            prop3: 333
        };

        expect(() => unserialize(data)).toThrow(/MissingSerializer/);

        addSerializer(new AutoSerializer("TestClass2", TestClass2));

        const test = unserialize(data);

        expect(test).toBeInstanceOf(TestClass2);
        expect((<TestClass2>test).serialize()).to.eql(data);
    });

    test("can clone itself (clone)", function () {
        const test = new TestClass({
            prop3: "hello"
        });

        const test2 = test.clone();

        expect(test2).toBeInstanceOf(TestClass);
        expect(test2.prop3).to.equal(test.prop3);
        expect(test2.id).not.to.equal(test.id);
    });

    test("makes deep copies of object/array properties", function () {
        class Class1 extends SerializableClass {
            __name__ = "Class1"
            get object() {
                return this.$data.object;
            }
            set object(o) {
                this.$data.object = o;
            }
            get array() {
                return this.$data.array;
            }
            set array(a) {
                this.$data.array = a;
            }
        }

        addSerializer(new AutoSerializer("Class1", Class1));

        const c = new Class1({
            object: { "a": "foo" },
            array: [1, 2, 3]
        });

        const c2 = clone(c);

        expect(c2.object).to.eql(c.object);
        expect(c2.object).not.toBe(c.object);
        expect(c2.array).to.eql(c.array);
        expect(c2.array).not.toBe(c.array);
    });


});
