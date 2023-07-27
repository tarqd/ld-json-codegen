import _ from "underscore.string";
const { classify } = _;
import {
    withoutBuiltins,
    indent,
    BUILT_INS,
    isNullOrUndefined,
    RenderedTemplate,
} from "../util/helpers.js";

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
    }
    return JSON.stringify(value);
}

export function renderContextBuilder(context) {
    const { key, kind, anonymous, name } = context;
    const { privateAttributes } = context._meta || {};
    const customAttributes = withoutBuiltins(context);
    console.log(customAttributes);
    const has = (key) => context.hasOwnProperty(key);
    const lines = [];
    lines.push(`
fun create${classify(kind)}Context(): LDContext {
    val builder = LDContext.builder(ContextKind.of(${stringify(
        kind,
    )}), ${stringify(key)})
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
                `.privateAttributes(${privateAttributes
                    .map(stringify)
                    .join(", ")})`,
                2,
            ),
        );
    }
    lines.push(indent("return builder.build()", 2));
    lines.push("}");
    const imports = new Set([
        "import com.launchdarkly.sdk.LDValue",
        "import com.launchdarkly.sdk.LDContext",
        "import com.launchdarkly.sdk.ObjectBuilder",
        "import com.launchdarkly.sdk.ArrayBuilder",
        "import com.launchdarkly.sdk.ContextKind",
    ]);
    return new RenderedTemplate({
        language: "kotlin",
        fileName: `${classify(kind)}Context.kt`,
        functionName: `create${classify(kind)}Context`,
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
    const contextTemplates = contexts.map(renderContextBuilder);
    const imports = new Set(["import com.launchdarkly.sdk.LDContext"]);

    const content = 
`fun createMultiContext(): LDContext {
    // Or LDContext.createMulti(LDContext...)
    return LDContext.multiBuilder()
${indent(contextTemplates.map((b) => indent(`.add(${b.functionName}())`, 1)).join("\n"), 4)}
          .build()
}`;
    return [new RenderedTemplate({
        language: "kotlin",
        fileName: `MultiContextExample.kt`,
        functionName: `createMultiContext`,
        content,
        imports,
    }), ...contextTemplates];
}
