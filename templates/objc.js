
import _ from 'underscore.string';
const { camelize, quote, slugify, classify, lines : split_lines } = _;
import { withoutBuiltins, indent, BUILT_INS, isNullOrUndefined, RenderedTemplate } from '../util/helpers.js';

const {hasOwn} = Reflect

export function stringify(value, level = 0) {
    if (Array.isArray(value)) {
         return `[LDValue ofArray: @[${value.map(v => stringify(v, 0)).join(',')}]`;
    } else if (value instanceof Date) {
        return value.getTime()
    } else if (typeof value == "object" && value !== null) {
       const lines = ['[LDValue ofObject: @{ ']
       lines.push(Object.entries(value).map(([key, v]) => {
            return indent(`@${JSON.stringify(key.toString())}: ${stringify(v, level+3)}`, level+2)
       }).join(',\n'))
       lines.push(indent("]", level+1))
       return lines.join("\n")
    } 
    switch (typeof value) {
        case "number":
            if (isNaN(value)) {
                return "[LDValue ofNull]"
            } else {
                return `[LDValue ofNumber:@${JSON.stringify(value)}]`
            }
        case "boolean":
            return `[LDValue ofBool:@${value ? "YES" : "NO"}]`
        case "string":
            return `[LDValue ofString:@${JSON.stringify(value)}]`
        case "undefined":
            return "[LDValue ofNull]"
        case "object":
            if (value === null) {
                return "[LDValue ofNull]"
            }
            break;
    }
    return JSON.stringify(value)
}

export function renderContextBuilder(context) {
    const {key, kind, anonymous, name} = context
    const {privateAttributes} = context._meta || {}
    const customAttributes = withoutBuiltins(context)
    const has = (key) => context.hasOwnProperty(key)
    const lines = [];
    lines.push(`
// objective-c generator is untested
+(ContextBuilderResult) create${classify(kind)}Context {
    LDContextBuilder *builder = [[LDContextBuilder alloc] initWithKey:@${JSON.stringify(key)}];
    [builder kind:@${JSON.stringify(kind)}];
    [builder anonymous:@${!!anonymous ? "YES" : "NO"}];`);        
    if (!isNullOrUndefined(name)) {
        lines.push(indent(`[builder name:@${JSON.stringify(name)}];`, 2))
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(indent(renderCustomAttributes(customAttributes), 2))
    }
    (privateAttributes || []).forEach((attr) => {
        lines.push(indent(`[builder addPrivateAttributeWithReference: [[LDReference alloc] initWithValue:@${JSON.stringify(attr)}]];`, 2))
    })
    lines.push(indent('return [builder build];', 2))
    lines.push('}')
    const imports = new Set([
        "@import LaunchDarkly;"
    ])
    return new RenderedTemplate({
        language: "objc",
        fileName: `${classify(kind)}Context.m`,
        functionName: `create${classify(kind)}Context`,
        content: lines.join("\n"),
        imports
    })
}

function renderCustomAttributes(customAttributes, level=0) {
    const lines = [];
    Object.entries(customAttributes).map(([key, value]) => {
        lines.push(`[builder trySetValueWithName:@${JSON.stringify(key)} ${stringify(value, level)}];`)
    })
    return lines.join("\n")
}


