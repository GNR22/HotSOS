import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ContactManager({ userId }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const addContact = async () => {
    if (!name || !phone) return Alert.alert("Error", "Fill in both fields");

    const { error } = await supabase
      .from('trusted_contacts')
      .insert([{ user_id: userId, contact_name: name, contact_phone: phone }]);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Contact added!");
      setName('');
      setPhone('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Name (e.g. Mama)" 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
        placeholderTextColor="#999"
      />
      <TextInput 
        placeholder="Phone (e.g. 0912...)" 
        value={phone} 
        onChangeText={setPhone} 
        keyboardType="phone-pad"
        style={styles.input} 
        placeholderTextColor="#999"
      />
      <Button title="Save Contact" onPress={addContact} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    padding: 20, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginTop: 20 
  },
  input: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    marginBottom: 20, 
    padding: 10, 
    fontSize: 16,
    color: '#000'
  }
});