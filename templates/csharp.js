
import _ from 'underscore.string';
const { camelize, quote, slugify, classify } = _;
import { withoutBuiltins, indent, BUILT_INS, isNullOrUndefined, RenderedTemplate } from '../util/helpers.js';


export function stringify(value, level = 0) {
    console.log("stringify", value)
    if (Array.isArray(value)) {
        const lines = ['LDValue.BuildArray()']
        value.forEach((v) => {
             lines.push(indent(`.Add(${stringify(v, level+3)})`, level + 1))
        });
        lines.push(indent(".Build()", level+1))
        return lines.join("\n")
    } else if (value instanceof Date) {
        return value.getTime()
    } else if (typeof value == "object" && value !== null) {
       const lines = ['LDValue.BuildObject()']
       Object.entries(value).forEach(([key, v]) => {
            lines.push(indent(`.Add(${JSON.stringify(key.toString())}, ${stringify(v, level+3)})`, level+2))
       })
       lines.push(indent(".Build()", level+1))
       return lines.join("\n")
    } else if (typeof value == "number" && !isNaN(value)) {
        return `${JSON.stringify(value)}D`
    }
    return JSON.stringify(value)
}

export function renderContextBuilder(context) {
    const {key, kind, anonymous, name} = context
    const {privateAttributes} = context._meta || {}
    const customAttributes = withoutBuiltins(context)
    console.log(customAttributes)
    const has = (key) => context.hasOwnProperty(key)
    const lines = [];
    const hasPrivateAttributes = privateAttributes && privateAttributes.length > 0;
    lines.push(`
class ${classify(kind)}ContextBuilder {
    public static LDContext CreateContext() {
        return LDContext.Builder(${stringify(key)})
            .Kind(${stringify(kind)})
            .Anonymous(${stringify(!!anonymous)})`)

    if (!isNullOrUndefined(name)) {
        lines.push(indent(`.Name(${stringify(name)})`, 6))
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(indent(renderCustomAttributes(customAttributes, 0, false), 6))
    }
    if(hasPrivateAttributes) {
        lines.push(indent(`.Private(${privateAttributes.map(stringify).join(", ")})`, 6))
    }
    lines.push(indent('.Build();', 6))
    lines.push(indent('}', 2))
    lines.push('}')
    const imports = new Set([
        "using LaunchDarkly.Sdk;",
        "using LaunchDarkly.Sdk.Server;",
    ])
    return new RenderedTemplate({
        language: "csharp",
        fileName: `${classify(kind)}Context.cs`,
        functionName: `${classify(kind)}.CreateContext`,
        content: lines.join("\n"),
        imports
    })
}

function renderCustomAttributes(customAttributes, level=0, includeSemicolon = false) {
    const lines = [];
    Object.entries(customAttributes).map(([key, value]) => {
        lines.push(`.Set(${stringify(key)}, ${stringify(value, level)})`)

    })
    return lines.join("\n")
}

export function renderMultiContext(contexts) {
    const builders = contexts.map(renderContextBuilder)
    const imports = new Set([
        "using LaunchDarkly.Sdk;",
        "using LaunchDarkly.Sdk.Server;",

    ]);
    
    const lines = []
    lines.push(
`
func CreateMultiContext() -> LDContext {
    // Or LDContext.createMulti(LDContext...)
    return LDContext.MultiBuilder()
`)
    builders.forEach(builder => {
        lines.push(indent(`.add(${builder.functionName}())`, 1))
    })
    lines.push(indent('.Build()', 1))
    lines.push('}')
    return new RenderedTemplate({
        language: "csharp",
        fileName: `MultiContextExample.cs`,
        functionName: `CreateMultiContext`,
        content: lines.join("\n"),
        imports
    })
}


