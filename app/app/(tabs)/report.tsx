import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { apiService } from "../../src/services/api";
import { LoadingOverlay } from "../../src/components";
import { colors, spacing, radius, shadows } from "../../src/theme";
import { fonts } from "../../src/theme/typography";

export default function ReportScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc);
      } catch {
        setLocationError("Failed to get location");
      }
    })();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Required", "Please describe what you observed.");
      return;
    }
    if (!location) {
      Alert.alert("Location required", "Unable to get your location. Please enable GPS.");
      return;
    }
    setSubmitting(true);
    try {
      await apiService.createReport({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        text: description.trim(),
        photoUri: photoUri || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      Alert.alert(
        "Report submitted",
        "Your sighting is now in the community feed and on the public map. Network observers and nearby users can see it and corroborate.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = description.trim() && location;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero} accessible={true} accessibilityLabel="Report fire or smoke">
          <View style={styles.heroIconWrap}>
            <Ionicons name="flame" size={28} color={colors.fire} />
          </View>
          <Text style={styles.heroTitle}>Report Fire or Smoke</Text>
          <Text style={styles.heroSubtitle}>
            What you see on the ground is the ground truth. Your report joins the
            community feed and the public map for others to corroborate.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR LOCATION</Text>
          {location ? (
            <View style={styles.locationRow} accessible={true} accessibilityRole="text">
              <View style={styles.locationDot} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationCoords} selectable>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationStatus} selectable>GPS active · accurate</Text>
              </View>
            </View>
          ) : locationError ? (
            <View style={styles.locationErrorBox}>
              <Text style={[styles.errorText]} selectable>{locationError}</Text>
            </View>
          ) : (
            <View style={styles.locationLoadingBox} accessible={true} accessibilityRole="text">
              <ActivityIndicator size="small" color={colors.fire} />
              <Text style={styles.locationLoadingText} selectable>Getting location...</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>WHAT DID YOU SEE?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the smoke, flames, or any other signs of fire..."
            placeholderTextColor={colors.inkMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessible={true}
            accessibilityLabel="Describe what you observed"
          />
            <Text style={styles.charCount} selectable>{description.length} characters</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PHOTO (OPTIONAL)</Text>
          {photoUri ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.photoImage} accessible={true} accessibilityLabel="Photo preview" />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setPhotoUri(null)} accessibilityRole="button" accessibilityLabel="Remove photo" disabled={submitting}>
                <Text style={styles.removeBtnText} selectable>Remove photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto} accessibilityRole="button" accessibilityLabel="Take photo" disabled={submitting}>
                <View style={styles.photoBtnIcon}>
                  <Ionicons name="camera" size={24} color={colors.fire} />
                </View>
                <Text style={styles.photoBtnText} selectable>
                  Camera
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={handlePickImage} accessibilityRole="button" accessibilityLabel="Choose from gallery" disabled={submitting}>
                <View style={styles.photoBtnIcon}>
                  <Ionicons name="images" size={24} color={colors.sky} />
                </View>
                <Text style={styles.photoBtnText} selectable>
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.submitFooter} pointerEvents={submitting ? 'none' : 'auto'}>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isValid ? "Submit report" : "Submit report requires location and description"}
          accessibilityHint={!isValid ? "Please include location and description to submit" : ""}
        >
          <Ionicons name="paper-plane" size={18} color="#fff" style={{ marginRight: spacing.sm }} />
          <Text style={styles.submitBtnText} selectable>
            {submitting ? "Submitting..." : "Submit report"}
          </Text>
        </TouchableOpacity>
      </View>
      <LoadingOverlay visible={submitting} message="Submitting report..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.fireGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderCurve: "continuous",
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.inkMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.forest,
    marginRight: spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationCoords: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  locationStatus: {
    fontSize: 11,
    color: colors.forest,
    fontWeight: "600",
    marginTop: 2,
  },
  locationErrorBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
  locationLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  locationLoadingText: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  textInput: {
    fontSize: 16,
    color: colors.ink,
    lineHeight: 24,
    minHeight: 120,
    padding: 0,
  },
  charCount: {
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: "right",
    marginTop: spacing.sm,
  },
  photoPreview: {
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.lg,
  },
  removeBtn: {
    marginTop: spacing.md,
    minHeight: 44,
    justifyContent: "center",
  },
  removeBtnText: {
    fontSize: 14,
    color: colors.fire,
    fontWeight: "600",
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.bgAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  photoBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  photoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkSoft,
  },
  submitFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.bgAlt,
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: colors.fire,
    borderRadius: radius.full,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  submitBtnDisabled: {
    backgroundColor: colors.inkMuted,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
});
