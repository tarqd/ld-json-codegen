import {EditorView, basicSetup} from "codemirror"
import {json} from "@codemirror/lang-json"
import hljs from 'highlight.js';
import { renderContextBuilder as swiftContextBuilder } from "../templates/swift.js";
import { renderContextBuilder as kotlinContextBuilder } from "../templates/kotlin.js";
import { renderContextBuilder as goContextBuilder } from "../templates/go.js";
import { renderContextBuilder as csharpContextBuilder } from "../templates/csharp.js";
import { renderContextBuilder as javaContextBuilder } from "../templates/java.js";
import { union, RenderedTemplate } from "../util/helpers.js";

const languages = {
    Swift: swiftContextBuilder,
    Kotlin: kotlinContextBuilder,
    Go: goContextBuilder,
    "C#": csharpContextBuilder,
    Java: javaContextBuilder
}

const languageExtensions = {
    "Swift": "swift",
    "Kotlin": "kt",
    "Go": "go",
    "C#": "cs",
    "Java": "java"
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { return func.apply(this, args); }, timeout);
    };
  }

function createSelect() {
    const select = document.createElement("select")
    select.id = "language-select"
    Object.keys(languages).forEach((lang, index) => {
        const option = document.createElement("option")
        option.value = lang
        option.innerText = lang
        if (index === 0) {
            option.selected = true
        }
        select.appendChild(option)
    })
    return select
}

const getRenderer = function getRenderer() {
    const select = document.getElementById("language-select")
    const lang = select.options[select.selectedIndex].value
    return {renderer: languages[lang], ext: languageExtensions[lang]}
}


const renderTemplate = debounce(function renderTemplate(update) {
    const {view} = update;
    try {
        const {renderer, ext} = getRenderer();
        const context = JSON.parse(view.state.doc.toString())
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
}, 500);

function main() {
    const defaultContext = JSON.stringify({
        key: "some-key",
        name: "Hugh Mann",
        kind: "user"
    }, null, 2)

    let view = new EditorView({
        doc: defaultContext,
        extensions: [
            basicSetup,
            json(),
            EditorView.updateListener.of(renderTemplate)
        ],
    })
    const editor = document.getElementById('editor')
    editor.appendChild(view.dom)
    const select = createSelect();
    select.addEventListener("change", () => {
        renderTemplate({view})
    })
    document.getElementById("options").appendChild(select)
}

if (document.readyState === "ready") {
    main()
} else {
    document.addEventListener("DOMContentLoaded", () => {
        main()
    })
}