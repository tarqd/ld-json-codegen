
import _ from 'underscore.string';
const { camelize, quote, slugify, classify, underscored } = _;
import { withoutBuiltins, indent, BUILT_INS, isNullOrUndefined, RenderedTemplate } from '../util/helpers.js';

const typeSetterMap = {
    "number": "set_float",
    "boolean": "set_bool",
    "string": "set_string",
    "object": "set",
    "undefined": "set"
}
const attributeValueMap = {
    "number": "Number",
    "boolean": "Bool",
    "string": "String",
    "object": "Object",
    "array": "Array"
}

export function stringify(value, level = 0) {
    if (Array.isArray(value)) {
        return `Vec::<AttributeValue>::from([${value.map(v => `${stringify(v)}.into()`).join(", ")}])`
    } else if (value instanceof Date) {
        return value.getTime()
    } else if (typeof value == "object" && value !== null) {
       const parts = ['HashMap::<String, AttributeValue>::from([']
        parts.push(Object.entries(value).map(([key, v]) => {
            return indent(`(${stringify(key.toString())}, ${stringify(v, level+4)}.into())`, level+3)
         }).join(',\n'));
         parts.push("]).into()")
       return parts.join("\n")
    }
    if (value === null || value === undefined) {
        return "AttributeValue::Null"
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
pub fn create_${underscored(kind)}_context() -> Result<Context, String> {
    return ContextBuilder::new(${stringify(key)})
        .kind(${stringify(kind)})
        .anonymous(${stringify(!!anonymous)})`)

    if (!isNullOrUndefined(name)) {
        lines.push(indent(`.name(${stringify(name)})`, 4))
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(indent(renderCustomAttributes(customAttributes, 3), 4))
    }
    if(hasPrivateAttributes) {
        privateAttributes.forEach((attr) => {
            lines.push(indent(`.add_private_attribute(${stringify(attr)})`, 4));
        });
    }
    lines.push(indent('.build();', 4))
    lines.push('}')
    const imports = new Set([
        "use launchdarkly_server_sdk::{Context, ContextBuilder, AttributeValue};",
        "use std::collections::{hash_map::HashMap, vec::Vec};",
    ])
    return new RenderedTemplate({
        language: "rust",
        fileName: `${classify(kind)}Context.rs`,
        functionName: `create_${underscored(kind)}_context`,
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
        return `.${setter}(${stringify(key)}, ${stringify(value, level)})`
    });
    return lines.join("\n")
}

