import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const cities = ['Prishtinë', 'Pejë', 'Gjakovë', 'Mitrovicë', 'Ferizaj', 'Gjilan'];

const CitiesScreen = () => {
  const router = useRouter();
  const { from } = useLocalSearchParams();

  const handleSelectCity = async (city: string) => {
    // Only set selectedCity in AsyncStorage for edit/register, not for auto-save
    await AsyncStorage.setItem('selectedCity', city);
    if (from === 'edit' || from === 'register') {
      router.back(); 
    }
  };
  
  return (
    <View style={styles.container}>
      {cities.map((city, index) => (
        <TouchableOpacity key={index} style={styles.city} onPress={() => handleSelectCity(city)}>
          <Text style={styles.text}>{city}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
  },
  city: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    height: 60,
    marginBottom: 10,
    backgroundColor: '#rgba(255, 255, 255, 1)',
    borderRadius: 5,
  },
  text: { fontSize: 16 },
});

export default CitiesScreen;
