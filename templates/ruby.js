// LDContext JSON-to-Ruby by Yoz
// Mainly a copy of the Python one with some tweaks

import _ from 'underscore.string';
const { underscored } = _;
import { indent, isNullOrUndefined, RenderedTemplate } from '../util/helpers.js';

const SYMBOL_REGEX = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
function symbolilify(name) {
    if (!SYMBOL_REGEX.test(name)) {
        return `${JSON.stringify(name.toString())}`
    } else {
        return `${name}`
    }
}


export function stringify(value, level = 0) {
    if (isNullOrUndefined(value)) {
        return 'nil'
    }
    if (Array.isArray(value)) {
        if (value.length === 0) { return '[]' }
        if (value.length === 1) { return `[${stringify(value[0], level+1)}]` }
        return [
            '[',
                `${indent(value.map(v => stringify(v, level+2)).join(", \n"), level+1)}`,
            ']'
        ].join('\n');
    } else if (value instanceof Date) {
        return value.getTime()
    } else if (typeof value == "object" && value !== null) {
        return [
            '{',
            `${indent(Object.entries(value).map(([k, v]) => `${symbolilify(k)}: ${stringify(v, level+2)}`).join(", \n"), level+1)}`,
            '}'
        ].join('\n')
    }
    return JSON.stringify(value)
}

export function renderContextBuilder(context) {
    const imports = new Set([
        "require 'ldclient-rb'",
    ])
    const lines = [];
    lines.push( "# ruby generator is untested",
                `def create_${underscored(kind)}_context():`,
                indent(`return Launchdarkly::LDContext.create(${stringify(context)})`, 1),        
                'end','')
    return new RenderedTemplate({
        language: "ruby",
        fileName: `${kind}_context.rb`,
        functionName: `create_${underscored(kind)}_context`,
        content: lines.join("\n"),
        imports
    })
}

