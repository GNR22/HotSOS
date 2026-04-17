import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

export default function AddContactsScreen({ navigation, session }) {
  const [nickname, setNickname] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  const theme = {
    background: isDarkMode ? "#121212" : "#F5F5F5",
    card: isDarkMode ? "#1C1C1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    input: isDarkMode ? "#2C2C2E" : "#E8E8E8",
    secondaryText: isDarkMode ? "#8E8E93" : "#666666",
    headerBorder: isDarkMode ? "#2C2C2E" : "#DDDDDD",
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select(
          `
          id,
          contact_user_id,
          profiles:contact_user_id (full_name, nickname)
        `,
        )
        .eq("user_id", session.user.id);

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error.message);
    }
  }

  async function handleAddContact() {
    const cleanQuery = nickname.trim();
    if (!cleanQuery) {
      Alert.alert("Error", "Please enter a nickname");
      return;
    }

    setLoading(true);
    try {
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("id, nickname, full_name")
        .ilike("nickname", cleanQuery)
        .single();

      if (userError || !userProfile) throw new Error("User not found.");
      if (userProfile.id === session.user.id)
        throw new Error("You cannot add yourself.");

      const { error: linkError } = await supabase
        .from("emergency_contacts")
        .insert([
          {
            user_id: session.user.id,
            contact_user_id: userProfile.id,
          },
        ]);

      if (linkError) {
        if (linkError.code === "23505")
          throw new Error("This person is already in your network.");
        throw linkError;
      }

      Alert.alert("Success", `${userProfile.full_name} added to your network!`);
      setNickname("");
      fetchContacts();
    } catch (error) {
      Alert.alert("Search Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeContact(id) {
    const { error } = await supabase
      .from("emergency_contacts")
      .delete()
      .eq("id", id);
    if (!error) {
      fetchContacts();
    } else {
      Alert.alert("Error", "Could not remove contact");
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Centered Header */}
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Emergency Network
        </Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View
              style={[styles.searchSection, { backgroundColor: theme.card }]}
            >
              <TextInput
                placeholder="Enter Friend's Nickname"
                placeholderTextColor="#888"
                value={nickname}
                onChangeText={setNickname}
                style={[
                  styles.input,
                  { backgroundColor: theme.input, color: theme.text },
                ]}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddContact}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="person-add" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.subHeader, { color: theme.secondaryText }]}>
              Your Trusted Responders
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.contactCard, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.contactName, { color: theme.text }]}>
                {item.profiles?.full_name || "Unknown User"}
              </Text>
              <Text style={{ color: theme.secondaryText }}>
                @{item.profiles?.nickname || "no-nickname"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeContact(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={22} color="#FF453A" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.secondaryText }]}>
            No contacts added yet. Search a nickname above to start your
            network.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  backBtn: { width: 70 },
  backBtnText: { color: "#0A84FF", fontSize: 16, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  searchSection: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 25,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#0A84FF",
    height: 45,
    width: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  subHeader: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  contactCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  contactName: { fontSize: 16, fontWeight: "700" },
  deleteBtn: { padding: 4 },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 30,
  },
});
