import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "e4336120ae95530ffae07f07132ff848"; //not supposed to do like this, but it's free API key so I just put it here. Again, this is not secure

export default function App() {
  const [region, setRegion] = useState("Loading...");
  const [weatherInfo, setWeatherInfo] = useState([]);
  const [districtNstreet, setDNS] = useState("");
  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setRegion(location[0].region);
    setDNS(location[0].district + ", " + location[0].street);
    const weatherData = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`
    );
    const json = await weatherData.json();
    setWeatherInfo(json.daily);
  };
  useEffect(() => {
    getWeather();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.region}>{region}</Text>
        <Text style={styles.districtNstreet}>{districtNstreet}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {weatherInfo.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            {/* style={styles.day} 적용하고, 추가로 뒤에 효과도 넣음 */}
            <ActivityIndicator size="large" color="black" />
          </View>
        ) : (
          weatherInfo.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.temp}>
                  {parseFloat(day.temp.day).toFixed(1)}
                </Text>
                <Image
                  style={{ width: 100, height: 100 }}
                  source={{
                    uri: `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
                  }}
                />
              </View>
              <Text style={styles.main}>{day.weather[0].main}</Text>
              <Text style={styles.description}>
                {day.weather[0].description}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7d455",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    marginLeft: 40,
  },
  region: {
    fontSize: 64,
  },
  districtNstreet: { fontSize: 30 },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  temp: {
    marginTop: 50,
    fontWeight: "bold",
    fontSize: 125,
  },
  main: {
    marginTop: -20,
    fontSize: 50,
  },
  description: {
    fontSize: 30,
  },
});
