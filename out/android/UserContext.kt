import com.launchdarkly.sdk.ArrayBuilder
import com.launchdarkly.sdk.ContextKind
import com.launchdarkly.sdk.LDContext
import com.launchdarkly.sdk.LDValue
import com.launchdarkly.sdk.ObjectBuilder


fun createUserContext(): LDContext {
    val builder = LDContext.builder(ContextKind.of("user"), "some-key")
        .anonymous(false)
        .name("User's Name")
        .set("roles", LDValue.buildArray()
          .add("staff")
          .add("editor")
          .build())
    .privateAttributes("email")
    return builder.build()
}