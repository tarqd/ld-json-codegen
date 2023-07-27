import { EditorView, basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import hljs from "highlight.js";
import renderers from "../templates/mod.js";
import { union, RenderedTemplate } from "../util/helpers.js";

const languages = {
    Swift: renderers.swift,
    Kotlin: renderers.kotlin,
    Go: renderers.go,
    "C#": renderers.csharp,
    Java: renderers.java,
    "Objective-C": renderers.objc,
    Python: renderers.python,
    Ruby: renderers.ruby,
    Rust: renderers.rust,
};

const languageExtensions = {
    Swift: "swift",
    Kotlin: "kt",
    Go: "go",
    "C#": "cs",
    Java: "java",
    "Objective-C": "m",
    Python: "py",
    Rust: "rs",
    Ruby: "rb",
};

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            return func.apply(this, args);
        }, timeout);
    };
}

function createSelect() {
    const select = document.getElementById("language-select");
    const lastLang = localStorage.getItem("lang") || "Swift";
    Object.keys(languages).forEach((lang, index) => {
        const option = document.createElement("option");
        option.value = lang;
        option.innerText = lang;
        if (lang === lastLang) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    return select;
}


const getRenderer = function getRenderer() {
    const select = document.getElementById("language-select");
    const lang = select.options[select.selectedIndex].value;
    return { renderer: languages[lang], ext: languageExtensions[lang] };
};

function renderTemplate(update) {
    const { view } = update;
    try {
        const { renderer, ext } = getRenderer();
        const { renderContextBuilder, renderMultiContextBuilder } = renderer;
        const context = JSON.parse(view.state.doc.toString());
        localStorage.setItem("context", JSON.stringify(context));

        if (context.kind === "multi") {
            const contexts = [];
            Object.entries(context)
                .filter(([key]) => key !== "_meta" && key !== "kind")
                .forEach(([key, value]) => {
                    if (typeof value === "object") {
                        if (!value.hasOwnProperty("kind")) {
                            value.kind = key;
                        }
                        contexts.push(value);
                    }
                });
            const [multi, ...contextTemplates] = renderMultiContextBuilder(contexts);
            const imports = union(multi.imports, ...contextTemplates.map((t) => t.imports));
            const content = [multi.content, ...contextTemplates.map((t) => t.content)].join("\n\n");
            const combined = new RenderedTemplate({
                imports,
                language: multi.language,
                fileName: multi.fileName,
                content,
            });
            document.getElementById("rendered").innerHTML = hljs.highlight(
                combined.language,
                combined.renderToString(),
                true,
            ).value;
        } else {
            const template = renderContextBuilder(context);
            document.getElementById("rendered").innerHTML = hljs.highlight(
                template.language,
                template.renderToString(),
                true,
            ).value;
        }
    } catch (e) {
        console.error(e);
        document.getElementById("rendered").innerText = e.toString();
    }
}
const renderTemplateDebounced = debounce(renderTemplate, 300);

function loadContext() {
    try {
        const context = JSON.parse(localStorage.getItem("context"));
        return JSON.stringify(context, null, 2)
    } catch (e) {
        return null;
    }
}

function main() {
    const defaultContext = JSON.stringify(
        {
            key: "some-key",
            name: "Hugh Mann",
            kind: "user",
            groups: ["reader", "writer"],
            email: "hmann@example.com",
            location: {
                country: "US",
                region: "PA",
            },
            _meta: {
                privateAttributes: ["email"],
            },
        },
        null,
        2,
    );
    const firstContext = loadContext() || defaultContext;
    const firstLang = localStorage.getItem("lang") || "Swift";

    let view = new EditorView({
        doc: firstContext,
        extensions: [
            basicSetup,
            json(),
            EditorView.updateListener.of(renderTemplateDebounced),
        ],
    });
    const editor = document.getElementById("editor");
    editor.appendChild(view.dom);
    const select = createSelect();
    select.addEventListener("change", () => {
        localStorage.setItem(
            "lang",
            select.options[select.selectedIndex].value,
        );
        renderTemplate({ view });
    });
    const copyButton = document.getElementById("copy-button");
    const rendered = document.getElementById("rendered");
    copyButton.addEventListener("click", () => {
        console.log(rendered.innerText);
        rendered.focus();
        navigator.clipboard.writeText(rendered.innerText);
        setTimeout(() => {
            alert("Copied to clipboard");
        }, 0);
    });
    renderTemplate({view})
}

if (document.readyState === "ready") {
    main();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        main();
    });
}
