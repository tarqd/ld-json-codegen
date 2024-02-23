import _ from "underscore.string";
const { classify } = _;
import {
    withoutBuiltins,
    indent,
    BUILT_INS,
    isNullOrUndefined,
    RenderedTemplate,
} from "../util/helpers.js";

const { hasOwn } = Reflect;

export function stringify(value, level = 0) {
    if (Array.isArray(value)) {
        return `{${value.map((v) => stringify(v, 0)).join(",")}}`;
    } else if (value instanceof Date) {
        return value.getTime();
    } else if (typeof value == "object" && value !== null) {
        // c++ map initializer of string to Value

        const lines = ["Object{"];
        lines.push(
            Object.entries(value)
                .map(([key, v]) => {
                    return indent(
                        `{${JSON.stringify(key.toString())}, ${stringify(
                            v,
                            level + 3,
                        )}}`,
                        level + 2,
                    );
                })
                .join(",\n"),
        );
        lines.push(indent("}", level + 1));
        return lines.join("\n");
    }
    switch (typeof value) {
        case "number":
            if (isNaN(value)) {
                return "Value()";
            } else {
                return `${JSON.stringify(value)}`;
            }
        case "boolean":
            return JSON.stringify(value);
        case "string":
            return JSON.stringify(value);
        case "undefined":
            return "Value()";
        case "object":
            if (value === null) {
                return "Value()";
            }
            break;
    }
    return JSON.stringify(value);
}

export function renderContextBuilder(context, multi = false) {
    const imports = new Set([
        "#include <launchdarkly/attributes_builder.hpp>",
        "#include <launchdarkly/context.hpp>",
        "#include <launchdarkly/value.hpp>",
        "#include <string>"
        ,
    ]);
    const { key, kind, anonymous, name } = context;
    const { privateAttributes = [] } = context._meta || {};
    const customAttributes = withoutBuiltins(context);
    const has = (key) => context.hasOwnProperty(key);
    const lines = [];
    if (multi) {
        lines.push(
            `void add${classify(kind)}Context(ContextBuilder& builder) {
    using launchdarkly::Value::Object;
    builder`,
        );
    } else {
        lines.push(`Context create${classify(kind)}Context() {
    using launchdarkly::Value::Object;
    return ContextBuilder()`);
    }
    lines.push(
        `\t.Kind(${JSON.stringify(kind)}, ${JSON.stringify(key)})
\t.Anonymous(${JSON.stringify(!!anonymous)})`,
    );
    if (!isNullOrUndefined(name)) {
        lines.push(indent(`.Name(${JSON.stringify(name)})`, 4));
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(
            indent(
                renderCustomAttributes(customAttributes, privateAttributes),
                4,
            ),
        );
    }

    if (!multi) {
        lines.push(indent(".Build();", 4));
    } else {
        lines[lines.length-1] += ';';
    }
    lines.push("}\n");

    return new RenderedTemplate({
        language: "cpp",
        fileName: `${classify(kind)}Context.m`,
        functionName: `${multi ? "add": "create" }${classify(kind)}Context`,
        content: lines.join("\n"),
        imports,
    });
}

function renderCustomAttributes(
    customAttributes,
    privateAttributes = [],
    level = 0,
) {
    const lines = [];
    Object.entries(customAttributes).map(([key, value]) => {
        lines.push(
            `.${
                privateAttributes.includes(key) ? "SetPrivate" : "Set"
            }(${JSON.stringify(key)}, ${stringify(value, level)})`,
        );
    });
    
    return lines.join("\n");
}

export function renderMultiContextBuilder(contexts) {
    const imports = new Set([
        "#include <launchdarkly/attributes_builder.hpp>",
        "#include <launchdarkly/context.hpp>",
        "#include <launchdarkly/value.hpp>",
        "#include <string>",
    ]);
    const contextTemplates = contexts.map((context) =>
        renderContextBuilder(context, true),
    );

    const content = `Context createMultiContext() {
    auto builder = ContextBuilder();
${contextTemplates
    .map((t) =>
        indent(`${t.functionName}(&builder)`, 2),
    )
    .join("\n")}
    return builder.Build();
}
`;
    return [
        new RenderedTemplate({
            language: "cpp",
            fileName: `multi_context.cpp`,
            functionName: `createMultiContext`,
            content,
            imports,
        }),
        ...contextTemplates,
    ];
}
