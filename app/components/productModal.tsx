import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useCartStore } from '../store/cartStore';

type ProductModalProps = {
  visible: boolean;
  packageId: string;
  onClose: () => void;
};

const ProductModal = ({ visible, packageId, onClose }: ProductModalProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { addToCart } = useCartStore(state => state);

  useEffect(() => {
    console.log('Package ID in ProductModal:', packageId);

    const fetchProducts = async () => {
      if (!packageId) {
        console.error('Package ID is missing!');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl(ENDPOINTS.PACKAGE_PRODUCTS(packageId))}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        } else {
          console.error('Error fetching products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchProducts();
    } else {
      setProducts([]); // Clear products when modal is closed
    }
  }, [visible, packageId]);

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl && !imageUrl.startsWith('http')) {
      return `${getApiUrl('')}${imageUrl}`;
    }
    return imageUrl;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.trashImage}>
            <Image source={require('../../assets/images/remove.png')} style={styles.icon} />
          </TouchableOpacity>
          <ScrollView style={styles.productList}>
            {loading ? (
              <Text>Loading...</Text>
            ) : products.length === 0 ? (
              <Text>No products found</Text> 
            ) : (
              <View style={styles.row}>
                {products.map((product, index) => {
                  const imageUrl = getImageUrl(product.imageUrl);

                  return (
                    <View style={styles.productItem} key={index}>
                      {imageUrl && (
                        <Image
                          source={{
                            uri: imageUrl,
                          }}
                          style={styles.productImage}
                        />
                      )}
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <Text style={styles.productPrice}>Qmimi: {product.price}€</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
          
          {/* Buttons Section */}
          <View style={styles.buttonContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // add each product in the package with quantity 1 by default
                products.forEach((p) => addToCart(p._id, 1));
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Shto ne shporte</Text>
            </TouchableOpacity>
            
            {/* Continue Button */}
            <TouchableOpacity onPress={() => console.log('Continue pressed')} style={styles.continueButton}>
          <Text style={styles.buttonBottomText}>Blej menjehere</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '95%',
    height: '75%',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height:30,    
  },
  trashImage: {   
    width: '100%',
    display:'flex',
    justifyContent: 'flex-end',
    alignItems:'flex-end',
  },
  productList: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    shadowRadius: 2,
    elevation: 3,
    width: '48%',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#eb1c24', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
  },
  continueButton: {
    width: '47%',
    display:'flex',
    flexDirection: 'row',
    borderWidth:1,
    borderColor: '#eb1c24', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonBottomText: {
    color: '#eb1c24',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductModal;