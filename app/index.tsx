// Login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      alert('Por favor, insira seu email.');
      return;
    }
    if (!senha.trim()) {
      alert('Por favor, insira sua senha.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push('/HomePage/page');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') alert('Usuário não encontrado.');
      else if (error.code === 'auth/wrong-password') alert('Senha incorreta.');
      else if (error.code === 'auth/invalid-email') alert('Email inválido.');
      else alert('Erro ao entrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.title}>PhotoMoments</Text>

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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/cadastro')}>
          <Text style={styles.signUpText}>Criar Conta</Text>
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
    borderWidth: 2,
    borderColor: '#0a0f1e', // mesma cor do fundo
  },
  loginButton: {
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
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signUpButton: {
    marginTop: 10,
  },
  signUpText: {
    color: '#38BDF8',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
