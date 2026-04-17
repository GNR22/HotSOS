import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration, // 1. Import Vibration
  View,
} from "react-native";

export default function SOSButton({ onPanicStart }) {
  const [isPressing, setIsPressing] = useState(false);

  const handlePressIn = () => {
    setIsPressing(true);
    // 2. Start a pulsing vibration (pattern: 0ms delay, 100ms vibrate, 50ms pause)
    // The 'true' means it will repeat until we call cancel()
    Vibration.vibrate([0, 100, 50], true);
  };

  const handlePressOut = () => {
    setIsPressing(false);
    // 3. Stop vibrating if they let go
    Vibration.cancel();
  };

  const handleLongPress = () => {
    // 4. Stop the pulse and trigger the actual SOS logic
    Vibration.cancel();
    if (onPanicStart) onPanicStart();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={1000}
        style={[styles.button, isPressing && styles.buttonPressed]}
      >
        <Text style={styles.text}>SOS</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Long press for 1 or 3 second</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonPressed: {
    backgroundColor: "#C32F27",
    transform: [{ scale: 0.95 }],
  },
  text: {
    color: "white",
    fontSize: 48,
    fontWeight: "bold",
  },
  hint: {
    marginTop: 15,
    color: "#8E8E93",
    fontSize: 14,
  },
});
