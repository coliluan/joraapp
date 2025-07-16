import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Përdorues aktivë</Text>
        <Text style={styles.cardValue}>123</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Porosi totale</Text>
        <Text style={styles.cardValue}>58</Text>
      </View>
      {/* Shto më shumë elemente sipas nevojës */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default DashboardScreen;
