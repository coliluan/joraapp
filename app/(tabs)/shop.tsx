import { globalStyles } from '@/assets/globalStyles';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import LoginModal from '../components/loginModal';
import ProductModal from '../components/productModal';
import { useUserStore } from '../store/useUserStore';

const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Te gjitha');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const { user, isLoggedIn, loadUserFromStorage } = useUserStore();

  useEffect(() => {
      loadUserFromStorage();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(getApiUrl(ENDPOINTS.PRODUCTS));
        const data = await response.json();
        const updatedProducts = data.products.map((product: any) => ({
          ...product,
          quantity: product.quantity || 1, // Ensure quantity is set (1 if undefined)
          category: product.category || 'Te gjitha', // Add a default category if missing
        }));
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true); // Show the modal with the selected product
  };

  const closeModal = () => {
    setModalVisible(false); // Close the modal
  };

  const handleQuantityChange = (productId: string, operation: 'increment' | 'decrement') => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => {
        if (product._id === productId) {
          let newQuantity = product.quantity;

          // Increment or decrement the quantity based on the operation
          if (operation === 'increment') {
            newQuantity = product.quantity + 1;
          } else if (operation === 'decrement') {
            newQuantity = Math.max(1, product.quantity - 1); // Prevent quantity from going below 1
          }

          return { ...product, quantity: newQuantity };
        }
        return product;
      });

      return updatedProducts;
    });
  };

  const handleAddToCart = (product: any) => {
    alert(`Added ${product.quantity} of ${product.title} to the cart.`);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterProducts(query, selectedCategory);
  };

  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    filterProducts(searchQuery, category);
  };

  // Filter products based on search query and category
  const filterProducts = (query: string, category: string) => {
    let filtered = products;

    if (query) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== 'Te gjitha') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  return (
    <SafeAreaView>
      {isLoggedIn ? (
        <ScrollView style={styles.container}>
          <View style={globalStyles.notification}>
            <TouchableOpacity
              onPress={() => {
                if (!user?.isGuest && user?.firstName) {
                  router.push('/components/notificationModal');
                }
              }}
              disabled={user?.isGuest || !user?.firstName}>
              <Image source={require('../../assets/images/notification.png')} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
          />

          {/* Sort and Filter Buttons */}
          <View style={styles.sortFilterContainer}>
            <TouchableOpacity style={styles.button}>
              <Text>Sort</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Category Buttons */}
          <View style={styles.categoryContainer}>
            {['Te gjitha', 'Ushqimore', 'Vendore', 'Higjenike'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory,
                ]}
                onPress={() => handleCategoryClick(category)}
              >
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Product Cards */}
          <View style={styles.cardContainer}>
            {filteredProducts.map((product) => (
              <TouchableOpacity style={styles.card} key={product._id} onPress={() => handleProductClick(product)}>
                <Card>
                  <Card.Cover style={styles.productImage} source={{ uri: getApiUrl(product.image) }} />
                  <Card.Content>
                    <Text style={styles.title} variant="titleLarge">{product.title}</Text>
                    <Text style={styles.price} variant="bodyMedium">{product.price}€</Text>
                  </Card.Content>
                  <Card.Actions style={styles.quantityContainer}>
                    <View style={styles.quantityButtons}>
                      <View style={styles.leftSection}>
                        <TouchableOpacity
                          style={styles.counter}
                          onPress={() => handleQuantityChange(product._id, 'decrement')}
                        >
                          <Text>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{product.quantity}</Text>
                        <TouchableOpacity
                          style={styles.counter}
                          onPress={() => handleQuantityChange(product._id, 'increment')}
                        >
                          <Text>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.rightSection}>
                        <TouchableOpacity style={styles.buttonFavorite}>
                          <Image style={styles.favorite} source={require('../../assets/images/favorite.png')} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.cartButton}>
                      <TouchableOpacity style={styles.buttonCart} onPress={() => handleAddToCart(product)}>
                        <Text>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Actions>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <LoginModal />
      )}

      {selectedProduct && (
        <ProductModal visible={modalVisible} product={selectedProduct} onClose={closeModal} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 170,
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',
    margin: 0,
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
});

export default Shop;
