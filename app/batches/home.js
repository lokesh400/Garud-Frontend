import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { apiFetch } from "../../utils/api"; // adjust path if needed

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch("/api/batches")
      .then((res) => res.json())
      .then(setBatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <FlatList
      data={batches}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text>
            {item.title}
          </Text>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.subText}>Starts on: {item.startingDate}</Text>
            <Text style={styles.subText}>Class: {item.class}</Text>
          </View>

           <View style={styles.buttonDiv}>
            <TouchableOpacity
              style={styles.button2}
              onPress={() => router.push(`/batches/${item._id}`)}
            >
              <Text style={styles.buttonText}>Explore</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button1}
              onPress={() => router.push(`/batches/${item._id}`)}
            >
              <Text style={styles.buttonText}>Buy</Text>
            </TouchableOpacity>
           </View>

        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    paddingTop:10,
    paddingBottom:10
  },
  image: {
    width: "90%",
    margin:"auto",
    height: 180,
    borderRadius:20
  },
  info: {
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-around",
  },
  buttonDiv: {
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-around",
    width:"90%",
    margin:"auto"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginVertical: 6,
  },
  button1: {
    backgroundColor: "#6b28ad",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    width:"49%",
  },
  button2: {
    backgroundColor: "#bfb5c9",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    width:"49%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
