import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Vibration } from "react-native";
import { ThemeContext } from "./context/ThemeContext";
import { supabase } from "./lib/supabase";

import AddContactsScreen from "./screens/AddContactsScreen";
import AlertsScreen from "./screens/AlertsScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RegisterScreen from "./screens/RegisterScreen";

// ❌ DELETED: Notifications.setNotificationHandler logic (not needed for Realtime alerts)

const Stack = createStackNavigator();

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function App() {
  const [session, setSession] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const openInMaps = (lat, lon) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}`,
    });
    Linking.openURL(url);
  };

  useEffect(() => {
    // Auth Session Management
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    // Global Realtime Alert Listener
    const channel = supabase
      .channel("global-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        async (payload) => {
          if (!session?.user) return;

          const victimId = payload.new.user_id;
          const myId = session.user.id;

          // Don't alert myself about my own SOS
          if (victimId === myId) return;

          // Check if the victim is one of MY trusted contacts (or if I am THEIR contact)
          const { data: isContact, error } = await supabase
            .from("emergency_contacts")
            .select("*")
            .eq("user_id", victimId)
            .eq("contact_user_id", myId)
            .single();

          if (error || !isContact) return;

          // Get my current location to calculate distance
          let myLocation = await Location.getLastKnownPositionAsync({});
          if (!myLocation) {
            myLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
          }

          if (myLocation) {
            const distance = calculateDistance(
              myLocation.coords.latitude,
              myLocation.coords.longitude,
              payload.new.latitude,
              payload.new.longitude,
            );

            // Trigger alert if within 10km
            if (distance <= 10) {
              const { contact_name, latitude, longitude } = payload.new;
              Vibration.vibrate([500, 1000, 500, 1000, 500]);

              Alert.alert(
                "🚨 INCOMING SOS 🚨",
                `${contact_name} triggered an emergency ${distance.toFixed(1)} km away!`,
                [
                  {
                    text: "Track on Map",
                    onPress: () => openInMaps(latitude, longitude),
                  },
                  { text: "Dismiss", style: "cancel" },
                ],
              );
            }
          }
        },
      )
      .subscribe();

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]); // Watch for session changes to ensure listener has correct user context

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session && session.user ? (
            <>
              <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="Profile">
                {(props) => <ProfileScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="Alerts">
                {(props) => <AlertsScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AddContacts">
                {(props) => <AddContactsScreen {...props} session={session} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
