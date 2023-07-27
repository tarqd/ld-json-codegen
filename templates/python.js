import _ from "underscore.string";
const { classify, underscored } = _;
import {
    withoutBuiltins,
    indent,
    isNullOrUndefined,
    RenderedTemplate,
} from "../util/helpers.js";

export function stringify(value, level = 0) {
    if (Array.isArray(value)) {
        return `[${value.map((v) => stringify(v)).join(", ")}]`;
    } else if (value instanceof Date) {
        return value.getTime();
    } else if (typeof value == "object" && value !== null) {
        const lines = ["{"];
        lines.push(
            Object.entries(value)
                .map(([key, v]) => {
                    return indent(
                        `${stringify(key.toString())}: ${stringify(
                            v,
                            level + 3,
                        )}`,
                        level + 2,
                    );
                })
                .join(",\n"),
        );
        lines.push(indent("}", level + 1));
        return lines.join("\n");
    }
    if (typeof value == "boolean") {
        return value ? "True" : "False";
    }
    return JSON.stringify(value);
}

export function renderContextBuilder(context) {
    const imports = new Set(["from ldclient import Context"]);
    const { key, kind, anonymous, name } = context;
    const { privateAttributes } = context._meta || {};
    const customAttributes = withoutBuiltins(context);
    const has = (key) => context.hasOwnProperty(key);
    const lines = [];
    lines.push(`
def create_${underscored(kind)}_context(): 
    return (Context.builder(${stringify(key)})
        .kind(${stringify(kind)})
        .anonymous(${stringify(!!anonymous)})`);
    if (!isNullOrUndefined(name)) {
        lines.push(indent(`.name(${stringify(name)})`, 4));
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(indent(renderCustomAttributes(customAttributes), 4));
    }
    if (privateAttributes && privateAttributes.length > 0) {
        lines.push(
            indent(
                `.private(${privateAttributes.map(stringify).join(", ")})`,
                4,
            ),
        );
    }
    lines.push(indent(".build())", 4));
    lines.push("");
    return new RenderedTemplate({
        language: "python",
        fileName: `${underscored(kind)}_context.py`,
        functionName: `create_${underscored(kind)}_context`,
        content: lines.join("\n"),
        imports,
    });
}

function renderCustomAttributes(customAttributes, level = 0) {
    const lines = [];
    Object.entries(customAttributes).map(([key, value]) => {
        lines.push(`.set(${stringify(key)}, ${stringify(value, level)})`);
    });
    return lines.join("\n");
}

export function renderMultiContextBuilder(contexts) {
    const imports = new Set(["from ldclient import Context"]);
    const contextTemplates = contexts.map(renderContextBuilder);
    
    const content = 
`def create_multi_context():
    return (Context.multi_builder()
${contextTemplates.map((t) => indent(`.add(${t.functionName}())`, 4)).join("\n")}
        .build())
`
    return [new RenderedTemplate({
        language: "python",
        fileName: `multi_context.py`,
        functionName: `create_multi_context`,
        content,
        imports,
    }), ...contextTemplates];
}