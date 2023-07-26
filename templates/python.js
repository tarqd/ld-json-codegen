import _ from "underscore.string";
const { classify } = _;
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
            `${stringify(key.toString())}: ${stringify(v, level + 3)}`,
            level + 2
          );
        })
        .join(",\n")
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
  const { key, kind, anonymous, name } = context;
  const { privateAttributes } = context._meta || {};
  const customAttributes = withoutBuiltins(context);
  const has = (key) => context.hasOwnProperty(key);
  const lines = [];
  lines.push(`
# python generator is untested
def create${classify(kind)}Context(): 
    return Context.builder(${stringify(key)})
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
      indent(`.private(${privateAttributes.map(stringify).join(", ")})`, 4)
    );
  }
  lines.push(indent(".build()", 4));
  lines.push("");
  const imports = new Set(["from ldclient import Context"]);
  return new RenderedTemplate({
    language: "python",
    fileName: `${classify(kind)}Context.py`,
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
