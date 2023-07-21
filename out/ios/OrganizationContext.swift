import LaunchDarkly


func createOrganizationContext() -> Result<LDContext, ContextBuilderError> {
    var builder = LDContextBuilder(key: "org-id")
    builder.kind("organization")
    builder.anonymous(false)
    builder.name("Acme Inc")
    builder.trySetValue("domain", "acme.my.example.com")
    builder.trySetValue("optIns", .array(["feature-1", "feature-2"]))
    return builder.build()
}