import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { Feather as Icon } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";
import {
  View,
  ImageBackground,
  Text,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import api from "../../services/api";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const navigation = useNavigation();

  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showUfSugestion, setShowUfSugestion] = useState(false);
  const [showCitySugestion, setShowCitySugestion] = useState(false);

  const ufInputRef = useRef<TextInput>(null);
  const cityInputRef = useRef<TextInput>(null);
  const handleNavigateToPoints = useCallback(() => {
    navigation.navigate("Points", { city, uf });
  }, [navigation]);

  const filteredUfs = useMemo(() => {
    const filtered = ufs.filter((eachUf) => eachUf.indexOf(uf) === 0);
    let sorted = filtered.sort();
    return sorted;
  }, [ufs, uf]);

  const filteredCities = useMemo(() => {
    const filtered = cities.filter((eachCity) => eachCity.indexOf(city) === 0);
    let sorted = filtered.sort();
    return sorted;
  }, [cities, city]);

  useEffect(() => {
    async function getData() {
      const ufsResponse = await api.get<any[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
        { baseURL: "" }
      );

      setUfs(ufsResponse.data.map((uf) => String(uf.sigla)));
    }

    getData();
  }, []);

  useEffect(() => {
    async function getData() {
      const cities = await api.get<any[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/microrregioes`
      );

      setCities(cities.data.map((city) => String(city.nome)));
    }

    if (uf.length === 2) {
      getData();
    } else {
      setCities([]);
    }
    setCity("");
  }, [uf]);

  return (
    <ImageBackground
      source={require("../../assets/home-background.png")}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View
        style={[
          styles.main,
          (ufInputRef.current?.isFocused() ||
            cityInputRef.current?.isFocused()) && { display: "none" },
        ]}
      >
        <Image source={require("../../assets/logo.png")} />
        <View
          style={[cityInputRef.current?.isFocused() && { display: "none" }]}
        >
          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encontrar pontos de coleta de forma eficiente.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              value={uf}
              onChangeText={setUf}
              style={styles.input}
              maxLength={2}
              autoCapitalize={"characters"}
              autoCorrect={false}
              placeholder="Digite a UF"
              onFocus={() => setShowUfSugestion(true)}
              onBlur={() => setShowUfSugestion(false)}
              ref={ufInputRef}
            />
            <Icon
              onPress={() => ufInputRef.current?.focus()}
              name="chevron-down"
              size={20}
              color="#6C6C80"
            />
          </View>
          <View style={[styles.sugestions, showUfSugestion && styles.visible]}>
            <FlatList
              data={filteredUfs}
              keyboardShouldPersistTaps="always"
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setUf(item);
                    setShowUfSugestion(false);
                    Keyboard.dismiss();
                    ufInputRef.current?.blur();
                  }}
                >
                  <View style={styles.inputItem}>
                    <Text style={styles.inputItemTyped}>
                      {item.slice(0, uf.length)}
                    </Text>
                    <Text style={styles.inputItemNotTyped}>
                      {item.slice(uf.length)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              value={city}
              onChangeText={setCity}
              style={styles.input}
              autoCorrect={false}
              placeholder="Digite a cidade"
              onBlur={() => setShowCitySugestion(false)}
              onFocus={() => setShowCitySugestion(true)}
              ref={cityInputRef}
            />
            <Icon
              name="chevron-down"
              onPress={() => cityInputRef.current?.focus()}
              size={20}
              color="#6C6C80"
            />
          </View>
          <View
            style={[styles.sugestions, showCitySugestion && styles.visible]}
          >
            <FlatList
              data={filteredCities}
              keyboardShouldPersistTaps="always"
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCity(item);
                    setShowCitySugestion(false);
                    Keyboard.dismiss();
                    cityInputRef.current?.blur();
                  }}
                >
                  <View style={styles.inputItem}>
                    <Text style={styles.inputItemTyped}>
                      {item.slice(0, city.length)}
                    </Text>
                    <Text style={styles.inputItemNotTyped}>
                      {item.slice(city.length)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>

        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Icon color="#FFF" size={20} name="arrow-right" />
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  input: {
    height: 60,
    fontSize: 16,
    color: "#6C6C80",
    flex: 1,
  },

  inputItem: {
    marginVertical: 8,
    flexDirection: "row",
  },

  inputItemNotTyped: {
    color: "#000",
    fontFamily: "Roboto_500Medium",
  },

  inputItemTyped: {
    color: "#6C6C80",
    fontFamily: "Roboto_500Medium",
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },

  sugestions: {
    zIndex: 1,
    maxHeight: 120,
    display: "none",
  },

  visible: {
    display: "flex",
  },
});
