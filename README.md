# LD Context Code Gen

WIP project to take JSON definitions of contexts and render examples of how to  build them in each SDK. Swift and Kotlin are partially implemented.

# Web UI

## Development
You can start a dev server locally using
```
./node_modules/.bin/parcel serve browser/index.html
```
## Build

You can build the web ui for deployment using the following command:
```
./node_modules/.bin/parcel build browser/index.html
```
The output will be in `dist/`

# Usage
Until the CLI is implemented, you'll need to edit index.js directly. 

1. Clone this repo
2. Import the `renderContextBuilder` function from one of files in `./templates`
3. Call `renderContextBuilder(myJsonContext)`

The function returns a `RenderedTemplate` which is defined in `./util/helpers.js`. It's properties are

- fileName: recommended file name 
- functionName: name of the function that was generated
- language: programming langauage of the rendered content
- content: the rendered code as a string
- imports: a javascript `Set` containing the import statements needed for this rendered template. useful for merging multiple templates into one file
 
 You can use `renderedTemplate.renderToFile('./out')` to write the imports statements and code to the `./out` directory with the recommended file name. The reason it takes a directly is to allow for templates that generate multiple files. 

# TODO

- Create command line tool and web UI
- Option to generate common utility contexts with real attributes populated from the application environment
    - [ ] `browser`
    - [ ] `device`
    - [ ] `session`
    - [ ] `application`
    - [ ] `request`
- Support more SDKs
    - [ ] Javascript (not really needed, we may add some addition)
        - [ ] Express.js (automatic contexts)
        - [ ] Browser (automatic contexts)
    - [ ] Java Server-Side
    - [ ] Java Client-side
    - [ ] Java Android
    - [ ] Obj-C iOS
    - [ ] Go server-side SDK
    - [ ] Python Server-side SDK
    - [ ] .Net Server-side
    - [ ] .Net Client-side


