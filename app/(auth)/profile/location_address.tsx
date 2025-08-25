import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Left from '../../../assets/images/left-side.svg';
import Location from '../../../assets/images/location-address.svg';
import Trash from '../../../assets/images/pencil-logout.svg'; // krijo një ikonë për delete

const LocationAddress = () => {
  const [sameAddress, setSameAddress] = useState(false);
  const [adding, setAdding] = useState(false); // true when showing form
  const [locations, setLocations] = useState<any[]>([]); // array of saved locations

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

  // Show add form
  const handleAdd = () => {
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
    setLocations([newLocation]); // Only one location for now
    setAdding(false);
    // Optionally reset form fields here
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.iconContainer}>
          <Left fill={'#EB2328'} width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}>Adresa e transportit</Text>
        </View>
      </View>

      {/* If there is a location, always show part 3 */}
      {locations.length > 0 && !adding && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{locations[0].tAddress}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash width={16} height={16} fill={'#EB2328'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Ndrysho</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.addressColumn}>
              <Text style={styles.sectionTitle}>Adresa e Transportit</Text>
              <Text>{locations[0].tName}</Text>
              <Text>{locations[0].tPhone}</Text>
              <Text>{locations[0].tCity}</Text>
              <Text>{locations[0].tAddress}</Text>
            </View>
            <View style={styles.addressColumn}>
              <Text style={styles.sectionTitle}>Adresa e Faturimit</Text>
              <Text>{locations[0].bName}</Text>
              <Text>{locations[0].bPhone}</Text>
              <Text>{locations[0].bCity}</Text>
              {locations[0].bPostal ? <Text>{locations[0].bPostal}</Text> : null}
              <Text>{locations[0].bAddress}</Text>
            </View>
          </View>
        </View>
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
            style={styles.input}
            placeholder="Emri dhe Mbiemri"
            value={tName}
            onChangeText={setTName}
          />
          <TextInput
            style={styles.input}
            placeholder="Numri i telefonit"
            value={tPhone}
            onChangeText={setTPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Qyteti"
            value={tCity}
            onChangeText={setTCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Adresa"
            value={tAddress}
            onChangeText={setTAddress}
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
                style={styles.input}
                placeholder="Emri dhe Mbiemri"
                value={bName}
                onChangeText={setBName}
              />
              <TextInput
                style={styles.input}
                placeholder="Numri i telefonit"
                value={bPhone}
                onChangeText={setBPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Qyteti"
                value={bCity}
                onChangeText={setBCity}
              />
              <TextInput
                style={styles.input}
                placeholder="Kodi postar"
                value={bPostal}
                onChangeText={setBPostal}
              />
              <TextInput
                style={styles.input}
                placeholder="Adresa"
                value={bAddress}
                onChangeText={setBAddress}
              />
            </>
          )}
          <TouchableOpacity style={styles.addButton} onPress={handleSave}>
            <Text style={styles.addButtonText}>Ruaj</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    marginVertical: 30,
  },
  locationIcon: {
    marginBottom: 20,
  },
  noAddressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EB2328',
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#EB2328',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  /** Part 2 **/
  formContainer: {
    borderWidth: 1,
    borderColor: '#EB2328',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
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
    backgroundColor: '#FFEAEA',
    padding: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#EB2328',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
    marginBottom: 6,
  },
});

export default LocationAddress;
