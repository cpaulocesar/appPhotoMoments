// Cadastro.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // caminho para seu firebaseConfig

export default function Cadastro() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!email.trim() || !senha.trim()) {
      alert('Preencha email e senha!');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert('Conta criada com sucesso!');
      router.push('/'); // volta para login após criar conta
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este email já está em uso.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Email inválido.');
      } else if (error.code === 'auth/weak-password') {
        alert('Senha fraca. Use ao menos 6 caracteres.');
      } else {
        alert('Erro ao criar conta: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.title}>Criar Conta</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleCadastro} disabled={loading}>
          <Text style={styles.registerText}>{loading ? 'Criando...' : 'Criar Conta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/')}>
          <Text style={styles.loginText}>Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#0a0f1e',
  },
  emoji: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    color: '#38BDF8',
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    backgroundColor: '#1e293b',
    color: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  registerButton: {
    width: '90%',
    backgroundColor: '#38BDF8',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginButton: {
    marginTop: 10,
  },
  loginText: {
    color: '#38BDF8',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
