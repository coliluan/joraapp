import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useCartStore } from '../store/cartStore';

const windowHeight = Dimensions.get('window').height;

const Store = () => {
  const { cart, addToCart } = useCartStore(state => state);
  const [products, setProducts] = useState<any[]>([]);

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
  }, []);

  const cartDetails = cart
    .filter(item => item.quantity > 0)
    .map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        ...item,
        title: product?.title || 'Produkt i panjohur',
        price: Number(product?.price) || 0,
        image: product?.image,
      };
    });

  const handleQuantityChange = (productId: string, type: 'increase' | 'decrease') => {
    const current = cart.find(item => item.productId === productId)?.quantity || 0;
    const newQuantity = type === 'increase' ? current + 1 : Math.max(0, current - 1);
    addToCart(productId, newQuantity);
  };

  const total = cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Produkte në Shportë:</Text>
        {cartDetails.length === 0 ? (
          <Text>Shporta është bosh.</Text>
        ) : (
          cartDetails.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: item.image ? getApiUrl(item.image) : 'https://example.com/default-image.png' }}
                style={styles.productImage}
              />

              <View style={styles.productInfo}>
                <View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.price}>{item.price.toFixed(2)}€</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleQuantityChange(item.productId, 'decrease')}
                    >
                      <Text style={styles.buttonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleQuantityChange(item.productId, 'increase')}
                    >
                      <Text style={styles.buttonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <TouchableOpacity style={styles.imageSection}>
                    <Image style={styles.image} source={require('../../assets/images/trash.png')} />
                  </TouchableOpacity>
                  <Text style={styles.totalPrice}>
                    Totali: {(item.price * item.quantity).toFixed(2)}€
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Fixed footer total */}
      <View style={styles.fixedTotalContainer}>
        <Text style={styles.totalText}>
          Totali Gjithsej: {total.toFixed(2)} €
        </Text>
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={styles.buttonContainertext}>Blej</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100, // Give space at bottom for fixed footer
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  price: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  rightSection: {
    justifyContent: 'space-between',
    height: 80,
    alignItems: 'flex-end',
  },
  imageSection: {
    marginTop: 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  image: {
    height: 25,
    width: 25,
  },
  totalPrice: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  fixedTotalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 10, // shadow on Android
    shadowColor: '#000', // shadow on iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  buttonContainer: {
    backgroundColor:'red',
    width: 90,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainertext: {
    color: 'white',
    fontSize: 18
  },
});

export default Store;
