import { renderContextBuilder as swiftContextBuilder } from "./templates/swift.js";
import { renderContextBuilder as kotlinContextBuilder } from "./templates/kotlin.js";


const user = {
    "key": "some-key",
    "kind": "user",
    name: "User's Name",
    roles: ['staff', 'editor'],
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
}

const swiftContexts = [user, org, iosDevice, app]
const kotlinContexts = [user, org, androidDevice, app]

swiftContexts.forEach((context) => {
    swiftContextBuilder(context).renderToFile('./out/ios')
})

kotlinContexts.forEach((context) => {
    kotlinContextBuilder(context).renderToFile('./out/android')
})