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

const languageSlugs = {
    Swift: "swift",
    Kotlin: "kotlin",
    Go: "go",
    "C#": "csharp",
    Java: "java",
    "Objective-C": "objc",
    Python: "python",
    Rust: "rust",
    Ruby: "ruby",
};

function langForSlug(slug) {
    let value = Object.entries(languageSlugs).find(([lang, s]) => s === slug)
    return value ? value[0] : null;
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            return func.apply(this, args);
        }, timeout);
    };
}

function parseParams() {
    let params = new URLSearchParams(window.location.search);
    return params;
}

function parseContextFragment() {
    console.log("parsing context fragment")
    try {
        let fragment = window.location.hash;
        let url = new URL(window.location.href);
        url.hash = "";
        window.history.replaceState({wasJS: true}, "", url);
        if (fragment.startsWith("#")) {
            fragment = fragment.slice(1);
        }
        if (fragment.length === 0 ) return;
        let parsed = JSON.parse(atob(fragment));
        if (typeof parsed !== "object" || Object.keys(parsed).length === 0) {
            throw new Error("parsed context is empty");
        }
        return JSON.stringify(parsed, null, 2);
        

    }
    catch(e) {
        console.log("failed to parse context from fragment", e);
    }
    
}

function createSelect(selected) {
    const select = document.getElementById("language-select");
    
    Object.keys(languages).forEach((lang, index) => {
        const option = document.createElement("option");
        option.value = lang;
        option.innerText = lang;
        if (lang === selected) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    return select;
}


function getRenderer() {
    const select = document.getElementById("language-select");
    const lang = select.options[select.selectedIndex].value;
    return languages[lang];
};

function getSlug() {
    const select = document.getElementById("language-select");
    const lang = select.options[select.selectedIndex].value;
    return languageSlugs[lang];
}

function setLanguage(lang) {
    const select = document.getElementById("language-select");
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === lang) {
            select.selectedIndex = i;
            break;
        }
    }
}


function renderTemplate(update) {
    const { view } = update;
    try {
        const renderer = getRenderer();
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
        const value = localStorage.getItem("context");
        if (!value) {
            return null;
        }
        const context = JSON.parse(value);
        if (typeof context !== "object") {
            return null;
        }
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
    
    const firstContext = parseContextFragment() || loadContext() || defaultContext;
    const firstLang = "Swift";
    
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
    let params = parseParams();
    let paramLang = langForSlug(params.get("lang"));
    let lang = paramLang || localStorage.getItem("lang");
    console.log(params, paramLang, lang);
    const select = createSelect(languages[lang] ? lang : firstLang);
    function updateFromHash() {
        try {
           
            let context = parseContextFragment();
            if (context) {
                view.dispatch({
                    changes: {from: 0, to: view.state.doc.length, insert: context},
                });
            }

        } catch (e) {
            console.error(e);
        }
    }
    window.addEventListener("hashchange", updateFromHash);
    window.addEventListener("onpopstate", (event) => {
        if(event.state.wasJS) {
            return;
        }
        updateFromHash();
        let params = parseParams();
        let paramLang = langForSlug(params.get("lang"));
        paramLang && setLanguage(paramLang);

    });
    select.addEventListener("change", () => {
        let lang = select.options[select.selectedIndex].value;
        localStorage.setItem(
            "lang",
            lang,
        );
        let params = parseParams();
        params.set("lang", languageSlugs[lang]);
        let url = new URL(window.location);
        url.searchParams.set("lang", languageSlugs[lang]);
        window.history.pushState({lang, wasJS: true }, "", url);
        renderTemplate({ view });
    });
    const copyButton = document.getElementById("copy-button");
    const rendered = document.getElementById("rendered");
    copyButton.addEventListener("click", () => {
        rendered.focus();
        navigator.clipboard.writeText(rendered.innerText);
        setTimeout(() => {
            alert("Copied to clipboard");
        }, 0);
    });
    const hashLink = document.getElementById("hashlink");
    hashLink.addEventListener("click", (e) => { 
        e.preventDefault();
        try {
            let url = new URL(window.location.href);
            url.hash = btoa(JSON.stringify(JSON.parse(view.state.doc.toString())));
            hashLink.href = url.toString();
            hashLink.focus();
            navigator.clipboard.writeText(hashLink.href);
            
        } catch(e) {
            alert("failed to generate permalink: " + e.toString());
        }
        return false;
    });
    let resetLink = document.getElementById("resetlink");
    resetLink.addEventListener("click", (e) => {
        e.preventDefault();
        view.dispatch({
            changes: {from: 0, to: view.state.doc.length, insert: defaultContext},
        });
        return false;
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
