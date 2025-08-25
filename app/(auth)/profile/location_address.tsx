import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Left from '../../../assets/images/left-side.svg';
import Location from '../../../assets/images/location-address.svg';
import Plus from '../../../assets/images/plus.svg';
import Trash from '../../../assets/images/trash.svg';
const LocationAddress = () => {
  const [sameAddress, setSameAddress] = useState(false);
  const [adding, setAdding] = useState(false); // true when showing form
  const [locations, setLocations] = useState<any[]>([]); // array of saved locations
  const [editIndex, setEditIndex] = useState<number | null>(null); // null means add, number means edit

  // Transport address
  const [tName, setTName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tCity, setTCity] = useState('');
  const [tAddress, setTAddress] = useState('');

  // Billing address
  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bCity, setBCity] = useState('');
  const [bPostal, setBPostal] = useState('');
  const [bAddress, setBAddress] = useState('');

  // Refs for inputs
  const tNameRef = useRef<TextInput>(null);
  const tPhoneRef = useRef<TextInput>(null);
  const tCityRef = useRef<TextInput>(null);
  const tAddressRef = useRef<TextInput>(null);
  const bNameRef = useRef<TextInput>(null);
  const bPhoneRef = useRef<TextInput>(null);
  const bCityRef = useRef<TextInput>(null);
  const bPostalRef = useRef<TextInput>(null);
  const bAddressRef = useRef<TextInput>(null);
  // Show add form
  const handleAdd = () => {
    // Clear all fields for new address
    setTName('');
    setTPhone('');
    setTCity('');
    setTAddress('');
    setBName('');
    setBPhone('');
    setBCity('');
    setBPostal('');
    setBAddress('');
    setSameAddress(false);
    setEditIndex(null); // Not editing, adding new
    setAdding(true);
  };

  // Save location
  const handleSave = () => {
    const newLocation = {
      tName, tPhone, tCity, tAddress,
      bName: sameAddress ? tName : bName,
      bPhone: sameAddress ? tPhone : bPhone,
      bCity: sameAddress ? tCity : bCity,
      bPostal: sameAddress ? '' : bPostal,
      bAddress: sameAddress ? tAddress : bAddress,
      sameAddress
    };
    if (editIndex !== null) {
      // Update existing
      setLocations(prev => prev.map((loc, idx) => idx === editIndex ? newLocation : loc));
    } else {
      // Add new
      setLocations(prev => [...prev, newLocation]);
    }
    setAdding(false);
    setEditIndex(null);
  };

  // Delete location
  const handleDelete = () => {
    setLocations([]);
  };

  // Edit location (show form with current values)
  const handleEdit = () => {
    if (locations.length > 0) {
      const loc = locations[0];
      setTName(loc.tName);
      setTPhone(loc.tPhone);
      setTCity(loc.tCity);
      setTAddress(loc.tAddress);
      setBName(loc.bName);
      setBPhone(loc.bPhone);
      setBCity(loc.bCity);
      setBPostal(loc.bPostal);
      setBAddress(loc.bAddress);
      setSameAddress(loc.sameAddress);
      setAdding(true);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.iconContainer}>
          <Left fill={'#EB2328'} width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}>Adresa e transportit</Text>
        </View>
        {locations.length > 0 && !adding && (
          <TouchableOpacity onPress={handleAdd}>
            <Plus width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>

      {/* Show all saved locations dynamically */}
      {locations.length > 0 && !adding && (
        locations.map((loc, idx) => (
          <View style={styles.card} key={idx}>
            <Text style={styles.cardTitle}>{loc.tAddress}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.deleteButton} onPress={() => setLocations(locs => locs.filter((_, i) => i !== idx))}>
                <Trash width={15}  height={15}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton} onPress={() => {
                setTName(loc.tName);
                setTPhone(loc.tPhone);
                setTCity(loc.tCity);
                setTAddress(loc.tAddress);
                setBName(loc.bName);
                setBPhone(loc.bPhone);
                setBCity(loc.bCity);
                setBPostal(loc.bPostal);
                setBAddress(loc.bAddress);
                setSameAddress(loc.sameAddress);
                setEditIndex(idx);
                setAdding(true);
              }}>
                <Text style={styles.editButtonText}>Ndrysho</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.addressColumn}>
                <Text style={styles.sectionTitle}>Adresa e Transportit</Text>
                <Text style={styles.text}>{loc.tName}</Text>
                <Text style={styles.text}>{loc.tPhone}</Text>
                <Text style={styles.text}>{loc.tCity}</Text>
                <Text style={styles.text}>{loc.tAddress}</Text>
              </View>
              <View style={styles.addressColumn}>
                <Text style={styles.sectionTitle}>Adresa e Faturimit</Text>
                <Text style={styles.text}>{loc.bName}</Text>
                <Text style={styles.text}>{loc.bPhone}</Text>
                <Text style={styles.text}>{loc.bCity}</Text>
                {loc.bPostal ? <Text style={styles.text}>{loc.bPostal}</Text> : null}
                <Text style={styles.text}>{loc.bAddress}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      {/* If no location and not adding, show part 1 */}
      {locations.length === 0 && !adding && (
        <View style={styles.partOne}>
          <Location width={50} height={50} style={styles.locationIcon} />
          <Text style={styles.noAddressText}>
            Ju nuk keni asnje adrese të regjistruar
          </Text>
          <Text style={styles.subText}>Shtoni një adresë transporti</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Shto</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* If adding, show part 2 */}
      {adding && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Plotësoni adresën e transportit</Text>
          {/* Transport Address */}
          <TextInput
            ref={tNameRef}
            style={styles.input}
            placeholder="Emri dhe Mbiemri"
            placeholderTextColor="#1F1F1F"
            value={tName}
            onChangeText={setTName}
            returnKeyType="next"
            onSubmitEditing={() => tPhoneRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref={tPhoneRef}
            style={styles.input}
            placeholder="Numri i telefonit"
            placeholderTextColor="#1F1F1F"
            value={tPhone}
            onChangeText={setTPhone}
            returnKeyType="next"
            onSubmitEditing={() => tCityRef.current?.focus()}
            blurOnSubmit={false}
            keyboardType="phone-pad"
          />
          <TextInput
            ref={tCityRef}
            style={styles.input}
            placeholder="Qyteti"
            placeholderTextColor="#1F1F1F"
            value={tCity}
            onChangeText={setTCity}
            returnKeyType="next"
            onSubmitEditing={() => tAddressRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref={tAddressRef}
            style={styles.input}
            placeholder="Adresa"
            placeholderTextColor="#1F1F1F"
            value={tAddress}
            onChangeText={setTAddress}
            returnKeyType={sameAddress ? "done" : "next"}
            onSubmitEditing={() => {
              if (!sameAddress) bNameRef.current?.focus();
            }}
            blurOnSubmit={sameAddress}
          />
          {/* Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={() => setSameAddress(!sameAddress)}>
              <View style={[styles.fakeCheckbox, sameAddress && styles.checked]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Faturo në të njëjtën adresë</Text>
          </View>
          {/* Billing Address */}
          {!sameAddress && (
            <>
              <TextInput
                ref={bNameRef}
                style={styles.input}
                placeholder="Emri dhe Mbiemri"
                placeholderTextColor="#1F1F1F"
                value={bName}
                onChangeText={setBName}
                returnKeyType="next"
                onSubmitEditing={() => bPhoneRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TextInput
                ref={bPhoneRef}
                style={styles.input}
                placeholder="Numri i telefonit"
                placeholderTextColor="#1F1F1F"
                value={bPhone}
                onChangeText={setBPhone}
                returnKeyType="next"
                onSubmitEditing={() => bCityRef.current?.focus()}
                blurOnSubmit={false}
                keyboardType="phone-pad"
              />
              <TextInput
                ref={bCityRef}
                style={styles.input}
                placeholder="Qyteti"
                placeholderTextColor="#1F1F1F"
                value={bCity}
                onChangeText={setBCity}
                returnKeyType="next"
                onSubmitEditing={() => bPostalRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TextInput
                ref={bPostalRef}
                style={styles.input}
                placeholder="Kodi postar"
                placeholderTextColor="#1F1F1F"
                value={bPostal}
                onChangeText={setBPostal}
                returnKeyType="next"
                onSubmitEditing={() => bAddressRef.current?.focus()}
                blurOnSubmit={false}
                keyboardType="number-pad"
              />
              <TextInput
                ref={bAddressRef}
                style={styles.input}
                placeholder="Adresa"
                placeholderTextColor="#1F1F1F"
                value={bAddress}
                onChangeText={setBAddress}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </>
          )}
          <TouchableOpacity style={styles.addButton} onPress={handleSave}>
            <Text style={styles.addButtonText}>Ruaj</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 15,
    backgroundColor: '#FAFAFA',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 20,
  },
  titleContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
    marginRight: 30,
  },

  /** Part 1 **/
  partOne: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 140,
  },
  locationIcon: {
    marginBottom: 20,
  },
  noAddressText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#EB2328',
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    fontSize: 13,
    color: '#828282',
    textAlign: 'center',
    marginBottom: 27,
  },
  addButton: {
    backgroundColor: '#EB2328',
    width: 183,
    height: 48,
   justifyContent: 'center',
   alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },

  /** Part 2 **/
  formContainer: {
    borderWidth: 0.5,
    borderColor: '#EB2328',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F1F1F',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    height:40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    color: '#1F1F1F',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  fakeCheckbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#EB2328',
    borderRadius: 4,
  },
  checked: {
    backgroundColor: '#EB2328',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F1F1F',
  },

  /** Part 3 **/
  card: {
    borderWidth: 1,
    borderColor: '#EB2328',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 10,
    backgroundColor: '#FFF1F2',
    padding: 6,
    borderRadius: 6,
  },
  trash: {
    width: 16,
    height: 16,
  },
  editButton: {
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 30,
  },
  editButtonText: {
    color: '#EB2328',
    fontSize: 13,
    fontWeight: '500',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addressColumn: {
    flex: 1,
  },
  sectionTitle: {
    color: '#EB2328',
    fontWeight: '400',
    marginBottom: 5,
    fontSize: 13,
  },
  text:{
    color:"#828282",
    fontSize: 13,
    fontWeight: '400',
  },
});

export default LocationAddress;
