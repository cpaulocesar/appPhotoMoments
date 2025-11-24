import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Moments() {
  const [momentos, setMomentos] = useState<any[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const router = useRouter();

  const carregarMomentos = async () => {
    const dados = await AsyncStorage.getItem('momentos');
    const lista = dados ? JSON.parse(dados) : [];
    setMomentos(lista);
  };

  const apagarMomento = async (index: number) => {
    Alert.alert(
      'Apagar momento?',
      'Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            const novosMomentos = [...momentos];
            novosMomentos.splice(index, 1);
            setMomentos(novosMomentos);
            await AsyncStorage.setItem('momentos', JSON.stringify(novosMomentos));
          },
        },
      ]
    );
  };

  // Função auxiliar: converte dd/mm/yyyy para ISO yyyy-mm-dd
  const convertToISO = (data: string) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  // Editar Data
  const editarData = (index: number) => {
    setCurrentIndex(index);
    const dataISO = momentos[index].dataISO || convertToISO(momentos[index].data);
    const [ano, mes, dia] = dataISO.split('-');
    setSelectedDate(new Date(Number(ano), Number(mes) - 1, Number(dia)));
    setShowDateModal(true);
  };

  const salvarData = async () => {
    if (currentIndex !== null) {
      const novosMomentos = [...momentos];
      const d = selectedDate;

      const dia = d.getDate().toString().padStart(2, '0');
      const mes = (d.getMonth() + 1).toString().padStart(2, '0');
      const ano = d.getFullYear();

      // Salva ISO internamente
      novosMomentos[currentIndex].dataISO = `${ano}-${mes}-${dia}`;

      // Mantém o formato amigável para exibição (dd/mm/yyyy HH:MM)
      const originalTime = new Date(novosMomentos[currentIndex].dataISO + 'T00:00');
      if (novosMomentos[currentIndex].hora) {
        const [hora, min] = novosMomentos[currentIndex].hora.split(':');
        originalTime.setHours(Number(hora), Number(min));
      }
      const horas = originalTime.getHours().toString().padStart(2, '0');
      const minutos = originalTime.getMinutes().toString().padStart(2, '0');

      novosMomentos[currentIndex].data = `${dia}/${mes}/${ano} ${horas}:${minutos}`;
      setMomentos(novosMomentos);
      await AsyncStorage.setItem('momentos', JSON.stringify(novosMomentos));
      setShowDateModal(false);
    }
  };

  // Editar Hora
  const editarHora = (index: number) => {
    setCurrentIndex(index);
    const [dia, mes, ano] = (momentos[index].dataISO || convertToISO(momentos[index].data)).split('-');
    const hora = momentos[index].hora ? Number(momentos[index].hora.split(':')[0]) : 0;
    const min = momentos[index].hora ? Number(momentos[index].hora.split(':')[1]) : 0;
    setSelectedTime(new Date(Number(ano), Number(mes) - 1, Number(dia), hora, min));
    setShowTimeModal(true);
  };

  const salvarHora = async () => {
    if (currentIndex !== null) {
      const novosMomentos = [...momentos];
      const h = selectedTime.getHours().toString().padStart(2, '0');
      const m = selectedTime.getMinutes().toString().padStart(2, '0');

      novosMomentos[currentIndex].hora = `${h}:${m}`;

      // Atualiza data exibida com hora
      const dataISO = novosMomentos[currentIndex].dataISO;
      const [ano, mes, dia] = dataISO.split('-');
      novosMomentos[currentIndex].data = `${dia}/${mes}/${ano} ${h}:${m}`;

      setMomentos(novosMomentos);
      await AsyncStorage.setItem('momentos', JSON.stringify(novosMomentos));
      setShowTimeModal(false);
    }
  };

  // Editar Localização
  const editarLocalizacao = (index: number) => {
    setCurrentIndex(index);
    setLatitude(momentos[index].latitude.toString());
    setLongitude(momentos[index].longitude.toString());
    setShowLocationModal(true);
  };

  const salvarLocalizacao = async () => {
    if (currentIndex !== null) {
      const novosMomentos = [...momentos];
      novosMomentos[currentIndex].latitude = parseFloat(latitude);
      novosMomentos[currentIndex].longitude = parseFloat(longitude);
      setMomentos(novosMomentos);
      await AsyncStorage.setItem('momentos', JSON.stringify(novosMomentos));
      setShowLocationModal(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarMomentos();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seus Momentos 🧡</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {momentos.length === 0 ? (
        <Text style={styles.empty}>Nenhum momento salvo 📭</Text>
      ) : (
        <FlatList
          data={momentos}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.foto }} style={styles.image} />
              <View style={styles.infoOverlay}>
                <Text style={styles.cardDate}>📅 {item.data}</Text>
                <Text style={styles.cardLocation}>📍 Lat: {item.latitude}</Text>
                <Text style={styles.cardLocation}>📍 Long: {item.longitude}</Text>
              </View>

              <View style={styles.editRow}>
                <TouchableOpacity style={styles.smallButton} onPress={() => editarData(index)}>
                  <Text style={styles.editText}>Editar Data</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButton} onPress={() => editarHora(index)}>
                  <Text style={styles.editText}>Editar Hora</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButton} onPress={() => editarLocalizacao(index)}>
                  <Text style={styles.editText}>Editar Localização</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.deleteButton} onPress={() => apagarMomento(index)}>
                <Text style={styles.deleteText}>🗑 Apagar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal Data */}
      <Modal visible={showDateModal} transparent animationType="fade" onRequestClose={() => setShowDateModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Data</Text>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => date && setSelectedDate(date)}
              style={{ width: '100%' }}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.saveButtonSmall} onPress={salvarData}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButtonSmall} onPress={() => setShowDateModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Hora */}
      <Modal visible={showTimeModal} transparent animationType="fade" onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Hora</Text>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={(_, time) => time && setSelectedTime(time)}
              style={{ width: '100%' }}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.saveButtonSmall} onPress={salvarHora}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButtonSmall} onPress={() => setShowTimeModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Localização */}
      <Modal visible={showLocationModal} transparent animationType="fade" onRequestClose={() => setShowLocationModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Localização</Text>
            <TextInput style={styles.modalInput} placeholder="Latitude" placeholderTextColor="#ccc" keyboardType="numeric" value={latitude} onChangeText={setLatitude} />
            <TextInput style={styles.modalInput} placeholder="Longitude" placeholderTextColor="#ccc" keyboardType="numeric" value={longitude} onChangeText={setLongitude} />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.saveButtonSmall} onPress={salvarLocalizacao}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButtonSmall} onPress={() => setShowLocationModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0a0f1e', paddingTop: 80 },
  title: { fontSize: 32, textAlign: 'center', marginBottom: 20, color: '#38BDF8', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#ccc' },
  card: { marginBottom: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1e293b', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10, paddingBottom: 10 },
  image: { width: '100%', height: 250 },
  infoOverlay: { padding: 15, backgroundColor: 'rgba(0,0,0,0.5)' },
  cardDate: { color: '#38BDF8', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  cardLocation: { color: '#fff', fontSize: 14 },
  backButton: { marginBottom: 20, paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#38BDF8', borderRadius: 15, alignSelf: 'flex-start', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  backText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  editRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  smallButton: { backgroundColor: '#38BDF8', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, alignItems: 'center', marginHorizontal: 3 },
  editText: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  deleteButton: { backgroundColor: '#ff4d6d', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginTop: 10, marginHorizontal: 10 },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContainer: { width: '80%', backgroundColor: '#1e293b', borderRadius: 15, padding: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#38BDF8', marginBottom: 15, textAlign: 'center' },
  modalInput: { backgroundColor: '#0a0f1e', color: '#fff', padding: 10, borderRadius: 10, marginBottom: 10 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButtonSmall: { backgroundColor: '#38BDF8', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center' },
  cancelButtonSmall: { backgroundColor: '#64748b', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  cancelText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
