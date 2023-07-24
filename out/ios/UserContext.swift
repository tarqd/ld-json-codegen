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