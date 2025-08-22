import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import CmimiIcon from '../../assets/images/cmimi.svg';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import LoginModal from '../components/loginModal';
import OrderLocationModal from '../components/OrderLocationModal';
import ProductModal from '../components/productModal';
import { useCartStore } from '../store/cartStore';
import { useFavoriteStore } from '../store/favoritesStore';
import { useUserStore } from '../store/useUserStore';

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [orderLocationVisible, setOrderLocationVisible] = useState(true);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { user, isLoggedIn, loadUserFromStorage } = useUserStore();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const { cart, addToCart } = useCartStore(state => state);
  const loadFavorites = useFavoriteStore(state => state.loadFavorites);
  const [city, setCity] = useState('');

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getApiUrl(ENDPOINTS.PRODUCTS));
        const data = await response.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const initialQuantities: { [productId: string]: number } = {};
    cart.forEach(item => {
      initialQuantities[item.productId] = item.quantity;
    });
    setQuantities(initialQuantities);
  }, [cart]);

  const handleSave = (location: { city: string }) => {
    setCity(location.city);
    setOrderLocationVisible(false);
  };

  const handleCancel = () => {
    setOrderLocationVisible(false);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };
  const closeProductModal = () => {
    setSelectedProduct(null);
    setProductModalVisible(false);
  };


  if (user?.isGuest || !isLoggedIn) {
    return <LoginModal />;
  }

  return (
    <SafeAreaView>
      <OrderLocationModal
        visible={orderLocationVisible}
        onSave={handleSave}
        onCancel={handleCancel}
        userId={user?._id ?? ''}
      />

      <ScrollView style={styles.container}>
        <View><Text style={styles.header}>Shop at Jora Center</Text></View>
          
        {/* Product cards */}
        <View style={styles.cardContainer}>
           {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <TouchableOpacity
                key={product._id}
                style={styles.card}
                onPress={() => handleProductClick(product)} 
              >
                <Card>
                  <Card.Cover
                    style={styles.productImage}
                    source={{ uri: getApiUrl(product.image) }}
                  />
                  <Card.Content style={styles.cardContent}>
                    <View>
                      <Text style={styles.title}>{product.title}</Text>
                      <Text style={styles.subtitle}>Përshkrimi</Text>
                    </View>
                    <View style={styles.priceBadgeContainerAbsolute}>
                      <CmimiIcon width={80} height={49} />
                      <Text style={styles.priceBadgeLabel}>vetëm</Text>
                      <Text style={styles.priceBadgeValue}>{product.price}€</Text>
                    </View>
                  </Card.Content>
                </Card>
               </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Nuk ka produkte.</Text>
          )}
        </View>        
      </ScrollView>
      

      {selectedProduct && (
        <ProductModal 
          visible={productModalVisible} 
          packageId={selectedProduct._id}  
          onClose={closeProductModal} 
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    position: 'relative',
    zIndex: 2,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 90,
    
  },
  card: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  productImage: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    resizeMode: 'cover',
    zIndex: 1,
    paddingHorizontal: 10,
  },
  cardContent: {
    position: 'relative',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 0,
  },
  
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#171717',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#6B7280',
  },
  priceBadgeContainer: {
    position: 'relative',
    width: 77,
    height: 49,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  priceBadgeContainerAbsolute: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 77,
    height: 49,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  priceBadgeLabel: {
    position: 'absolute',
    top: 4,
    right: 10,
    color: '#000000',
    fontSize: 8,
    fontWeight: '400',
    textTransform: 'lowercase',
  },
  priceBadgeValue: {
    position: 'absolute',
    bottom: 9,
    right: 9,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  content:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    paddingHorizontal: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  quantityButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: '70%',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '30%',
    height: 40,
  },
  buttonFavorite: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    width: 35,
    borderWidth: 1,
    borderColor: 'red',
    height: 35,
    paddingTop: 6,
    paddingHorizontal: 11,
  },
  favorite: {
    width: 35,
    height: 35,
  },
  counter: {
    width: 40,
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  cartButton: {
    width: '100%',
    alignItems: 'center',
  },
  buttonCart: {
    backgroundColor: 'red',
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
  },
  sortFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
  },
  selectedCategory: {
    backgroundColor: 'red',
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: 'white',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  clearFiltersButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
   favoriteIcon:{
    width: 40,
    borderRadius: 100,
    height: 40,
    backgroundColor: 'red'
  },

  header: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 30,
    color: '#171717',
  },
});

export default Shop;