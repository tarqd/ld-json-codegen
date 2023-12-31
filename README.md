# LD Context Code Gen

WIP project to take JSON definitions of contexts and render examples of how to  build them in each SDK. Swift and Kotlin are partially implemented.


# Web UI

A live demo is available here: [ldcontext.arq.sh](https://ldcontext.arq.sh).

1. Enter the JSON of the single or multi-context in the code editor on the left
2. Generated context code will appear on the right. You can switch languages using the dropdown

Please use valid JSON syntax, including quoted keys. 

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

- [ ] CLI
- [X] Web UI
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
    - [X] Java Server-Side
    - [X] Java Client-side
    - [X] Java Android
    - [ ] Obj-C iOS
    - [X] Go server-side SDK
    - [ ] Python Server-side SDK
    - [X] .Net Server-side
    - [X] .Net Client-side


