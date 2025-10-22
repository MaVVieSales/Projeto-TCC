import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import {
  TextInput,
  Text,
  Provider as PaperProvider,
  IconButton,
  Card,
  Button,
  RadioButton,
  Checkbox,
  ActivityIndicator,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from './../contexts/ThemeContext';

const { width, height } = Dimensions.get("window");

// Breakpoints responsivos
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;

// Cálculos dinâmicos
const CARD_WIDTH = isLargeDevice ? 160 : isMediumDevice ? 140 : 130;
const CARD_HEIGHT = isLargeDevice ? 240 : isMediumDevice ? 220 : 200;
const IMAGE_HEIGHT = isLargeDevice ? 190 : isMediumDevice ? 170 : 155;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const HERO_IMAGE_WIDTH = width * (isLargeDevice ? 0.5 : 0.625);
const HERO_IMAGE_HEIGHT = HERO_IMAGE_WIDTH * 0.7;

const Home = ({ navigation }) => {
  const ip = process.env.EXPO_PUBLIC_IP;
  const { theme, isDark, setTheme } = useTheme();

  const listRefs = useRef({});
  const [livros, setLivros] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [temaVisible, setTemaVisible] = useState(false);
  const [temaSelecionado, setTemaSelecionado] = useState(isDark ? "escuro" : "claro");
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [generos, setGeneros] = useState([]);
  const [generosSelecionados, setGenerosSelecionados] = useState([]);
  const [todosLivros, setTodosLivros] = useState([]);
  const [livrosPorGenero, setLivrosPorGenero] = useState({});
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem("idUser");
        if (idUsuario) {
          const response = await fetch(`${ip}/usuarios/${idUsuario}`);
          const data = await response.json();
          setUsuario(data);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    carregarUsuario();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregarDados = async () => {
        try {
          setLoading(true);
          const idUsuario = await AsyncStorage.getItem("idUser");

          if (!idUsuario) {
            Alert.alert("Erro", "Usuário não identificado. Faça login.");
            navigation.replace("Inicio");
            return;
          }

          const response = await fetch(`${ip}/usuarios/${idUsuario}?t=${Date.now()}`);
          const data = await response.json();

          if (ativo) setUsuario(data);
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
        } finally {
          if (ativo) setLoading(false);
        }
      };

      carregarDados();

      return () => {
        ativo = false;
      };
    }, [ip])
  );

  useEffect(() => {
    setTemaSelecionado(isDark ? "escuro" : "claro");
  }, [isDark]);

  useEffect(() => {
    const fetchGenerosELivros = async () => {
      try {
        const resGen = await fetch(`${ip}/generos`);
        const generosData = await resGen.json();
        const listaGeneros = generosData.map(g => g.genero);
        setGeneros(listaGeneros);

        const resAll = await fetch(`${ip}/livros`);
        const livrosData = await resAll.json();
        setTodosLivros(livrosData);

        listaGeneros.forEach(async (genero) => {
          const resLivros = await fetch(`${ip}/livros/genero/${encodeURIComponent(genero)}`);
          const data = await resLivros.json();

          setLivrosPorGenero(prev => ({
            ...prev,
            [genero]: data
          }));
        });
      } catch (err) {
        console.error("❌ Erro ao buscar gêneros ou livros:", err);
      }
    };

    fetchGenerosELivros();
  }, []);

  const scrollTo = (key, direction) => {
    const listRef = listRefs.current[key];
    if (!listRef) return;

    const offset = (listRef._currentOffset || 0) + (direction === "right" ? CARD_WIDTH + 12 : -(CARD_WIDTH + 12));
    listRef.scrollToOffset({ offset, animated: true });
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Detalhes", { livro: item })}
      activeOpacity={0.7}
      style={styles.cardWrapper}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.cardImageContainer}>
          <Image
            source={
              item.capa
                ? { uri: item.capa }
                : require("./../../assets/capalivro.png")
            }
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.titulo}
          </Text>
          {item.autor && (
            <Text style={[styles.cardAuthor, { color: theme.colors.text }]} numberOfLines={1}>
              {item.autor}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const aplicarTema = async () => {
    await setTheme(temaSelecionado);
    setTemaVisible(false);
  };

  const handleSearch = () => {
    if (query.trim() !== "" || generosSelecionados.length > 0) {
      navigation.navigate("Resultados", {
        query: query.trim(),
        filtros: generosSelecionados,
        tipo: "livro"
      });
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.primary}
        />

        {/* Modal Menu */}
        <Modal transparent visible={menuVisible} animationType="slide">
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={[styles.menu, { backgroundColor: theme.colors.background }]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.menuHeader}>
                <Text style={[styles.menuHeaderText, { color: theme.colors.text }]}>
                  Menu
                </Text>
                <IconButton
                  icon="close"
                  iconColor={theme.colors.text}
                  size={24}
                  onPress={() => setMenuVisible(false)}
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Home");
                }}
                style={[styles.menuItem, styles.menuItemActive, {backgroundColor: theme.colors.menuBackground, }]}
              >
                <IconButton icon="book-open-variant" iconColor={theme.colors.primary} size={22} />
                <Text style={[styles.menuText, { color: theme.colors.primary, fontWeight: '700', }]}>
                  Biblioteca
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Museu");
                }}
                style={styles.menuItem}
              >
                <IconButton icon="school" iconColor={theme.colors.menuText} size={22} />
                <Text style={[styles.menuText, { color: theme.colors.menuText }]}>
                  Museu dos TCCs
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Reservas");
                }}
                style={styles.menuItem}
              >
                <IconButton icon="bookmark" iconColor={theme.colors.menuText} size={22} />
                <Text style={[styles.menuText, { color: theme.colors.menuText }]}>
                  Reservas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Favoritos");
                }}
                style={styles.menuItem}
              >
                <IconButton icon="heart" iconColor={theme.colors.menuText} size={22} />
                <Text style={[styles.menuText, { color: theme.colors.menuText }]}>
                  Favoritos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setTemaVisible(true);
                }}
                style={styles.menuItem}
              >
                <IconButton icon="palette" iconColor={theme.colors.menuText} size={22} />
                <Text style={[styles.menuText, { color: theme.colors.menuText }]}>
                  Tema
                </Text>
              </TouchableOpacity>

              <View style={[styles.menuDivider, {backgroundColor: theme.colors.text}]} />

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate("Inicio");
                }}
                style={styles.menuItem}
              >
                <IconButton icon="logout" iconColor={theme.colors.menuText} size={22} />
                <Text style={[styles.menuText, { color: theme.colors.menuText }]}>
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal Tema */}
        <Modal transparent visible={temaVisible} animationType="fade">
          <View style={styles.overlayCenter}>
            <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Selecionar Tema
                </Text>
                <IconButton
                  icon="close"
                  iconColor={theme.colors.text}
                  size={24}
                  onPress={() => setTemaVisible(false)}
                />
              </View>

              <RadioButton.Group
                onValueChange={(value) => setTemaSelecionado(value)}
                value={temaSelecionado}
              >
                <TouchableOpacity 
                  style={[
                    styles.radioItem,
                    temaSelecionado === "claro" && styles.radioItemSelected
                  ]}
                  onPress={() => setTemaSelecionado("claro")}
                >
                  <RadioButton value="claro" color={theme.colors.primary} />
                  <IconButton icon="white-balance-sunny" iconColor={theme.colors.text} size={20} />
                  <Text style={[styles.radioText, { color: theme.colors.text }]}>Tema Claro</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.radioItem,
                    temaSelecionado === "escuro" && styles.radioItemSelected
                  ]}
                  onPress={() => setTemaSelecionado("escuro")}
                >
                  <RadioButton value="escuro" color={theme.colors.primary} />
                  <IconButton icon="moon-waning-crescent" iconColor={theme.colors.text} size={20} />
                  <Text style={[styles.radioText, { color: theme.colors.text }]}>Tema Escuro</Text>
                </TouchableOpacity>
              </RadioButton.Group>

              <Button
                mode="contained"
                style={[styles.prontoBtn, { backgroundColor: theme.colors.primary }]}
                labelStyle={styles.prontoBtnLabel}
                onPress={aplicarTema}
              >
                Aplicar Tema
              </Button>
            </View>
          </View>
        </Modal>

        {/* Modal de Filtro */}
        <Modal transparent visible={showFilter} animationType="fade">
          <View style={styles.overlayCenter}>
            <View style={[styles.filterModalBox, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Filtrar por Gênero
                </Text>
                <IconButton
                  icon="close"
                  iconColor={theme.colors.text}
                  size={24}
                  onPress={() => setShowFilter(false)}
                />
              </View>

              <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.checkboxItem,
                    generosSelecionados.length === 0 && styles.checkboxItemSelected
                  ]}
                  onPress={() => setGenerosSelecionados([])}
                >
                  <Checkbox
                    status={generosSelecionados.length === 0 ? "checked" : "unchecked"}
                    color={theme.colors.primary}
                  />
                  <Text style={[styles.checkboxText, { color: theme.colors.text }]}>
                    Todos os Gêneros
                  </Text>
                </TouchableOpacity>

                <View style={styles.filterDivider} />

                {generos.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.checkboxItem,
                      generosSelecionados.includes(g) && styles.checkboxItemSelected
                    ]}
                    onPress={() => {
                      if (generosSelecionados.includes(g)) {
                        setGenerosSelecionados(
                          generosSelecionados.filter((item) => item !== g)
                        );
                      } else {
                        setGenerosSelecionados([...generosSelecionados, g]);
                      }
                    }}
                  >
                    <Checkbox
                      status={generosSelecionados.includes(g) ? "checked" : "unchecked"}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.checkboxText, { color: theme.colors.text }]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.filterButtons}>
                <Button
                  mode="outlined"
                  style={styles.filterCancelBtn}
                  labelStyle={[styles.filterBtnLabel, { color: theme.colors.text }]}
                  onPress={() => {
                    setGenerosSelecionados([]);
                    setShowFilter(false);
                  }}
                >
                  Limpar
                </Button>
                <Button
                  mode="contained"
                  style={[styles.filterApplyBtn, { backgroundColor: theme.colors.primary }]}
                  labelStyle={styles.filterBtnLabel}
                  onPress={() => {
                    setShowFilter(false);
                    handleSearch();
                  }}
                >
                  Aplicar
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <IconButton icon="menu" iconColor="white" size={28} />
          </TouchableOpacity>

          <Image
            source={require("./../../assets/senai.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate("Perfil")}
            style={styles.profileButton}
          >
            <Image
              source={
                usuario?.foto
                  ? { uri: `${ip}/uploads/${usuario.foto}?t=${Date.now()}` }
                  : require("./../../assets/usericon.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Conteúdo principal */}
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Seção de Busca */}
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <TextInput
                placeholder="Pesquisar livros..."
                mode="outlined"
                value={query}
                onChangeText={(text) => setQuery(text)}
                style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}
                outlineStyle={styles.searchOutline}
                left={<TextInput.Icon icon="magnify" color={theme.colors.text} />}
                right={
                  query.length > 0 ? (
                    <TextInput.Icon 
                      icon="close" 
                      color={theme.colors.text}
                      onPress={() => setQuery("")}
                    />
                  ) : null
                }
                placeholderTextColor={theme.colors.text + '80'}
                textColor={theme.colors.text}
                activeOutlineColor={theme.colors.primary}
                onSubmitEditing={handleSearch}
              />

              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowFilter(true)}
              >
                <IconButton
                  icon="filter-variant"
                  iconColor="white"
                  size={24}
                />
                {generosSelecionados.length > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>
                      {generosSelecionados.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.subtitulo, { color: theme.colors.text }]}>
              Encontre aqui o que procura!
            </Text>
          </View>

          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image
              source={
                isDark
                  ? require("./../../assets/livro_dark.png")
                  : require("./../../assets/livro_light.png")
              }
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Literatura Geral */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.categoriaTitulo, { color: theme.colors.text }]}>
                Literatura Geral
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Resultados", {
                  query: "",
                  filtros: [],
                  tipo: "livro"
                })}
              >
                <Text style={[styles.verTodos, { color: theme.colors.primary }]}>
                  Ver todos
                </Text>
              </TouchableOpacity>
            </View>

            {todosLivros.length > 0 ? (
              <View style={styles.carrossel}>
                <IconButton
                  icon="chevron-left"
                  iconColor="white"
                  containerColor={theme.colors.primary}
                  size={24}
                  style={styles.carrosselButton}
                  onPress={() => scrollTo("geral", "left")}
                />
                <FlatList
                  ref={(ref) => (listRefs.current["geral"] = ref)}
                  data={todosLivros}
                  renderItem={renderCard}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carrosselContent}
                  onScroll={(e) => {
                    listRefs.current["geral"]._currentOffset = e.nativeEvent.contentOffset.x;
                  }}
                  scrollEventThrottle={16}
                />
                <IconButton
                  icon="chevron-right"
                  iconColor="white"
                  containerColor={theme.colors.primary}
                  size={24}
                  style={styles.carrosselButton}
                  onPress={() => scrollTo("geral", "right")}
                />
              </View>
            ) : (
              <View style={[styles.emptyCarrossel, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  Carregando livros...
                </Text>
              </View>
            )}
          </View>

          {/* Gêneros */}
          {generos.map((genero, idx) => (
            <View key={idx} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.categoriaTitulo, { color: theme.colors.text }]}>
                  {genero}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Resultados", {
                    query: "",
                    filtros: [genero],
                    tipo: "livro"
                  })}
                >
                  <Text style={[styles.verTodos, { color: theme.colors.primary }]}>
                    Ver todos
                  </Text>
                </TouchableOpacity>
              </View>

              {livrosPorGenero[genero] && livrosPorGenero[genero].length > 0 ? (
                <View style={styles.carrossel}>
                  <IconButton
                    icon="chevron-left"
                    iconColor="white"
                    containerColor={theme.colors.primary}
                    size={24}
                    style={styles.carrosselButton}
                    onPress={() => scrollTo(idx, "left")}
                  />
                  <FlatList
                    ref={(ref) => (listRefs.current[idx] = ref)}
                    data={livrosPorGenero[genero] || []}
                    renderItem={renderCard}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carrosselContent}
                    onScroll={(e) => {
                      listRefs.current[idx]._currentOffset = e.nativeEvent.contentOffset.x;
                    }}
                    scrollEventThrottle={16}
                  />
                  <IconButton
                    icon="chevron-right"
                    iconColor="white"
                    containerColor={theme.colors.primary}
                    size={24}
                    style={styles.carrosselButton}
                    onPress={() => scrollTo(idx, "right")}
                  />
                </View>
              ) : (
                <View style={[styles.emptyCarrossel, { backgroundColor: theme.colors.surface }]}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: { 
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    marginLeft: -8,
  },
  logo: { 
    height: 32,
    width: 100,
  },
  profileButton: {
    marginRight: -4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  searchSection: {
    paddingHorizontal: isLargeDevice ? 24 : 16,
    paddingTop: 20,
  },
  searchRow: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchInput: { 
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
  },
  searchOutline: {
    borderRadius: 12,
    borderWidth: 1,
  },
  filterButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  subtitulo: {
    fontSize: isLargeDevice ? 22 : 20,
    fontWeight: "700",
    textAlign: "center",
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  heroImage: {
    width: HERO_IMAGE_WIDTH,
    height: HERO_IMAGE_HEIGHT,
  },
  section: { 
    marginTop: 32,
    paddingHorizontal: isLargeDevice ? 24 : 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriaTitulo: { 
    fontSize: isLargeDevice ? 20 : 18,
    fontWeight: "700",
  },
  verTodos: {
    fontSize: 14,
    fontWeight: '600',
  },
  carrossel: { 
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: isLargeDevice ? -24 : -16,
    paddingHorizontal: 8,
  },
  carrosselButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  carrosselContent: {
    paddingHorizontal: 8,
  },
  cardWrapper: {
    marginHorizontal: 6,
    
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardImageContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  cardImage: { 
    height: IMAGE_HEIGHT,
    width: CARD_WIDTH - 24,
    borderRadius: 8,
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 16,
    minHeight: 70,
  },
  cardTitle: { 
    fontSize: isLargeDevice ? 14 : 13,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyCarrossel: {
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
  },
  menu: { 
    width: isLargeDevice ? 280 : 260,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 8,
  },
  menuHeaderText: {
    fontSize: 24,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 24,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuText: { 
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: { 
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 20,
    fontWeight: '700',
  },
  radioItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  radioItemSelected: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderColor: 'rgba(0,0,0,0.2)',
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  prontoBtn: { 
    marginTop: 20,
    borderRadius: 12,
    elevation: 0,
  },
  prontoBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 6,
    color: '#fff',
  },
  filterModalBox: {
    width: '90%',
    maxWidth: 450,
    maxHeight: height * 0.7,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterScroll: {
    maxHeight: height * 0.4,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  checkboxItemSelected: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderColor: 'rgba(0,0,0,0.2)',
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  filterDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  filterCancelBtn: {
    flex: 1,
    borderRadius: 12,
  },
  filterApplyBtn: {
    flex: 1,
    borderRadius: 12,
    elevation: 0,
  },
  filterBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 6,
  },
});

export default Home;