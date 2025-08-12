import { theme } from "@/theme";
import { getFromStorage } from "@/utils/storage";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { COUNTDOWN_STORAGE_KEY, PersistedCoundownState } from "./index";

const fullDateFormat = `LLL d yyyy, h:mm aaa`;

export default function HistoryScreen() {
  const [coundownState, setCoundownState] = useState<PersistedCoundownState>();

  useEffect(() => {
    getFromStorage(COUNTDOWN_STORAGE_KEY).then((persistedState) => {
      setCoundownState(persistedState);
    });
  }, []);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      data={coundownState?.completedAt}
      ListEmptyComponent={() => (
        <View style={styles.listEmptyContainer}>
          <Text>No completed tasks yet</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>
            {format(item, fullDateFormat)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.colors.colorWhite,
  },
  contentContainer: {
    marginTop: 8,
  },
  listItem: {
    backgroundColor: theme.colors.colorLightGrey,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  listItemText: {
    fontSize: 18,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
