
import _ from 'underscore.string';
const { camelize, quote, slugify, classify } = _;
import { withoutBuiltins, indent, BUILT_INS, isNullOrUndefined, RenderedTemplate } from '../util/helpers.js';

const typeSetterMap = {
    "number": "SetFloat64",
    "boolean": "SetBool",
    "string": "SetString",
    "object": "Set",
    "undefined": "Set"
}

export function stringify(value, level = 0) {
    if (Array.isArray(value)) {
        return `ldvalue.CopyArbitraryValueArray([]interface{}{${value.map(v => stringify(v)).join(", ")}})`
    } else if (value instanceof Date) {
        return value.getTime()
    } else if (typeof value == "object" && value !== null) {
       const props = []
       Object.entries(value).forEach(([key, v]) => {
            const setter = typeSetterMap[typeof v]
            if (!setter) {
                throw new Error(`Unsupported type ${typeof v}`)
            }
            props.push(indent(`${setter}(${stringify(key.toString())}, ${stringify(v, level+4)})`, level+3))
       })
       const parts = ['ldvalue.ObjectBuild().']
       parts.push(props.join(".\n") + ".")
       parts.push(indent("Build()", level+3))
       return parts.join("\n")
    }
    if (value === null || value === undefined) {
        return "ldvalue.Null()"
    }
    
    return JSON.stringify(value)
}

export function renderContextBuilder(context) {
    const {key, kind, anonymous, name} = context
    const {privateAttributes} = context._meta || {}
    const customAttributes = withoutBuiltins(context)
    const has = (key) => context.hasOwnProperty(key)
    const lines = [];
    const hasPrivateAttributes = privateAttributes && privateAttributes.length > 0;
    lines.push(`
func Create${classify(kind)}Context() {
    return ldcontext.NewBuilder(${stringify(key)}).
        Kind(${stringify(kind)}).
        Anonymous(${stringify(!!anonymous)}).`)

    if (!isNullOrUndefined(name)) {
        lines.push(indent(`Name(${stringify(name)}).`, 4))
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(indent(renderCustomAttributes(customAttributes, 3) + ".", 4))
    }
    if(hasPrivateAttributes) {
        privateAttributes.forEach((attr) => {
            lines.push(indent(`Private(${stringify(attr)}).`, 4));
        });
    }
    lines.push(indent('Build();', 4))
    lines.push('}')
    const imports = new Set([
        "github.com/launchdarkly/go-sdk-common/v3/ldcontext",
    ])
    return new RenderedTemplate({
        language: "go",
        fileName: `${classify(kind)}Context.go`,
        functionName: `Create${classify(kind)}`,
        content: lines.join("\n"),
        imports
    })
}

function renderCustomAttributes(customAttributes, level=0) {
    const lines = Object.entries(customAttributes).map(([key, value]) => {
        const setter = typeSetterMap[typeof value]
        if (!setter) {
            throw new Error(`Unsupported type ${typeof value}`)
        }
        return `${setter}(${stringify(key)}, ${stringify(value, level)})`
    });
    return lines.join(".\n")
}

