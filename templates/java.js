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
        const lines = ["LDValue.buildArray()"];
        value.forEach((v) => {
            lines.push(indent(`.add(${stringify(v, level + 3)})`, level + 1));
        });
        lines.push(indent(".build()", level + 1));
        return lines.join("\n");
    } else if (value instanceof Date) {
        return value.getTime();
    } else if (typeof value == "object" && value !== null) {
        const lines = ["LDValue.buildObject()"];
        Object.entries(value).forEach(([key, v]) => {
            lines.push(
                indent(
                    `.put(${stringify(key.toString())}, ${stringify(
                        v,
                        level + 3,
                    )})`,
                    level + 2,
                ),
            );
        });
        lines.push(indent(".build()", level + 1));
        return lines.join("\n");
    } else if (typeof value == "number" && !isNaN(value)) {
        return `${JSON.stringify(value)}d`;
    }
    return JSON.stringify(value);
}

export function renderContextBuilder(context) {
    const imports = new Set([
        "import com.launchdarkly.sdk.LDValue;",
        "import com.launchdarkly.sdk.LDContext;",
        "import com.launchdarkly.sdk.ObjectBuilder;",
        "import com.launchdarkly.sdk.ArrayBuilder;",
        "import com.launchdarkly.sdk.ContextKind;",
    ]);
    const { key, kind, anonymous, name } = context;
    const { privateAttributes } = context._meta || {};
    const customAttributes = withoutBuiltins(context);
    console.log(customAttributes);
    const has = (key) => context.hasOwnProperty(key);
    const lines = [];
    const hasPrivateAttributes =
        privateAttributes && privateAttributes.length > 0;
    lines.push(`
class ${classify(kind)}ContextBuilder {
    public static LDContext createContext() {
        return LDContext.builder(ContextKind.of(${stringify(
            kind,
        )}), ${stringify(key)})
            .anonymous(${stringify(!!anonymous)})`);

    if (!isNullOrUndefined(name)) {
        lines.push(indent(`.name(${stringify(name)})`, 6));
    }
    if (Object.keys(customAttributes).length > 0) {
        lines.push(
            indent(renderCustomAttributes(customAttributes, 0, false), 6),
        );
    }
    if (hasPrivateAttributes) {
        lines.push(
            indent(
                `.privateAttributes(${privateAttributes
                    .map(stringify)
                    .join(", ")})`,
                6,
            ),
        );
    }
    lines.push(indent(".build();", 6));
    lines.push(indent("}", 2));
    lines.push("}");
    return new RenderedTemplate({
        language: "java",
        fileName: `${classify(kind)}Context.java`,
        functionName: `${classify(kind)}ContextBuilder.createContext`,
        content: lines.join("\n"),
        imports,
    });
}

function renderCustomAttributes(
    customAttributes,
    level = 0,
    includeSemicolon = false,
) {
    const lines = [];
    Object.entries(customAttributes).map(([key, value]) => {
        lines.push(`.set(${JSON.stringify(key)}, ${stringify(value, level)})`);
    });
    return lines.join("\n");
}

export function renderMultiContextBuilder(contexts) {
    const imports = new Set([
        "import com.launchdarkly.sdk.LDContext;",
    ]);
    const contextTemplates = contexts.map(renderContextBuilder);

    const content = 
`class MultiContext {
    public static LDContext createContext() {
        // Or LDContext.createMulti(LDContext...)
        return LDContext.multiBuilder().
${contextTemplates.map((b) => indent(`.Add(${b.functionName}())`, 6)).join("\n")}
        .Build()
    }
}
`;
    return [
        new RenderedTemplate({
            language: "java",
            fileName: `MultiContextExample.java`,
            functionName: `MultiContext.createContext`,
            content,
            imports,
        }),
        ...contextTemplates,
    ];
}
