import { Context } from "cafy"

type LiteralableTypes = string | number | boolean

export function ConstContext<Const extends LiteralableTypes>(value: Const) {
    return class ConstContextClass<Maybe extends Const | undefined | null> extends Context<Maybe> {
        name = "Const"

        constructor(optional = false, nullable = false) {
            // its magic
            super(optional, nullable)

            this.push(v => v === value)
        }

        static with<C extends Const>(value: C) {
            return class ConstContextClass_ extends ConstContextClass<C> {}
        }

        //#region some magic
        public makeOptional(): ConstContextClass<Const | undefined> {
            return new ConstContextClass(true, false)
        }

        public makeNullable(): ConstContextClass<Const | null> {
            return new ConstContextClass(false, true)
        }

        public makeOptionalNullable(): ConstContextClass<Const | undefined | null> {
            return new ConstContextClass(true, true)
        }
        //#endregion
    }.with(value)
}
