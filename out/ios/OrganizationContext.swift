import LaunchDarkly


func createOrganizationContext() -> Result<LDContext, ContextBuilderError> {
    let builder = LDContextBuilder(key: "org-id")
    builder.kind("organization")
    builder.anonymous(false)
    builder.name("Acme Inc")
    builder.trySetValue("domain", "acme.my.example.com")
    return builder.build()
}