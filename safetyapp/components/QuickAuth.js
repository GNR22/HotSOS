import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function QuickAuth() {
  const handleAnonymousLogin = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      console.log("Logged in as:", data.user.id);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="QUICK START (TEST MODE)" onPress={handleAnonymousLogin} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20 }
});