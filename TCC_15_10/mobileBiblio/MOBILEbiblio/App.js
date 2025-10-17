import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, Text, ActivityIndicator } from 'react-native';

// 🔥 IMPORTAR O CONTEXT
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Importar telas
import SplashScreen from './src/Screens/SplashScreen';
import Home from './src/Screens/Home';
import Login from './src/Screens/Login';
import Cadastrar from './src/Screens/Cadastrar';
import Inicio from './src/Screens/Inicio';
import RedefSenha from './src/Screens/RedefSenha';
import Detalhes from './src/Screens/Detalhes';
import Favoritos from './src/Screens/Favoritos';
import Museu from './src/Screens/Museu';
import Perfil from './src/Screens/Perfil';
import VisualizarTCC from './src/Screens/VisualizarTCC';
import Resultados from './src/Screens/Resultados';
import Reservas from './src/Screens/Reservas';
import EditarPerfil from './src/Screens/EditarPerfil';

const Stack = createNativeStackNavigator();

// COMPONENTE INTERNO QUE USA O CONTEXT
function AppNavigator() {
  const { theme, isLoading } = useTheme();

  // TELA DE LOADING ENQUANTO CARREGA TEMA DO ASYNCSTORAGE
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#e30613" />
        <Text style={{ color: '#ffffff', marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{ 
            headerShown: false,
            animation: 'fade', // Transição suave entre telas
            animationDuration: 300
          }}
        >
          {/* Splash deve ser a primeira tela */}
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen}
            options={{
              animation: 'none' // Sem animação na splash inicial
            }}
          />
          <Stack.Screen name="Inicio" component={Inicio} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastrar" component={Cadastrar} />
          <Stack.Screen name="RedefSenha" component={RedefSenha} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Detalhes" component={Detalhes} />
          <Stack.Screen name="Museu" component={Museu} />
          <Stack.Screen name="Favoritos" component={Favoritos} />
          <Stack.Screen name="Resultados" component={Resultados} />
          <Stack.Screen name="Reservas" component={Reservas} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="VisualizarTCC" component={VisualizarTCC} />
          <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// APP PRINCIPAL ENVOLVIDO COM PROVIDER
export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}