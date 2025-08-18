import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Address {
  city: string;
  street: string;
  nr: string;
  phone: string;
}

interface OrderLocationModalProps {
  visible: boolean;
  onSave: (address: Address) => void;
  onCancel: () => void;
}

const OrderLocationModal: React.FC<OrderLocationModalProps> = ({ visible, onSave, onCancel }) => {
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [nr, setNr] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isExistingModalVisible, setIsExistingModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  useEffect(() => {
    setShowAddAddressModal(visible);
  }, [visible]);

  const handleSave = () => {
    const newAddress: Address = { city, street, nr, phone };
    onSave(newAddress);
    setAddresses([...addresses, newAddress]);

    // reset inputs
    setCity('');
    setStreet('');
    setNr('');
    setPhone('');

    setIsExistingModalVisible(true);
    setShowAddAddressModal(false);
  };

  const handleContinue = () => {
    if (!selectedAddress) return;
    onSave(selectedAddress);
    setIsExistingModalVisible(false);
  };

  const handleAddNewAddress = () => {
    setShowAddAddressModal(true);
    setIsExistingModalVisible(false);
  };

  return (
    <>
      {/* Modal for adding new address */}
      <Modal transparent visible={showAddAddressModal} animationType="fade" onRequestClose={onCancel}>
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
              <TouchableOpacity style={styles.backButton} onPress={onCancel}>
                <Text style={styles.backButtonTitle}>Kthehu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.continueButton} onPress={handleSave}>
                <Text style={styles.continueButtonTitle}>Vazhdo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for existing addresses */}
      <Modal transparent visible={isExistingModalVisible} animationType="fade" onRequestClose={() => setIsExistingModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Adresat ekzistuese</Text>
            <View style={styles.addressList}>
              {addresses.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.addressItem}
                  onPress={() => setSelectedAddress(address)}
                >
                  <View style={[styles.radioButton, selectedAddress === address && styles.selectedRadioButton]} />
                  <Text style={styles.addressText}>
                    {address.city}, {address.street}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.continueButtonAddress, !selectedAddress && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!selectedAddress}
            >
              <Text style={styles.continueButtonTitle}>Vazhdo blerjen</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAddNewAddress}>
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
