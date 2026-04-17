import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert(
        "Missing Info",
        "Please fill in your name, email, and password.",
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Security", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert("Error", authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        nickname: nickname,
      });

      if (profileError) console.error("Profile Error:", profileError.message);
      Alert.alert("Success!", "Account created! Redirecting to Home...");
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Join HotSOS</Text>
        <Text style={styles.subtitle}>Create an account to stay safe</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Juan Dela Cruz"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nickname (Optional)</Text>
          <TextInput
            placeholder="Juan"
            placeholderTextColor="#666"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="email@address.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize={"none"}
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize={"none"}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize={"none"}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF3B30",
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#AEAEB2",
    textAlign: "center",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  linkContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  linkText: {
    color: "#AEAEB2",
    textAlign: "center",
    fontSize: 14,
  },
  linkHighlight: {
    color: "#0A84FF",
    fontWeight: "bold",
  },
});
