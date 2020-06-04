import React, { useCallback, useEffect, useState, useRef } from "react";
import Constants from "expo-constants";
import { Feather as Icon } from "@expo/vector-icons";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import api from "../../services/api";
import * as Location from "expo-location";

const initialRegion = {
  latitude: -6.460905,
  longitude: -37.0995761,
};

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  image: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Params {
  city: string;
  uf: string;
}

const Points: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as Params;

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [initialPosition, setInitialPosition] = useState({
    latitude: -14.5,
    longitude: -49,
    longitudeDelta: 24,
    latitudeDelta: 24,
  });
  const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);

  const mapRef = useRef<MapView>(null);

  console.log(filteredPoints);

  useEffect(() => {
    async function loadPoints() {
      const itemsId = selectedItems.map((item) => item.id);

      const points = await api.get<Point[]>("points", {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          items: itemsId.join(","),
        },
      });
      setFilteredPoints(points.data);
    }

    loadPoints();
  }, [selectedItems]);

  const isItemActive = useCallback(
    (item: Item) => {
      const itemIndex = selectedItems.findIndex(
        (eachItem) => eachItem.id === item.id
      );

      return itemIndex > -1;
    },
    [selectedItems]
  );

  const handleToggleItem = useCallback(
    (item: Item) => {
      if (isItemActive(item)) {
        const newSelectedItems = selectedItems.filter(
          (eachItem) => eachItem.id !== item.id
        );
        setSelectedItems(newSelectedItems);
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    },
    [selectedItems]
  );

  const handleNavigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNavigateToDetail = useCallback(
    (point_id: number) => {
      navigation.navigate("Details", { point_id });
    },
    [navigation]
  );

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Oooops....",
          "Precisamos de sua permissão para obter a localização"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      mapRef.current?.animateCamera(
        { center: { latitude, longitude }, zoom: 16 },
        { duration: 1000 }
      );
    }

    loadPosition();
  }, []);

  useEffect(() => {
    async function getData() {
      const itemsResponse = await api.get<Item[]>("/items");
      setItems(itemsResponse.data);
    }

    getData();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
        </Text>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            initialRegion={initialPosition}
            style={styles.map}
          >
            {filteredPoints.map((point) => (
              <Marker
                key={String(point.id)}
                onPress={() => handleNavigateToDetail(point.id)}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                style={styles.mapMarker}
              >
                <View style={styles.mapMarkerContainer}>
                  <Image
                    style={styles.mapMarkerImage}
                    source={{
                      uri: point.image,
                    }}
                  />
                  <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, isItemActive(item) && styles.selectedItem]}
              onPress={() => handleToggleItem(item)}
              activeOpacity={0.6}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default Points;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: "#34CB79",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: "cover",
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#eee",
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",

    textAlign: "center",
  },

  selectedItem: {
    borderColor: "#34CB79",
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: "Roboto_400Regular",
    textAlign: "center",
    fontSize: 13,
  },
});
