import LaunchDarkly


func createUserContext() -> Result<LDContext, ContextBuilderError> {
    let builder = LDContextBuilder(key: "some-key")
    builder.kind("user")
    builder.anonymous(false)
    builder.name("User's Name")
    builder.trySetValue("roles", ["staff", "editor"])
    builder.addPrivateAttribute(Reference("email"))
    return builder.build()
}