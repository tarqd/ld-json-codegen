import LaunchDarkly


func createDeviceContext() -> Result<LDContext, ContextBuilderError> {
    let builder = LDContextBuilder(key: "device-id-here")
    builder.kind("device")
    builder.anonymous(false)
    builder.trySetValue("manufacturer", "Apple")
    builder.trySetValue("model", "iPhone 14")
    builder.trySetValue("formFactor", "phone")
    builder.trySetValue("os", Dictionary(uniqueKeysWithValues: [
        ("ios", Dictionary(uniqueKeysWithValues: [
                  ("version", "17.0.0")
                ]))
      ]))
    builder.trySetValue("storageCapMB", 10)
    builder.trySetValue("memoryCapMB", 512)
    return builder.build()
}