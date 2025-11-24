import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Momento {
  id: string;
  foto: string;
  data: string;
  hora?: string;
  latitude: number;
  longitude: number;
}

export default function HomePage() {
  const [foto, setFoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  const tirarFoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFoto(uri);
      setSaving(true);

      const loc = await Location.getCurrentPositionAsync({});
      const novoMomento: Momento = {
        id: Date.now().toString(),
        foto: uri,
        data: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      try {
        // salva localmente
        const dados = await AsyncStorage.getItem('momentos');
        const lista: Momento[] = dados ? JSON.parse(dados) : [];
        lista.push(novoMomento);
        await AsyncStorage.setItem('momentos', JSON.stringify(lista));

        Alert.alert('Sucesso', '📸 Momento salvo localmente!');
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível salvar o momento localmente.');
      } finally {
        setSaving(false);
      }
    }
  };

  const logout = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>⇽</Text>
        </TouchableOpacity>

        {/* Emoji acima do título */}
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.title}>PhotoMoments</Text>

        {/* Botão tirar foto */}
        <TouchableOpacity style={styles.button} onPress={tirarFoto} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Tirar Foto 📷</Text>}
        </TouchableOpacity>

        {/* Botão ver momentos */}
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push('/Moments/page')}>
          <Text style={styles.buttonText}>Ver Momentos</Text>
        </TouchableOpacity>

        {foto && <Image source={{ uri: foto }} style={styles.image} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0f1e' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emoji: { fontSize: 60, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 32, color: '#38BDF8', fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  button: {
    backgroundColor: '#38BDF8',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonSecondary: {
    backgroundColor: '#64748b',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ff4d6d',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  logoutText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  buttonText: { fontWeight: 'bold', fontSize: 16, color: '#fff' },
  image: { width: '90%', height: 300, marginTop: 25, borderRadius: 20 },
});
