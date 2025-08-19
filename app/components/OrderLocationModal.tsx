import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ENDPOINTS, getApiUrl } from '../../config/api';

interface Location {
  city: string;
  street: string;
  nr: string;
  phone: string;
}

interface OrderLocationModalProps {
  visible: boolean;
  userId: string; // Add userId prop to pass the userId dynamically
  onSave: (location: Location) => void;
  onCancel: () => void;
}

const OrderLocationModal: React.FC<OrderLocationModalProps> = ({ visible, userId, onSave, onCancel }) => {
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [nr, setNr] = useState('');
  const [phone, setPhone] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isExistingModalVisible, setIsExistingModalVisible] = useState(false);
  const [selectedAddressLocation, setSelectedAddressLocation] = useState<Location | null>(null);
  const [showAddAddressLocationModal, setShowAddAddressLocationModal] = useState(false);

  // Fetch locations from backend
  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl(ENDPOINTS.USER_ADDRESSLOCATION)}?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
        if (data.locations && data.locations.length > 0) {
          setIsExistingModalVisible(true);
          setShowAddAddressLocationModal(false);
          setSelectedAddressLocation(null); // force user to select
        } else {
          setIsExistingModalVisible(false);
          setShowAddAddressLocationModal(true);
        }
      }
    } catch {
      setLocations([]);
      setIsExistingModalVisible(false);
      setShowAddAddressLocationModal(true);
    }
  }, [userId]);

  // Fetch existing locations when the modal is opened
  useEffect(() => {
    if (visible && userId) {
      fetchLocations();
    }
  }, [visible, userId, fetchLocations]);

  // Always show existing address modal if there are locations
  useEffect(() => {
    if (locations.length > 0) {
      setIsExistingModalVisible(true);
      setShowAddAddressLocationModal(false);
    }
  }, [locations]);


  const handleSave = async () => {
    if (!city || !street || !nr || !phone) return;
    try {
      const res = await fetch(getApiUrl(ENDPOINTS.USER_ADDRESSLOCATION), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, city, street, nr, phone })
      });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
        setSelectedAddressLocation(data.locations[data.locations.length - 1]); // preselect new
        setCity(''); setStreet(''); setNr(''); setPhone('');
      }
    } catch {}
  };

  const handleContinue = () => {
    if (!selectedAddressLocation) return;
    setIsExistingModalVisible(false);
    onSave(selectedAddressLocation);
  };

  const newAddressLocation = () => {
    setShowAddAddressLocationModal(true);
    setIsExistingModalVisible(false);
  };

  return (
    <>
      <Modal
        transparent
        visible={showAddAddressLocationModal}
        animationType="fade"
        onRequestClose={() => {}} // block close
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Vendosni Adresën Tuaj</Text>
            <TextInput style={styles.input} placeholder="Qyteti" value={city} onChangeText={setCity} />
            <View style={styles.customInput}>
              <TextInput style={styles.addressInput} placeholder="Adresa" value={street} onChangeText={setStreet} />
              <TextInput style={styles.numberInput} placeholder="Nr." value={nr} onChangeText={setNr} />
            </View>
            <TextInput style={styles.input} placeholder="Nr. Telefonit" value={phone} onChangeText={setPhone} />
            <View style={styles.locationButton}>
              {/* Remove Kthehu button to prevent closing */}
              <TouchableOpacity style={styles.continueButton} onPress={handleSave}>
                <Text style={styles.continueButtonTitle}>Vazhdo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for existing addresses */}
      <Modal
        transparent
        visible={isExistingModalVisible}
        animationType="fade"
        onRequestClose={() => {}} // block close
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Adresat ekzistuese</Text>
            <View style={styles.addressList}>
              {locations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.addressItem}
                  onPress={() => setSelectedAddressLocation(location)}>
                  <View style={[styles.radioButton, selectedAddressLocation === location && styles.selectedRadioButton]} />
                  <Text style={styles.addressText}>
                    {location.city}, {location.street}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.continueButtonAddress, !selectedAddressLocation && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!selectedAddressLocation}>
              <Text style={styles.continueButtonTitle}>Vazhdo blerjen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={newAddressLocation}>
              <Text style={styles.addNewAddressText}>Shto adresë të re</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: 300, padding: 20, backgroundColor: '#FAFAFA', borderRadius: 10, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  customInput: { flexDirection: 'row', width: 240, gap: 10 },
  input: { backgroundColor: '#fff', width: 240, height: 50, borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 },
  addressInput: { backgroundColor: '#fff', width: 160, height: 50, borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 },
  numberInput: { backgroundColor: '#fff', width: 70, height: 50, borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 },
  locationButton: { flexDirection: 'row', gap: 20, marginTop: 10 },
  continueButton: { backgroundColor: '#D32F2F', width: 110, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  continueButtonTitle: { color: 'white', fontWeight: 'bold' },
  backButton: { borderRadius: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#D32F2F', width: 110, height: 50, justifyContent: 'center', alignItems: 'center' },
  backButtonTitle: { color: '#D32F2F' },
  continueButtonAddress: { backgroundColor: '#D32F2F', height: 50, width: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  disabledButton: { backgroundColor: '#B0B0B0' },
  addressList: { marginTop: 10, width: 240, maxHeight: 200 },
  addressItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  selectedRadioButton: { backgroundColor: '#D32F2F' },
  addressText: { fontSize: 14, color: '#1F1F1F' },
  addNewAddressText: { fontSize: 14, color: '#D32F2F', marginTop: 15, textDecorationLine: 'underline' },
});

export default OrderLocationModal;
