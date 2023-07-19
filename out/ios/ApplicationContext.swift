import LaunchDarkly


func createApplicationContext() -> Result<LDContext, ContextBuilderError> {
    var builder = LDContextBuilder(key: "my-app-1.0.0")
    builder.kind("application")
    builder.anonymous(false)
    builder.name("My Mobile App")
    builder.trySetValue("id", "com.example.app")
    builder.trySetValue("version", "1.0.0")
    builder.trySetValue("buildDate", 1689794324094)
    return builder.build()
}