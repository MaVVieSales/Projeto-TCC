import React, { useEffect } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import {
  Text,
  Button,
  Provider as PaperProvider,
  IconButton,
} from 'react-native-paper';
import { useTheme } from './../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const Inicio = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const textColor = theme.colors.onBackground;

  useEffect(() => {
    // Esconder barra de navegação
    if (Platform.OS === 'android') {
      import('expo-navigation-bar').then(NavigationBar => {
        NavigationBar.setVisibilityAsync("hidden");
        NavigationBar.setBehaviorAsync("overlay-swipe");
        NavigationBar.setBackgroundColorAsync("transparent");
      });
    }
  }, []);

  const cardWidth = wp(85);
  const cardHeight = hp(82);
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
                    style={{ width: wp(35), height: hp(4), resizeMode: 'contain' }}
                  />
                </View>

                {/* Card principal */}
                <View style={{
                  position: 'relative',
                  minHeight: hp(75),
                  width: cardWidth,
                  paddingTop: hp(5),
                }}>
                  {/* SVG Background com máscara - Círculo vazado */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
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

                  {/* Ícone centralizado NO CÍRCULO VAZADO (sobre o fundo transparente) */}
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

                  {/* Conteúdo */}
                  <View style={{
                    zIndex: 5,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: wp(5),
                    paddingTop: hp(1),
                  }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: hp(1), color: textColor, fontSize: wp(6) }}>
                      Bem-vindo(a)
                    </Text>
                    <Text style={{ textAlign: 'center', opacity: 0.8, marginBottom: hp(6), color: textColor, fontSize: wp(3.5) }}>
                      Escolha uma opção para continuar:
                    </Text>

                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('Cadastrar')}
                      style={{ width: '100%', borderRadius: 8 }}
                      contentStyle={{ height: hp(7) }}
                      labelStyle={{ fontSize: wp(4.5), fontWeight: 'bold', color: 'white' }}
                      buttonColor={theme.colors.primary}
                    >
                      Criar conta
                    </Button>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: hp(5), width: '100%' }}>
                      <View style={{ flex: 1, height: 1, backgroundColor: textColor }} />
                      <Text style={{ marginHorizontal: 10, fontSize: wp(4), color: textColor }}>ou</Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: textColor }} />
                    </View>

                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('Login')}
                      style={{ width: '100%', borderRadius: 8, }}
                      contentStyle={{ height: hp(7) }}
                      labelStyle={{ fontSize: wp(4.5), fontWeight: 'bold', color: theme.colors.primary }}
                      textColor={theme.colors.primary}
                    >
                      Já tenho uma conta
                    </Button>

                    {/* Livro decorativo */}
                    <Image
                      source={isDark ? require('./../../assets/livro_dark.png') : require('./../../assets/livro_light.png')}
                      style={{ width: wp(65), height: hp(20), resizeMode: 'contain', marginTop: hp(6) }}
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

export default Inicio;