import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { supabase } from "../lib/supabase"; // KEEP ONLY THIS ONE

export default function ProfileScreen({ session }) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const { isDarkMode } = useContext(ThemeContext);

  const theme = {
    background: isDarkMode ? "#121212" : "#F5F5F5",
    text: isDarkMode ? "#FFFFFF" : "#333333",
    inputBorder: isDarkMode ? "#3A3A3C" : "#CCCCCC",
    avatarBg: isDarkMode ? "#2C2C2E" : "#E0E0E0",
    placeholderText: isDarkMode ? "#8E8E93" : "#999999",
  };

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(`full_name, nickname, avatar_url`)
        .eq("id", session.user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setNickname(data.nickname || "");
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
    } finally {
      setLoading(false);
    }
  }

  // UPDATED PICK IMAGE FUNCTION
  async function pickImage() {
    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled) return;

      const base64 = result.assets[0].base64;
      // Use timestamp to ensure a fresh URL so the image updates instantly
      const filePath = `${session.user.id}/avatar-${Date.now()}.png`;

      // 1. Upload to Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(base64), {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Update Profile Table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.log("Upload Error:", error.message);
      Alert.alert("Error", "Could not upload image: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error signing out", error.message);
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: fullName,
        nickname: nickname,
        updated_at: new Date(),
      });

      if (error) throw error;
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* 1. Place the Back Button right at the top of the SafeAreaView */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={[styles.backButtonText, { color: theme.text }]}>
          ← Back
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerDisplay}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={[styles.avatar, { backgroundColor: theme.avatarBg }]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.placeholder,
                  { backgroundColor: theme.avatarBg },
                ]}
              >
                <Text style={{ color: theme.text, fontWeight: "600" }}>
                  Add Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.displayName, { color: theme.text }]}>
            {fullName || "Your Name"}
          </Text>
          <Text
            style={[styles.displayNickname, { color: theme.placeholderText }]}
          >
            @{nickname || "nickname"}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.placeholderText }]}>
            EDIT DETAILS
          </Text>

          <Text style={[styles.label, { color: theme.placeholderText }]}>
            Full Name
          </Text>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor={theme.placeholderText}
            value={fullName}
            onChangeText={setFullName}
            style={[
              styles.input,
              { color: theme.text, borderBottomColor: theme.inputBorder },
            ]}
          />

          <Text style={[styles.label, { color: theme.placeholderText }]}>
            Nickname
          </Text>
          <TextInput
            placeholder="Nickname"
            placeholderTextColor={theme.placeholderText}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            style={[
              styles.input,
              { color: theme.text, borderBottomColor: theme.inputBorder },
            ]}
          />

          <TouchableOpacity
            onPress={updateProfile}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  headerDisplay: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
  },
  displayNickname: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 5,
  },
  imageContainer: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#0A84FF",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    padding: 10,
    marginBottom: 25,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0A84FF",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF453A",
    borderRadius: 12,
  },
  logoutText: {
    color: "#FF453A",
    fontWeight: "600",
  },
});
