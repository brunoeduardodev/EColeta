import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  Linking,
} from "react-native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RectButton } from "react-native-gesture-handler";
import api from "../../services/api";
import * as MailComposer from "expo-mail-composer";
// import { Container } from './styles';

interface RouteParams {
  point_id: number;
}

interface Item {
  title: string;
}

interface Error {
  message: string;
}

interface Point {
  id: number;
  image: string;
  name: string;
  city: string;
  uf: string;
  whatsapp: string;
  email: string;
}

interface PointData {
  point: Point;
  items: Item[];
}

const Detail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const pointId = routeParams.point_id;

  const [pointData, setPointData] = useState<PointData>({
    point: {
      id: 0,
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
      name: "",
      city: "",
      uf: "",
      whatsapp: "",
      email: "",
    },
    items: [],
  });

  const formatedItems = useMemo(() => {
    console.log(pointData);
    const itemsNames = pointData.items.map((item) => item.title);
    return itemsNames.join(", ");
  }, [pointData.items]);

  useEffect(() => {
    async function getData() {
      try {
        console.log(pointId);
        const point = await api.get<PointData>(`points/${pointId}`);
        setPointData(point.data);
      } catch (error) {}
    }

    getData();
  }, [pointId]);

  const handleNavigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleComposeMail = useCallback(() => {
    MailComposer.composeAsync({
      subject: "Interesse na coleta de resíduos",
      recipients: [pointData.point.email],
    });
  }, [pointData]);

  const handleWhatsapp = useCallback(() => {
    Linking.openURL(
      `whatsapp://send?phone=${pointData.point.whatsapp}&text=Tenho interesse sobre coleta de resíduos`
    );
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Image
          source={{
            uri: pointData.point.image,
          }}
          style={styles.pointImage}
        />

        <Text style={styles.pointName}>{pointData.point.name}</Text>
        <Text style={styles.pointItems}>{formatedItems}</Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {pointData.point.city}, {pointData.point.uf}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={() => {}}>
          <FontAwesome name="whatsapp" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>

        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Icon name="mail" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Email</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

export default Detail;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop:
      20 + (Platform.OS === "android" ? Constants.statusBarHeight : 0),
  },

  pointImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: "#322153",
    fontSize: 28,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  pointItems: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: "#6C6C80",
  },

  address: {
    marginTop: 32,
  },

  addressTitle: {
    color: "#322153",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },

  addressContent: {
    fontFamily: "Roboto_400Regular",
    lineHeight: 24,
    marginTop: 8,
    color: "#6C6C80",
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#999",
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  button: {
    width: "48%",
    backgroundColor: "#34CB79",
    borderRadius: 10,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 17,
    fontFamily: "Roboto_500Medium",
  },

  input: {
    height: 64,
    backgroundColor: "#FFF",
  },
});
