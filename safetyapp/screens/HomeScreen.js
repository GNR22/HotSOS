import * as Location from "expo-location";
import { useContext, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SOSButton from "../components/SOSButton";
import { ThemeContext } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

export default function HomeScreen({ navigation, session }) {
  const [profile, setProfile] = useState(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const theme = {
    background: isDarkMode ? "#121212" : "#f5f5f5",
    text: isDarkMode ? "#ffffff" : "#333333",
    btn: isDarkMode ? "#333" : "#e0e0e0",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, nickname")
        .eq("id", session.user.id)
        .single();
      if (data) setProfile(data);
    };

    fetchProfile();
    Location.requestForegroundPermissionsAsync();
  }, [session?.user?.id]);

  const triggerSOS = async () => {
    try {
      // 1. Get High Accuracy Location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const senderName = profile?.nickname || profile?.full_name || "User";
      Vibration.vibrate(1000);

      // 2. Insert Alert into Supabase
      // This "broadcasts" the SOS to anyone subscribed to the table
      const { error } = await supabase.from("alerts").insert([
        {
          user_id: session.user.id,
          contact_name: senderName,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          status: "pending",
        },
      ]);

      if (error) throw error;

      Alert.alert(
        "SOS SENT",
        "Your emergency network has been alerted via Realtime.",
      );
    } catch (error) {
      console.error("SOS Error:", error.message);
      Alert.alert("Error", "Could not send SOS. Check GPS and Internet.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>HotSOS</Text>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.headerBtn, { backgroundColor: theme.btn }]}
        >
          <Text>{isDarkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.welcome, { color: theme.text }]}>
          Welcome, {profile?.nickname || "User"}
        </Text>

        <SOSButton onPanicStart={triggerSOS} />

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: "#007AFF", marginTop: 40 },
          ]}
          onPress={() => navigation.navigate("AddContacts")}
        >
          <Text style={styles.navText}>Manage Emergency Network</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: "#34C759", marginTop: 15 },
          ]}
          onPress={() => navigation.navigate("Alerts")}
        >
          <Text style={styles.navText}>View Alert History (Live)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  headerBtn: { padding: 10, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: "bold" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  welcome: { fontSize: 18, marginBottom: 20 },
  navButton: {
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  navText: { color: "#fff", fontWeight: "bold" },
});
