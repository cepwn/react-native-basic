import ShoppingListItem from "@/components/ShoppingListItem";
import { theme } from "@/theme";
import { getFromStorage, setToStorage } from "@/utils/storage";
import {
  impactAsync,
  ImpactFeedbackStyle,
  notificationAsync,
  NotificationFeedbackType,
} from "expo-haptics";
import { useEffect, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const STORAGE_KEY = "shopping-list";

type ShoppingListItemType = {
  id: string;
  name: string;
  completedAt?: number;
  updatedAt: number;
};

export default function App() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    getFromStorage(STORAGE_KEY).then((data) => {
      if (data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShoppingList(data);
      }
    });
  }, []);

  const handleSubmit = () => {
    if (value.trim() === "") return;
    const newList = [
      ...shoppingList,
      { id: Math.random().toString(), name: value, updatedAt: Date.now() },
    ];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(newList);
    setToStorage(STORAGE_KEY, newList);
    setValue("");
  };

  const handleDelete = (id: string) => {
    const newList = shoppingList.filter((item) => item.id !== id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    impactAsync(ImpactFeedbackStyle.Medium);
    setShoppingList(newList);
    setToStorage(STORAGE_KEY, newList);
  };

  const handleToggleComplete = (id: string) => {
    const newList = shoppingList.map((item) => {
      if (item.id === id) {
        if (item.completedAt) {
          impactAsync(ImpactFeedbackStyle.Medium);
        } else {
          notificationAsync(NotificationFeedbackType.Success);
        }
        return {
          ...item,
          completedAt: item.completedAt ? undefined : Date.now(),
          updatedAt: Date.now(),
        };
      }
      return item;
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShoppingList(newList);
    setToStorage(STORAGE_KEY, newList);
  };

  return (
    <FlatList
      data={orderShoppingList(shoppingList)}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={() => (
        <View style={styles.listEmptyContainer}>
          <Text>No items in the list</Text>
        </View>
      )}
      ListHeaderComponent={
        <TextInput
          value={value}
          placeholder="E.g. Coffee"
          style={styles.textInput}
          onChangeText={setValue}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      }
      renderItem={({ item }) => (
        <ShoppingListItem
          name={item.name}
          onDelete={() => handleDelete(item.id)}
          onToggleComplete={() => handleToggleComplete(item.id)}
          isCompleted={Boolean(item.completedAt)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
  textInput: {
    borderColor: theme.colors.colorLightGrey,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
    backgroundColor: theme.colors.colorWhite,
  },
});

function orderShoppingList(shoppingList: ShoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAt && item2.completedAt) {
      return item2.completedAt - item1.completedAt;
    }

    if (item1.completedAt && !item2.completedAt) {
      return 1;
    }

    if (!item1.completedAt && item2.completedAt) {
      return -1;
    }

    if (!item1.completedAt && !item2.completedAt) {
      return item2.updatedAt - item1.updatedAt;
    }

    return 0;
  });
}
