# Play Store Build & Release Guide for Dealzhub

This guide explains how to generate a release build for the Android version of **Dealzhub** (using the `prod` flavor) and upload it to the Google Play Store.

---

## 🛠️ Step 1: Prerequisites
Ensure you have the following:

1. **Google Play Console Account**: A developer account registered on the [Google Play Console](https://play.google.com/console/signup).
2. **Release Keystore**:
   - The keystore is already configured at [android/app/thekkan-release.keystore](file:///c:/DealzHub/Dealzhub-mobile-app/android/app/thekkan-release.keystore).
   - Signing credentials are configured in [android/app/keystore.properties](file:///c:/DealzHub/Dealzhub-mobile-app/android/app/keystore.properties):
     ```properties
     storeFile=thekkan-release.keystore
     storePassword=Thekkan_4u
     keyAlias=upload
     keyPassword=Thekkan_4u
     ```
3. **Environment Files**: Ensure [.env.prod](file:///c:/DealzHub/Dealzhub-mobile-app/.env.prod) exists in the project root and contains all necessary production environment variables.

---

## 📦 Step 2: Build the Production Bundle (.aab)
Google Play Store requires apps to be uploaded as an **Android App Bundle (.aab)** rather than an APK.

1. Open your terminal at the root of the project.
2. Run the Metro bundler or close any running Metro instances to avoid caching conflicts:
   ```bash
   npm start -- --reset-cache
   ```
3. In a new terminal tab/window at the root directory, run the bundle command:
   ```bash
   npm run android:prod-bundle
   ```
   *This command runs `cd android && cross-env ENVFILE=.env.prod ./gradlew bundleProdRelease` under the hood.*

4. **Verify the Build**:
   Once the build completes successfully, you will find the signed Android App Bundle (`.aab`) at:
   `android/app/build/outputs/bundle/prodRelease/app-prod-release.aab`

---

## 🧪 Step 3: Local APK Generation (Optional)
If you want to generate a standard APK to test the production build on a real device before uploading:

1. Run the assembly command:
   ```bash
   npm run android:prod-release
   ```
   *This runs `cd android && cross-env ENVFILE=.env.prod ./gradlew assembleProdRelease` under the hood.*
2. **Locate the APK**:
   `android/app/build/outputs/apk/prod/release/app-prod-release.apk`

---

## 🚀 Step 4: Play Store Upload & Release

1. **Log in to Play Console**:
   - Go to [Google Play Console](https://play.google.com/console).
   - Select your app: **Dealzhub**.

2. **Increment Build/Version (if uploading a new update)**:
   - If this is an update, ensure you increase the `versionCode` and `versionName` under `prod` in [android/app/build.gradle](file:///c:/DealzHub/Dealzhub-mobile-app/android/app/build.gradle) before building.

3. **Create a Release**:
   - In the left menu, select **Production** (or **Testing** > **Closed testing** / **Internal testing** if you want to test first).
   - Click **Create new release** in the top right.

4. **Upload the Bundle**:
   - Drag and drop the `.aab` file from `android/app/build/outputs/bundle/prodRelease/app-prod-release.aab` into the upload box.
   - Wait for Google to process the bundle and list the API level, target SDK, and architectures.

5. **Provide Release Notes**:
   - Add release notes describing changes (e.g. `Initial release of Dealzhub mobile app`).

6. **Save & Review Release**:
   - Click **Save as draft**, then click **Review release**.
   - Review any warnings (such as missing advertising ID declarations, which must be completed in the App Content section).
   - Click **Start rollout to Production** (or rollout to your testing track).
