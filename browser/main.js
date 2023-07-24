import {EditorView, basicSetup} from "codemirror"
import {json} from "@codemirror/lang-json"
import hljs from 'highlight.js';
import { renderContextBuilder as swiftContextBuilder } from "../templates/swift.js";
import { renderContextBuilder as kotlinContextBuilder } from "../templates/kotlin.js";
import { renderContextBuilder as goContextBuilder } from "../templates/go.js";
import { renderContextBuilder as csharpContextBuilder } from "../templates/csharp.js";
import { renderContextBuilder as javaContextBuilder } from "../templates/java.js";
import { renderContextBuilder as objcContextBuilder } from "../templates/objc.js";
import { renderContextBuilder as pythonContextBuilder } from "../templates/python.js";
import { renderContextBuilder as rustContextBuilder } from "../templates/rust.js";
import { union, RenderedTemplate } from "../util/helpers.js";

const languages = {
    Swift: swiftContextBuilder,
    Kotlin: kotlinContextBuilder,
    Go: goContextBuilder,
    "C#": csharpContextBuilder,
    Java: javaContextBuilder,
    "Objective-C": objcContextBuilder,
    Python: pythonContextBuilder,
    Rust: rustContextBuilder
}

const languageExtensions = {
    "Swift": "swift",
    "Kotlin": "kt",
    "Go": "go",
    "C#": "cs",
    "Java": "java",
    "Objective-C": "m",
    "Python": "py",
    "Rust": "rs"
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { return func.apply(this, args); }, timeout);
    };
  }

function createSelect() {
    const select = document.getElementById("language-select")
    const lastLang = localStorage.getItem("lang") || "Swift"
    Object.keys(languages).forEach((lang, index) => {
        const option = document.createElement("option")
        option.value = lang
        option.innerText = lang
        if (lang === lastLang) {
            option.selected = true
        }
        select.appendChild(option)
    })
    return select
}

function setLanguage(lang) {
    const select = document.getElementById("language-select")
    const option = Array.from(select.options).filter(option => option.value === lang).pop();
    if(option) {
        option.selected = true
        localStorage.setItem("lang", option.value)
    }
}

const getRenderer = function getRenderer() {
    const select = document.getElementById("language-select")
    const lang = select.options[select.selectedIndex].value
    return {renderer: languages[lang], ext: languageExtensions[lang]}
}


function renderTemplate(update) {
    const {view} = update;
    try {
        const {renderer, ext} = getRenderer();
        const context = JSON.parse(view.state.doc.toString())
        localStorage.setItem("context", JSON.stringify(context))
        setLanguage(localStorage.getItem("lang") || "Swift")
        if (context.kind === "multi") {
            const contexts = []
            Object.entries(context).filter(([key]) => key !== '_meta' && key !== "kind").forEach(([key, value]) => {
                if(typeof value === "object") {
                    if (!value.hasOwnProperty("kind")) {
                        value.kind = key
                    }
                    contexts.push(value)
                }
            })
            const rendered = contexts.map((context) => {
                return renderer(context)
            });
            const imports = union(...rendered.map((r) => r.imports));
            const content = rendered.map((r) => r.getContent()).join("\n")
            const template = new RenderedTemplate({
                language: ext,
                fileName: `Contexts.${ext}`,
                functionName: `createContexts`,
                content,
                imports
            });
            document.getElementById("rendered").innerHTML = hljs.highlight(template.language, template.renderToString(), true).value;
        } else {
            const rendered = renderer(context)
            document.getElementById("rendered").innerHTML = hljs.highlight(rendered.language, rendered.renderToString(), true).value;
        }
        
    } catch (e) {
        console.error(e)
        document.getElementById("rendered").innerText = e.toString()
    }
}
const renderTemplateDebounced = debounce(renderTemplate, 300)

function main() {
    const defaultContext = JSON.stringify({
        key: "some-key",
        name: "Hugh Mann",
        kind: "user",
        "groups": ["reader", "writer"],
        email: "hmann@example.com",
        location: {
            country: "US",
            region: "PA"
        },
        _meta: {
            privateAttributes: ["email"]
        }
    }, null, 2)
    const firstContext = localStorage.getItem("context") || defaultContext
    const firstLang = localStorage.getItem("lang") || "Swift"


    let view = new EditorView({
        doc: defaultContext,
        extensions: [
            basicSetup,
            json(),
            EditorView.updateListener.of(renderTemplateDebounced)
        ],
    })
    const editor = document.getElementById('editor')
    editor.appendChild(view.dom)
    const select = createSelect();
    select.addEventListener("change", () => {
        localStorage.setItem("lang", select.options[select.selectedIndex].value)
        renderTemplate({view})
    })
    const copyButton = document.getElementById("copy-button")
    const rendered = document.getElementById("rendered")
    copyButton.addEventListener("click", () => {
        console.log(rendered.innerText)
        rendered.focus()
        navigator.clipboard.writeText(rendered.innerText)
        setTimeout(() => {
            alert("Copied to clipboard")
        }, 0)
        //alert("Copied to clipboard")
    })
    
}

if (document.readyState === "ready") {
    main()
} else {
    document.addEventListener("DOMContentLoaded", () => {
        main()
    })
}