import LaunchDarkly


func createUserContext() -> Result<LDContext, ContextBuilderError> {
    var builder = LDContextBuilder(key: "some-key")
    builder.kind("user")
    builder.anonymous(false)
    builder.name("User's Name")
    builder.trySetValue("roles", .array(["writer", "reader"]))
    builder.addPrivateAttribute(Reference("email"))
    return builder.build()
}


func createOrganizationContext() -> Result<LDContext, ContextBuilderError> {
    var builder = LDContextBuilder(key: "org-id")
    builder.kind("organization")
    builder.anonymous(false)
    builder.name("Acme Inc")
    builder.trySetValue("domain", "acme.my.example.com")
    builder.trySetValue("optIns", .array(["feature-1", "feature-2"]))
    return builder.build()
}


func createDeviceContext() -> Result<LDContext, ContextBuilderError> {
    var builder = LDContextBuilder(key: "device-id-here")
    builder.kind("device")
    builder.anonymous(false)
    builder.trySetValue("manufacturer", "Apple")
    builder.trySetValue("model", "iPhone 14")
    builder.trySetValue("formFactor", "phone")
    builder.trySetValue("os", .object([
        "ios": .object([
                  "version": "17.0.0"
                ])
      ]))
    builder.trySetValue("storageCapMB", 10)
    builder.trySetValue("memoryCapMB", 512)
    return builder.build()
}


func createApplicationContext() -> Result<LDContext, ContextBuilderError> {
    var builder = LDContextBuilder(key: "my-app-1.0.0")
    builder.kind("application")
    builder.anonymous(false)
    builder.name("My Mobile App")
    builder.trySetValue("id", "com.example.app")
    builder.trySetValue("version", "1.0.0")
    builder.trySetValue("buildDate", 1689952732283)
    return builder.build()
}