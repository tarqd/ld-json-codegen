import com.launchdarkly.sdk.ArrayBuilder
import com.launchdarkly.sdk.ContextKind
import com.launchdarkly.sdk.LDContext
import com.launchdarkly.sdk.LDValue
import com.launchdarkly.sdk.ObjectBuilder


fun createApplicationContext(): LDContext {
    val builder = LDContext.builder(ContextKind.of("application"), "my-app-1.0.0")
        .anonymous(false)
        .name("My Mobile App")
        .set("id", "com.example.app")
        .set("version", "1.0.0")
        .set("buildDate", 1689794324094)
    return builder.build()
}