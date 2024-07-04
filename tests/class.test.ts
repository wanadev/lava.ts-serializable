import { describe, test, expect } from "vitest";
import { SerializableClass as Class } from "../lib/SerializableClass";

describe("Class features of SerializableClass", function () {

    describe("instances", function () {

        test("Accessor for class, use of prototype and constructor", function () {
            var $c;

            class Cls1 extends Class {
                meth1() {
                    $c = this.constructor;
                }
            };

            var c1 = new Cls1();
            c1.meth1();

            expect($c).toBe(Cls1);
            expect(c1.$class).toBe(Cls1);
            expect(Cls1.prototype.constructor).toBe(Cls1);
            expect(c1).toBeInstanceOf(Cls1);
        });

        test("stay clean (no trash properties)", function () {
            class Cls1 extends Class {

                __include__ = []
                __classvars__ = {}

                meth1() {
                    // Here we can access to this.$super() and this.$name
                }
            }

            var c1 = new Cls1();
            c1.meth1();

            expect(Object.getOwnPropertyNames(c1)).not.to.contain("$super");
            expect(Object.getOwnPropertyNames(c1)).not.to.contain("$name");
            expect(Object.getOwnPropertyNames(c1)).not.to.contain("$computedPropertyName");

            expect(Cls1.prototype.__include__).toBeUndefined();
            expect(Cls1.prototype.__classvars__).toBeUndefined();
            expect(c1.__include__).not.toBeUndefined(); // differs from abitbol
            expect(c1.__classvars__).not.toBeUndefined(); // differs from abitbol
        });

        test("special properties are not enumerable", function () {
            class Cls1 extends Class {

            }
            var c1 = new Cls1();

            var p;
            for (p in Cls1) {
                expect(p).not.toEqual("$class");
                expect(p).not.toEqual("$extend");
                expect(p).not.toEqual("$map");
                expect(p).not.toEqual("$data");
            }

            for (p in c1) {
                expect(p).not.toEqual("$class");
                expect(p).not.toEqual("$extend");
                expect(p).not.toEqual("$map");
                expect(p).not.toEqual("$data");
            }
        });

        test("provides a $data object to store private values", function () {
            class Cls1 extends Class {

            }

            var c1 = new Cls1();

            expect(c1.$data).toBeInstanceOf(Object);
        });

        test("Usage of super", function () {
            class Cls1 extends Class {
                meth1() { }
            };

            class Cls2 extends Cls1 {
                meth1() {
                    const initialSuper = super.meth1;
                    this.meth2();
                    expect(super.meth1).not.toBeUndefined();
                    expect(super.meth1).toBe(initialSuper);
                }

                meth2() {
                }
            };

            const c2 = new Cls2();
            c2.meth1();
        });

    });

    describe("inheritance", function () {

        test("allows any class to be extended", function () {
            class Cls1 extends Class {
                prop1 = "prop1"
            };

            var c1 = new Cls1();

            expect(c1).toBeInstanceOf(Cls1);
            expect(c1.prop1).toEqual("prop1");
        });

        test("is consistent and allows the instanceof operator to work properly", function () {
            class Cls1 extends Class { }
            class Cls2 extends Cls1 { }

            var c1 = new Cls1();
            var c2 = new Cls2();

            expect(c1).toBeInstanceOf(Class);
            expect(c1).toBeInstanceOf(Cls1);
            expect(c1).not.toBeInstanceOf(Cls2);

            expect(c2).toBeInstanceOf(Class);
            expect(c2).toBeInstanceOf(Cls1);
            expect(c2).toBeInstanceOf(Cls2);
        });

        test("allows to inherit super class' properties", function () {
            class Cls1 extends Class {
                prop1 = "prop1"
            }

            class Cls2 extends Cls1 {
                prop2 = "prop2"
            }

            var c2 = new Cls2();

            expect(c2.prop1).to.equal("prop1");
            expect(c2.prop2).to.equal("prop2");
        });

        test("allows super class' properties to be overridden", function () {
            class Cls1 extends Class {
                prop1 = "prop1"
            }

            class Cls2 extends Cls1 {
                prop1 = "override"
            }

            var c2 = new Cls2();

            expect(c2.prop1).to.equal("override");
        });

    });

    describe("constructor", function () {

        test("is called only when the class is instantiated", function () {
            class Cls1 extends Class {
                ok: boolean
                constructor() {
                    super()
                    this.ok = true;
                }
            };

            class Cls2 extends Cls1 { }

            class Cls3 extends Cls1 {
                constructor() {
                    super()
                }
            };

            const c1 = new Cls1();
            const c2 = new Cls2();
            const c3 = new Cls3();

            expect(c1.ok).toBe(true);
            expect(c2.ok).toBe(true);
            expect(c3.ok).toBe(true); // differs from abitbol
        });

        test("can gets argument passed to the real constructor when instantiating the class", function () {
            class Cls1 extends Class {
                param1: string
                param2: string
                constructor(param1: string, param2: string) {
                    super();
                    this.param1 = param1;
                    this.param2 = param2;
                }
            }

            const c1 = new Cls1("a", "b");

            expect(c1.param1).to.equal("a");
            expect(c1.param2).to.equal("b");
        });

    });

    describe("methods", function () {

        test("can access to a reference to their classes", function () {
            class Cls1 extends Class {
                meth1() {
                    return this.constructor;
                }
            }

            var c1 = new Cls1();

            expect(c1.meth1()).toBe(Cls1);
        });

        test.skip("[UNSUPPORTED] can access to their own name", function () {
            class Cls1 extends Class {
                meth1() {
                    return this.$name;
                }
            };

            var c1 = new Cls1();

            expect(c1.meth1()).to.equal("meth1");
        });

        test.skip("[UNSUPPORTED] can access to their related computed property name if any", function () {
            class Cls1 extends Class {
                meth1() {
                    return this.$computedPropertyName;
                }

                getProp1() {
                    return this.$computedPropertyName;
                }
            };

            var c1 = new Cls1();

            expect(c1.meth1()).toBeUndefined();
            expect(c1.getProp1()).to.equal("prop1");
            expect(c1.prop1).to.equal("prop1");
        });

        test("can call their super method", function () {
            class Cls1 extends Class {
                param1?: string
                param2?: string
                meth1(param1: string, param2: string) {
                    this.param1 = param1;
                    this.param2 = param2;
                }
            }

            class Cls2 extends Cls1 {
                meth1(param1: string, param2: string) {
                    super.meth1(param2, param1);
                }
            }

            class Cls3 extends Cls1 {
                meth1() { }
            }

            var c1 = new Cls1();
            var c2 = new Cls2();
            var c3 = new Cls3();

            c1.meth1("a", "b");
            c2.meth1("a", "b");
            // @ts-expect-error Cls3 overrides method without arguments
            c3.meth1("a", "b");

            expect(c1.param1).to.equal("a");
            expect(c1.param2).to.equal("b");

            expect(c2.param1).to.equal("b");
            expect(c2.param2).to.equal("a");

            expect(c3.param1).toBeUndefined();
            expect(c3.param2).toBeUndefined();
        });

        test.skip("[UNSUPPORTED] always has a 'this' binded to the current instance", () => new Promise<void>(done => {
            var c1: Cls1;

            class Cls1 extends Class {
                meth1() {
                    return this;
                }

                meth2() {
                    expect(this).toBe(c1);
                    done();
                }
            };

            c1 = new Cls1();

            expect(c1.meth1()).toBe(c1);

            setTimeout(c1.meth2, 1);
        }));

        test.skip("[UNSUPPORTED] are wrapped only when necessary", function () {
            class Cls1 extends Class {
                noWrap() {
                    var test = "nowrap";
                }

                wrapSuper() {
                    var test = "nowrap";
                    var v = this.$super;
                }

                wrapName() {
                    var test = "nowrap";
                    var v = this.$name;
                }

                wrapComputed() {
                    var test = "nowrap";
                    var v = this.$computedPropertyName;
                }
            }

            expect(Cls1.prototype.noWrap.toString()).to.match(/.*nowrap.*/);
            expect(Cls1.prototype.wrapSuper.toString()).not.to.match(/.*nowrap.*/);
            expect(Cls1.prototype.wrapName.toString()).not.to.match(/.*nowrap.*/);
            expect(Cls1.prototype.wrapComputed.toString()).not.to.match(/.*nowrap.*/);
        });

    });

    describe("static properties", function () {

        test("can be added to the class", function () {
            class Cls1 extends Class {
                static static1 = "static1"
            };

            var c1 = new Cls1();

            expect(Cls1.static1).to.equal("static1");
            expect(Cls1.prototype.static1).toBeUndefined();
            expect(c1.static1).toBeUndefined();
        });

        test("can be inherited", function () {
            class Cls1 extends Class {
                static static1 = "static1"
            };

            class Cls2 extends Cls1 { }

            var c2 = new Cls2();

            expect(Cls2.static1).to.equal("static1");
            expect(Cls2.prototype.static1).toBeUndefined();
            expect(c2.static1).toBeUndefined();
        });

        test("can be overridden", function () {
            class Cls1 extends Class {
                static static1 = "static1"
            };

            class Cls2 extends Cls1 {
                static static1 = "static2"
            };

            expect(Cls2.static1).to.equal("static2");
        });

    });

    describe("accessors and mutators", function () {

        test("generates computed properties", function () {
            class Cls1 extends Class {
                get prop1() {
                    return "prop1";
                }
            };

            var c1 = new Cls1();

            expect(c1.prop1).not.toBeUndefined()
            expect(c1.prop1).to.equal("prop1");
        });

        test("are used to manipulate computed properties", function () {
            class Cls1 extends Class {
                constructor() {
                    super()
                    this.prop1 = "a";
                }

                get prop1() {
                    return "get" + this.$data.prop1;
                }

                set prop1(value) {
                    this.$data.prop1 = "set" + value;
                }
            }

            var c1 = new Cls1();

            expect(c1.prop1).not.toBeUndefined()

            expect(c1.$data.prop1).to.equal("seta");
            expect(c1.prop1).to.equal("getseta");

            c1.prop1 = "b";

            expect(c1.$data.prop1).to.equal("setb");
            expect(c1.prop1).to.equal("getsetb");
        });

        test("can be monkey-patched (https://en.wikipedia.org/wiki/Monkey_patch)", function () {
            class Cls1 extends Class {
                setter?: string

                get prop1() {
                    return "orig";
                }

                set prop1(ignored) {
                    this.setter = "orig";
                }
            };

            var c1 = new Cls1();

            Object.defineProperty(c1, "prop1", {
                get() {
                    return "patched";
                },
                set(v) {
                    this.setter = "patched";
                },
            })

            expect(c1.prop1).to.equal("patched");
            c1.prop1 = "foo";
            expect(c1.setter).to.equal("patched");
        });
    });

});
