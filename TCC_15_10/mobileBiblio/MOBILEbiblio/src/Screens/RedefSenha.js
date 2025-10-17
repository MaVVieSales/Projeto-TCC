import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Provider as PaperProvider,
} from 'react-native-paper';
import Svg, { Rect, Circle, Defs, Mask } from 'react-native-svg';
import { useTheme } from './../contexts/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const RedefSenha = ({ navigation }) => {
  const ip = process.env.EXPO_PUBLIC_IP;
  
  const { theme, isDark, toggleTheme } = useTheme();
  const textColor = theme.colors.onBackground;

  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const novaSenhaRef = useRef();
  const confirmarSenhaRef = useRef();

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
    NavigationBar.setBackgroundColorAsync("transparent");

    return () => {
      NavigationBar.setVisibilityAsync("visible");
      NavigationBar.setBehaviorAsync("inset-swipe");
    };
  }, []);

  const handleRedefinirSenha = async () => {
    setMensagemErro('');
    
    if (!email || !novaSenha || !confirmarSenha) {
      setMensagemErro('Preencha todos os campos');
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      setMensagemErro('As senhas não coincidem');
      return;
    }
    
    try {
      const resposta = await fetch(ip + '/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, novaSenha }),
      });
      
      const dados = await resposta.json();
      
      if (resposta.ok) {
        Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        setMensagemErro(dados.erro || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagemErro('Erro de conexão com o servidor');
    }
  };

  const cardWidth = wp(90);
  const cardHeight = hp(85);
  const circleRadius = wp(10);
  const iconSize = wp(11);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground
          source={require('../../assets/imgbg.png')}
          style={{ flex: 1, width: '100%', height: '100%' }}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: hp(2),
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                {/* Logo SENAI */}
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                  marginBottom: hp(-3),
                  backgroundColor: theme.colors.surface,
                  width: wp(45),
                  height: hp(7),
                  borderRadius: 15,
                }}>
                  <Image
                    source={require('./../../assets/senai.png')}
                    style={{
                      width: wp(35),
                      height: hp(4),
                      resizeMode: 'contain',
                    }}
                  />
                </View>

                {/* Card Principal */}
                <View style={{
                  position: 'relative',
                  minHeight: hp(80),
                  width: cardWidth,
                  paddingTop: hp(5),
                }}>
                  {/* SVG Background com Máscara - Círculo vazado */}
                  <View style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    zIndex: 0 
                  }}>
                    <Svg width={cardWidth} height={cardHeight}>
                      <Defs>
                        <Mask id="mask">
                          <Rect width="100%" height="100%" fill="white" />
                          <Circle 
                            cx={cardWidth / 2} 
                            cy={cardHeight} 
                            r={circleRadius} 
                            fill="black" 
                          />
                        </Mask>
                      </Defs>
                      <Rect
                        width="100%"
                        height="100%"
                        fill={theme.colors.surface}
                        mask="url(#mask)"
                        rx={15}
                      />
                    </Svg>
                  </View>

                  {/* Ícone de tema centralizado NO CÍRCULO VAZADO */}
                  <View
                    pointerEvents="box-none"
                    style={{
                      position: 'absolute',
                      top: cardHeight - circleRadius,
                      left: (cardWidth / 2) - circleRadius,
                      width: circleRadius * 2,
                      height: circleRadius * 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 50,
                    }}
                  >
                    <IconButton
                      icon={isDark ? 'white-balance-sunny' : 'weather-night'}
                      iconColor="white"
                      size={iconSize}
                      onPress={toggleTheme}
                      style={{
                        margin: 0,
                        backgroundColor: 'transparent',
                      }}
                    />
                  </View>

                  {/* Conteúdo do Formulário */}
                  <View style={{
                    zIndex: 5,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: wp(5),
                    paddingTop: hp(1),
                  }}>
                    <Text style={{ 
                      fontWeight: 'bold', 
                      textAlign: 'center', 
                      marginBottom: hp(1), 
                      color: textColor, 
                      fontSize: wp(6) 
                    }}>
                      Redefinir Senha
                    </Text>
                    
                    <Text style={{ 
                      textAlign: 'center', 
                      opacity: 0.8, 
                      marginBottom: hp(2), 
                      color: textColor, 
                      fontSize: wp(3.5) 
                    }}>
                      Digite seu e-mail e escolha uma nova senha
                    </Text>

                    {/* Espaço para mensagem de erro */}
                    <View style={{ height: hp(3.5) }}>
                      {mensagemErro !== '' && (
                        <Text style={{ 
                          color: '#e74c3c', 
                          textAlign: 'center', 
                          marginBottom: hp(1.5), 
                          fontWeight: '600', 
                          fontSize: wp(3.5) 
                        }}>
                          {mensagemErro}
                        </Text>
                      )}
                    </View>

                    {/* Campo E-mail */}
                    <TextInput
                      label="E-mail"
                      value={email}
                      onChangeText={setEmail}
                      mode="outlined"
                      style={{ 
                        width: '100%', 
                        marginBottom: hp(1.5), 
                        height: hp(6.5) 
                      }}
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
                      outlineColor={theme.colors.primary}
                      cursorColor={theme.colors.primary}
                      activeOutlineColor={theme.colors.primary}
                      textColor={textColor}
                      returnKeyType="next"
                      onSubmitEditing={() => novaSenhaRef.current.focus()}
                      maxLength={150}
                      theme={{
                        colors: {
                          primary: textColor,
                          onSurfaceVariant: textColor,
                          placeholder: textColor,
                        },
                      }}
                    />

                    {/* Campo Nova Senha */}
                    <TextInput
                      label="Nova senha"
                      value={novaSenha}
                      onChangeText={setNovaSenha}
                      secureTextEntry={!showSenha}
                      mode="outlined"
                      style={{ 
                        width: '100%', 
                        marginBottom: hp(1.5), 
                        height: hp(6.5) 
                      }}
                      left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
                      right={
                        <TextInput.Icon
                          icon={showSenha ? 'eye' : 'eye-off'}
                          color={theme.colors.primary}
                          onPress={() => setShowSenha(!showSenha)}
                        />
                      }
                      outlineColor={theme.colors.primary}
                      cursorColor={theme.colors.primary}
                      activeOutlineColor={theme.colors.primary}
                      textColor={textColor}
                      returnKeyType="next"
                      ref={novaSenhaRef}
                      onSubmitEditing={() => confirmarSenhaRef.current.focus()}
                      maxLength={150}
                      theme={{
                        colors: {
                          primary: textColor,
                          onSurfaceVariant: textColor,
                          placeholder: textColor,
                        },
                      }}
                    />

                    {/* Campo Confirmar Senha */}
                    <TextInput
                      label="Confirmar senha"
                      value={confirmarSenha}
                      onChangeText={setConfirmarSenha}
                      secureTextEntry={!showConfirmarSenha}
                      mode="outlined"
                      style={{ 
                        width: '100%', 
                        marginBottom: hp(1.5), 
                        height: hp(6.5) 
                      }}
                      left={<TextInput.Icon icon="lock-check" color={theme.colors.primary} />}
                      right={
                        <TextInput.Icon
                          icon={showConfirmarSenha ? 'eye' : 'eye-off'}
                          color={theme.colors.primary}
                          onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
                        />
                      }
                      outlineColor={theme.colors.primary}
                      cursorColor={theme.colors.primary}
                      activeOutlineColor={theme.colors.primary}
                      textColor={textColor}
                      returnKeyType="done"
                      ref={confirmarSenhaRef}
                      onSubmitEditing={handleRedefinirSenha}
                      maxLength={150}
                      theme={{
                        colors: {
                          primary: textColor,
                          onSurfaceVariant: textColor,
                          placeholder: textColor,
                        },
                      }}
                    />

                    {/* Link Voltar para Login */}
                   

                    <Text style={{ color: textColor, fontSize: wp(3.5), marginTop: hp(1.5) }}>
                      Lembrou sua senha?{' '}
                      <Text style={{ color: 'red', fontWeight: 'bold', textDecorationLine: 'underline' }}
                        onPress={() => navigation.navigate('Login')}>
                        Voltar ao Login
                      </Text>
                    </Text>

                    {/* Botão Redefinir */}
                    <Button
                      icon="lock-reset"
                      mode="contained"
                      onPress={handleRedefinirSenha}
                      style={{ 
                        width: '100%', 
                        marginTop: hp(2), 
                        overflow: 'hidden', 
                        borderRadius: 8 
                      }}
                      contentStyle={{ height: hp(7) }}
                      labelStyle={{ 
                        fontSize: wp(4.5), 
                        fontWeight: 'bold', 
                        color: 'white' 
                      }}
                      buttonColor={theme.colors.primary}
                    >
                      Redefinir Senha
                    </Button>

                    {/* Livro decorativo */}
                    <Image
                      source={
                        isDark
                          ? require('./../../assets/livro_dark.png')
                          : require('./../../assets/livro_light.png')
                      }
                      style={{
                        width: wp(65),
                        height: hp(20),
                        resizeMode: 'contain',
                        marginTop: hp(3),
                      }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default RedefSenha;