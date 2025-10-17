import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { Provider as PaperProvider, IconButton } from "react-native-paper";

const { width, height } = Dimensions.get("window");

// Função para calcular porcentagem da largura
const wp = (percentage) => (width * percentage) / 100;
// Função para calcular porcentagem da altura
const hp = (percentage) => (height * percentage) / 100;

// Dimensões responsivas do livro - proporção de livro real
const BOOK_W = wp(90);
const BOOK_H = BOOK_W * 1.1; // Proporção aproximada de um livro (mais alto que largo)

const Detalhes = ({ route, navigation }) => {
  const ip = process.env.EXPO_PUBLIC_IP;
  const { livro: initialLivro } = route.params;
  const [livro, setLivro] = useState(initialLivro);
  const [aberto, setAberto] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [usuarioId, setUsuarioId] = useState(null);
  const [statusLivro, setStatusLivro] = useState("");
  const [dataFinal, setDataFinal] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const { theme, isDark, toggleTheme } = useTheme();

  const carregarDados = useCallback(async () => {
    try {
      const idUsuario = await AsyncStorage.getItem("idUser");
      if (!idUsuario) {
        Alert.alert("Erro", "Usuário não identificado. Faça login.");
        return;
      }
      setUsuarioId(idUsuario);

      const res = await fetch(`${ip}/livros/${initialLivro.id}?usuario_id=${idUsuario}`);
      if (!res.ok) throw new Error("Falha ao buscar dados do livro");
      const fresh = await res.json();
      setLivro({ ...fresh, favorito: fresh.favorito || false });
      if (fresh.minha_avaliacao) setNotaSelecionada(fresh.minha_avaliacao);

      const resPre = await fetch(
        `${ip}/pre_reservas/check?usuario_id=${idUsuario}&livro_id=${initialLivro.id}`
      );
      const dataPre = await resPre.json();

      if (dataPre.existe === false) {
        setStatusLivro("");
        setDataFinal(null);
      } else {
        if (dataPre.status === "retirado") {
          setStatusLivro("retirado");
          setDataFinal(null);
        } else if (dataPre.status === "aguardando") {
          setStatusLivro("aguardando");
          if (dataPre.data_retirada_max) setDataFinal(new Date(dataPre.data_retirada_max));
          else setDataFinal(null);
        } else if (dataPre.status === "devolvido") {
          setStatusLivro("devolvido");
          setDataFinal(null);
        } else {
          setStatusLivro("");
          setDataFinal(null);
        }
      }
    } catch (err) {
      console.log("Erro ao carregar livro:", err.message);
    }
  }, [initialLivro, ip]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const toggleBook = useCallback(() => {
    Animated.spring(anim, {
      toValue: aberto ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
    setAberto((prev) => !prev);
  }, [aberto, anim]);

  const coverRotateY = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-180deg"] });
  const leftPageRotateY = anim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "0deg"] });
  const rightPageRotateY = anim.interpolate({ inputRange: [0, 1], outputRange: ["-180deg", "0deg"] });
  const coverOpacity = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0, 0] });

  const mediaGeral =
    livro?.numero_avaliacoes && livro.numero_avaliacoes > 0
      ? (livro.avaliacao / livro.numero_avaliacoes).toFixed(1)
      : null;

  const avaliar = useCallback(
    async (nota) => {
      if (!usuarioId) return Alert.alert("Erro", "Usuário não identificado");
      if (notaSelecionada > 0) return Alert.alert("Aviso", "Você já avaliou este livro");

      try {
        const res = await fetch(`${ip}/livros/avaliar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idLivro: livro.id, idUsuario: usuarioId, nota }),
        });
        const data = await res.json();

        if (res.ok) {
          setNotaSelecionada(nota);
          setLivro((prev) => ({
            ...prev,
            avaliacao: (prev.avaliacao || 0) + nota,
            numero_avaliacoes: (prev.numero_avaliacoes || 0) + 1,
          }));
          Alert.alert("Sucesso", "Livro avaliado com sucesso!");
        } else {
          Alert.alert("Erro", data.message || "Não foi possível avaliar.");
        }
      } catch (e) {
        console.log("Erro ao avaliar:", e);
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      }
    },
    [ip, livro.id, notaSelecionada, usuarioId]
  );

  const toggleFavorito = useCallback(async () => {
    if (!usuarioId) return Alert.alert("Erro", "Usuário não identificado");

    try {
      const res = await fetch(`${ip}/livros/${livro.id}/favoritar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLivro((prev) => ({ ...prev, favorito: data.favorito }));
      } else {
        Alert.alert("Erro", data.message || "Não foi possível favoritar.");
      }
    } catch (e) {
      console.log("Erro ao favoritar:", e);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  }, [ip, livro.id, usuarioId]);

  const preReservar = useCallback(async () => {
    if (!usuarioId) return Alert.alert("Erro", "Usuário não identificado.");
    if (livro.quantidade_disponivel <= 0) {
      return Alert.alert("Aviso", "Não há exemplares disponíveis para pré-reserva.");
    }

    try {
      const res = await fetch(`${ip}/pre_reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioId, livro_id: livro.id }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "Pré-reserva realizada",
          "Você tem 24h para retirar seu livro na biblioteca. Após esse prazo, a reserva será removida automaticamente."
        );
        setStatusLivro("aguardando");
        setLivro((prev) => ({ ...prev, quantidade_disponivel: (prev.quantidade_disponivel || 0) - 1 }));
        if (data.data_retirada_max) setDataFinal(new Date(data.data_retirada_max));
      } else {
        Alert.alert("Erro", data.message || "Não foi possível realizar a pré-reserva.");
        carregarDados();
      }
    } catch (e) {
      console.log("Erro ao pré-reservar:", e);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  }, [ip, usuarioId, livro, carregarDados]);

  const cancelarReserva = useCallback(async () => {
    if (!usuarioId) return Alert.alert("Erro", "Usuário não identificado.");
    Alert.alert("Confirmar", "Tem certeza que deseja cancelar a pré-reserva?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          try {
            const res = await fetch(`${ip}/pre_reservas`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ usuario_id: usuarioId, livro_id: livro.id }),
            });
            const data = await res.json();
            if (res.ok) {
              setStatusLivro("");
              setDataFinal(null);
              setLivro((prev) => ({
                ...prev,
                quantidade_disponivel: (prev.quantidade_disponivel || 0) + 1,
              }));
              Alert.alert("Sucesso", "Pré-reserva cancelada.");
            } else {
              Alert.alert("Erro", data.message || "Não foi possível cancelar a pré-reserva.");
              carregarDados();
            }
          } catch (e) {
            console.log("Erro ao cancelar reserva:", e);
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
          }
        },
      },
    ]);
  }, [ip, usuarioId, livro, carregarDados]);

  const retirarLivro = useCallback(async () => {
    if (!usuarioId) return Alert.alert("Erro", "Usuário não identificado.");
    Alert.alert("Confirmar", "Confirmar retirada do livro?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          try {
            const res = await fetch(`${ip}/pre_reservas/retirar`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ usuario_id: usuarioId, livro_id: livro.id }),
            });
            const data = await res.json();
            if (res.ok) {
              setStatusLivro("retirado");
              setDataFinal(null);
              Alert.alert("Sucesso", "Retirada registrada. Bom proveito da leitura!");
            } else {
              Alert.alert("Erro", data.message || "Não foi possível registrar retirada.");
              carregarDados();
            }
          } catch (e) {
            console.log("Erro ao registrar retirada:", e);
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
          }
        },
      },
    ]);
  }, [ip, usuarioId, livro, carregarDados]);

  const devolverLivro = useCallback(async () => {
    if (!usuarioId) return Alert.alert("Erro", "Usuário não identificado.");
    Alert.alert("Confirmar", "Confirmar devolução do livro?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          try {
            const res = await fetch(`${ip}/pre_reservas/devolver`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ usuario_id: usuarioId, livro_id: livro.id }),
            });
            const data = await res.json();
            if (res.ok) {
              setStatusLivro("devolvido");
              setLivro((prev) => ({ ...prev, quantidade_disponivel: (prev.quantidade_disponivel || 0) + 1 }));
              Alert.alert("Sucesso", "Livro devolvido com sucesso.");
            } else {
              Alert.alert("Erro", data.message || "Não foi possível registrar devolução.");
              carregarDados();
            }
          } catch (e) {
            console.log("Erro ao devolver:", e);
            Alert.alert("Erro", "Não foi possível conectar ao servidor.");
          }
        },
      },
    ]);
  }, [ip, usuarioId, livro, carregarDados]);

  const preReservarAction = statusLivro === "aguardando" ? cancelarReserva : preReservar;

  let preReservarText = "";
  let preReservarDisabled = false;
  let mostrarPrazo = false;

  if (statusLivro === "retirado") {
    preReservarText = "Boa leitura!";
    preReservarDisabled = true;
    mostrarPrazo = false;
  } else if (statusLivro === "aguardando") {
    preReservarText = "Cancelar Reserva";
    preReservarDisabled = false;
    mostrarPrazo = true;
  } else if (statusLivro === "devolvido") {
    preReservarText = "Pré-reservar";
    preReservarDisabled = false;
    mostrarPrazo = false;
  } else {
    preReservarText = livro.quantidade_disponivel <= 0 ? "Indisponível" : "Pré-reservar";
    preReservarDisabled = livro.quantidade_disponivel <= 0;
    mostrarPrazo = false;
  }

  let statusMensagem = "";
  if (statusLivro === "retirado") {
    statusMensagem = "📚 Atualmente com você";
  } else if (statusLivro === "aguardando") {
    statusMensagem = "⏳ Aguardando retirada";
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <IconButton 
            icon="arrow-left" 
            iconColor={theme.colors.primary} 
            size={wp(7)} 
            onPress={() => navigation.goBack()} 
          />
        </TouchableOpacity>

        {/* Botão Tema */}
        <TouchableOpacity
          style={styles.btnTema}
          onPress={toggleTheme}
          activeOpacity={0.8}
        >
          <IconButton
            icon={isDark ? 'white-balance-sunny' : 'weather-night'}
            iconColor={theme.colors.primary}
            size={wp(7)}
            onPress={toggleTheme}
          />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={[styles.instructionText, { color: theme.colors.primary, fontSize: wp(4) }]}>
            Pressione o Livro
          </Text>

          <TouchableOpacity activeOpacity={1} onPress={toggleBook} style={styles.bookContainer}>
            <View style={styles.bookWrapper}>
              {/* Capa do livro */}
              <Animated.View
                pointerEvents={aberto ? "none" : "auto"}
                style={[
                  styles.cover,
                  {
                    backgroundColor: theme.colors.primary,
                    transform: [{ rotateY: coverRotateY }],
                    opacity: coverOpacity,
                  },
                ]}
              >
                <Image
                  source={livro.capa ? { uri: livro.capa } : require("./../../assets/capalivro.png")}
                  style={styles.capa}
                  resizeMode="cover"
                />
              </Animated.View>

              {/* Livro aberto */}
              <View style={styles.book}>
                {/* Página Esquerda */}
                <Animated.View
                  style={[
                    styles.pageLeft,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      transform: [{ perspective: 1000 }, { rotateY: leftPageRotateY }],
                    },
                  ]}
                >
                  <ScrollView 
                    contentContainerStyle={styles.pagePad}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={[styles.title, { color: theme.colors.primary, fontSize: wp(4.8) }]}>
                      {livro.titulo}
                    </Text>
                    {[
                      ["Autor", livro.autor],
                      ["Editora", livro.editora],
                      ["Gênero", livro.genero],
                    ].map(([label, value]) => (
                      <View style={styles.detailRow} key={label}>
                        <Text style={[styles.label, { color: theme.colors.primary, fontSize: wp(3.5) }]}>
                          {label}:
                        </Text>
                        <Text style={[styles.value, { color: theme.colors.text, fontSize: wp(3.5) }]}>
                          {value || "—"}
                        </Text>
                      </View>
                    ))}
                    <View style={[styles.separator, { backgroundColor: theme.colors.menuText }]} />
                    
                    <View style={[styles.detailRow, { alignItems: "center" }]}>
                      <Text style={[styles.label, { fontSize: wp(3.7), color: theme.colors.primary }]}>
                        Avaliação:
                      </Text>
                      <View style={styles.mediaWrap}>
                        <Text style={[styles.mediaText, { color: theme.colors.text, fontSize: wp(3.7) }]}>
                          {mediaGeral ? `${mediaGeral}★` : "0★"}
                        </Text>
                        <Text style={[styles.countText, { color: theme.colors.text, fontSize: wp(3.2) }]}>
                          ({livro.numero_avaliacoes || 0})
                        </Text>
                      </View>
                    </View>
                  </ScrollView>
                </Animated.View>

                {/* Página Direita */}
                <Animated.View
                  style={[
                    styles.pageRight,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      transform: [{ perspective: 1000 }, { rotateY: rightPageRotateY }],
                    },
                  ]}
                >
                  <ScrollView 
                    contentContainerStyle={styles.pagePad}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={[styles.titleRight, { color: theme.colors.primary, fontSize: wp(4.5) }]}>
                      Avalie este livro
                    </Text>
                    <View style={styles.rateRow}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <TouchableOpacity 
                          key={n} 
                          onPress={aberto ? () => avaliar(n) : undefined} 
                          activeOpacity={0.7}
                        >
                          <Text
                            style={
                              n <= notaSelecionada
                                ? [styles.starOn, { color: "#d62828", fontSize: wp(7) }]
                                : [styles.rateStar, { 
                                    color: theme.dark ? "#7a7a7a" : "#b0b0b0",
                                    fontSize: wp(7) 
                                  }]
                            }
                          >
                            ★
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.titleRight, { color: theme.colors.primary, fontSize: wp(4.5), marginTop: hp(0.5) }]}>
                      {livro.favorito ? "Favorito" : "Favoritar"}
                    </Text>
                    <View style={styles.rateRow}>
                      <TouchableOpacity activeOpacity={0.8} onPress={aberto ? toggleFavorito : undefined}>
                        <Text style={[styles.favIcon, { fontSize: wp(6) }]}>
                          {livro.favorito ? "❤️" : "🤍"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[
                      styles.infoBox, 
                      { backgroundColor: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }
                    ]}>
                      <Text style={[styles.smallLabel, { color: theme.colors.text, fontSize: wp(2.8) }]}>
                        Disponibilidade
                      </Text>
                      <Text style={[styles.status, { color: theme.colors.primary, fontSize: wp(4.2) }]}>
                        {livro.quantidade_disponivel != null && livro.quantidade_total != null
                          ? `${livro.quantidade_disponivel} / ${livro.quantidade_total}`
                          : "Não informado"}
                      </Text>
                      {statusMensagem ? (
                        <Text style={[styles.statusMensagem, { color: theme.colors.text, fontSize: wp(3) }]}>
                          {statusMensagem}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={aberto ? preReservarAction : undefined}
                      disabled={preReservarDisabled}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: preReservarDisabled ? theme.colors.disabled : theme.colors.primary,
                          paddingVertical: hp(1.5),
                        },
                      ]}
                    >
                      <Text style={[
                        styles.actionText, 
                        { 
                          color: preReservarDisabled ? theme.colors.text : "#fff",
                          fontSize: wp(3.8)
                        }
                      ]}>
                        {preReservarText}
                      </Text>
                    </TouchableOpacity>

                    {mostrarPrazo && dataFinal && (
                      <Text style={[styles.prazoText, { color: theme.colors.text, fontSize: wp(2.7) }]}>
                        Retire até:{" "}
                        {dataFinal.toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                  </ScrollView>
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(2),
  },
  instructionText: {
    marginBottom: hp(2),
    fontWeight: "bold",
  },
  bookContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  bookWrapper: {
    width: BOOK_W,
    height: BOOK_H,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    position: "absolute",
    width: BOOK_W * 0.78,
    height: BOOK_H,
    borderWidth: 1,
    borderColor: "#8c1515",
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  capa: {
    width: "100%",
    height: "100%",
    
  },
  book: {
    position: "absolute",
    width: BOOK_W,
    height: BOOK_H,
    flexDirection: "row",
    
  },
  pageLeft: {
    width: "50%",
    height: "100%",
    borderRightWidth: 0.5,
    borderRightColor: "#c4c4c4",
    backfaceVisibility: "hidden",
  },
  pageRight: {
    width: "50%",
    height: "100%",
    borderLeftWidth: 0.5,
    borderLeftColor: "#c4c4c4",
    backfaceVisibility: "hidden",
  },
  pagePad: {
    flexGrow: 1,
    padding: wp(3),
    paddingVertical: hp(1.5),
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
    marginBottom: hp(1),
    lineHeight: wp(6),
  },
  titleRight: {
    fontWeight: "800",
    textAlign: "center",
    marginBottom: hp(0),
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(0.7),
  },
  label: {
    fontWeight: "700",
  },
  value: {
    flexShrink: 1,
    textAlign: "right",
  },
  separator: {
    height: 0.5,
    marginVertical: hp(1),
  },
  mediaWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "no-wrap",
  },
  mediaText: {
    fontWeight: "700",
    textAlign: "right",
    flexWrap: "nowrap"
  },
  countText: {
    marginLeft: wp(1),
  },
  starOn: {
    marginHorizontal: wp(0.2),
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hp(0.8),
  },
  rateStar: {
    marginHorizontal: wp(0.2),
  },
  favIcon: {},
  infoBox: {
    padding: wp(2.5),
    alignItems: "center",
    borderRadius: 6,
    marginBottom: hp(1),
    marginTop: hp(0.5),
  },
  smallLabel: {
    marginBottom: hp(0.4),
  },
  status: {
    fontWeight: "700",
    marginBottom: hp(0.6),
  },
  statusMensagem: {
    textAlign: "center",
    marginTop: hp(0.2),
  },
  actionBtn: {
    borderRadius: 6,
    alignItems: "center",
  },
  actionText: {
    fontWeight: "700",
  },
  prazoText: {
    textAlign: "center",
    marginTop: hp(0.8),
    fontStyle: "italic",
  },
  btnVoltar: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(5) : hp(2),
    left: wp(2),
    zIndex: 9999,
    elevation: 10,
  },
  btnTema: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(5) : hp(2),
    right: wp(2),
    zIndex: 9999,
    elevation: 10,
  },
});

export default Detalhes;