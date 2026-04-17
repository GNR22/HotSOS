import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  const theme = {
    background: isDarkMode ? "#121212" : "#f5f5f5",
    card: isDarkMode ? "#1C1C1E" : "#ffffff",
    text: isDarkMode ? "#FFFFFF" : "#333333",
    subtext: isDarkMode ? "#AEAEB2" : "#666666",
    headerBorder: isDarkMode ? "#2C2C2E" : "#dddddd",
  };

  const fetchAlerts = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("alerts-live-update")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          setAlerts((currentAlerts) => [payload.new, ...currentAlerts]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openInMaps = (lat, lon) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}`,
    });
    Linking.openURL(url);
  };

  const renderAlertItem = ({ item }) => {
    const dateObj = new Date(item.created_at);

    // --- Added Date Formatting ---
    const dateString = dateObj.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    const timeString = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.senderName, { color: theme.text }]}>
            {item.contact_name || "Emergency Signal"}
          </Text>
          <Text style={styles.timeText}>
            {dateString} • {timeString}
          </Text>
        </View>

        <Text style={[styles.locationText, { color: theme.subtext }]}>
          Coords: {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
        </Text>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => openInMaps(item.latitude, item.longitude)}
        >
          <Text style={styles.mapButtonText}>📍 View on Google Maps</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Streamlined Header - No Redundant Buttons */}
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Emergency Log
        </Text>

        {/* Balanced spacer for centering the title */}
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAlerts}
            tintColor="#FF453A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.subtext }]}>
              No recent emergency signals detected.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, // Ultra-thin line for a premium look
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800", // Extra bold for the dashboard feel
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.5,
  },
  backBtn: {
    width: 70,
    justifyContent: "center",
  },
  backBtnText: {
    color: "#0A84FF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16, // Smoother corners
    padding: 16,
    marginBottom: 16,
    // Shadow for Light Mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)", // Subtle border for dark mode depth
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  senderName: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    color: "#FF453A", // Bold emergency red
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  locationText: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", // Makes coordinates look technical
    opacity: 0.8,
  },
  mapButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.6,
  },
});
