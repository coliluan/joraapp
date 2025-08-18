import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Button,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Payment = () => {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const handlePaymentSubmit = () => {
    // Show popup
    setModalVisible(true);

    // Animate from small (0) to big (1)
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    console.log(`Selected Payment Method: ${selectedPayment}`);
  };

  const closeModal = () => {
    // Animate back to small
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => setModalVisible(false));
  };

  const PaymentOption = ({ label, value }) => (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => setSelectedPayment(value)}
    >
      <View style={styles.radioCircle}>
        {selectedPayment === value && <View style={styles.selectedRb} />}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Page</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Emri" />
        <TextInput style={styles.input} placeholder="Mbiemri" />
        <TextInput style={styles.input} placeholder="Email" />
        <TextInput style={styles.input} placeholder="Adresa" />
        <TextInput style={styles.input} placeholder="Nr. Telefonit" />
        <TextInput style={styles.input} placeholder="Qyteti" />

        <Text style={[styles.title, { marginTop: 20 }]}>Menyra e Pageses</Text>

        <PaymentOption label="Cash" value="cash" />
        <PaymentOption label="With Card" value="card" />
        <PaymentOption label="With POS" value="pos" />

        <Button title="Submit Payment" onPress={handlePaymentSubmit} />
      </View>

      {/* Modal Popup */}
      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalBackground}>
          <Animated.View
            style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.popupText}>Order Submitted!</Text>
            <Button
              title="Close"
              onPress={() => {
                closeModal();
                router.push('../(tabs)/home'); 
              }}
            />

          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2e86de',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e86de',
  },
  radioText: {
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: 250,
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 10,
  },
  popupText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Payment;