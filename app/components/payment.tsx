import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Button,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/useUserStore';

const Payment = () => {

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [nr, setNr] = useState('');

  const { user } = useUserStore();
  const [selectedPayment, setSelectedPayment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Cart and products
  const { cart } = useCartStore(state => state);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products and autofill address fields from user address location
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getApiUrl(ENDPOINTS.PRODUCTS));
        const data = await response.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();

    // Autofill user info if available
    if (user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.email) setEmail(user.email);
    }

    // Fetch address location if user exists
    const fetchAddressLocation = async () => {
      if (user && user._id) {
        try {
          const res = await fetch(getApiUrl(ENDPOINTS.USER_ADDRESSLOCATION) + `?userId=${user._id}`);
          const data = await res.json();
          if (data.locations && Array.isArray(data.locations) && data.locations.length > 0) {
            // Use the last (most recent) address location
            const loc = data.locations[data.locations.length - 1];
            setAddress(loc.street || '');
            setCity(loc.city || '');
            setNr(loc.nr || '');
            setPhone(loc.phone || '');
          }
        } catch (err) {
          // ignore
        }
      }
    };
    fetchAddressLocation();
  }, [user]);

  const cartDetails = cart
    .filter(item => item.quantity > 0)
    .map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        ...item,
        title: product?.title || 'Produkt i panjohur',
        price: Number(product?.price) || 0,
      };
    });


  const handlePaymentSubmit = async () => {
    // Save order details to localStorage for admin dashboard
    const orderData = {
      firstName,
      lastName,
      email,
      address,
      nr,
      phone,
      city,
      selectedPayment,
      cart: cartDetails,
      createdAt: new Date().toISOString(),
      userId: user?._id || undefined,
    };
    try {
      // Save to backend
      await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
    } catch (err) {
      // ignore backend error for now
    }
    try {
      // Use window.localStorage if available (web), else fallback to globalThis (for React Native Web)
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('lastOrder', JSON.stringify(orderData));
      } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem('lastOrder', JSON.stringify(orderData));
      }
    } catch (e) {
      // Ignore storage errors
    }
    setModalVisible(true);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
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
      style={[styles.paymentCard, selectedPayment === value && styles.selectedCard]}
      onPress={() => setSelectedPayment(value)}
    >
      <View style={styles.radioContainer}>
        <View style={styles.radioCircle}>
          {selectedPayment === value && <View style={styles.selectedRb} />}
        </View>
        <Text style={[styles.cardText, selectedPayment === value && styles.selectedText]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Page</Text>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.card}>
          <TextInput style={styles.input} placeholder="Emri" placeholderTextColor="rgb(107, 114, 128);" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Mbiemri" placeholderTextColor="rgb(107, 114, 128);" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgb(107, 114, 128);" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Adresa" placeholderTextColor="rgb(107, 114, 128);" value={address} onChangeText={setAddress} />
          <TextInput style={styles.input} placeholder="Nr." placeholderTextColor="rgb(107, 114, 128);" value={nr} onChangeText={setNr} />
          <TextInput style={styles.input} placeholder="Nr. Telefonit" placeholderTextColor="rgb(107, 114, 128);" value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder="Qyteti" placeholderTextColor="rgb(107, 114, 128);" value={city} onChangeText={setCity} />

          <Text style={[styles.title, { marginTop: 20 }]}>Menyra e Pageses</Text>

          <View style={styles.paymentOptions}>
            <PaymentOption label="Cash" value="cash" />
            <PaymentOption label="With Card" value="card" />
            <PaymentOption label="With POS" value="pos" />
          </View>

          <Button title="Submit Payment" onPress={handlePaymentSubmit} />
        </View>
      </ScrollView>

      {/* Modal Popup */}
      <Modal transparent visible={modalVisible} animationType="none">
        <View style={styles.modalBackground}>
          <Animated.View
            style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}
          >
            <Text style={styles.popupText}>Order Submitted!</Text>
            {/* Card with all input values */}
            <View style={{width: '100%', marginBottom: 15}}>
              <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 8}}>Të dhënat e pagesës</Text>
              <View style={{backgroundColor: '#f3f4f6', borderRadius: 8, padding: 12, marginBottom: 10}}>
                <Text>Emri: {firstName}</Text>
                <Text>Mbiemri: {lastName}</Text>
                <Text>Email: {email}</Text>
                <Text>Adresa: {address}</Text>
                <Text>Nr. Telefonit: {phone}</Text>
                <Text>Qyteti: {city}</Text>
                <Text>Mënyra e pagesës: {selectedPayment}</Text>
              </View>
              <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 6}}>Produktet në porosi</Text>
              {cartDetails.length === 0 ? (
                <Text>Shporta është bosh.</Text>
              ) : (
                cartDetails.map((item, idx) => (
                  <View key={idx} style={{backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee'}}>
                    <Text style={{fontWeight: '600'}}>Titulli: {item.title}</Text>
                    <Text>Sasia: {item.quantity}</Text>
                    <Text>Çmimi: {item.price.toFixed(2)} €</Text>
                    <Text style={{fontWeight: 'bold'}}>Totali: {(item.price * item.quantity).toFixed(2)} €</Text>
                  </View>
                ))
              )}
            </View>
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
  scrollContainer: {
    width: '100%',
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
  paymentOptions: {
    marginTop: 20,
  },
  paymentCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#eb1c24', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eb1c24', 
  },
  cardText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  selectedText: {
    color: '#eb1c24',  
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
  selectedCard: {
    borderWidth: 2,
    color: 'black',
    shadowColor: '#eb1c24', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 6, 
  },
});

export default Payment;
