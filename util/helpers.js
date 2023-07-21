import _ from 'underscore.string';
const {lpad, lines } = _;
import { writeFileSync } from 'fs';
import { join } from 'path';

export function indent(string, level = 1, step=2, pad=' ') {
    if (typeof string != "string") { throw new TypeError("indent requires a string") }
    if (indent == 0) { return string }
    return lines(string).map(line => pad.repeat(step * level).concat(line)).join("\n")
}

export function isNullOrUndefined(value) {
    return value === null || value === undefined
}
export const BUILT_INS = new Set(['key','kind', 'anonymous', 'name', '_meta'])

export function withoutKeys(object, keys) {
    return Object.fromEntries(Object.entries(object).filter(([key, value]) => !keys.has(key)))
}

export function withoutBuiltins(object) {
    return withoutKeys(object, BUILT_INS)
}

export const symbols = {
    imports : Symbol('imports'),
}

export function union(set, ...sets) {
    const unioned = new Set(set.values())
    sets.forEach(s => s.forEach(value => unioned.add(value)))
    return unioned
}


export class RenderedTemplate {
    constructor({language,fileName, functionName, content, imports}) {
        this.language = language
        this.fileName = fileName
        this.functionName = functionName
        this.content = content
        this.imports = (new Set(imports) || new Set())
    }
    renderImports() {
        switch (this.language) {
            case "go":
                return ["import(", ...Array.from(this.imports).sort().map(v => JSON.stringify(v)), ")"].join("\n")
            default:
                return Array.from(this.imports).sort().join("\n")
        }
    }
    getContent() {
        return this.content
    }
    renderToFile(dir) {
        const outFileName = join(dir, this.fileName)
        writeFileSync(outFileName, this.renderImports() + "\n\n" + this.content, {
            encoding: 'utf8'
        })
    }
    toString() {
        return `[Rendered Template: ${JSON.stringify({
                language: this.language,
                fileName: this.fileName,
                functionName: this.functionName,
                imports: Array.from(this.imports)})}]`
    }
}