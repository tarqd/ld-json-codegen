import { renderContextBuilder as swiftContextBuilder } from "./templates/swift.js";
import { renderContextBuilder as kotlinContextBuilder } from "./templates/kotlin.js";
import { renderContextBuilder as goContextBuilder } from "./templates/go.js";
import { renderContextBuilder as csharpContextBuilder } from "./templates/csharp.js";
import { renderContextBuilder as javaContextBuilder } from "./templates/csharp.js";
import { union, RenderedTemplate } from "./util/helpers.js";

const user = {
    "key": "some-key",
    "kind": "user",
    name: "User's Name",
    roles: ['writer', 'reader'],
    _meta: {
        privateAttributes: ['email']
    }
};

const androidDevice = {
    'key': 'device-id-here',
    'kind': 'device',
    'manufacturer': 'Samsung',
    'model': 'Galaxy S10',
    'formFactor': 'phone',
    'os': {
        android: {
            version: '10.0.0'
        }
    },
    storageCapMB: 10,
    memoryCapMB: 512
    
}
const iosDevice = {
    'key': 'device-id-here',
    'kind': 'device',
    'manufacturer': 'Apple',
    'model': 'iPhone 14',
    'formFactor': 'phone',
    'os': {
        ios: {
            version: '17.0.0'
        }
    },
    storageCapMB: 10,
    memoryCapMB: 512
}
const app = {
    key: "my-app-1.0.0",
    kind: "application",
    "id": "com.example.app",
    version: "1.0.0",
    name: "My Mobile App",
    buildDate: Date.now()
}
const org = {
    "key": "org-id",
    "kind": "organization",
    "name": "Acme Inc",
    "domain": "acme.my.example.com",
    optIns: ['feature-1', 'feature-2']
}

const swiftContexts = [user, org, iosDevice, app]
const kotlinContexts = [user, org, androidDevice, app]

swiftContexts.forEach((context) => {
    swiftContextBuilder(context).renderToFile('./out/ios')
})

kotlinContexts.forEach((context) => {
    kotlinContextBuilder(context).renderToFile('./out/android')
})

function renderAll(language, dir, contexts, ext) {
    
    const imports = union(...contexts.map((t) => t.imports))
    const content = contexts.map((t) => t.content).join("\n\n")
    const fileName = `Contexts.${ext || language}`
    const functionName = `createContexts`
    const template = new RenderedTemplate({
        language,
        fileName,
        functionName,
        content,
        imports
    })
    template.renderToFile(dir)

}

renderAll('swift', './out/ios', swiftContexts.map(c => swiftContextBuilder(c)))
renderAll('kotlin', './out/android', kotlinContexts.map(c => kotlinContextBuilder(c)), 'kt')
renderAll('java', './out/java', kotlinContexts.map(c => javaContextBuilder(c)))
renderAll('csharp', './out/csharp', kotlinContexts.map(c => csharpContextBuilder(c)), 'cs')
renderAll('go', './out/go', kotlinContexts.map(c => goContextBuilder(c)))