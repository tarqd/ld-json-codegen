// LDContext JSON-to-Ruby by Yoz
// Mainly a copy of the Python one with some tweaks

import _ from 'underscore.string';
const { camelize, quote, slugify, classify, lines : split_lines } = _;
import { withoutBuiltins, indent, BUILT_INS, isNullOrUndefined, RenderedTemplate } from '../util/helpers.js';
import { nextTick } from 'process';

// WHAT DOES THIS DO? No other references in this file
const {hasOwn} = Reflect

export function stringify(value, level = 0) {
    if (Array.isArray(value)) {
        switch (value.length) {
            case 0:
                return "[]"
            case 1:
                return `[${stringify(value[0])}]`
            default:
                // Ruby style says arrays with multiple items should
                // wrap at 80 cols
                // I'm sure there's a better way to do this but leave it for the moment -- Yoz
                let lines = [];
                let currentLineStr = '';
                for (item of value) {
                    let itemStr = stringify(item)
                    if (currentLineStr.length == 0) {
                        currentLineStr += indent(itemStr, level + 1)
                        continue
                    } else if ((currentLineStr + itemStr).length > 77) {
                        lines.push(currentLineStr + ',')
                        currentLineStr = indent(itemStr, level + 1)
                    } else {
                        currentLineStr += ', ' + itemStr
                    }
                }
                lines.push(currentLineStr)
                return `[\n${lines.join("\n")}\n${indent(']', level)}`
        }
    } else if (value instanceof Date) {
        return value.getTime()
    } else if (typeof value == "object" && value !== null && Object.keys(value).length > 0) {
        const kvPairs = Object.entries(value).map(([key, v]) =>
            indent(`${stringify(key.toString())} => ${stringify(v, level)}`, level + 1)
        )
        return "{\n" + kvPairs.join(',\n') + indent("\n}", level)
    }
    if (typeof value == "boolean") {
        return value ? "true" : "false"
    }
    return JSON.stringify(value)
}

export function renderContextBuilder(context) {
    const {key, kind, anonymous, name} = context
    const lines = [];
    lines.push( "# ruby generator is untested",
                `def create_${kind}_context():`,
                indent(`return Launchdarkly::LDContext.create((${stringify(context)})`, 1),        
                'end','')
    const imports = new Set([
        "require 'ldclient-rb'",
    ])
    return new RenderedTemplate({
        language: "ruby",
        fileName: `${kind}_context.rb`,
        functionName: `create_$(kind}_context`,
        content: lines.join("\n"),
        imports
    })
}

