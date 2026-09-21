# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in proguard-android-optimize.txt.

# --------------------------------------------------------------------------------
# General Android & Kotlin optimizations
# --------------------------------------------------------------------------------
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# --------------------------------------------------------------------------------
# React Native Core & JNI / Bridgeless / TurboModules (RN 0.80+)
# --------------------------------------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }

-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * implements com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod <methods>;
    @com.facebook.react.bridge.ReactMethodSync <methods>;
}

-dontwarn com.facebook.react.**
-dontwarn com.facebook.jni.**

# --------------------------------------------------------------------------------
# React Native Config (BuildConfig reflection)
# --------------------------------------------------------------------------------
-keep class com.thekkanvendor.BuildConfig { *; }
-keep class com.thekkanvendor.prod.BuildConfig { *; }
-keep class com.thekkanvendor.dev.BuildConfig { *; }
-dontwarn com.thekkanvendor.**

# --------------------------------------------------------------------------------
# React Native Reanimated (v3)
# --------------------------------------------------------------------------------
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-dontwarn com.swmansion.reanimated.**

# --------------------------------------------------------------------------------
# React Native Gesture Handler & Screens
# --------------------------------------------------------------------------------
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.gesturehandler.**
-dontwarn com.swmansion.rnscreens.**

# --------------------------------------------------------------------------------
# Notifee
# --------------------------------------------------------------------------------
-keep class app.notifee.** { *; }
-keep class io.invertase.notifee.** { *; }
-dontwarn app.notifee.**
-dontwarn io.invertase.notifee.**

# --------------------------------------------------------------------------------
# React Native Fast Image (@d11/react-native-fast-image) & Glide
# --------------------------------------------------------------------------------
-keep public class com.d11.fastimage.** { *; }
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}
-dontwarn com.d11.fastimage.**
-dontwarn com.bumptech.glide.**

# --------------------------------------------------------------------------------
# Firebase, Google Auth & Play Services
# --------------------------------------------------------------------------------
-keep public class com.google.firebase.** { *; }
-keep public class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# --------------------------------------------------------------------------------
# Async Storage & Documents Picker/Viewer
# --------------------------------------------------------------------------------
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.reactnativedocuments.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# --------------------------------------------------------------------------------
# React Native Keyboard Controller
# --------------------------------------------------------------------------------
-keep class com.reactnativekeyboardcontroller.** { *; }
-dontwarn com.reactnativekeyboardcontroller.**

# --------------------------------------------------------------------------------
# React Native SVG, View Shot, Share, Splash View
# --------------------------------------------------------------------------------
-keep class com.horcrux.svg.** { *; }
-keep class fr.greweb.reactnativeviewshot.** { *; }
-keep class cl.json.** { *; }
-dontwarn com.horcrux.svg.**
-dontwarn fr.greweb.reactnativeviewshot.**
-dontwarn cl.json.**
